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
            projects={[
                {
                    client: "Aarav Mehta",
                    business: "Sahyadri Care Network · Pune",
                    project: "A calmer patient journey",
                    summary:
                        "A patient portal and operations dashboard concept that helps clinics coordinate appointments, follow-ups, and care-team communication.",
                    services: "Product design · Software development",
                },
                {
                    client: "Priya Nair",
                    business: "Mango Leaf Kitchens · Bengaluru",
                    project: "Every order in rhythm",
                    summary:
                        "A restaurant operations concept connecting online orders, kitchen status, and ingredient visibility for a growing hospitality team.",
                    services: "Workflow automation · Data analysis",
                },
                {
                    client: "Rohan Kulkarni",
                    business: "VidyaSetu Learning · Mumbai",
                    project: "More room for learning",
                    summary:
                        "A school communication platform concept bringing parents, teachers, and administrators into one clear weekly rhythm.",
                    services: "Web application · Cloud infrastructure",
                },
                {
                    client: "Ananya Iyer",
                    business: "NammaCart Market · Chennai",
                    project: "Insight from every aisle",
                    summary:
                        "A retail analytics concept for understanding product movement, reducing stock gaps, and making local shopping more convenient.",
                    services: "Dashboards · AI systems",
                },
            ]}
        />
    );
}
