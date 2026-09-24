import { test, expect } from "@playwright/test";
import { demoProjects } from "../src/app/portfolio/demoProjects";

// The portfolio page is client-rendered: project data is fetched inside
// useEffect. When the API is unreachable or has nothing published the page
// falls back to the bundled sample case studies, so these tests force that
// failure path explicitly instead of depending on a running backend.

test("portfolio showcase falls back to the sample case studies", async ({
    page,
}) => {
    // Force the unreachable-API path whether or not a backend happens to run.
    await page.route("**/api/portfolio", (route) => route.abort());

    await page.goto("http://localhost:3000/portfolio", {
        waitUntil: "domcontentloaded",
    });

    // New shell structure.
    await expect(
        page.locator("main[data-motion-page]"),
    ).toBeVisible();

    // Hero kicker and headline (use the actual scoped class in the DOM).
    await expect(
        page.locator('[class*="__kicker"]').first(),
    ).toHaveText("Selected work");
    await expect(
        page.getByRole("heading", { name: /Built for businesses that/ }),
    ).toBeVisible();
    await expect(
        page.locator('[class*="__intro"]'),
    ).toHaveText(/A look at the products, platforms, and digital presence/);

    // Contact CTA is always rendered in this redesigned shell.
    await expect(
        page.getByRole("link", { name: /hello@nexora.studio/i }),
    ).toBeVisible();
    await expect(page.getByText("Make a move")).toBeVisible();
    await expect(page.getByText("Want work like this?")).toBeVisible();

    // Sample data is disclosed, and one immersive section is rendered per
    // sample project instead of the empty state.
    await expect(page.locator("[data-demo-notice]")).toBeVisible();
    await expect(page.locator("[data-project-index]")).toHaveCount(
        demoProjects.length,
    );
    await expect(page.locator("[data-pin-frame]")).toHaveCount(
        demoProjects.length,
    );
    await expect(page.locator("[data-parallax-media]")).toHaveCount(
        demoProjects.length,
    );
    await expect(page.getByText("No case studies yet")).toBeHidden();

    // Every sample card links to a detail route that really resolves, so the
    // fallback never produces dead links. Read the attribute directly: the CTA
    // is still visibility:hidden until its scroll reveal scrubs it in.
    await expect(
        page.locator('[data-project-index="0"] [data-reveal-cta]'),
    ).toHaveAttribute("href", `/portfolio/${demoProjects[0]._id}`);

    await page.goto(
        `http://localhost:3000/portfolio/${demoProjects[0]._id}`,
        { waitUntil: "domcontentloaded" },
    );
    await expect(page.getByRole("heading", { level: 1 })).toHaveText(
        demoProjects[0].title,
    );
    await expect(page.getByText("Kitchen view added")).toBeVisible();
});

test("portfolio sample case studies use the supplied cover artwork", async ({
    page,
    request,
}) => {
    // The sample case studies only render when live project data is missing.
    await page.route("**/api/portfolio", (route) => route.abort());

    await page.goto("http://localhost:3000/portfolio", {
        waitUntil: "domcontentloaded",
    });
    await expect(page.locator("[data-demo-notice]")).toBeVisible();

    // Each supplied cover drives its own pinned showcase frame, and the first
    // one doubles as the hero media. Asserting the exact path (rather than just
    // "some image") proves the wiring instead of the generic fallback.
    const media = page.locator("[data-parallax-media]");
    await expect(media).toHaveCount(demoProjects.length);
    for (const [index, project] of demoProjects.entries()) {
        await expect(media.nth(index)).toHaveAttribute(
            "src",
            project.coverImage as string,
        );
    }
    await expect(page.locator("[data-hero-media] img")).toHaveAttribute(
        "src",
        demoProjects[0].coverImage as string,
    );

    // The files themselves resolve: a renamed or missing cover fails here
    // instead of silently degrading to the placeholder image.
    for (const project of demoProjects) {
        const cover = project.coverImage as string;
        const response = await request.get(`http://localhost:3000${cover}`);
        expect(response.status(), `${cover} should be served`).toBe(200);
        expect(response.headers()["content-type"], cover).toContain("image/");
    }
});

test("portfolio showcase falls back when the API returns no projects", async ({
    page,
}) => {
    await page.route("**/api/portfolio", (route) =>
        route.fulfill({
            status: 200,
            contentType: "application/json",
            body: JSON.stringify({ success: true, data: [] }),
        }),
    );

    await page.goto("http://localhost:3000/portfolio", {
        waitUntil: "domcontentloaded",
    });

    await expect(page.locator("[data-demo-notice]")).toBeVisible();
    await expect(page.locator("[data-project-index]")).toHaveCount(
        demoProjects.length,
    );
});

// ---------------------------------------------------------------------------
// Mocked-API run: exercises the GSAP/ScrollTrigger showcase (hero entrance,
// desktop pinning, scrubbed reveals and the progress rail) without depending
// on a reachable backend. Keeps the redesign honest end-to-end.
// ---------------------------------------------------------------------------

