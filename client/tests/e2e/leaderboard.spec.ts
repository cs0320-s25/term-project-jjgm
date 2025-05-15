import { test, expect, APIRequestContext } from "@playwright/test";

const FRONTEND = "http://localhost:8000";
const BACKEND = "http://localhost:3232";


//API tests for /leaderboard/global and /leaderboard/dorm/:dorm

test.describe("Leaderboard handlers (API)", () => {
  let api: APIRequestContext;

  test.beforeAll(async ({ request }) => {
    api = request;
  });

  test("GET /leaderboard/global → success + entries array", async () => {
    const resp = await api.get(`${BACKEND}/leaderboard/global`);
    expect(resp.ok()).toBeTruthy();
    const body = await resp.json();
    expect(body.response_type).toBe("success");
    expect(Array.isArray(body.entries)).toBe(true);
    expect(body.entries.length).toBeGreaterThan(0);
  });

  test("GET /leaderboard/global twice → identical", async () => {
    const first = await api
      .get(`${BACKEND}/leaderboard/global`)
      .then((r) => r.json());
    const second = await api
      .get(`${BACKEND}/leaderboard/global`)
      .then((r) => r.json());
    expect(second).toEqual(first);
  });

  test("GET /leaderboard/global → capped at 10 & sorted desc", async () => {
    const { entries } = await api
      .get(`${BACKEND}/leaderboard/global`)
      .then((r) => r.json());
    expect(entries.length).toBeLessThanOrEqual(10);
    for (let i = 0; i < entries.length - 1; i++) {
      expect(entries[i].score).toBeGreaterThanOrEqual(entries[i + 1].score);
    }
  });

  test("GET /leaderboard/dorm/:dorm → success + filtered", async () => {
    const dorm = "Perkins";
    const resp = await api.get(`${BACKEND}/leaderboard/dorm/${dorm}`);
    expect(resp.ok()).toBeTruthy();
    const body = await resp.json();
    expect(body.response_type).toBe("success");
    expect(Array.isArray(body.entries)).toBe(true);
    expect(body.entries.length).toBeGreaterThan(0);
    for (const e of body.entries) {
      expect(e.dorm.toLowerCase()).toBe(dorm.toLowerCase());
    }
  });

  test("GET /leaderboard/dorm/:dorm twice → identical", async () => {
    const dorm = "Perkins";
    const first = await api
      .get(`${BACKEND}/leaderboard/dorm/${dorm}`)
      .then((r) => r.json());
    const second = await api
      .get(`${BACKEND}/leaderboard/dorm/${dorm}`)
      .then((r) => r.json());
    expect(second).toEqual(first);
  });

  test("GET /leaderboard/dorm/:dorm → numeric contribution & sorted", async () => {
    const dorm = "Perkins";
    const { entries } = await api
      .get(`${BACKEND}/leaderboard/dorm/${dorm}`)
      .then((r) => r.json());
    expect(entries.length).toBeLessThanOrEqual(10);
    for (let i = 0; i < entries.length; i++) {
      expect(typeof entries[i].contribution).toBe("number");
      if (i < entries.length - 1) {
        expect(entries[i].score).toBeGreaterThanOrEqual(entries[i + 1].score);
      }
    }
  });

  test("GET /leaderboard/dorm/thisboyDoesNotExist → empty entries", async () => {
    const resp = await api.get(`${BACKEND}/leaderboard/dorm/PapasPizzeria`);
    expect(resp.ok()).toBeTruthy();
    const body = await resp.json();
    expect(body.response_type).toBe("success");
    expect(Array.isArray(body.entries)).toBe(true);
    expect(body.entries).toHaveLength(0);
  });


  test("Unsupported leaderboard endpoint → 404", async () => {
    const resp = await api.get(`${BACKEND}/leaderboard/foobar`, {
      failOnStatusCode: false,
    });
    expect(resp.status()).toBe(404);
  });
});

//UI tests: click BEATMAP dummy :)

test.describe("Leaderboard UI persistence", () => {
  test.beforeEach(async ({ page }) => {
    //1)sign in via Clerk test flow
    await page.goto(FRONTEND);
    await page.getByLabel("Email address").fill("notreal@brown.edu");
    await page.getByRole("button", { name: "Continue", exact: true }).click();
    await page.getByPlaceholder("Enter your password").fill("notrealnotreal");
    await page.getByRole("button", { name: "Continue", exact: true }).click();

    //2)wait for the genre‐select overlay that i completely forgot about and dismiss
    await expect(
      page.getByText("What genre would you like to play?")
    ).toBeVisible();
    await page.getByRole("button", { name: "POP" }).click();
    await expect(page.getByText("Guess Songs")).toBeVisible();

    //3)nav to BEATMAP where leaderboard appears
    await page.getByRole("button", { name: "BEATMAP" }).click();
    await expect(page.locator(".leaderboard table")).toBeVisible();
  });

  test("Leaderboard view persists after navigation and reload", async ({
    page,
  }) => {
    //a)open global leaderboard and capture ranking
    await page.getByRole("button", { name: "Global" }).click();
    await page.waitForSelector(".leaderboard tbody tr");
    const firstPass = await page.$$eval(
      ".leaderboard tbody tr td:first-child",
      (rows) => rows.map((r) => r.textContent)
    );

    //b)nav away to GUESS SONGS then back to BEATMAP
    await page.getByRole("button", { name: "GUESS SONGS" }).click();
    await page.getByRole("button", { name: "BEATMAP" }).click();
    await expect(page.locator(".leaderboard table")).toBeVisible();
    const afterNav = await page.$$eval(
      ".leaderboard tbody tr td:first-child",
      (rows) => rows.map((r) => r.textContent)
    );
    expect(afterNav).toEqual(firstPass);

    //c)reload page and verify persistence
    await page.reload();
    await expect(page.locator(".leaderboard table")).toBeVisible();
    const afterReload = await page.$$eval(
      ".leaderboard tbody tr td:first-child",
      (rows) => rows.map((r) => r.textContent)
    );
    expect(afterReload).toEqual(firstPass);
  });
});






