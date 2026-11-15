"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

import type { AdminPost, PostBlock, PostStatus } from "@/entities/post";
import {
    POST_IMAGE_ERROR_MESSAGES,
    uploadPostImage,
} from "@/entities/post/lib/upload-post-image";
import { Button } from "@/shared/ui/button";
import { getImageSize } from "@/shared/lib/image/get-image-size";
import { slugify } from "@/shared/lib/slug/slugify";
import {
    DEFAULT_LOCALE,
    LOCALE_META,
    LOCALES,
    type Locale,
} from "@/shared/i18n/config";
import { LocaleTabs } from "@/shared/ui/locale-tabs";

import { PostBasics } from "./PostBasics";
import { PostCover } from "./PostCover";
import { PostContent, type PendingImage } from "./post-content";
import { PostSeo } from "./PostSeo";

type PostFormProps = {
    post?: AdminPost;
};

type PostTextDraft = {
    title: string;
    blocks: PostBlock[];
    seoTitle: string;
    seoDescription: string;
};

type PostTextsDraft = Record<Locale, PostTextDraft>;

function toTextsDraft(post?: AdminPost): PostTextsDraft {
    return Object.fromEntries(
        LOCALES.map((locale) => {
            const item = post?.translations[locale];

            return [
                locale,
                {
                    title: item?.title ?? "",
                    blocks: item?.blocks ?? [],
                    seoTitle: item?.seoTitle ?? "",
                    seoDescription: item?.seoDescription ?? "",
                },
            ];
        }),
    ) as PostTextsDraft;
}

function hasAnyContent(text: PostTextDraft) {
    return Boolean(
        text.title.trim() ||
        text.blocks.length ||
        text.seoTitle.trim() ||
        text.seoDescription.trim(),
    );
}

const SEO_TITLE_MAX = 60;
const SEO_DESCRIPTION_MAX = 160;

function isTitleMissing(text: PostTextDraft) {
    return !text.title.trim();
}

function hasTextErrors(text: PostTextDraft) {
    const seoTitle = text.seoTitle.trim();
    const seoDescription = text.seoDescription.trim();

    return (
        isTitleMissing(text) ||
        text.blocks.length === 0 ||
        !seoTitle ||
        seoTitle.length > SEO_TITLE_MAX ||
        !seoDescription ||
        seoDescription.length > SEO_DESCRIPTION_MAX ||
        text.blocks.some(
            (block) => block.type === "image" && !block.alt.trim(),
        )
    );
}

function cloneBlocks(blocks: PostBlock[]): PostBlock[] {
    return blocks.map((block) => ({
        ...structuredClone(block),
        id: crypto.randomUUID(),
    }));
}

type CoverUploadResult =
    | { success: true; url: string | null }
    | { success: false };

const ERROR_MESSAGES: Record<string, string> = {
    slug_taken: "Пост з такою англійською назвою вже існує",
    invalid_fields: "Заповніть усі поля для кожної мови",
    not_found: "Пост не знайдено — можливо, його видалили",
};

