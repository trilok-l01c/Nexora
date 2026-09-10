import type { Metadata } from "next";
import CompanyPage from "../components/company/CompanyPage";

export const metadata: Metadata = {
    title: "Clients | Nexora",
    description:
        "How Nexora helps ambitious teams turn technology into momentum.",
};

export default function ClientsPage() {
    return (
        <CompanyPage
            eyebrow="Clients"
            title={
                <>
                    Built around
                    <br />
                    <em>your momentum.</em>
                </>
            }
            description="We work alongside teams who want technology to become a clearer advantage, not another source of complexity. Strategy, design, engineering, and support move together around the work that matters to you."
            signal="YOU"
            sectionLabel="01 / Working together"
            sectionTitle={
                <>
                    A better kind of
                    <br />
                    <em>technology partner.</em>
                </>
            }
            cards={[
                {
                    number: "01",
                    title: "Start with the real problem.",
                    text: "We listen closely, map the friction, and find the smallest useful move that can create momentum.",
                },
                {
                    number: "02",
                    title: "Make progress visible.",
                    text: "Clear plans, regular touchpoints, and working increments keep every decision connected to the outcome.",
                },
                {
                    number: "03",
                    title: "Leave you stronger.",
                    text: "We build systems your team can understand, own, and keep improving long after launch.",
                },
            ]}
        />
    );
}
