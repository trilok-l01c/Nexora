"use client";

import { FormEvent, KeyboardEvent, useEffect, useRef, useState } from "react";
import { useReveal } from "../../useReveal";
import styles from "./Contact.module.css";
import { apiUrl } from "../../apiConfig";

type Field = "name" | "company" | "email" | "phone" | "service" | "message";
const prompts: {
    field: Field;
    question: string;
    hint: string;
    type: "text" | "email" | "tel" | "textarea";
    required: boolean;
    autoComplete?: string;
}[] = [
    {
        field: "name",
        question: "What is your name?",
        hint: "Press Enter to continue",
        type: "text",
        required: true,
        autoComplete: "name",
    },
    {
        field: "company",
        question: "Your company name?",
        hint: "Press Enter to continue — optional",
        type: "text",
        required: false,
        autoComplete: "organization",
    },
    {
        field: "email",
        question: "Your email?",
        hint: "Press Enter to continue",
        type: "email",
        required: true,
        autoComplete: "email",
    },
    {
        field: "phone",
        question: "Your phone number?",
        hint: "Press Enter to continue — optional",
        type: "tel",
        required: false,
        autoComplete: "tel",
    },
    {
        field: "service",
        question: "What service do you want?",
        hint: "For example: website, AI automation, data analysis, or blockchain",
        type: "text",
        required: true,
    },
    {
        field: "message",
        question: "Briefly explain what you want?",
        hint: "Press Enter to send your enquiry",
        type: "textarea",
        required: true,
    },
];
const emptyForm = {
    name: "",
    company: "",
    email: "",
    phone: "",
    service: "",
    message: "",
};

