"use client";

import Image from "next/image";

import type { PostStatus } from "@/entities/post";
import { Input } from "@/shared/ui/input";
import {
  SelectDropdown,
  type DropdownOption,
} from "@/shared/ui/select-dropdown";

const STATUS_OPTIONS = [
  { value: "draft", label: "Чернетка" },
  { value: "published", label: "Опубліковано" },
] as const satisfies readonly DropdownOption[];

type PostBasicsProps = {
  title: string;
  status: PostStatus;
  titleInvalid: boolean;
  onTitleChange: (value: string) => void;
  onStatusChange: (value: PostStatus) => void;
};

export function PostBasics({
  title,
  status,
  titleInvalid,
  onTitleChange,
  onStatusChange,
}: PostBasicsProps) {
  return (
    <div className="rounded-2xl border border-[var(--border-primary)] bg-[var(--card-bg)] p-6">
      <div>
        <label className="mb-2 block text-sm text-[var(--text-secondary)]">
          Назва
        </label>

        <Input
          type="text"
          value={title}
          onChange={(event) => onTitleChange(event.target.value)}
          placeholder="Назва"
          invalid={titleInvalid}
        />
      </div>

      <div className="mt-5">
        <span className="mb-2 block text-sm text-[var(--text-secondary)]">
          Статус
        </span>

        <SelectDropdown
          options={STATUS_OPTIONS}
          defaultValue={status}
          onChange={(value) =>
            onStatusChange(value === "published" ? "published" : "draft")
          }
          className="w-full"
          renderTrigger={({ open, selectedOption, toggle }) => (
            <button
              type="button"
              onClick={toggle}
              aria-expanded={open}
              className="flex w-full cursor-pointer items-center justify-between gap-3 rounded-2xl border border-[var(--border-primary)] bg-[var(--bg-primary)] px-4 py-[13px] text-left text-[16px] text-[var(--text-primary)] outline-none transition-all duration-300 hover:border-[var(--border-hover)] focus:border-[var(--border-hover)] focus:shadow-[var(--shadow-primary)]"
            >
              <span className="flex items-center gap-2">
                <span
                  className={`size-2 rounded-full ${
                    selectedOption?.value === "published"
                      ? "bg-[var(--accent-primary)]"
                      : "bg-[var(--icon-inactive)]"
                  }`}
                />
                {selectedOption?.label}
              </span>

              <Image
                src="/icons/arrow.svg"
                alt=""
                width={16}
                height={16}
                className={`transition-transform duration-200 ${
                  open ? "rotate-180" : ""
                }`}
              />
            </button>
          )}
        />
      </div>
    </div>
  );
}