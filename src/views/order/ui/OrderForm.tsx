"use client";

import { useState, type FormEvent } from "react";

import {
    LEAD_LIMITS,
    isValidLeadEmail,
    isValidLeadMessage,
    isValidLeadName,
    isValidLeadPhone,
    type LeadContactType,
} from "@/entities/lead";
import { Button } from "@/shared/ui/button";
import { ButtonLink } from "@/shared/ui/button-link";
import { Input } from "@/shared/ui/input";
import { PhoneInput } from "@/shared/ui/phone-input";
import { Textarea } from "@/shared/ui/textarea";
import { useI18n } from "@/providers/locale-provider";

const labelClass = "flex flex-col gap-[6px]";
const captionClass = "text-[14px] text-[var(--text-secondary)]";

const CONTACT_TYPES: LeadContactType[] = ["phone", "email"];

export function OrderForm() {
    const { locale, dict, href } = useI18n();
    const [name, setName] = useState("");
    const [contactType, setContactType] = useState<LeadContactType>("phone");
    const [phone, setPhone] = useState("");
    const [email, setEmail] = useState("");
    const [message, setMessage] = useState("");

    const [submitAttempted, setSubmitAttempted] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSent, setIsSent] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const nameInvalid = !isValidLeadName(name);
    const phoneInvalid = contactType === "phone" && !isValidLeadPhone(phone);
    const emailInvalid = contactType === "email" && !isValidLeadEmail(email);
    const messageInvalid = !isValidLeadMessage(message);

    const isFormValid =
        !nameInvalid && !phoneInvalid && !emailInvalid && !messageInvalid;

    async function handleSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();

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
            const response = await fetch("/api/lead", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    name: name.trim(),
                    contactType,
                    phone: contactType === "phone" ? phone : "",
                    email: contactType === "email" ? email.trim() : "",
                    message: message.trim(),
                    locale,
                }),
            });

            const result = await response.json().catch(() => null);

            if (!response.ok || !result?.success) {
                setError(dict.order.sendError);

                return;
            }

            setIsSent(true);
        } catch (fetchError) {
            console.error("SEND LEAD ERROR", fetchError);

            setError(dict.order.sendError);
        } finally {
            setIsSubmitting(false);
        }
    }

    if (isSent) {
        return (
            <div className="flex w-full max-w-[480px] flex-col items-center gap-[8px] rounded-2xl border border-[var(--border-primary)] bg-[var(--bg-primary)] px-[24px] py-[32px] text-center">
                <span className="text-[20px] font-bold text-[var(--text-primary)]">
                    {dict.order.successTitle}
                </span>

                <span className="text-[14px] text-[var(--text-secondary)]">
                    {dict.order.successText}
                </span>

                <ButtonLink
                    href={href("/catalog")}
                    className="mt-[16px] h-12 rounded-full border border-[var(--border-primary)] px-[28px] text-[16px] font-medium text-[var(--text-primary)] hover:border-[var(--border-hover)] active:scale-[0.99]"
                >
                    {dict.order.toShowcase}
                </ButtonLink>
            </div>
        );
    }

    return (
        <form
            onSubmit={handleSubmit}
            noValidate
            className="flex w-full max-w-[480px] flex-col gap-[16px]"
        >
            <label className={labelClass}>
                <span className={captionClass}>{dict.order.name}</span>

                <Input
                    value={name}
                    onChange={(event) => setName(event.target.value)}
                    placeholder={dict.order.namePlaceholder}
                    autoComplete="name"
                    maxLength={LEAD_LIMITS.name}
                    invalid={submitAttempted && nameInvalid}
                />
            </label>

            <div className={labelClass}>
                <span className={captionClass}>{dict.order.contactMethod}</span>

                <div
                    role="radiogroup"
                    aria-label={dict.order.contactMethodLabel}
                    className="grid grid-cols-2 gap-[4px] rounded-2xl border border-[var(--border-primary)] bg-[var(--bg-primary)] p-[4px]"
                >
                    {CONTACT_TYPES.map((type) => {
                        const isActive = type === contactType;

                        return (
                            <button
                                key={type}
                                type="button"
                                role="radio"
                                aria-checked={isActive}
                                onClick={() => setContactType(type)}
                                className={`h-10 cursor-pointer rounded-xl text-sm font-medium transition-all duration-300 ${isActive
                                    ? "bg-[var(--accent-primary)] text-black"
                                    : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                                    }`}
                            >
                                {dict.order[type]}
                            </button>
                        );
                    })}
                </div>
            </div>

            {contactType === "phone" ? (
                <label className={labelClass}>
                    <span className={captionClass}>{dict.order.phoneLabel}</span>

                    <PhoneInput
                        placeholder={dict.order.phonePlaceholder}
                        value={phone}
                        onChange={setPhone}
                        invalid={submitAttempted && phoneInvalid}
                    />
                </label>
            ) : (
                <label className={labelClass}>
                    <span className={captionClass}>{dict.order.emailLabel}</span>

                    <Input
                        type="email"
                        value={email}
                        onChange={(event) => setEmail(event.target.value)}
                        placeholder="you@example.com"
                        autoComplete="email"
                        inputMode="email"
                        maxLength={LEAD_LIMITS.email}
                        invalid={submitAttempted && emailInvalid}
                    />
                </label>
            )}

            <label className={labelClass}>
                <span className={captionClass}>{dict.order.message}</span>

                <Textarea
                    value={message}
                    onChange={(event) => setMessage(event.target.value)}
                    placeholder={dict.order.messagePlaceholder}
                    rows={4}
                    maxLength={LEAD_LIMITS.message}
                    invalid={submitAttempted && messageInvalid}
                />
            </label>

            {submitAttempted && !isFormValid ? (
                <div className="text-sm text-[var(--error-primary)]">
                    {dict.order.required}
                </div>
            ) : null}

            {error ? (
                <div className="text-sm text-[var(--error-primary)]">{error}</div>
            ) : null}

            <Button
                type="submit"
                aria-disabled={!isFormValid}
                loading={isSubmitting}
                className="mt-[8px] h-12 rounded-full bg-[var(--accent-primary)] px-[28px] text-[16px] font-semibold text-black hover:bg-[var(--accent-hover)] active:scale-[0.99]"
            >
                {dict.order.submit}
            </Button>
        </form>
    );
}
