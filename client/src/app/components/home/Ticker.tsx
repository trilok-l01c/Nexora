import styles from "./Ticker.module.css";

export default function Ticker() {
    return (
        <div className={styles.ticker} aria-hidden="true">
            <span>Full-stack development</span>
            <b>✳</b>
            <span>Intelligent systems</span>
            <b>✳</b>
            <span>Digital momentum</span>
            <b>✳</b>
            <span>Human-first technology</span>
            <b>✳</b>
        </div>
    );
}