export default function Contact() {
    const [form, setForm] = useState(emptyForm);
    const [step, setStep] = useState(0);
    const [draft, setDraft] = useState("");
    const [error, setError] = useState("");
    const [status, setStatus] = useState<
        "idle" | "sending" | "success" | "error"
    >("idle");
    const [statusMessage, setStatusMessage] = useState("");
    const introReveal = useReveal<HTMLDivElement>();
    const formReveal = useReveal<HTMLFormElement>({ delay: 120 });
    const active = prompts[step];
    const [typedQuestion, setTypedQuestion] = useState("");
    const contactSectionRef = useRef<HTMLElement>(null);
    const activeFieldRef = useRef<HTMLInputElement | HTMLTextAreaElement>(null);
    const [hasReachedContact, setHasReachedContact] = useState(false);

    useEffect(() => {
        const section = contactSectionRef.current;
        if (!section || !("IntersectionObserver" in window)) return;

        const observer = new IntersectionObserver(
            ([entry]) => {
                if (!entry.isIntersecting) return;
                setHasReachedContact(true);
                observer.disconnect();
            },
            { threshold: 0.2 },
        );
        observer.observe(section);
        return () => observer.disconnect();
    }, []);

    useEffect(() => {
        if (!active) return;
        let character = 0;
        const timer = window.setInterval(() => {
            setTypedQuestion(active.question.slice(0, character));
            if (character === active.question.length) {
                window.clearInterval(timer);
                return;
            }
            character += 1;
        }, 28);
        return () => window.clearInterval(timer);
    }, [active]);

    useEffect(() => {
        if (!hasReachedContact || typedQuestion !== active?.question) return;
        activeFieldRef.current?.focus({ preventScroll: true });
    }, [active, hasReachedContact, typedQuestion]);

    function validate() {
        const value = draft.trim();
        if (active.required && !value)
            return "Please add a response before continuing.";
        if (active.field === "email" && value && !/^\S+@\S+\.\S+$/.test(value))
            return "Please enter a valid email address.";
        if (
            active.field === "phone" &&
            value &&
            !/^[+\d][\d\s().-]{6,29}$/.test(value)
        )
            return "Please enter a valid phone number, or leave this blank.";
        return "";
    }
    function advance() {
        const message = validate();
        if (message) return setError(message);
        setForm((current) => ({ ...current, [active.field]: draft.trim() }));
        setDraft("");
        setError("");
        setStep((current) => current + 1);
    }
    async function submit() {
        const message = validate();
        if (message) return setError(message);
        const completedForm = { ...form, [active.field]: draft.trim() };
        setStatus("sending");
        setStatusMessage("");
        try {
            const response = await fetch(`${apiUrl}/api/contact`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(completedForm),
            });
            const result = await response.json();
            if (!response.ok)
                throw new Error(
                    result.message || "We could not send your message.",
                );
            setForm(completedForm);
            setDraft("");
            setStep(prompts.length);
            setStatus("success");
            setStatusMessage(result.message);
        } catch (submissionError) {
            setStatus("error");
            setStatusMessage(
                submissionError instanceof Error
                    ? submissionError.message
                    : "We could not send your message.",
            );
        }
    }
    function onKeyDown(
        event: KeyboardEvent<HTMLInputElement | HTMLTextAreaElement>,
    ) {
        if (event.key !== "Enter" || event.shiftKey) return;
        event.preventDefault();
        if (step === prompts.length - 1) void submit();
        else advance();
    }
    function onSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        if (step < prompts.length - 1) advance();
        else void submit();
    }

    return (
        <section className={styles.contact} id="contact" ref={contactSectionRef}>
            <div {...introReveal}>
                <p className={styles.kicker}>03 / Make a move</p>
                <h2>
                    Have a good
                    <br />
                    <em>feeling</em> about this?
                </h2>
            </div>
            <form
                className={`${styles.contactForm} ${styles.conversationForm}`}
                onSubmit={onSubmit}
                {...formReveal}
            >
                <div className={styles.conversationLog} aria-live="polite">
                    <p className={styles.systemLine}>So, let&apos;s talk.</p>
                    {prompts.slice(0, step).map((prompt) => (
                        <div
                            className={styles.completedLine}
                            key={prompt.field}
                        >
                            <p>{prompt.question}</p>
                            <span>{form[prompt.field] || "—"}</span>
                        </div>
                    ))}
                    {step < prompts.length ? (
                        <div className={styles.activeLine} key={active.field}>
                            <div className={styles.questionRow}>
                                <label htmlFor={`contact-${active.field}`}>
                                    {typedQuestion}
                                    {typedQuestion !== active.question && (
                                        <i aria-hidden="true" />
                                    )}
                                </label>
                                {typedQuestion === active.question &&
                                    (active.type === "textarea" ? (
                                        <textarea
                                            id={`contact-${active.field}`}
                                            ref={(field) => {
                                                activeFieldRef.current = field;
                                            }}
                                            value={draft}
                                            onChange={(event) => {
                                                setDraft(event.target.value);
                                                setError("");
                                            }}
                                            onKeyDown={onKeyDown}
                                            rows={3}
                                        />
                                    ) : (
                                        <input
                                            id={`contact-${active.field}`}
                                            ref={(field) => {
                                                activeFieldRef.current = field;
                                            }}
                                            type={active.type}
                                            value={draft}
                                            onChange={(event) => {
                                                setDraft(event.target.value);
                                                setError("");
                                            }}
                                            onKeyDown={onKeyDown}
                                            autoComplete={active.autoComplete}
                                        />
                                    ))}
                            </div>
                            <small>
                                {active.hint} <kbd>↵</kbd>
                            </small>
                        </div>
                    ) : (
                        <p className={styles.successLine}>
                            ✦ Thank you. We&apos;ll be in touch soon.
                        </p>
                    )}
                </div>
                <div className={styles.formFooter}>
                    <p
                        className={styles.formStatus}
                        data-status={status}
                        aria-live="polite"
                    >
                        {error || statusMessage}
                    </p>
                    {step < prompts.length &&
                        typedQuestion === active.question && (
                            <button
                                className={styles.conversationSubmit}
                                type="submit"
                            >
                                {step === prompts.length - 1
                                    ? "Send enquiry"
                                    : "Continue"}{" "}
                                <span>↵</span>
                            </button>
                        )}
                </div>
            </form>
        </section>
    );
}
