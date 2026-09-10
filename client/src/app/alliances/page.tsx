import type { Metadata } from "next";
import CompanyPage from "../components/company/CompanyPage";

export const metadata: Metadata = {
    title: "Alliances | Nexora",
    description:
        "Build stronger digital outcomes with the Nexora partner network.",
};

export default function AlliancesPage() {
    return (
        <CompanyPage
            eyebrow="Alliances"
            title={
                <>
                    Better together.
                    <br />
                    <em>By design.</em>
                </>
            }
            description="Nexora works with complementary specialists, platforms, and technology teams to bring the right expertise into the room at the right time."
            signal="ALL"
            sectionLabel="01 / What we bring"
            sectionTitle={
                <>
                    Partnerships with
                    <br />
                    <em>useful range.</em>
                </>
            }
            cards={[
                {
                    number: "01",
                    title: "Complementary expertise.",
                    text: "Bring strategy, engineering, infrastructure, and specialist knowledge together around one shared outcome.",
                },
                {
                    number: "02",
                    title: "Shared standards.",
                    text: "We value clear communication, thoughtful delivery, and work that earns trust from the teams using it.",
                },
                {
                    number: "03",
                    title: "Room to grow.",
                    text: "Strong alliances create better options for clients without adding unnecessary layers or handoffs.",
                },
            ]}
        />
    );
}
