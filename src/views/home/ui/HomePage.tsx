import { OrganizationJsonLd } from "./OrganizationJsonLd";
import { SITE_NAME } from "@/shared/config/site";

export function HomePage() {
    return (
        <div className="w-full">
            <OrganizationJsonLd />

            <h1 className="sr-only">
                {SITE_NAME}
            </h1>
        </div>
    );
}
