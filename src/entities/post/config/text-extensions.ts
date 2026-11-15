import StarterKit from "@tiptap/starter-kit";
import { TableKit } from "@tiptap/extension-table";

export const POST_TEXT_EXTENSIONS = [
    StarterKit.configure({
        heading: {
            levels: [2, 3],
        },
        link: {
            openOnClick: false,
            autolink: true,
            defaultProtocol: "https",
        },
    }),

    TableKit.configure({
        table: {
            resizable: false,
        },
    }),
];
