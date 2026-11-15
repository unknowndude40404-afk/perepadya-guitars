import { supabaseBrowser } from "@/shared/lib/supabase/client";

type SignedUploadResponse =
    | {
        success: true;
        path: string;
        token: string;
        publicUrl: string;
    }
    | {
        success: false;
        reason?: string;
    };

export type SignedUploadFailReason = "upload_url_failed" | "upload_failed";

export type SignedUploadResult =
    | { success: true; url: string }
    | { success: false; reason: SignedUploadFailReason };

type UploadViaSignedUrlParams = {
    file: File;
    bucket: string;
    uploadUrlEndpoint: string;
};

async function requestSignedUpload(
    endpoint: string,
    contentType: string,
): Promise<SignedUploadResponse | null> {
    try {
        const response = await fetch(endpoint, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ contentType }),
        });

        const result = (await response.json().catch(() => null)) as
            | SignedUploadResponse
            | null;

        return response.ok ? result : null;
    } catch (error) {
        console.error("REQUEST SIGNED UPLOAD ERROR", error);

        return null;
    }
}

export async function uploadViaSignedUrl({
    file,
    bucket,
    uploadUrlEndpoint,
}: UploadViaSignedUrlParams): Promise<SignedUploadResult> {
    const signed = await requestSignedUpload(uploadUrlEndpoint, file.type);

    if (!signed?.success) {
        return { success: false, reason: "upload_url_failed" };
    }

    const { error } = await supabaseBrowser.storage
        .from(bucket)
        .uploadToSignedUrl(signed.path, signed.token, file, {
            contentType: file.type,
        });

    if (error) {
        console.error("SIGNED UPLOAD ERROR", error.message);

        return { success: false, reason: "upload_failed" };
    }

    return { success: true, url: signed.publicUrl };
}