import Link from "next/link";
import Contact from "./components/home/Contact";
import Footer from "./components/home/Footer";
import Reveal from "./components/motion/Reveal";
import HeroSlider from "./components/home/HeroSlider";
import styles from "./page.module.css";

const services = [["Websites that bring in enquiries", "A clear, credible home for your business—fast on every screen and easy to update.", "01"], ["Apps that keep customers close", "Make booking, ordering, updates, and everyday service feel effortless.", "02"], ["Systems that save your team time", "Replace scattered spreadsheets and repetitive tasks with a simpler way to work.", "03"]];

const heroSlides = [
    {
        image: "/hero.jpg",
        alt: "Nexora technology and digital solutions",
        title: "easier to choose",
        subtitle: "Build a digital presence that works for your business"
    },
    {
        image: "/team-work.jpg",
        alt: "Indian business team collaborating",
        title: "easier to grow",
        subtitle: "Technology that adapts to the way you work"
    },
    {
        image: "/health-tech.jpg",
        alt: "Healthcare technology solutions",
        title: "easier to serve",
        subtitle: "Digital experiences your customers will love"
    }
];

export default function Home() {
    return <main className={styles.page} data-motion-page>
        <HeroSlider slides={heroSlides} />
        <section className={styles.intro}><Reveal variant="up"><p className={styles.kicker}>What Nexora brings to the table</p></Reveal><Reveal variant="up" delay={100}><h2>Technology should feel like a <em>good business decision.</em></h2><p>We turn a business need into a useful digital experience—without making you learn a new language first.</p></Reveal></section>
        <section className={styles.services}>{services.map(([title, text, number], index) => <Reveal key={number} delay={index * 90}><article className={styles.service}><span>{number}</span><div className={styles.icon}>✦</div><h3>{title}</h3><p>{text}</p><Link href="/what-we-do">Explore service <b>&#8594;</b></Link></article></Reveal>)}</section>
        <section className={styles.story}><Reveal className={styles.storyPhoto} variant="left"><img src="/team-work.jpg" alt="Team discussing a project together" /></Reveal><Reveal className={styles.storyCopy} variant="right" delay={100}><p className={styles.kicker}>A partner, not a jargon machine</p><h2>We start with your day-to-day, then make it <em>work better.</em></h2><p>Whether you need a stronger first impression, a smoother customer journey, or a system behind the scenes, we keep the process straightforward and focused on what matters.</p><Link href="/who-we-are" className={styles.secondary}>Meet Nexora <span>&#8594;</span></Link></Reveal></section>
        <section className={styles.work}><Reveal className={styles.sectionHeading}><div><p className={styles.kicker}>Ideas made real</p><h2>Work with a purpose, not just a pretty screen.</h2></div><Link href="/portfolio" className={styles.textLink}>View our work <span>&#8594;</span></Link></Reveal><div className={styles.workGrid}><Reveal variant="left"><article className={styles.workLarge}><img src="/health-tech.jpg" alt="Healthcare technology workspace" /><div><p>Digital solutions</p><h3>Better experiences begin with a better plan.</h3></div></article></Reveal><Reveal variant="right" delay={100}><article className={styles.workSmall}><img src="/for-grocery-shop.jpg" alt="Local grocery shop" /><div><p>Local business</p><h3>Everyday business, made easier.</h3></div></article></Reveal></div></section>
        <section className={styles.reasons}><Reveal><p className={styles.kicker}>Why businesses choose Nexora</p></Reveal><div className={styles.reasonGrid}>{["Business-first thinking|We speak in outcomes, not technical acronyms.","One connected team|Strategy, design, build, and support work together.","Built to be useful|Every decision earns its place in your business."].map((item,index)=>{const [title,text]=item.split("|");return <Reveal key={title} delay={index*100}><div><b>0{index+1}</b><h3>{title}</h3><p>{text}</p></div></Reveal>})}</div></section><Contact /><Footer />
    </main>;
}