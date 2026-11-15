"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { Input } from "@/shared/ui/input";
import { Button } from "@/shared/ui/button";

export function AdminLogin() {
    const router = useRouter();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState<string | null>(null);
    const [isPending, setIsPending] = useState(false);

    async function handleSubmit() {
        if (isPending) {
            return;
        }

        setError(null);
        setIsPending(true);

        try {
            const response = await fetch(
                "/api/admin/login",
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        email,
                        password,
                    }),
                },
            );

            if (!response.ok) {
                setError("Невірний email або пароль");
                setIsPending(false);

                return;
            }

            router.replace("/admin/products");
            router.refresh();
        } catch {
            setError("Не вдалося увійти. Спробуйте пізніше");
            setIsPending(false);
        }
    }

    return (
        <div className="flex min-h-screen w-full items-center justify-center px-4">
            <div className="w-full max-w-sm rounded-2xl border border-[var(--border-primary)] bg-[var(--card-bg)] p-8 shadow-[var(--shadow-primary)]">
                <h1 className="text-center text-2xl font-semibold text-[var(--text-primary)]">
                    Вхід
                </h1>

                <div className="mt-8 flex flex-col gap-4">
                    <Input
                        type="email"
                        value={email}
                        onChange={(event) =>
                            setEmail(event.target.value)
                        }
                        onKeyDown={(event) => {
                            if (event.key === "Enter") {
                                handleSubmit();
                            }
                        }}
                        placeholder="Email"
                        autoComplete="username"
                        invalid={Boolean(error)}
                    />

                    <Input
                        type="password"
                        value={password}
                        onChange={(event) =>
                            setPassword(event.target.value)
                        }
                        onKeyDown={(event) => {
                            if (event.key === "Enter") {
                                handleSubmit();
                            }
                        }}
                        placeholder="Пароль"
                        autoComplete="current-password"
                        invalid={Boolean(error)}
                    />

                    {error ? (
                        <div className="text-sm text-[var(--error-primary)]">
                            {error}
                        </div>
                    ) : null}

                    <Button
                        type="button"
                        onClick={handleSubmit}
                        loading={isPending}
                        className="mt-2 h-12 w-full rounded-xl bg-[var(--accent-primary)] px-6 text-sm font-medium text-white hover:bg-[var(--accent-hover)] active:scale-[0.99]"
                    >
                        {isPending ? "Вхід..." : "Увійти"}
                    </Button>
                </div>
            </div>
        </div>
    );
}