export function PostForm({ post }: PostFormProps) {
    const router = useRouter();

    const isEdit = Boolean(post);

    const [texts, setTexts] = useState<PostTextsDraft>(() => toTextsDraft(post));
    const [activeLocale, setActiveLocale] = useState<Locale>(DEFAULT_LOCALE);
    const [coverUrl, setCoverUrl] = useState<string | null>(
        post?.coverUrl ?? null,
    );
    const [pendingCover, setPendingCover] = useState<PendingImage | null>(null);
    const [pendingImages, setPendingImages] = useState<
        Record<string, PendingImage>
    >({});
    const [status, setStatus] = useState<PostStatus>(
        post?.status ?? "published",
    );

    const [submitAttempted, setSubmitAttempted] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [titleTaken, setTitleTaken] = useState(false);

    const pendingImagesRef = useRef(pendingImages);
    const pendingCoverRef = useRef(pendingCover);

    useEffect(() => {
        pendingImagesRef.current = pendingImages;
    }, [pendingImages]);

    useEffect(() => {
        pendingCoverRef.current = pendingCover;
    }, [pendingCover]);

    useEffect(() => {
        return () => {
            for (const pending of Object.values(pendingImagesRef.current)) {
                URL.revokeObjectURL(pending.previewUrl);
            }

            if (pendingCoverRef.current) {
                URL.revokeObjectURL(pendingCoverRef.current.previewUrl);
            }
        };
    }, []);

    const activeText = texts[activeLocale];
    const title = activeText.title;
    const blocks = activeText.blocks;

    const slug = slugify(texts[DEFAULT_LOCALE].title);

    const titlesInvalid =
        !slug || LOCALES.some((locale) => hasTextErrors(texts[locale]));

    const isImageMissing = (locale: Locale) =>
        texts[locale].blocks.some(
            (block) =>
                block.type === "image" && !block.url && !pendingImages[block.id],
        );

    const imagesInvalid = LOCALES.some(isImageMissing);

    const isFormValid = !titlesInvalid && !imagesInvalid;

    function updateActiveText(patch: Partial<PostTextDraft>) {
        setTexts((prev) => ({
            ...prev,
            [activeLocale]: { ...prev[activeLocale], ...patch },
        }));
    }

    function setBlocks(
        action: PostBlock[] | ((prev: PostBlock[]) => PostBlock[]),
    ) {
        const locale = activeLocale;

        setTexts((prev) => ({
            ...prev,
            [locale]: {
                ...prev[locale],
                blocks:
                    typeof action === "function"
                        ? action(prev[locale].blocks)
                        : action,
            },
        }));
    }

    function handleTitleChange(value: string) {
        updateActiveText({ title: value });
        setTitleTaken(false);
    }

    function handleCopyFromDefault() {
        const source = texts[DEFAULT_LOCALE];

        updateActiveText({ blocks: cloneBlocks(source.blocks) });
    }

    function handleCoverFileSelect(file: File) {
        if (pendingCover) {
            URL.revokeObjectURL(pendingCover.previewUrl);
        }

        setPendingCover({ file, previewUrl: URL.createObjectURL(file) });
    }

    function handleCoverRemove() {
        if (pendingCover) {
            URL.revokeObjectURL(pendingCover.previewUrl);
        }

        setPendingCover(null);
        setCoverUrl(null);
    }

    function handleMakeCoverFromBlock(blockId: string) {
        const pending = pendingImages[blockId];

        if (pending) {
            handleCoverFileSelect(pending.file);

            return;
        }

        const block = LOCALES.flatMap((locale) => texts[locale].blocks).find(
            (item) => item.id === blockId,
        );

        if (block?.type !== "image" || !block.url) {
            return;
        }

        if (pendingCover) {
            URL.revokeObjectURL(pendingCover.previewUrl);
        }

        setPendingCover(null);
        setCoverUrl(block.url);
    }

    function handlePendingImageChange(blockId: string, file: File | null) {
        const current = pendingImages[blockId];

        if (current) {
            URL.revokeObjectURL(current.previewUrl);
        }

        const previewUrl = file ? URL.createObjectURL(file) : null;

        setPendingImages((prev) => {
            const next = { ...prev };

            if (file && previewUrl) {
                next[blockId] = { file, previewUrl };
            } else {
                delete next[blockId];
            }

            return next;
        });
    }

    async function uploadPendingCover(): Promise<CoverUploadResult> {
        if (!pendingCover) {
            return { success: true, url: coverUrl };
        }

        const result = await uploadPostImage(pendingCover.file);

        if (!result.success) {
            setError(POST_IMAGE_ERROR_MESSAGES[result.reason]);

            return { success: false };
        }

        URL.revokeObjectURL(pendingCover.previewUrl);

        setPendingCover(null);
        setCoverUrl(result.url);

        return { success: true, url: result.url };
    }

    async function uploadPendingImages(): Promise<PostTextsDraft | null> {
        const entries = Object.entries(pendingImages);

        if (entries.length === 0) {
            return texts;
        }

        const results = await Promise.all(
            entries.map(async ([blockId, pending]) => {
                const [result, size] = await Promise.all([
                    uploadPostImage(pending.file),
                    getImageSize(pending.file),
                ]);

                return { blockId, pending, result, size };
            }),
        );

        const uploadedImages = new Map<
            string,
            { url: string; width: number | null; height: number | null }
        >();

        for (const { blockId, pending, result, size } of results) {
            if (result.success) {
                uploadedImages.set(blockId, {
                    url: result.url,
                    width: size?.width ?? null,
                    height: size?.height ?? null,
                });

                URL.revokeObjectURL(pending.previewUrl);
            }
        }

        const nextTexts = Object.fromEntries(
            LOCALES.map((locale) => [
                locale,
                {
                    ...texts[locale],
                    blocks: texts[locale].blocks.map((block) => {
                        const image = uploadedImages.get(block.id);

                        return block.type === "image" && image
                            ? { ...block, ...image }
                            : block;
                    }),
                },
            ]),
        ) as PostTextsDraft;

        setTexts(nextTexts);

        setPendingImages((prev) => {
            const next = { ...prev };

            for (const blockId of uploadedImages.keys()) {
                delete next[blockId];
            }

            return next;
        });

        const failed = results.find(({ result }) => !result.success);

        if (failed && !failed.result.success) {
            setError(POST_IMAGE_ERROR_MESSAGES[failed.result.reason]);

            return null;
        }

        return nextTexts;
    }

    async function handleSubmit() {
        if (isSubmitting) {
            return;
        }

        setSubmitAttempted(true);
        setError(null);

        if (!isFormValid) {
            return;
        }

        setIsSubmitting(true);

        try {
            const [textsToSave, cover] = await Promise.all([
                uploadPendingImages(),
                uploadPendingCover(),
            ]);

            if (!textsToSave || !cover.success) {
                return;
            }

            const response = await fetch(
                post ? `/api/admin/posts/${post.id}` : "/api/admin/posts",
                {
                    method: post ? "PATCH" : "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        coverUrl: cover.url,
                        status,
                        translations: Object.fromEntries(
                            LOCALES.filter((locale) =>
                                textsToSave[locale].title.trim(),
                            ).map((locale) => [
                                locale,
                                {
                                    title: textsToSave[locale].title.trim(),
                                    blocks: textsToSave[locale].blocks,
                                    seoTitle: textsToSave[locale].seoTitle,
                                    seoDescription:
                                        textsToSave[locale].seoDescription,
                                },
                            ]),
                        ),
                    }),
                },
            );

            const result = await response.json().catch(() => null);

            if (!response.ok || !result?.success) {
                if (result?.reason === "slug_taken") {
                    setTitleTaken(true);
                }

                setError(
                    ERROR_MESSAGES[result?.reason] ?? "Не вдалося зберегти пост",
                );

                return;
            }

            router.push("/admin/posts");
        } catch (fetchError) {
            console.error("SAVE POST ERROR", fetchError);

            setError("Не вдалося зберегти пост");
        } finally {
            setIsSubmitting(false);
        }
    }

    return (
        <div className="w-full">
            <h1 className="mb-6 text-2xl font-semibold text-[var(--text-primary)]">
                {isEdit ? "Редагувати пост" : "Новий пост"}
            </h1>

            <div className="flex flex-col gap-6">
                <div className="rounded-2xl border border-[var(--border-primary)] bg-[var(--card-bg)] p-6">
                    <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                        <span className="text-sm font-medium text-[var(--text-primary)]">
                            Мова тексту
                        </span>

                        <span className="text-xs text-[var(--text-secondary)]">
                            Усі поля обов’язкові для кожної мови
                        </span>
                    </div>

                    <LocaleTabs
                        value={activeLocale}
                        onChange={setActiveLocale}
                        isFilled={(locale) => Boolean(texts[locale].title.trim())}
                        isInvalid={(locale) =>
                            submitAttempted &&
                            (hasTextErrors(texts[locale]) ||
                                isImageMissing(locale))
                        }
                    />

                    <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-xs text-[var(--text-secondary)]">
                        <span>
                            {LOCALE_META[activeLocale].nativeName}
                            {!hasAnyContent(activeText)
                                ? " — ще не заповнено"
                                : null}
                            {activeLocale === DEFAULT_LOCALE && slug
                                ? ` · адреса: /blog/${slug}`
                                : null}
                        </span>

                        {activeLocale !== DEFAULT_LOCALE &&
                            !activeText.blocks.length &&
                            texts[DEFAULT_LOCALE].blocks.length ? (
                            <button
                                type="button"
                                onClick={handleCopyFromDefault}
                                className="cursor-pointer text-[var(--accent-primary)] transition hover:opacity-80"
                            >
                                Скопіювати блоки з EN
                            </button>
                        ) : null}
                    </div>
                </div>

                <PostBasics
                    title={title}
                    status={status}
                    titleInvalid={
                        (submitAttempted &&
                            isTitleMissing(activeText)) ||
                        (titleTaken && activeLocale === DEFAULT_LOCALE)
                    }
                    onTitleChange={handleTitleChange}
                    onStatusChange={setStatus}
                />

                <PostCover
                    coverUrl={coverUrl}
                    pending={pendingCover}
                    onFileSelect={handleCoverFileSelect}
                    onRemove={handleCoverRemove}
                />

                <PostContent
                    key={activeLocale}
                    blocks={blocks}
                    pendingImages={pendingImages}
                    coverUrl={coverUrl}
                    pendingCoverFile={pendingCover?.file ?? null}
                    showErrors={submitAttempted}
                    onChange={setBlocks}
                    onPendingImageChange={handlePendingImageChange}
                    onMakeCover={handleMakeCoverFromBlock}
                />

                <PostSeo
                    showErrors={submitAttempted}
                    seoTitle={activeText.seoTitle}
                    seoDescription={activeText.seoDescription}
                    onSeoTitleChange={(value) => updateActiveText({ seoTitle: value })}
                    onSeoDescriptionChange={(value) =>
                        updateActiveText({ seoDescription: value })
                    }
                />
            </div>

            {submitAttempted && !isFormValid ? (
                <div className="mt-6 text-sm text-[var(--error-primary)]">
                    Заповніть обов’язкові поля — вони підсвічені червоним
                </div>
            ) : null}

            {error ? (
                <div className="mt-6 text-sm text-[var(--error-primary)]">{error}</div>
            ) : null}

            <div className="mt-6 flex justify-end gap-3">
                <Button
                    type="button"
                    onClick={() => router.push("/admin/posts")}
                    disabled={isSubmitting}
                    className="h-12 rounded-xl border border-[var(--border-primary)] px-6 text-sm font-medium text-[var(--text-primary)] hover:border-[var(--border-hover)] active:scale-[0.99]"
                >
                    Скасувати
                </Button>

                <Button
                    type="button"
                    onClick={handleSubmit}
                    aria-disabled={!isFormValid}
                    loading={isSubmitting}
                    className="h-12 rounded-xl bg-[var(--accent-primary)] px-6 text-sm font-medium text-white hover:bg-[var(--accent-hover)] active:scale-[0.99]"
                >
                    Зберегти
                </Button>
            </div>
        </div>
    );
}