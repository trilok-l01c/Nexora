import { test, Page } from "@playwright/test";

test("capture", async ({ page }) => {
    const shot = async (theme: "light" | "dark", mobile: boolean) => {
        await page.setViewportSize(
            mobile ? { width: 390, height: 844 } : { width: 1440, height: 900 },
        );
        await page.goto("http://localhost:3000/portfolio");
        await page.evaluate(
            (t) => localStorage.setItem("nexora-theme", t),
            theme,
        );
        await page.reload({ waitUntil: "networkidle" });
        await page.waitForTimeout(1800);
        const idx = mobile ? 0 : 0;
        await page.evaluate((i) => {
            const f = document.querySelectorAll(
                "[data-pin-frame]",
            )[i] as HTMLElement;
            window.scrollTo(0, f.getBoundingClientRect().top + window.scrollY);
        }, idx);
        await page.waitForTimeout(1800);
        await page.screenshot({
            path: `/tmp/v2-${theme}-${mobile ? "mobile" : "desktop"}.png`,
        });
    };

    await shot("light", false);
    await shot("dark", false);
    await shot("light", true);
});
