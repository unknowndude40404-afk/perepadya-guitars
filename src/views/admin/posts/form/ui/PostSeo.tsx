"use client";

import { Input } from "@/shared/ui/input";
import { Textarea } from "@/shared/ui/textarea";

const SEO_TITLE_MAX = 60;
const SEO_DESCRIPTION_MAX = 160;

type PostSeoProps = {
  showErrors: boolean;
  seoTitle: string;
  seoDescription: string;
  onSeoTitleChange: (value: string) => void;
  onSeoDescriptionChange: (value: string) => void;
};

export function PostSeo({
  showErrors,
  seoTitle,
  seoDescription,
  onSeoTitleChange,
  onSeoDescriptionChange,
}: PostSeoProps) {
  const titleLength = seoTitle.trim().length;
  const descriptionLength = seoDescription.trim().length;

  const titleTooLong = titleLength > SEO_TITLE_MAX;
  const descriptionTooLong = descriptionLength > SEO_DESCRIPTION_MAX;

  return (
    <div className="rounded-2xl border border-[var(--border-primary)] bg-[var(--card-bg)] p-6">
      <span className="mb-5 block text-sm font-medium text-[var(--text-primary)]">
        SEO
      </span>

      <div>
        <label className="mb-2 block text-sm text-[var(--text-secondary)]">
          Заголовок
        </label>

        <Input
          type="text"
          value={seoTitle}
          onChange={(event) => onSeoTitleChange(event.target.value)}
          placeholder="Заголовок для пошукової видачі"
          invalid={showErrors && (!seoTitle.trim() || titleTooLong)}
        />

        <div className="mt-1 flex flex-wrap items-center justify-between gap-2 pl-4 text-xs text-[var(--text-secondary)]">
          <span>Рекомендовано 30–60 символів</span>

          <span className={titleTooLong ? "text-[var(--error-primary)]" : ""}>
            {titleLength} / {SEO_TITLE_MAX}
          </span>
        </div>
      </div>

      <div className="mt-5">
        <label className="mb-2 block text-sm text-[var(--text-secondary)]">
          Опис
        </label>

        <Textarea
          value={seoDescription}
          onChange={(event) => onSeoDescriptionChange(event.target.value)}
          placeholder="Опис для пошукової видачі"
          rows={3}
          invalid={showErrors && (!seoDescription.trim() || descriptionTooLong)}
        />

        <div className="mt-1 flex flex-wrap items-center justify-between gap-2 pl-4 text-xs text-[var(--text-secondary)]">
          <span>Рекомендовано 120–160 символів</span>

          <span
            className={descriptionTooLong ? "text-[var(--error-primary)]" : ""}
          >
            {descriptionLength} / {SEO_DESCRIPTION_MAX}
          </span>
        </div>
      </div>
    </div>
  );
}