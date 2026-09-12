"use client";

import { FormEvent, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import styles from "./AuthDialog.module.css";

const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4292";
type Mode = "signin" | "signup";

export default function AuthDialog() {
    const router = useRouter();
    const [mode, setMode] = useState<Mode>("signin");
    const [open, setOpen] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState("");
    const [form, setForm] = useState({
        name: "",
        email: "",
        company: "",
        password: "",
        confirmPassword: "",
    });
    const triggerRef = useRef<HTMLButtonElement>(null);
    const dialogRef = useRef<HTMLDivElement>(null);

    function close() {
        setOpen(false);
        setMessage("");
        triggerRef.current?.focus();
    }

    function switchMode(nextMode: Mode) {
        setMode(nextMode);
        setMessage("");
        setShowPassword(false);
    }

    useEffect(() => {
        if (!open) return;
        const previousActive = document.activeElement as HTMLElement | null;
        const focusable = () =>
            Array.from(
                dialogRef.current?.querySelectorAll<HTMLElement>(
                    "button, input, [href]",
                ) || [],
            ).filter((element) => !element.hasAttribute("disabled"));
        focusable()[0]?.focus();
        function handleKeyDown(event: KeyboardEvent) {
            if (event.key === "Escape") close();
            if (event.key !== "Tab") return;
            const elements = focusable();
            if (!elements.length) return;
            const first = elements[0];
            const last = elements[elements.length - 1];
            if (event.shiftKey && document.activeElement === first) {
                event.preventDefault();
                last.focus();
            } else if (!event.shiftKey && document.activeElement === last) {
                event.preventDefault();
                first.focus();
            }
        }
        document.addEventListener("keydown", handleKeyDown);
        return () => {
            document.removeEventListener("keydown", handleKeyDown);
            previousActive?.focus();
        };
    }, [open]);

    function update(field: keyof typeof form, value: string) {
        setForm((current) => ({ ...current, [field]: value }));
    }

    async function submit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setLoading(true);
        setMessage("");
        try {
            const endpoint =
                mode === "signin" ? "/api/auth/login" : "/api/auth/signup";
            const body =
                mode === "signin"
                    ? { email: form.email, password: form.password }
                    : form;
            const response = await fetch(`${apiUrl}${endpoint}`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify(body),
            });
            const result = await response.json();
            if (!response.ok)
                throw new Error(
                    result.message ||
                        "Authentication failed. Please try again.",
                );
            close();
            router.push(
                result.data?.user?.role === "admin"
                    ? "/admin"
                    : "/client/dashboard",
            );
        } catch (error) {
            setMessage(
                error instanceof Error
                    ? error.message
                    : "Authentication failed. Please try again.",
            );
        } finally {
            setLoading(false);
        }
    }

    return (
        <>
            <button
                ref={triggerRef}
                className={styles.trigger}
                type="button"
                onClick={() => {
                    setMode("signin");
                    setOpen(true);
                }}
            >
                Sign In
            </button>
            {open && (
                <div
                    className={styles.backdrop}
                    role="presentation"
                    onMouseDown={(event) => {
                        if (event.target === event.currentTarget) close();
                    }}
                >
                    <div
                        ref={dialogRef}
                        className={styles.dialog}
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby="auth-dialog-title"
                    >
                        <button
                            className={styles.close}
                            type="button"
                            onClick={close}
                            aria-label="Close authentication dialog"
                        >
                            ×
                        </button>
                        <p className={styles.kicker}>Nexora client portal</p>
                        <h2 id="auth-dialog-title">
                            {mode === "signin"
                                ? "Welcome back"
                                : "Create your Nexora account"}
                        </h2>
                        <p className={styles.intro}>
                            {mode === "signin"
                                ? "Sign in to follow your projects and updates."
                                : "Create a client account to stay close to the work."}
                        </p>
                        <form onSubmit={submit}>
                            {mode === "signup" && (
                                <>
                                    <label className={styles.field}>
                                        Name
                                        <input
                                            value={form.name}
                                            onChange={(event) =>
                                                update(
                                                    "name",
                                                    event.target.value,
                                                )
                                            }
                                            required
                                            minLength={2}
                                            maxLength={120}
                                            autoComplete="name"
                                        />
                                    </label>
                                    <label className={styles.field}>
                                        Company
                                        <input
                                            value={form.company}
                                            onChange={(event) =>
                                                update(
                                                    "company",
                                                    event.target.value,
                                                )
                                            }
                                            required
                                            minLength={2}
                                            maxLength={160}
                                            autoComplete="organization"
                                        />
                                    </label>
                                </>
                            )}
                            <label className={styles.field}>
                                {mode === "signin" ? "Email" : "Work email"}
                                <input
                                    type="email"
                                    value={form.email}
                                    onChange={(event) =>
                                        update("email", event.target.value)
                                    }
                                    required
                                    maxLength={254}
                                    autoComplete="email"
                                />
                            </label>
                            <label className={styles.field}>
                                Password
                                <div className={styles.passwordWrap}>
                                    <input
                                        type={
                                            showPassword ? "text" : "password"
                                        }
                                        value={form.password}
                                        onChange={(event) =>
                                            update(
                                                "password",
                                                event.target.value,
                                            )
                                        }
                                        required
                                        minLength={8}
                                        maxLength={128}
                                        autoComplete={
                                            mode === "signin"
                                                ? "current-password"
                                                : "new-password"
                                        }
                                    />
                                    <button
                                        className={styles.passwordToggle}
                                        type="button"
                                        onClick={() =>
                                            setShowPassword(
                                                (visible) => !visible,
                                            )
                                        }
                                    >
                                        {showPassword ? "Hide" : "Show"}
                                    </button>
                                </div>
                            </label>
                            {mode === "signup" && (
                                <label className={styles.field}>
                                    Confirm password
                                    <input
                                        type={
                                            showPassword ? "text" : "password"
                                        }
                                        value={form.confirmPassword}
                                        onChange={(event) =>
                                            update(
                                                "confirmPassword",
                                                event.target.value,
                                            )
                                        }
                                        required
                                        minLength={8}
                                        maxLength={128}
                                        autoComplete="new-password"
                                    />
                                </label>
                            )}
                            <p className={styles.passwordHint}>
                                {mode === "signup"
                                    ? "Use 8 to 128 characters. Your account will be created as a client account."
                                    : ""}
                            </p>
                            <p
                                className={`${styles.message} ${message ? styles.error : ""}`}
                                aria-live="polite"
                            >
                                {message}
                            </p>
                            <button
                                className={styles.submit}
                                type="submit"
                                disabled={loading}
                            >
                                {loading
                                    ? "Please wait..."
                                    : mode === "signin"
                                      ? "Sign In"
                                      : "Create Account"}
                            </button>
                        </form>
                        <p className={styles.switchPrompt}>
                            {mode === "signin"
                                ? "Don't have an account?"
                                : "Already have an account?"}{" "}
                            <button
                                type="button"
                                onClick={() =>
                                    switchMode(
                                        mode === "signin" ? "signup" : "signin",
                                    )
                                }
                            >
                                {mode === "signin"
                                    ? "Create an account"
                                    : "Sign In"}
                            </button>
                        </p>
                    </div>
                </div>
            )}
        </>
    );
}
