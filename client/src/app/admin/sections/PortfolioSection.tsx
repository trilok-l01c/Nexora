"use client";

import PortfolioManager from "../PortfolioManager";
import styles from "../workspace.module.css";

// Thin wrapper: PortfolioManager is existing, fully working code, so it is
// reused as-is inside its own tab rather than rebuilt.
export default function PortfolioSection() {
    return (
        <div className={styles.stack}>
            <header className={styles.pageHeader}>
                <div>
                    <p className={styles.pageKicker}>Public showcase</p>
                    <h1 className={styles.pageTitle}>Portfolio</h1>
                    <p className={styles.pageSubtitle}>
                        The projects shown on the public portfolio page. Keep
                        images, technologies, and progress updates current so
                        the showcase reflects real work.
                    </p>
                </div>
            </header>
            <PortfolioManager />
        </div>
    );
}
