import { getLlmsPosts, type LlmsPost } from "@/entities/post/api/get-llms-posts";

import {
    LLMS_SUMMARY,
    LLMS_TITLE,
    cleanLlmsLinkText,
} from "@/shared/config/llms";
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

export async function GET() {
    const posts = await loadLlmsPosts();

    const body = [
        `# ${LLMS_TITLE}`,
        "",
        `> ${LLMS_SUMMARY}`,
        "",
        ...dict.about.paragraphs.flatMap((paragraph) => [paragraph, ""]),
        `## ${dict.catalog.title}`,
        "",
        `- [All products](${BASE_URL}/catalog)`,
        "",
        `## ${dict.blog.title}`,
        "",
        `- [All articles](${BASE_URL}/blog)`,
        ...posts.map(
            (post) =>
                `- [${cleanLlmsLinkText(post.title)}](${BASE_URL}/blog/${post.slug})`,
        ),
        "",
        "## Information",
        "",
        `- [${dict.about.title}](${BASE_URL}/about)`,
        `- [${dict.order.title}](${BASE_URL}/order): ${dict.order.description}`,
        "",
        "## Optional",
        "",
        `- [Full catalog](${SITE_URL}/llms-full.txt): all products with availability and descriptions`,
        "",
    ].join("\n");

    return new Response(body, {
        headers: {
            "Content-Type": "text/plain; charset=utf-8",
        },
    });
}