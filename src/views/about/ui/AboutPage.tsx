import { getHomeBreadcrumb } from "@/shared/config/breadcrumbs";
import { getI18n } from "@/shared/i18n/server";
import { Breadcrumbs } from "@/shared/ui/breadcrumbs";
import { Wrapper } from "@/shared/ui/wrapper";

export async function AboutPage() {
    const { locale, dict } = await getI18n();

    return (
        <section className="w-full px-4 py-6 sm:px-6">
            <Breadcrumbs
                className="mb-10"
                items={[
                    getHomeBreadcrumb(locale, dict),
                    { label: dict.about.title },
                ]}
            />

            <h1 className="mb-8 text-center text-3xl font-semibold text-[var(--text-primary)]">
                {dict.about.title}
            </h1>

            <Wrapper className="p-6 sm:p-8">
                <div className="space-y-4">
                    {dict.about.paragraphs.map((paragraph) => (
                        <p
                            key={paragraph}
                            className="text-sm leading-7 text-[var(--text-secondary)]"
                        >
                            {paragraph}
                        </p>
                    ))}
                </div>
            </Wrapper>
        </section>
    );
}
