import styles from "./Industries.module.css";

const industries = [
    {
        number: "01",
        name: "Hospitals & healthcare",
        title: "Better care starts with clearer systems.",
        text: "Connect patient information, simplify staff workflows, and give healthcare teams the reliable tools they need to spend more time caring.",
        outcomes:
            "Patient portals · Operations dashboards · Secure infrastructure",
    },
    {
        number: "02",
        name: "Restaurants & hospitality",
        title: "Make every service run smoother.",
        text: "From online ordering to stock visibility, we help hospitality teams reduce friction for staff and create more memorable guest experiences.",
        outcomes: "Ordering systems · Inventory tools · Digital presence",
    },
    {
        number: "03",
        name: "Schools & education",
        title: "Give learning more room to happen.",
        text: "Bring students, parents, teachers, and administrators into simpler digital experiences that make communication and progress easier to manage.",
        outcomes: "Learning platforms · Parent communication · Data reporting",
    },
    {
        number: "04",
        name: "Supermarkets & retail",
        title: "Turn busy operations into useful insight.",
        text: "See what is selling, keep shelves moving, and make the customer journey more convenient across stores and digital channels.",
        outcomes:
            "Stock analytics · Customer experiences · Workflow automation",
    },
    {
        number: "05",
        name: "Professional services",
        title: "Make expertise easier to deliver.",
        text: "We help firms organize knowledge, automate repeatable work, and build digital touchpoints that earn client confidence.",
        outcomes: "Client portals · AI assistants · Process automation",
    },
    {
        number: "06",
        name: "Logistics & operations",
        title: "Keep decisions moving with the work.",
        text: "Connect teams, assets, and data so operational leaders can respond faster and plan with a clearer view of what is happening.",
        outcomes: "Tracking tools · Performance dashboards · Cloud systems",
    },
];

export default function Industries() {
    return (
        <section className={styles.industries} id="industries">
            <div className={styles.intro}>
                <p className={styles.kicker}>02 / Where we help</p>
                <h2>
                    Technology that
                    <br />
                    understands your <em>world.</em>
                </h2>
                <p className={styles.introText}>
                    Every industry has its own pace, pressure, and definition of
                    progress. We shape practical systems around the way your
                    people actually work.
                </p>
            </div>
            <div className={styles.industryGrid}>
                {industries.map((industry) => (
                    <article className={styles.industry} key={industry.number}>
                        <div className={styles.industryTop}>
                            <span>{industry.number}</span>
                            <span>{industry.name}</span>
                        </div>
                        <h3>{industry.title}</h3>
                        <p>{industry.text}</p>
                        <small>{industry.outcomes}</small>
                    </article>
                ))}
            </div>
        </section>
    );
}
