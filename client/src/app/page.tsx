import Approach from "./components/home/Approach";
import Contact from "./components/home/Contact";
import Footer from "./components/home/Footer";
import Hero from "./components/home/Hero";
import Nav from "./components/home/Nav";
import Solutions from "./components/home/Solutions";
import Ticker from "./components/home/Ticker";
import styles from "./page.module.css";

export default function Home() {
    return (
        <main className={styles.page}>
            <Nav />
            <Hero />
            <Ticker />
            <Solutions />
            <Approach />
            <Contact />
            <Footer />
        </main>
    );
}
