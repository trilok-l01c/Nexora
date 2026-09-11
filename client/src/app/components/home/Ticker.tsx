import styles from "./Ticker.module.css";
import { defaultHomeContent } from "../../homeContent";

export default function Ticker({
    items = defaultHomeContent.ticker,
}: {
    items?: string[];
}) {
    return (
        <div className={styles.ticker} aria-hidden="true">
            {items.map((item) => (
                <span key={item}>
                    {item} <b>✳</b>
                </span>
            ))}
        </div>
    );
}
