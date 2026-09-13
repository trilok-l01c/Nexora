import Link from "next/link";

export default function NotFound() {
    return (
        <main
            style={{
                display: "grid",
                placeItems: "center",
                minHeight: "70vh",
                padding: "48px 24px",
                textAlign: "center",
                gap: "24px",
            }}
        >
            <div>
                <p
                    style={{
                        color: "var(--card-label)",
                        fontSize: "11px",
                        fontWeight: 600,
                        letterSpacing: "0.1em",
                        textTransform: "uppercase",
                        marginBottom: "16px",
                    }}
                >
                    404 / Page not found
                </p>
                <h1
                    style={{
                        fontSize: "clamp(40px, 6vw, 72px)",
                        lineHeight: 0.9,
                        letterSpacing: "-0.06em",
                        margin: 0,
                    }}
                >
                    Nothing here.
                    <br />
                    <em style={{ color: "var(--hero-emphasis)", fontStyle: "normal" }}>
                        Yet.
                    </em>
                </h1>
                <p
                    style={{
                        color: "var(--muted)",
                        fontSize: "15px",
                        lineHeight: 1.6,
                        maxWidth: "440px",
                        margin: "20px auto 0",
                    }}
                >
                    The page you were looking for has moved, never existed, or is
                    hiding in another route. Let&apos;s get you back on track.
                </p>
            </div>
            <Link
                href="/"
                style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "28px",
                    padding: "16px 19px",
                    color: "var(--button-text)",
                    background: "var(--button-bg)",
                    fontSize: "12px",
                    fontWeight: 600,
                }}
            >
                Back to homepage <span aria-hidden="true">→</span>
            </Link>
        </main>
    );
}
