import type { Metadata } from "next";
import styles from "./approach.module.css";

export const metadata: Metadata = {
    title: "Our Approach | Nexora",
    description:
        "How Nexora works with clients: understand, plan, design, build, test, deploy, and support — one clear workflow from first conversation to launch and beyond.",
};

const steps = [
    {
        number: "01",
        name: "Understand",
        text: "Every engagement starts by listening. We map your goals, constraints, users, and the friction in the way things work today. No solution is chosen before the problem is clear.",
    },
    {
        number: "02",
        name: "Plan",
        text: "That understanding becomes a small, sequenced plan with visible milestones, so you always know what happens next, who is involved, and why.",
    },
    {
        number: "03",
        name: "Design",
        text: "Flows, interfaces, and architecture take shape together, checked against real use rather than assumptions — design and engineering move in the same room.",
    },
    {
        number: "04",
        name: "Build",
        text: "Working software arrives in increments you can see and try. You watch the product come together instead of waiting for a reveal.",
    },
    {
        number: "05",
        name: "Test",
        text: "Each increment is verified against the plan: functionally, on real devices, and under the conditions your team actually works in.",
    },
    {
        number: "06",
        name: "Deploy",
        text: "Launch is calm and repeatable. Environments, monitoring, and a way back are all in place before anything goes live.",
    },
    {
        number: "07",
        name: "Support",
        text: "After launch we stay close — maintenance, iteration, and a team that answers when something needs attention, so systems stay healthy between projects.",
    },
];

export default function ApproachPage() {
    return (
        <main className={styles.page}>
            <section className={styles.hero}>
                <div className={styles.heroMeta}>
                    <p>NX / Approach</p>
                    <span>How we work / 2026</span>
                </div>
                <p className={styles.kicker}>Our approach</p>
                <h1>
                    One clear way of
                    <br />
                    <em>working together.</em>
                </h1>
                <p className={styles.intro}>
                    Strategy, design, engineering, and support move together
                    around your work — from the first conversation to launch,
                    and for as long as the system is yours.
                </p>
            </section>
            <section className={styles.process} aria-label="Our process">
                <p className={styles.kicker}>01 / The workflow</p>
                <h2>
                    Seven steps, no
                    <br />
                    <em>black boxes.</em>
                </h2>
                <ol className={styles.stepList}>
                    {steps.map((step) => (
                        <li className={styles.step} key={step.number}>
                            <span className={styles.stepNumber}>
                                {step.number}
                            </span>
                            <h3>{step.name}</h3>
                            <p>{step.text}</p>
                        </li>
                    ))}
                </ol>
            </section>
            <section className={styles.expect} aria-label="What to expect">
                <div>
                    <p className={styles.kicker}>02 / What you can expect</p>
                    <h2>
                        Progress you can
                        <br />
                        <em>actually see.</em>
                    </h2>
                </div>
                <div className={styles.expectPoints}>
                    <div>
                        <span>01</span>
                        <strong>A plan before a build.</strong>
                        <p>
                            Scope, milestones, and responsibilities are written
                            down and agreed before work begins — and revisited
                            openly when reality changes.
                        </p>
                    </div>
                    <div>
                        <span>02</span>
                        <strong>Regular touchpoints.</strong>
                        <p>
                            Working increments and straightforward updates keep
                            every decision connected to the outcome, with no
                            surprise reveals.
                        </p>
                    </div>
                    <div>
                        <span>03</span>
                        <strong>Systems you can own.</strong>
                        <p>
                            We build and document things your team can
                            understand, run, and keep improving long after
                            launch.
                        </p>
                    </div>
                </div>
            </section>
            <section className={styles.cta}>
                <p className={styles.kicker}>03 / Make a move</p>
                <h2>
                    Sound like a fit?
                    <br />
                    <em>Let&apos;s talk.</em>
                </h2>
                <a
                    className={styles.ctaButton}
                    href="mailto:hello@nexora.studio"
                >
                    hello@nexora.studio <span aria-hidden="true">↗</span>
                </a>
            </section>
        </main>
    );
}