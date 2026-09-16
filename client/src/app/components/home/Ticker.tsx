import styles from "./Ticker.module.css";
import { defaultHomeContent } from "../../homeContent";

export default function Ticker({
    items = defaultHomeContent.ticker,
}: {
    items?: string[];
}) {
    // Static and centered on desktop. On mobile the strip scrolls, so the
    // item list is rendered twice for a seamless wrap; the duplicate is
    // hidden on desktop and the whole strip stays invisible to assistive
    // technology.
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
