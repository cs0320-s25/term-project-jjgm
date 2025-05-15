import { test, expect } from "@playwright/test";
import { clerkSetup } from "@clerk/testing/playwright";
import dotenv from "dotenv";

dotenv.config();

const BACKEND = "http://localhost:3232";
const FRONTEND = "http://localhost:8000";

//
// ─── API HANDLER TESTS ─────────────────────────────────────────────────────────
//
test.describe("Leaderboard handlers (API)", () => {
    
  test("GET /leaderboard/global → success + entries array", async ({
    request,
  }) => {
    const resp = await request.get(`${BACKEND}/leaderboard/global`);
    expect(resp.ok()).toBeTruthy();
    const body = await resp.json();
    expect(body.response_type).toBe("success");
    expect(Array.isArray(body.entries)).toBe(true);
    expect(body.entries.length).toBeGreaterThan(0);
  });
  
  test("GET /leaderboard/global twice → identical", async ({ request }) => {
    const first = await request
      .get(`${BACKEND}/leaderboard/global`)
      .then((r) => r.json());
    const second = await request
      .get(`${BACKEND}/leaderboard/global`)
      .then((r) => r.json());
    expect(second).toEqual(first);
  });
  
  test("GET /leaderboard/global → capped at 10 & sorted desc", async ({
    request,
  }) => {
    const { entries } = await request
      .get(`${BACKEND}/leaderboard/global`)
      .then((r) => r.json());
    expect(entries.length).toBeLessThanOrEqual(10);
    for (let i = 0; i < entries.length - 1; i++) {
      expect(entries[i].score).toBeGreaterThanOrEqual(entries[i + 1].score);
    }
  });

  test("GET /leaderboard/dorm/:dorm → success + filtered entries", async ({
    request,
  }) => {
    const dorm = "Perkins";
    const resp = await request.get(`${BACKEND}/leaderboard/dorm/${dorm}`);
    expect(resp.ok()).toBeTruthy();
    const body = await resp.json();
    expect(body.response_type).toBe("success");
    expect(Array.isArray(body.entries)).toBe(true);
    expect(body.entries.length).toBeGreaterThan(0);
    for (const e of body.entries) {
      expect(e.dorm.toLowerCase()).toBe(dorm.toLowerCase());
    }
  });

  test("GET /leaderboard/dorm/:dorm twice → identical", async ({ request }) => {
    const dorm = "Perkins";
    const first = await request
      .get(`${BACKEND}/leaderboard/dorm/${dorm}`)
      .then((r) => r.json());
    const second = await request
      .get(`${BACKEND}/leaderboard/dorm/${dorm}`)
      .then((r) => r.json());
    expect(second).toEqual(first);
  });

  test("GET /leaderboard/dorm/:dorm → numeric contribution & sorted", async ({
    request,
  }) => {
    const dorm = "Perkins";
    const { entries } = await request
      .get(`${BACKEND}/leaderboard/dorm/${dorm}`)
      .then((r) => r.json());
    // capped at 10
    expect(entries.length).toBeLessThanOrEqual(10);
    // each entry has a number contribution, and scores sorted
    for (let i = 0; i < entries.length; i++) {
      expect(typeof entries[i].contribution).toBe("number");
      if (i < entries.length - 1) {
        expect(entries[i].score).toBeGreaterThanOrEqual(entries[i + 1].score);
      }
    }
  });
  //fails
  test("GET /leaderboard/dorm/nonexistent → empty entries", async ({
    request,
  }) => {
    const resp = await request.get(
      `${BACKEND}/leaderboard/dorm/___NoSuchDorm___`
    );
    expect(resp.ok()).toBeTruthy();
    const body = await resp.json();
    // our handler returns success + empty array when no matches
    expect(body.response_type).toBe("success");
    expect(Array.isArray(body.entries)).toBe(true);
    expect(body.entries.length).toBe(0);
  });

  test("Unsupported leaderboard endpoint → 404", async ({ request }) => {
    const resp = await request.get(`${BACKEND}/leaderboard/foobar`, {
      failOnStatusCode: false,
    });
    expect(resp.status()).toBe(404);
  });
});

//
// ─── UI PERSISTENCE TESTS ──────────────────────────────────────────────────────
//
test.describe("Leaderboard UI persistence", () => {
  test.beforeEach(async ({ page }) => {
    // initialize Clerk testing
    await clerkSetup({
      frontendApiUrl: process.env.CLERK_FRONTEND_API,
    });

    // load the app & open Clerk modal
    await page.goto(FRONTEND);
    await page.getByRole("button", { name: "Sign in", exact: true }).click();

    // fill & submit
    await page.getByPlaceholder("Email address").fill("test@test.com");
    await page.getByPlaceholder("Password").fill("superdupertest123");
    await page.getByRole("button", { name: "Sign in", exact: true }).click();

    // wait for main nav to appear
    await page.waitForSelector(".beatmap-nav");
  });

  test("Global leaderboard stays the same across nav and reload", async ({
    page,
  }) => {
    // switch to the BEATMAP tab
    await page.getByRole("button", { name: "BEATMAP" }).click();
    await page.waitForSelector(".leaderboard table");

    // show Global
    await page.getByRole("button", { name: /global/i }).click();
    await page.waitForSelector(".leaderboard tbody tr");

    // capture ranks column
    const initial = await page.$$eval(
      ".leaderboard tbody tr td:first-child",
      (cells) => cells.map((td) => td.textContent!.trim())
    );

    // navigate away and back
    await page.getByRole("button", { name: /guess songs/i }).click();
    await page.getByRole("button", { name: "BEATMAP" }).click();
    await page.waitForSelector(".leaderboard table");

    const afterNav = await page.$$eval(
      ".leaderboard tbody tr td:first-child",
      (cells) => cells.map((td) => td.textContent!.trim())
    );
    expect(afterNav).toEqual(initial);

    // reload page
    await page.reload();
    await page.waitForSelector(".leaderboard table");

    const afterReload = await page.$$eval(
      ".leaderboard tbody tr td:first-child",
      (cells) => cells.map((td) => td.textContent!.trim())
    );
    expect(afterReload).toEqual(initial);
  });

  test("Dorm leaderboard stays the same across nav and reload", async ({
    page,
  }) => {
    // switch to the BEATMAP tab
    await page.getByRole("button", { name: "BEATMAP" }).click();
    await page.waitForSelector(".leaderboard table");

    // show Dorm
    await page.getByRole("button", { name: /dorm/i }).click();
    await page.waitForSelector(".leaderboard tbody tr");

    const initial = await page.$$eval(
      ".leaderboard tbody tr td:first-child",
      (cells) => cells.map((td) => td.textContent!.trim())
    );

    // navigate away & back
    await page.getByRole("button", { name: /guess songs/i }).click();
    await page.getByRole("button", { name: "BEATMAP" }).click();
    await page.waitForSelector(".leaderboard table");

    const afterNav = await page.$$eval(
      ".leaderboard tbody tr td:first-child",
      (cells) => cells.map((td) => td.textContent!.trim())
    );
    expect(afterNav).toEqual(initial);

    // reload
    await page.reload();
    await page.waitForSelector(".leaderboard table");

    const afterReload = await page.$$eval(
      ".leaderboard tbody tr td:first-child",
      (cells) => cells.map((td) => td.textContent!.trim())
    );
    expect(afterReload).toEqual(initial);
  });
});
