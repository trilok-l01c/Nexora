import { test, expect, Page } from "@playwright/test";

const settle = async (page: Page) => {
    await page.waitForTimeout(1500);
};

/** Scroll to the nth project's pin start, then `progress` into its 30vh dwell. */
async function scrollToCard(page: Page, index: number, progress = 0) {
    await page.evaluate(
        ([i, p]) => {
            // The ScrollTrigger's trigger is the section, not the frame.
            const sec = document.querySelector(
                `[data-project-index="${i}"]`,
            ) as HTMLElement | null;
            if (!sec) throw new Error(`no section ${i}`);
            const top = sec.getBoundingClientRect().top + window.scrollY;
            const dwell = window.innerHeight * 0.3;
            window.scrollTo(0, top + dwell * (p as number));
        },
        [index, progress] as const,
    );
    await settle(page);
}

/** Measure one card while it is pinned. Selectors use stable data hooks. */
async function measureCard(page: Page, index: number) {
    return page.evaluate((i) => {
        const sec = document.querySelectorAll(
            "[data-project-index]",
        )[i] as HTMLElement;
        const frame = sec.querySelector("[data-pin-frame]") as HTMLElement;
        const overlay = frame.children[1] as HTMLElement;
        const inner = overlay.firstElementChild as HTMLElement;
        const kickerRow = inner.querySelector(
            "[data-reveal-kicker]",
        ) as HTMLElement;
        const title = inner.querySelector("h2") as HTMLElement;
        const counter = kickerRow.lastElementChild as HTMLElement;
        const desc = inner.querySelector(
            "[data-reveal-desc]",
        ) as HTMLElement;
        const footer = inner.querySelector(
            "[data-reveal-tags]",
        )?.parentElement as HTMLElement;
        const img = frame.querySelector("img") as HTMLImageElement | null;

        const r = frame.getBoundingClientRect();
        const ir = inner.getBoundingClientRect();
        const cs = (el: Element | null) =>
            el ? getComputedStyle(el) : null;
        // Negative = inset above the card's bottom edge.
        const fromBottom = (el: Element | null) =>
            el
                ? Math.round(el.getBoundingClientRect().bottom - r.bottom)
                : null;

        return {
            frame: { w: Math.round(r.width), h: Math.round(r.height) },
            areaPct: +(
                ((r.width * r.height) /
                    (window.innerWidth * window.innerHeight)) *
                100
            ).toFixed(1),
            pinned: cs(frame)?.position === "fixed",
            centredOffset: Math.round(
                Math.abs(r.top + r.height / 2 - window.innerHeight / 2),
            ),
            textLeft: Math.round(ir.left - r.left),
            textWidth: Math.round(ir.width),
            textBottom: Math.round(ir.bottom - r.bottom),
            order: {
                kicker: fromBottom(kickerRow),
                title: fromBottom(title),
                desc: fromBottom(desc),
                footer: fromBottom(footer),
            },
            sizes: {
                kicker: cs(kickerRow?.firstElementChild)?.fontSize,
                counter: cs(counter)?.fontSize,
                title: cs(title)?.fontSize,
                desc: cs(desc)?.fontSize,
            },
            counterText: counter.textContent?.replace(/\s+/g, " ").trim(),
            counterVsKickerTop: Math.round(
                Math.abs(
                    counter.getBoundingClientRect().top -
                        kickerRow.getBoundingClientRect().top,
                ),
            ),
            footerRows: (() => {
                const kids = Array.from(footer.children) as HTMLElement[];
                const centres = kids.map((k) => {
                    const r = k.getBoundingClientRect();
                    return Math.round(r.top + r.height / 2);
                });
                // Group children into rows by their vertical centre.
                const rows: number[][] = [];
                kids.forEach((k, i) => {
                    const c = centres[i];
                    const row = rows.find((r) => Math.abs(r[0] - c) <= 8);
                    if (row) row.push(c);
                    else rows.push([c]);
                });
                return {
                    rowCount: rows.length,
                    // The last row holds meta + CTA and must be aligned.
                    lastRowSpread:
                        Math.max(...rows[rows.length - 1]) -
                        Math.min(...rows[rows.length - 1]),
                    footerH: Math.round(footer.getBoundingClientRect().height),
                };
            })(),
            overlayBg: cs(overlay)?.backgroundImage.slice(0, 46),
            imgLoaded: img ? img.naturalWidth > 0 : false,
        };
    }, index);
}


async function pageMetrics(page: Page) {
    return page.evaluate(() => {
        const vh = window.innerHeight;
        const sections = Array.from(
            document.querySelectorAll("[data-project-index]"),
        ) as HTMLElement[];
        return {
            vh,
            pageViewports: +(
                document.documentElement.scrollHeight / vh
            ).toFixed(2),
            overflowX:
                document.documentElement.scrollWidth - window.innerWidth,
            count: sections.length,
        };
    });
}

