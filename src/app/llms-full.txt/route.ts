import {
    getLlmsProducts,
    type LlmsProduct,
} from "@/entities/product/api/get-llms-products";
import { getLlmsPosts, type LlmsPost } from "@/entities/post/api/get-llms-posts";
import { postBlocksToMarkdown } from "@/entities/post/lib/post-blocks-to-markdown";
import { descriptionToText } from "@/entities/product/lib/description-to-text";

import { LLMS_SUMMARY, LLMS_TITLE } from "@/shared/config/llms";
import { SITE_URL } from "@/shared/config/site";
import { DEFAULT_LOCALE, getDictionary } from "@/shared/i18n";

const dict = getDictionary(DEFAULT_LOCALE);
const BASE_URL = `${SITE_URL}/${DEFAULT_LOCALE}`;


export const revalidate = 3600;

async function loadLlmsPosts(): Promise<LlmsPost[]> {
    try {
        return await getLlmsPosts();
    } catch (error) {
        console.error("LLMS POSTS ERROR", error);

        return [];
    }
}

function getPostSection(post: LlmsPost): string[] {
    const content = postBlocksToMarkdown(post.blocks, 2);

    return [
        `### ${post.title}`,
        "",
        `Link: ${BASE_URL}/blog/${post.slug}`,
        ...(post.publishedAt
            ? [`Published: ${post.publishedAt.slice(0, 10)}`]
            : []),
        "",
        ...(content ? [content, ""] : []),
    ];
}

function getProductSection(product: LlmsProduct): string[] {
    const description =
        descriptionToText(product.description) ||
        (product.seoDescription ?? "").trim();

    return [
        `### ${product.name}`,
        "",
        `Link: ${BASE_URL}/product/${product.slug}`,
        `Availability: ${dict.product.status[product.status].toLowerCase()}`,
        "",
        ...(description ? [description, ""] : []),
    ];
}

export async function GET() {
    const [products, posts] = await Promise.all([
        getLlmsProducts(),
        loadLlmsPosts(),
    ]);

    const catalogSections = products.flatMap(getProductSection);

    const body = [
        `# ${LLMS_TITLE}`,
        "",
        `> ${LLMS_SUMMARY}`,
        "",
        `## ${dict.about.title}`,
        "",
        ...dict.about.paragraphs.flatMap((paragraph) => [paragraph, ""]),
        `## ${dict.catalog.title}`,
        "",
        `All products: ${BASE_URL}/catalog`,
        "",
        ...catalogSections,
        ...(posts.length
            ? [
                `## ${dict.blog.title}`,
                "",
                `All articles: ${BASE_URL}/blog`,
                "",
                ...posts.flatMap(getPostSection),
            ]
            : []),
    ].join("\n");

    return new Response(body, {
        headers: {
            "Content-Type": "text/plain; charset=utf-8",
        },
    });
}