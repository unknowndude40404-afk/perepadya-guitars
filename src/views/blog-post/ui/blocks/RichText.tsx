import Link from "next/link";
import { Fragment, type ReactNode } from "react";
import type { JSONContent } from "@tiptap/react";

function getSafeHref(href: unknown): string | null {
    if (typeof href !== "string") {
        return null;
    }

    const value = href.trim();

    if (value.startsWith("/") && !value.startsWith("//")) {
        return value;
    }

    try {
        const url = new URL(value);

        return ["http:", "https:", "mailto:", "tel:"].includes(url.protocol)
            ? value
            : null;
    } catch {
        return null;
    }
}

function renderText(node: JSONContent): ReactNode {
    let content: ReactNode = node.text ?? "";

    for (const mark of node.marks ?? []) {
        switch (mark.type) {
            case "bold":
                content = <strong>{content}</strong>;
                break;

            case "italic":
                content = <em>{content}</em>;
                break;

            case "strike":
                content = <s>{content}</s>;
                break;

            case "underline":
                content = <u>{content}</u>;
                break;

            case "code":
                content = <code>{content}</code>;
                break;

            case "link": {
                const href = getSafeHref(mark.attrs?.href);

                if (!href) {
                    break;
                }

                content = href.startsWith("/") ? (
                    <Link href={href}>{content}</Link>
                ) : (
                    <a href={href} target="_blank" rel="noopener noreferrer">
                        {content}
                    </a>
                );
                break;
            }
        }
    }

    return content;
}

function renderChildren(node: JSONContent): ReactNode {
    return (node.content ?? []).map((child, index) => (
        <Fragment key={index}>{renderNode(child)}</Fragment>
    ));
}

function renderNode(node: JSONContent): ReactNode {
    switch (node.type) {
        case "text":
            return renderText(node);

        case "paragraph":
            return <p>{renderChildren(node)}</p>;

        case "heading":
            return node.attrs?.level === 3 ? (
                <h3>{renderChildren(node)}</h3>
            ) : (
                <h2>{renderChildren(node)}</h2>
            );

        case "bulletList":
            return <ul>{renderChildren(node)}</ul>;

        case "orderedList":
            return <ol>{renderChildren(node)}</ol>;

        case "listItem":
            return <li>{renderChildren(node)}</li>;

        case "blockquote":
            return <blockquote>{renderChildren(node)}</blockquote>;

        case "codeBlock":
            return (
                <pre>
                    <code>{renderChildren(node)}</code>
                </pre>
            );

        case "horizontalRule":
            return <hr />;

        case "hardBreak":
            return <br />;

        case "table":
            return (
                <table>
                    <tbody>{renderChildren(node)}</tbody>
                </table>
            );

        case "tableRow":
            return <tr>{renderChildren(node)}</tr>;

        case "tableHeader":
            return <th>{renderChildren(node)}</th>;

        case "tableCell":
            return <td>{renderChildren(node)}</td>;

        default:
            return null;
    }
}

type RichTextProps = {
    content: JSONContent;
};

export function RichText({ content }: RichTextProps) {
    return (
        <div className="rich-text text-[17px] leading-8 text-[var(--text-primary)]">
            {renderChildren(content)}
        </div>
    );
}