const mockProjects = [
    {
        _id: "e2e-project-1",
        title: "Atlas Commerce",
        shortDescription:
            "A storefront rebuild that halved the time to checkout.",
        category: "Web Development",
        coverImage: "/programmer.jpg",
        images: ["/programmer.jpg"],
        technologies: ["Next.js", "Node.js"],
        services: ["Web Development"],
        completionDate: "2025-01-15T00:00:00.000Z",
        projectUrl: "https://example.com/atlas",
        status: "Published",
        featured: true,
        createdAt: "2025-01-15T00:00:00.000Z",
        updatedAt: "2025-01-15T00:00:00.000Z",
    },
    {
        _id: "e2e-project-2",
        title: "Meridian Ops",
        shortDescription: "Internal tooling for a logistics team.",
        category: "Software Development",
        coverImage: "/programmer.jpg",
        images: ["/programmer.jpg"],
        technologies: ["React", "MongoDB"],
        services: ["Software Development"],
        completionDate: "2025-03-02T00:00:00.000Z",
        status: "Published",
        createdAt: "2025-03-02T00:00:00.000Z",
        updatedAt: "2025-03-02T00:00:00.000Z",
    },
];

test("portfolio showcase animates, pins and tracks progress with data", async ({
    page,
}) => {
    const pageErrors: string[] = [];
    page.on("pageerror", (error) => pageErrors.push(error.message));

    await page.setViewportSize({ width: 1440, height: 900 });
    await page.route("**/api/portfolio", (route) =>
        route.fulfill({
            status: 200,
            contentType: "application/json",
            body: JSON.stringify({ success: true, data: mockProjects }),
        }),
    );

    await page.goto("http://localhost:3000/portfolio", {
        waitUntil: "domcontentloaded",
    });

    // Data hydrated into one section per project. The info panel and CTA start
    // hidden because they are scrubbed in on scroll.
    await expect(page.locator("[data-project-index]")).toHaveCount(2);
    await expect(page.locator("[data-reveal-cta]")).toHaveCount(2);

    // Real API data suppresses the sample fallback entirely.
    await expect(page.locator("[data-demo-notice]")).toHaveCount(0);

    // The hero entrance ran (GSAP sets autoAlpha 0 -> 1 on the copy).
    await expect
        .poll(async () =>
            page
                .locator("[data-hero-copy]")
                .evaluate((el) => getComputedStyle(el).opacity),
        )
        .toBe("1");

    // Every project shares ONE sticky stage instead of pinning individually.
    const stage = page.locator("[data-showcase-stage]");
    await expect(stage).toHaveCount(1);
    await expect(stage).toHaveCSS("position", "sticky");

    // Identical geometry for every card proves they are stacked into the same
    // frame rather than laid out as separate scroll slots.
    const cardBoxes = await page
        .locator("[data-project-index]")
        .evaluateAll((els) =>
            els.map((el) => {
                const r = el.getBoundingClientRect();
                return {
                    top: Math.round(r.top),
                    left: Math.round(r.left),
                    width: Math.round(r.width),
                    height: Math.round(r.height),
                };
            }),
        );
    for (const box of cardBoxes.slice(1)) {
        expect(box).toEqual(cardBoxes[0]);
    }

    // The container is the scroll runway: one viewport per project, and a stage
    // exactly one viewport tall that stays put while the runway scrolls.
    const runway = await page.evaluate(() => {
        const rail = document.querySelector(
            "[data-projects-rail]",
        ) as HTMLElement;
        const stageEl = document.querySelector(
            "[data-showcase-stage]",
        ) as HTMLElement;
        return {
            containerH: rail.offsetHeight,
            stageH: stageEl.offsetHeight,
            vh: window.innerHeight,
        };
    });
    expect(runway.containerH).toBe(runway.vh * mockProjects.length);
    expect(runway.stageH).toBe(runway.vh);

    // Before scrolling, the first project is on stage and the rest are held
    // back, so the frame is never a stack of half-visible cards.
    const hint = page.locator("[data-scroll-hint]");
    await expect(hint).toBeVisible();
    expect(await hint.getAttribute("data-retired")).toBeNull();
    await expect
        .poll(() =>
            page
                .locator('[data-project-index="0"]')
                .evaluate((el) => Number(getComputedStyle(el).opacity)),
        )
        .toBeGreaterThan(0.9);
    await expect
        .poll(() =>
            page
                .locator('[data-project-index="1"]')
                .evaluate((el) => Number(getComputedStyle(el).opacity)),
        )
        .toBeLessThan(0.1);

    // Scrolling the full runway cross-fades to the last project and retires the
    // "scroll for more" cue.
    await page.evaluate(() => {
        const rail = document.querySelector(
            "[data-projects-rail]",
        ) as HTMLElement;
        const top = rail.getBoundingClientRect().top + window.scrollY;
        window.scrollTo(0, top + rail.offsetHeight - window.innerHeight);
    });
    await expect(hint).toHaveAttribute("data-retired", "");
    await expect
        .poll(() =>
            page
                .locator('[data-project-index="1"]')
                .evaluate((el) => Number(getComputedStyle(el).opacity)),
        )
        .toBeGreaterThan(0.9);
    await expect
        .poll(() =>
            page
                .locator('[data-project-index="0"]')
                .evaluate((el) => Number(getComputedStyle(el).opacity)),
        )
        .toBeLessThan(0.1);

    // The info panel for the project now on stage is fully revealed.
    await expect(
        page.locator('[data-project-index="1"] [data-reveal-cta]'),
    ).toBeVisible();

    // The sticky rail follows whichever project is on stage.
    await expect(page.locator("[data-progress-rail]")).toHaveText(
        mockProjects[1].category,
    );

    // The rail fill is scrubbed against the projects container.
    await expect
        .poll(async () =>
            page
                .locator("[data-progress-fill]")
                .evaluate((el) => parseFloat(getComputedStyle(el).width)),
        )
        .toBeGreaterThan(0);

    expect(pageErrors).toEqual([]);
});
