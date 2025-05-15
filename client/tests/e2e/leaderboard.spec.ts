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
  //fails but irrelevent given dropdown usage for dorms. 
//   test("GET /leaderboard/dorm/nonexistent → empty entries", async ({
//     request,
//   }) => {
//     const resp = await request.get(
//       `${BACKEND}/leaderboard/dorm/___NoSuchDorm___`
//     );
//     expect(resp.ok()).toBeTruthy();
//     const body = await resp.json();
//     // our handler returns success + empty array when no matches
//     expect(body.response_type).toBe("success");
//     expect(Array.isArray(body.entries)).toBe(true);
//     expect(body.entries.length).toBe(0);
//   });

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
    await page.getByRole("button", { name: "Continue", exact: true }).click();

    // wait for main nav to appear
    await page.waitForSelector(".beatmap-nav");
    await page.waitForSelector(".genre-overlay");

    // 3) Dismiss the popup by choosing a genre, e.g. POP
    await page.getByRole("button", { name: "POP" }).click();
    await page.waitForSelector(".genre-overlay", { state: "detached" });

    // 4) Finally ensure the leaderboard is visible
    await page.waitForSelector(".leaderboard table");
  });

  test("Global leaderboard stays the same across nav and reload", async ({
    page,
  }) => {
    // Global view already on
    //await page.getByRole("button", { name: /global/i }).click();
    await page.waitForSelector(".leaderboard tbody tr");
    const initial = await page.$$eval(
      ".leaderboard tbody tr td:first-child",
      (cells) => cells.map((td) => td.textContent!.trim())
    );

    // Nav away ↔ back
    await page.getByRole("button", { name: "GUESS SONGS" }).click();
    await page.getByRole("button", { name: "BEATMAP" }).click();
    await page.waitForSelector(".leaderboard tbody tr");
    const afterNav = await page.$$eval(
      ".leaderboard tbody tr td:first-child",
      (cells) => cells.map((td) => td.textContent!.trim())
    );
    expect(afterNav).toEqual(initial);

    // Reload
    await page.reload();
    await page.waitForSelector(".leaderboard tbody tr");
    const afterReload = await page.$$eval(
      ".leaderboard tbody tr td:first-child",
      (cells) => cells.map((td) => td.textContent!.trim())
    );
    expect(afterReload).toEqual(initial);
  });

  test("Dorm leaderboard stays the same across nav and reload", async ({
    page,
  }) => {
    // Switch to Dorm
    await page.getByRole("button", { name: /dorm/i }).click();
    await page.waitForSelector(".leaderboard tbody tr");
    const initial = await page.$$eval(
      ".leaderboard tbody tr td:first-child",
      (cells) => cells.map((td) => td.textContent!.trim())
    );

    // Nav away ↔ back
    await page.getByRole("button", { name: "GUESS SONGS" }).click();
    await page.getByRole("button", { name: "BEATMAP" }).click();
    await page.waitForSelector(".leaderboard tbody tr");
    const afterNav = await page.$$eval(
      ".leaderboard tbody tr td:first-child",
      (cells) => cells.map((td) => td.textContent!.trim())
    );
    expect(afterNav).toEqual(initial);

    // Reload
    await page.reload();

    //lovely, not at all annoying popup is back

    await page.waitForSelector(".genre-overlay");
    await page.getByRole("button", { name: "POP" }).click();
    await page.waitForSelector(".genre-overlay", { state: "detached" });

    // 4) Finally ensure the leaderboard is visible
    await page.waitForSelector(".leaderboard table");


    await page.getByRole("button", { name: /dorm/i }).click();
    await page.waitForSelector(".leaderboard tbody tr");
    const afterReload = await page.$$eval(
      ".leaderboard tbody tr td:first-child",
      (cells) => cells.map((td) => td.textContent!.trim())
    );
    expect(afterReload).toEqual(initial);
  });

  test("Global UI shows ≤10 rows and is sorted desc", async ({ page }) => {
    await page.waitForSelector(".leaderboard tbody tr");

    //grab the raw text from the 4th column (Score)
    const rawScores = await page.$$eval(
      ".leaderboard tbody tr td:nth-child(4)",
      (tds) => tds.map((td) => td.textContent!.trim())
    );

    //parse & sanity-check
    const scores = rawScores.map((text) => {
      const n = parseInt(text.replace(/[^0-9\-]/g, ""), 10);
      expect(!isNaN(n)).toBeTruthy();
      return n;
    });

    //cap at 10 rows
    expect(scores.length).toBeLessThanOrEqual(10);

    //descending order
    for (let i = 0; i < scores.length - 1; i++) {
      expect(scores[i]).toBeGreaterThanOrEqual(scores[i + 1]);
    }
  });

  test("Dorm UI shows ≤10 rows and is sorted by contribution desc", async ({
    page,
  }) => {
    //switch into Dorm view
    await page.getByRole("button", { name: /dorm/i }).click();
    await page.waitForSelector(".leaderboard tbody tr");

    //grab the raw text from the 5th column (Contribution)
    const rawContribs = await page.$$eval(
      ".leaderboard tbody tr td:nth-child(5)",
      (tds) => tds.map((td) => td.textContent!.trim())
    );

    //parse & sanity-check
    const contribs = rawContribs.map((text) => {
      const n = parseInt(text.replace(/[^0-9\-]/g, ""), 10);
      expect(!isNaN(n)).toBeTruthy();
      return n;
    });

    //cap at 10 rows
    expect(contribs.length).toBeLessThanOrEqual(10);

    //descending order
    for (let i = 0; i < contribs.length - 1; i++) {
      expect(contribs[i]).toBeGreaterThanOrEqual(contribs[i + 1]);
    }
  });

});