const shot = async (page: Page, path: string) => {
    await page.screenshot({ path, fullPage: false });
};

test.describe("portfolio showcase composition", () => {
    test("screenshots", async ({ page }) => {
        await page.setViewportSize({ width: 1440, height: 900 });
        await page.goto("http://localhost:3000/portfolio", {
            waitUntil: "networkidle",
        });
        await settle(page);
        await scrollToCard(page, 0);
        await shot(page, "/tmp/show-light.png");
        await scrollToCard(page, 1);
        await shot(page, "/tmp/show-light2.png");

        await page.evaluate(() =>
            localStorage.setItem("nexora-theme", "dark"),
        );
        await page.reload({ waitUntil: "networkidle" });
        await settle(page);
        await scrollToCard(page, 0);
        await shot(page, "/tmp/show-dark.png");
        await scrollToCard(page, 2);
        await shot(page, "/tmp/show-dark2.png");

        await page.setViewportSize({ width: 390, height: 844 });
        await page.reload({ waitUntil: "networkidle" });
        await settle(page);
        await page.evaluate(() => window.scrollTo(0, 1750));
        await settle(page);
        await shot(page, "/tmp/show-mobile.png");
    });
});

test.describe("portfolio showcase composition", () => {
    test("desktop light: large image, tight slots, lower-left hierarchy", async ({
        page,
    }) => {
        await page.setViewportSize({ width: 1440, height: 900 });
        await page.goto("http://localhost:3000/portfolio", {
            waitUntil: "networkidle",
        });
        await settle(page);

        const pm = await pageMetrics(page);
        console.log("PAGE", JSON.stringify(pm));
        expect(pm.overflowX).toBe(0);
        expect(pm.count).toBeGreaterThan(0);

        const cards = [];
        for (let i = 0; i < pm.count; i++) {
            // Sample near the end of the pin dwell, where the scrubbed reveal
            // timeline has run to completion.
            await scrollToCard(page, i, 0.92);
            const c = await measureCard(page, i);
            cards.push(c);
            console.log(`CARD ${i}`, JSON.stringify(c));
        }

        for (const c of cards) {
            // The image is the main visual focus.
            expect(c.frame.w).toBeGreaterThanOrEqual(1240);
            expect(c.frame.h).toBeGreaterThanOrEqual(600);
            expect(c.areaPct).toBeGreaterThan(55);
            expect(c.imgLoaded).toBe(true);

            // Pinned and centred in the viewport.
            expect(c.pinned).toBe(true);
            expect(c.centredOffset).toBeLessThanOrEqual(6);

            // Text sits lower-left with a clean inset and does not span the
            // whole card. (Negative bottom = inset above the card's edge.)
            expect(c.textLeft).toBeGreaterThanOrEqual(40);
            expect(c.textWidth).toBeLessThanOrEqual(700);
            expect(c.textBottom).toBeLessThanOrEqual(-20);

            // Hierarchy: category -> title -> description -> footer.
            expect(c.order.title!).toBeGreaterThan(c.order.kicker!);
            expect(c.order.desc!).toBeGreaterThan(c.order.title!);
            expect(c.order.footer!).toBeGreaterThan(c.order.desc!);
            expect(parseFloat(c.sizes.title!)).toBeGreaterThan(
                parseFloat(c.sizes.kicker!),
            );
            expect(parseFloat(c.sizes.title!)).toBeGreaterThan(
                parseFloat(c.sizes.desc!),
            );
            expect(parseFloat(c.sizes.kicker!)).toBeLessThanOrEqual(12);
            expect(parseFloat(c.sizes.counter!)).toBeLessThanOrEqual(12);
        }

        // Counter reads like "01 / 04" from the live project count.
        const n = pm.count;
        expect(cards[0].counterText).toBe(
            `01 / ${String(n).padStart(2, "0")}`,
        );
        expect(cards[n - 1].counterText).toBe(
            `${String(n).padStart(2, "0")} / ${String(n).padStart(2, "0")}`,
        );
        for (const c of cards) {
            expect(c.counterVsKickerTop).toBeLessThan(14);
            // Chips on their own line; meta + CTA aligned on the row beneath.
            expect(c.footerRows.rowCount).toBe(2);
            expect(c.footerRows.lastRowSpread).toBeLessThanOrEqual(4);
        }

        // No excessive empty space.
        expect(pm.pageViewports).toBeLessThan(9);
    });

    test("desktop dark: text readable and fully revealed", async ({
        page,
    }) => {
        await page.setViewportSize({ width: 1440, height: 900 });
        await page.goto("http://localhost:3000/portfolio");
        await page.evaluate(() =>
            localStorage.setItem("nexora-theme", "dark"),
        );
        await page.reload({ waitUntil: "networkidle" });
        await settle(page);

        const pm = await pageMetrics(page);
        for (let i = 0; i < pm.count; i++) {
            await scrollToCard(page, i, 0.92);

            // Every reveal target must be visible, not stuck at opacity 0.
            const targets = await page.evaluate(
                ([idx, attrs]) => {
                    const sec = document.querySelectorAll(
                        "[data-project-index]",
                    )[idx as number] as HTMLElement;
                    return (attrs as string[]).map((a) => {
                        const el = sec.querySelector(
                            `[data-reveal-${a}]`,
                        ) as HTMLElement | null;
                        if (!el) return { attr: a, missing: true };
                        const s = getComputedStyle(el);
                        return {
                            attr: a,
                            opacity: Number(s.opacity),
                            visibility: s.visibility,
                        };
                    });
                },
                [i, ["inner", "kicker", "desc", "tags", "meta", "cta"]],
            );
            console.log(`DARK_TARGETS ${i}`, JSON.stringify(targets));
            for (const t of targets) {
                expect((t as { missing?: boolean }).missing).toBeFalsy();
                expect(t.visibility).toBe("visible");
                expect(t.opacity).toBeGreaterThan(0.9);
            }
        }

        await scrollToCard(page, 0, 0.92);
        const c = await measureCard(page, 0);
        console.log("DARK_CARD", JSON.stringify(c));
        expect(c.frame.w).toBeGreaterThanOrEqual(1240);
        expect(c.centredOffset).toBeLessThanOrEqual(6);
        expect(c.counterText).toBe(
            `01 / ${String(pm.count).padStart(2, "0")}`,
        );
    });

    test("mobile: image-first vertical stack, no overflow", async ({
        page,
    }) => {
        await page.setViewportSize({ width: 390, height: 844 });
        await page.goto("http://localhost:3000/portfolio", {
            waitUntil: "networkidle",
        });
        await settle(page);

        const m = await page.evaluate(() => {
            const frames = Array.from(
                document.querySelectorAll("[data-pin-frame]"),
            ) as HTMLElement[];
            return {
                overflowX:
                    document.documentElement.scrollWidth - window.innerWidth,
                count: frames.length,
                cards: frames.map((f) => {
                    const media = f.querySelector(
                        "[data-pin-media]",
                    ) as HTMLElement;
                    const overlay = f.children[1] as HTMLElement;
                    const fr = f.getBoundingClientRect();
                    const mr = media.getBoundingClientRect();
                    const or = overlay.getBoundingClientRect();
                    const img = f.querySelector("img") as HTMLImageElement;
                    return {
                        frameW: Math.round(fr.width),
                        mediaH: Math.round(mr.height),
                        mediaRatio: +(mr.width / mr.height).toFixed(3),
                        mediaAboveText: mr.bottom <= or.top + 1,
                        overlayStatic:
                            getComputedStyle(overlay).position === "relative",
                        frameStatic:
                            getComputedStyle(f).position === "static",
                        imgLoaded: img ? img.naturalWidth > 0 : false,
                    };
                }),
            };
        });
        console.log("MOBILE", JSON.stringify(m));

        expect(m.overflowX).toBe(0);
        expect(m.count).toBeGreaterThan(0);
        for (const c of m.cards) {
            expect(c.frameW).toBeLessThanOrEqual(390);
            expect(c.mediaAboveText).toBe(true);
            expect(c.mediaH).toBeGreaterThan(200);
            expect(c.mediaRatio).toBeCloseTo(4 / 3, 1);
            expect(c.overlayStatic).toBe(true);
            expect(c.frameStatic).toBe(true);
            expect(c.imgLoaded).toBe(true);
        }
    });
});

test("capture", async ({ page }) => {
    const waitForImages = () =>
        page.evaluate(async () => {
            const imgs = Array.from(document.images).filter(
                (i) => !i.complete || i.naturalWidth === 0,
            );
            await Promise.all(
                imgs.map((i) =>
                    i.decode().catch(() => undefined),
                ),
            );
        });

    for (const t of ["light", "dark"] as const) {
        await page.setViewportSize({ width: 1440, height: 900 });
        await page.goto("http://localhost:3000/portfolio");
        if (t === "dark") {
            await page.evaluate(() => localStorage.setItem("nexora-theme", "dark"));
            await page.reload({ waitUntil: "domcontentloaded" });
        }
        await settle(page);
        for (const i of [0, 1]) {
            // progress 1 = end of the pin dwell, so the scrubbed reveal has
            // fully played and the artwork is at its resting scale.
            await scrollToCard(page, i, 1);
            await waitForImages();
            await settle(page);
            await page.screenshot({ path: `/tmp/showcase-${t}-${i}.png` });
        }
    }
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("http://localhost:3000/portfolio");
    await settle(page);
    await scrollToCard(page, 0, 1);
    await waitForImages();
    await settle(page);
    await page.screenshot({ path: "/tmp/showcase-mobile.png" });
});
