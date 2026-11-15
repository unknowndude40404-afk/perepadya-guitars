-- Perepadya Guitars: full database schema (tables, functions, storage).
-- Run once on an empty Supabase project: Dashboard → SQL Editor → Run.
--
-- The site talks to the database only from the server with the secret key
-- (role service_role), so tables have RLS on and no public policies.
-- Locale codes are validated by the app (src/shared/i18n/config.ts), so a new
-- language needs no database change. English ("en") is the required fallback.

-- ---------------------------------------------------------------------------
-- Helpers
-- ---------------------------------------------------------------------------

create or replace function public.touch_updated_at_camel()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
    new."updatedAt" = now();
    return new;
end;
$$;

create or replace function public.touch_updated_at_snake()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
    new.updated_at = now();
    return new;
end;
$$;

-- ---------------------------------------------------------------------------
-- Products (language-independent fields)
-- ---------------------------------------------------------------------------

create sequence if not exists public.product_sku_seq;

create table if not exists public.products (
    id uuid primary key default gen_random_uuid(),

    slug text not null unique check (char_length(slug) > 0),

    "isHidden" boolean not null default false,
    images text[] not null default '{}',

    sku text not null unique
        default ('PG-' || lpad(nextval('public.product_sku_seq')::text, 6, '0')),
    gtin text,

    status text not null default 'in_stock'
        check (status in ('in_stock', 'on_order')),

    "createdAt" timestamptz not null default now(),
    "updatedAt" timestamptz not null default now()
);

alter sequence public.product_sku_seq owned by public.products.sku;

create index if not exists products_created_at_idx
    on public.products ("createdAt" desc);

create index if not exists products_visible_idx
    on public.products ("isHidden", status);

drop trigger if exists products_touch_updated_at on public.products;

create trigger products_touch_updated_at
    before update on public.products
    for each row execute function public.touch_updated_at_camel();

alter table public.products enable row level security;

-- ---------------------------------------------------------------------------
-- Product translations
-- ---------------------------------------------------------------------------

create table if not exists public.product_translations (
    "productId" uuid not null references public.products(id) on delete cascade,
    locale text not null check (locale ~ '^[a-z]{2}$'),

    name text not null check (char_length(btrim(name)) > 0),
    description text,
    "seoTitle" text,
    "seoDescription" text,

    primary key ("productId", locale)
);

create index if not exists product_translations_locale_name_idx
    on public.product_translations (locale, name);

alter table public.product_translations enable row level security;

-- ---------------------------------------------------------------------------
-- Posts (blog, language-independent fields)
-- ---------------------------------------------------------------------------

