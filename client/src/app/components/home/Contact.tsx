import styles from "./Contact.module.css";

export default function Contact() {
    return (
        <section className={styles.contact} id="contact">
            <p className={styles.kicker}>03 / Make a move</p>
            <h2>
                Have a good
                <br />
                <em>feeling</em> about this?
            </h2>
            <a
                className={styles.contactButton}
                href="mailto:hello@nexora.studio"
            >
                hello@nexora.studio <span>↗</span>
            </a>
        </section>
    );
}
