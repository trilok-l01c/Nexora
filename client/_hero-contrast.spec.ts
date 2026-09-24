import { test, expect } from "@playwright/test";
import sharp from "sharp";

// Temporary: proves the portfolio hero headline is legible in both themes by
// sampling the real rendered pixels behind it and computing WCAG contrast.
function channel(value: number) {
    const v = value / 255;
    return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4;
}

function luminance([r, g, b]: number[]) {
    return 0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b);
}

function contrast(a: number[], b: number[]) {
    const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
    return (hi + 0.05) / (lo + 0.05);
}

for (const theme of ["light", "dark"] as const) {
    test(`portfolio hero headline contrast — ${theme} theme`, async ({ page }) => {
        await page.addInitScript((value) => {
            window.localStorage.setItem("nexora-theme", value);
        }, theme);
        await page.setViewportSize({ width: 1440, height: 900 });
        await page.route("**/api/portfolio", (route) => route.abort());

        await page.goto("http://localhost:3000/portfolio", {
            waitUntil: "domcontentloaded",
        });
        await expect(page.locator("[data-demo-notice]")).toBeVisible();
        await page.waitForTimeout(1600); // let the hero intro timeline finish

        const title = page.locator("[data-hero-title]");
        const box = await title.boundingBox();
        if (!box) throw new Error("no title box");

        const textColor = await title.evaluate((el) =>
            getComputedStyle(el)
                .color.match(/\d+/g)!
                .slice(0, 3)
                .map(Number),
        );

        // Sample the gradient just above the glyphs to get the local backdrop.
        const shot = await page.screenshot({ fullPage: false });
        const { data, info } = await sharp(shot)
            .extract({
                left: Math.round(box.x + 4),
                top: Math.max(0, Math.round(box.y - 10)),
                width: 8,
                height: 2,
            })
            .raw()
            .toBuffer({ resolveWithObject: true });
        const background = [
            data[0],
            data[1],
            data[2],
        ];
        void info;

        const ratio = contrast(textColor, background);
        console.log(
            `${theme}: h1 rgb(${textColor.join(", ")}) on rgb(${background.join(", ")}) → contrast ${ratio.toFixed(2)}:1`,
        );
        expect(ratio).toBeGreaterThan(7);

        await page.screenshot({
            path: `/tmp/hero-fixed-${theme}.jpg`,
            type: "jpeg",
            quality: 72,
        });
        await page.screenshot({
            path: `/tmp/portfolio-${theme}-full.jpg`,
            type: "jpeg",
            quality: 58,
            fullPage: true,
        });
    });
}