create table if not exists public.posts (
    id uuid primary key default gen_random_uuid(),

    slug text not null unique check (char_length(slug) > 0),
    cover_url text,

    status text not null default 'draft'
        check (status in ('draft', 'published')),
    published_at timestamptz,

    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

create index if not exists posts_status_published_at_idx
    on public.posts (status, published_at desc);

create index if not exists posts_created_at_idx
    on public.posts (created_at desc);

drop trigger if exists posts_touch_updated_at on public.posts;

create trigger posts_touch_updated_at
    before update on public.posts
    for each row execute function public.touch_updated_at_snake();

alter table public.posts enable row level security;

-- ---------------------------------------------------------------------------
-- Post translations
-- ---------------------------------------------------------------------------

create table if not exists public.post_translations (
    post_id uuid not null references public.posts(id) on delete cascade,
    locale text not null check (locale ~ '^[a-z]{2}$'),

    title text not null check (char_length(btrim(title)) > 0),
    excerpt text,
    blocks jsonb not null default '[]'::jsonb,
    seo_title text,
    seo_description text,

    search_text text generated always as (
        coalesce(title, '') || ' ' || coalesce(excerpt, '')
    ) stored,

    primary key (post_id, locale)
);

alter table public.post_translations enable row level security;

-- ---------------------------------------------------------------------------
-- Access to tables: only the server (service_role)
-- ---------------------------------------------------------------------------

revoke all on table
    public.products,
    public.product_translations,
    public.posts,
    public.post_translations
from anon, authenticated;

grant all on table
    public.products,
    public.product_translations,
    public.posts,
    public.post_translations
to service_role;

revoke all on sequence public.product_sku_seq from anon, authenticated;
grant usage, select on sequence public.product_sku_seq to service_role;

-- ---------------------------------------------------------------------------
-- Catalog page: localized names (English fallback), search, sort, pagination
-- sort_value: date_desc (default) | date_asc | name_asc | name_desc
--             | status_asc (in stock first) | status_desc (on order first)
-- ---------------------------------------------------------------------------

create or replace function public.get_catalog_page(
    search_value text default null,
    sort_value text default 'date_desc',
    page_value integer default 1,
    page_size_value integer default 16,
    locale_value text default 'en'
)
returns jsonb
language plpgsql
stable
set search_path = ''
as $$
declare
    v_page integer := greatest(coalesce(page_value, 1), 1);
    v_size integer := least(greatest(coalesce(page_size_value, 16), 1), 60);
    v_search text := nullif(btrim(coalesce(search_value, '')), '');
    v_locale text := coalesce(nullif(locale_value, ''), 'en');
    v_total integer;
    v_items jsonb;
begin
    with visible as (
        select
            p.*,
            coalesce(tl.name, te.name) as display_name
        from public.products p
        left join public.product_translations tl
            on tl."productId" = p.id and tl.locale = v_locale
        left join public.product_translations te
            on te."productId" = p.id and te.locale = 'en'
        where not p."isHidden"
          and (
              v_search is null
              or coalesce(tl.name, te.name) ilike '%' || v_search || '%'
          )
    ),
    ordered as (
        select
            v.*,
            row_number() over (
                order by
                    case when sort_value in ('status_asc', 'in-stock')
                        then (v.status <> 'in_stock')::int end,
                    case when sort_value = 'status_desc'
                        then (v.status = 'in_stock')::int end,
                    case when sort_value in ('name_asc', 'name-asc')
                        then v.display_name end,
                    case when sort_value = 'name_desc'
                        then v.display_name end desc,
                    case when sort_value = 'date_asc'
                        then v."createdAt" end,
                    v."createdAt" desc,
                    v.id
            ) as rn,
            count(*) over () as total_count
        from visible v
    )
    select
        coalesce(max(o.total_count), 0),
        coalesce(
            jsonb_agg(
                jsonb_build_object(
                    'id', o.id,
                    'name', o.display_name,
                    'slug', o.slug,
                    'images', to_jsonb(o.images),
                    'sku', o.sku,
                    'gtin', o.gtin,
                    'status', o.status
                )
                order by o.rn
            ) filter (
                where o.rn > (v_page - 1) * v_size
                  and o.rn <= v_page * v_size
            ),
            '[]'::jsonb
        )
    into v_total, v_items
    from ordered o;

    return jsonb_build_object(
        'data', v_items,
        'total', v_total,
        'page', v_page,
        'pageSize', v_size
    );
end;
$$;

-- ---------------------------------------------------------------------------
-- Admin: products list (English name, list of filled locales)
-- ---------------------------------------------------------------------------

create or replace function public.get_admin_products(
    p_search text default null,
    p_sort text default 'created_desc',
    p_limit integer default 20,
    p_offset integer default 0,
    p_show_hidden boolean default false
)
returns jsonb
language plpgsql
stable
set search_path = ''
as $$
declare
    v_search text := nullif(btrim(coalesce(p_search, '')), '');
    v_total integer;
    v_items jsonb;
begin
    with base as (
        select
            p.*,
            coalesce(
                (select t.name from public.product_translations t
                 where t."productId" = p.id and t.locale = 'en'),
                (select t.name from public.product_translations t
                 where t."productId" = p.id order by t.locale limit 1),
                p.slug
            ) as display_name,
            coalesce(
                (select array_agg(t.locale order by t.locale)
                 from public.product_translations t
                 where t."productId" = p.id),
                '{}'::text[]
            ) as locales
        from public.products p
        where (p_show_hidden or not p."isHidden")
          and (
              v_search is null
              or p.sku ilike '%' || v_search || '%'
              or exists (
                  select 1 from public.product_translations t
                  where t."productId" = p.id
                    and t.name ilike '%' || v_search || '%'
              )
          )
    ),
    ordered as (
        select
            b.*,
            row_number() over (
                order by
                    case when p_sort = 'name_asc' then b.display_name end asc,
                    case when p_sort = 'name_desc' then b.display_name end desc,
                    case when p_sort = 'created_asc' then b."createdAt" end asc,
                    b."createdAt" desc,
                    b.id
            ) as rn,
            count(*) over () as total_count
        from base b
    )
    select
        coalesce(max(o.total_count), 0),
        coalesce(
            jsonb_agg(
                jsonb_build_object(
                    'id', o.id,
                    'name', o.display_name,
                    'slug', o.slug,
                    'isHidden', o."isHidden",
                    'image', o.images[1],
                    'status', o.status,
                    'locales', to_jsonb(o.locales)
                )
                order by o.rn
            ) filter (
                where o.rn > greatest(coalesce(p_offset, 0), 0)
                  and o.rn <= greatest(coalesce(p_offset, 0), 0)
                      + greatest(coalesce(p_limit, 20), 1)
            ),
            '[]'::jsonb
        )
    into v_total, v_items
    from ordered o;

    return jsonb_build_object(
        'success', true,
        'total', v_total,
        'items', v_items
    );
end;
$$;

-- ---------------------------------------------------------------------------
-- Admin: create / update product with translations
-- Payload: slug, isHidden, images, gtin, status,
--          translations: { "<locale>": { name, description, seoTitle, seoDescription } }
-- ---------------------------------------------------------------------------

create or replace function public.save_admin_product(
    p_product_id uuid,
    p_payload jsonb
)
returns jsonb
language plpgsql
set search_path = ''
as $$
declare
    v_id uuid;
    v_images text[] := case
        when jsonb_typeof(p_payload -> 'images') = 'array'
            then array(select jsonb_array_elements_text(p_payload -> 'images'))
        else '{}'::text[]
    end;
    v_translations jsonb := coalesce(p_payload -> 'translations', '{}'::jsonb);
begin
    if jsonb_typeof(v_translations) <> 'object'
       or nullif(btrim(coalesce(v_translations -> 'en' ->> 'name', '')), '') is null then
        return jsonb_build_object('success', false, 'reason', 'invalid_input');
    end if;

    if p_product_id is null then
        insert into public.products (slug, "isHidden", images, gtin, status)
        values (
            p_payload ->> 'slug',
            coalesce((p_payload ->> 'isHidden')::boolean, false),
            v_images,
            nullif(btrim(coalesce(p_payload ->> 'gtin', '')), ''),
            coalesce(p_payload ->> 'status', 'in_stock')
        )
        returning id into v_id;
    else
        update public.products
        set
            slug = p_payload ->> 'slug',
            "isHidden" = coalesce((p_payload ->> 'isHidden')::boolean, false),
            images = v_images,
            gtin = nullif(btrim(coalesce(p_payload ->> 'gtin', '')), ''),
            status = coalesce(p_payload ->> 'status', 'in_stock')
        where id = p_product_id
        returning id into v_id;

        if v_id is null then
            return jsonb_build_object(
                'success', false,
                'reason', 'product_not_found'
            );
        end if;
    end if;

    delete from public.product_translations t
    where t."productId" = v_id
      and not (v_translations ? t.locale);

    insert into public.product_translations (
        "productId", locale, name, description, "seoTitle", "seoDescription"
    )
    select
        v_id,
        item.key,
        btrim(item.value ->> 'name'),
        nullif(item.value ->> 'description', ''),
        nullif(btrim(coalesce(item.value ->> 'seoTitle', '')), ''),
        nullif(btrim(coalesce(item.value ->> 'seoDescription', '')), '')
    from jsonb_each(v_translations) as item
    on conflict ("productId", locale) do update set
        name = excluded.name,
        description = excluded.description,
        "seoTitle" = excluded."seoTitle",
        "seoDescription" = excluded."seoDescription";

    update public.products set "updatedAt" = now() where id = v_id;

    return jsonb_build_object('success', true, 'id', v_id);
exception
    when unique_violation then
        return jsonb_build_object('success', false, 'reason', 'slug_taken');
    when check_violation or not_null_violation or invalid_text_representation then
        return jsonb_build_object('success', false, 'reason', 'invalid_input');
end;
$$;

-- ---------------------------------------------------------------------------
-- Admin: delete product
-- ---------------------------------------------------------------------------

create or replace function public.delete_admin_product(
    p_product_id uuid
)
returns jsonb
language plpgsql
set search_path = ''
as $$
declare
    v_id uuid;
begin
    delete from public.products
    where id = p_product_id
    returning id into v_id;

    if v_id is null then
        return jsonb_build_object(
            'success', false,
            'reason', 'product_not_found'
        );
    end if;

    return jsonb_build_object('success', true);
end;
$$;

-- ---------------------------------------------------------------------------
-- Blog: published posts list (localized, English fallback)
-- p_sort: newest | oldest
-- ---------------------------------------------------------------------------

create or replace function public.get_blog_page(
    p_locale text default 'en',
    p_search text default null,
    p_sort text default 'newest',
    p_limit integer default 10,
    p_offset integer default 0
)
returns jsonb
language plpgsql
stable
set search_path = ''
as $$
declare
    v_locale text := coalesce(nullif(p_locale, ''), 'en');
    v_search text := nullif(btrim(coalesce(p_search, '')), '');
    v_total integer;
    v_items jsonb;
begin
    with localized as (
        select
            p.id,
            p.slug,
            p.cover_url,
            p.published_at,
            coalesce(tl.title, te.title) as title,
            coalesce(tl.excerpt, te.excerpt) as excerpt,
            coalesce(tl.search_text, te.search_text) as search_text
        from public.posts p
        left join public.post_translations tl
            on tl.post_id = p.id and tl.locale = v_locale
        left join public.post_translations te
            on te.post_id = p.id and te.locale = 'en'
        where p.status = 'published'
          and (tl.post_id is not null or te.post_id is not null)
    ),
    filtered as (
        select l.*
        from localized l
        where v_search is null or l.search_text ilike '%' || v_search || '%'
    ),
    ordered as (
        select
            f.*,
            row_number() over (
                order by
                    case when p_sort = 'oldest' then f.published_at end asc,
                    f.published_at desc,
                    f.id
            ) as rn,
            count(*) over () as total_count
        from filtered f
    )
    select
        coalesce(max(o.total_count), 0),
        coalesce(
            jsonb_agg(
                jsonb_build_object(
                    'id', o.id,
                    'slug', o.slug,
                    'title', o.title,
                    'excerpt', o.excerpt,
                    'coverUrl', o.cover_url,
                    'publishedAt', o.published_at
                )
                order by o.rn
            ) filter (
                where o.rn > greatest(coalesce(p_offset, 0), 0)
                  and o.rn <= greatest(coalesce(p_offset, 0), 0)
                      + greatest(coalesce(p_limit, 10), 1)
            ),
            '[]'::jsonb
        )
    into v_total, v_items
    from ordered o;

    return jsonb_build_object('total', v_total, 'items', v_items);
end;
$$;

-- ---------------------------------------------------------------------------
-- Admin: create / update post with translations
-- Payload: slug, coverUrl, status, publishedAt,
--          translations: { "<locale>": { title, excerpt, blocks, seoTitle, seoDescription } }
-- ---------------------------------------------------------------------------

create or replace function public.save_admin_post(
    p_post_id uuid,
    p_payload jsonb
)
returns jsonb
language plpgsql
set search_path = ''
as $$
declare
    v_id uuid;
    v_translations jsonb := coalesce(p_payload -> 'translations', '{}'::jsonb);
begin
    if jsonb_typeof(v_translations) <> 'object'
       or nullif(btrim(coalesce(v_translations -> 'en' ->> 'title', '')), '') is null then
        return jsonb_build_object('success', false, 'reason', 'invalid_fields');
    end if;

    if p_post_id is null then
        insert into public.posts (slug, cover_url, status, published_at)
        values (
            p_payload ->> 'slug',
            nullif(p_payload ->> 'coverUrl', ''),
            coalesce(p_payload ->> 'status', 'draft'),
            (p_payload ->> 'publishedAt')::timestamptz
        )
        returning id into v_id;
    else
        update public.posts
        set
            slug = p_payload ->> 'slug',
            cover_url = nullif(p_payload ->> 'coverUrl', ''),
            status = coalesce(p_payload ->> 'status', 'draft'),
            published_at = (p_payload ->> 'publishedAt')::timestamptz
        where id = p_post_id
        returning id into v_id;

        if v_id is null then
            return jsonb_build_object('success', false, 'reason', 'not_found');
        end if;
    end if;

    delete from public.post_translations t
    where t.post_id = v_id
      and not (v_translations ? t.locale);

    insert into public.post_translations (
        post_id, locale, title, excerpt, blocks, seo_title, seo_description
    )
    select
        v_id,
        item.key,
        btrim(item.value ->> 'title'),
        nullif(btrim(coalesce(item.value ->> 'excerpt', '')), ''),
        case
            when jsonb_typeof(item.value -> 'blocks') = 'array'
                then item.value -> 'blocks'
            else '[]'::jsonb
        end,
        nullif(btrim(coalesce(item.value ->> 'seoTitle', '')), ''),
        nullif(btrim(coalesce(item.value ->> 'seoDescription', '')), '')
    from jsonb_each(v_translations) as item
    on conflict (post_id, locale) do update set
        title = excluded.title,
        excerpt = excluded.excerpt,
        blocks = excluded.blocks,
        seo_title = excluded.seo_title,
        seo_description = excluded.seo_description;

    update public.posts set updated_at = now() where id = v_id;

    return jsonb_build_object('success', true, 'id', v_id);
exception
    when unique_violation then
        return jsonb_build_object('success', false, 'reason', 'slug_taken');
    when check_violation or not_null_violation or invalid_text_representation then
        return jsonb_build_object('success', false, 'reason', 'invalid_fields');
end;
$$;

-- ---------------------------------------------------------------------------
-- Admin: posts list (English title, filled locales)
-- p_sort_field: created | published | title ; p_sort_dir: asc | desc
-- ---------------------------------------------------------------------------

create or replace function public.get_admin_posts(
    p_search text default null,
    p_status text default null,
    p_sort_field text default 'created',
    p_sort_dir text default 'desc',
    p_limit integer default 20,
    p_offset integer default 0
)
returns jsonb
language plpgsql
stable
set search_path = ''
as $$
declare
    v_search text := nullif(btrim(coalesce(p_search, '')), '');
    v_total integer;
    v_items jsonb;
begin
    with base as (
        select
            p.*,
            coalesce(
                (select t.title from public.post_translations t
                 where t.post_id = p.id and t.locale = 'en'),
                (select t.title from public.post_translations t
                 where t.post_id = p.id order by t.locale limit 1),
                p.slug
            ) as display_title,
            coalesce(
                (select array_agg(t.locale order by t.locale)
                 from public.post_translations t
                 where t.post_id = p.id),
                '{}'::text[]
            ) as locales
        from public.posts p
        where (p_status is null or p.status = p_status)
          and (
              v_search is null
              or exists (
                  select 1 from public.post_translations t
                  where t.post_id = p.id
                    and t.title ilike '%' || v_search || '%'
              )
          )
    ),
    ordered as (
        select
            b.*,
            row_number() over (
                order by
                    case when p_sort_field = 'title' and p_sort_dir = 'asc' then b.display_title end asc,
                    case when p_sort_field = 'title' and p_sort_dir = 'desc' then b.display_title end desc,
                    case when p_sort_field = 'published' and p_sort_dir = 'asc' then b.published_at end asc nulls last,
                    case when p_sort_field = 'published' and p_sort_dir = 'desc' then b.published_at end desc nulls last,
                    case when p_sort_field = 'created' and p_sort_dir = 'asc' then b.created_at end asc,
                    b.created_at desc,
                    b.id
            ) as rn,
            count(*) over () as total_count
        from base b
    )
    select
        coalesce(max(o.total_count), 0),
        coalesce(
            jsonb_agg(
                jsonb_build_object(
                    'id', o.id,
                    'title', o.display_title,
                    'slug', o.slug,
                    'status', o.status,
                    'publishedAt', o.published_at,
                    'createdAt', o.created_at,
                    'updatedAt', o.updated_at,
                    'locales', to_jsonb(o.locales)
                )
                order by o.rn
            ) filter (
                where o.rn > greatest(coalesce(p_offset, 0), 0)
                  and o.rn <= greatest(coalesce(p_offset, 0), 0)
                      + greatest(coalesce(p_limit, 20), 1)
            ),
            '[]'::jsonb
        )
    into v_total, v_items
    from ordered o;

    return jsonb_build_object('total', v_total, 'items', v_items);
end;
$$;

-- ---------------------------------------------------------------------------
-- Access to functions: executable by PUBLIC by default, keep them server-only
-- ---------------------------------------------------------------------------

revoke execute on function
    public.get_catalog_page(text, text, integer, integer, text),
    public.get_admin_products(text, text, integer, integer, boolean),
    public.save_admin_product(uuid, jsonb),
    public.delete_admin_product(uuid),
    public.get_blog_page(text, text, text, integer, integer),
    public.save_admin_post(uuid, jsonb),
    public.get_admin_posts(text, text, text, text, integer, integer)
from public, anon, authenticated;

grant execute on function
    public.get_catalog_page(text, text, integer, integer, text),
    public.get_admin_products(text, text, integer, integer, boolean),
    public.save_admin_product(uuid, jsonb),
    public.delete_admin_product(uuid),
    public.get_blog_page(text, text, text, integer, integer),
    public.save_admin_post(uuid, jsonb),
    public.get_admin_posts(text, text, text, text, integer, integer)
to service_role;

-- ---------------------------------------------------------------------------
-- Storage: public buckets for images
-- Uploads go through signed upload URLs created by the server.
-- ---------------------------------------------------------------------------

insert into storage.buckets (id, name, public)
values
    ('store-images', 'store-images', true),
    ('post-images', 'post-images', true)
on conflict (id) do update set public = excluded.public;

-- Tell the Data API about the new tables and functions.
notify pgrst, 'reload schema';
