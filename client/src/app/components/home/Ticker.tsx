import styles from "./Ticker.module.css";
import { defaultHomeContent } from "../../homeContent";

export default function Ticker({
    items = defaultHomeContent.ticker,
}: {
    items?: string[];
}) {
    // The item list is rendered twice so the marquee can wrap seamlessly;
    // the whole strip is aria-hidden, so the duplicate stays invisible to
    // assistive technology.
    const strip = items.map((item) => (
        <span key={item}>
            {item} <b>✳</b>
        </span>
    ));

    return (
        <div className={styles.ticker} aria-hidden="true">
            <div className={styles.tickerTrack}>
                <div className={styles.tickerGroup}>{strip}</div>
                <div className={styles.tickerGroup}>{strip}</div>
            </div>
        </div>
    );
}
