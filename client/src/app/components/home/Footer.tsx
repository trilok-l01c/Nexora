import Link from "next/link";
import styles from "./Footer.module.css";

export default function Footer() {
    return (
        <footer className={styles.footer} id="about">
            <Link className={styles.brand} href="#top">
                <span className={styles.brandMark} aria-hidden="true">
                    N
                </span>
                <span>Nexora</span>
            </Link>
            <span>Independent technology studio / Nairobi · Worldwide</span>
            <span>© 2026 Nexora</span>
        </footer>
    );
}
