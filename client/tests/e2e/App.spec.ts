import { expect, test } from "@playwright/test";
import { clearUser } from "../../src/utils/api";
import { setupClerkTestingToken, clerk } from "@clerk/testing/playwright";
import { clerkSetup } from "@clerk/testing/playwright";

/**
  The general shapes of tests in Playwright Test are:
    1. Navigate to a URL
    2. Interact with the page
    3. Assert something about the page against your expectations
  Look for this pattern in the tests below!
 */

/**
const SPOOF_UID = "mock-user-id";

test.beforeEach(
  "add spoof uid cookie to browser",
  async ({ context, page }) => {
    // - Add "uid" cookie to the browser context
    await context.addCookies([
      {
        name: "uid",
        value: SPOOF_UID,
        url: "http://localhost:8000",
      },
    ]);

    // wipe everything for this spoofed UID in the database.
    await clearUser(SPOOF_UID);
  }
);

/**
 * Don't worry about the "async" yet. We'll cover it in more detail
 * for the next sprint. For now, just think about "await" as something
 * you put before parts of your test that might take time to run,
 * like any interaction with the page.
 */
/**
test("on page load, I see the gearup screen and skip auth.", async ({
  page,
}) => {
  // Notice: http, not https! Our front-end is not set up for HTTPs.
  await page.goto("http://localhost:8000/");
  await expect(page.getByLabel("Gearup Title")).toBeVisible();
  // <i> with aria-label favorite-words-header should include the SPOOF_UID
  await expect(page.getByLabel("user-header")).toContainText(SPOOF_UID);
});

test("I can add a word to my favorites list", async ({ page }) => {
  await page.goto("http://localhost:8000/");
  // - get the <p> elements inside the <ul> with aria-label="favorite-words"
  const favoriteWords = await page.getByLabel("favorite-words");
  await expect(favoriteWords).not.toContainText("hello");

  await page.getByLabel("word-input").fill("hello");
  await page.getByLabel("add-word-button").click();

  const favoriteWordsAfter = await page.getByLabel("favorite-words");
  await expect(favoriteWordsAfter).toContainText("hello");

  // .. and this works on refresh
  await page.reload();
  const favoriteWordsAfterReload = await page.getByLabel("favorite-words");
  await expect(favoriteWordsAfterReload).toContainText("hello");
});
*/

test.describe('Map pin functionality', () => {
  test.beforeEach(async ({ page }) => {
    await clerkSetup({
      frontendApiUrl: process.env.CLERK_FRONTEND_API,
    })
    setupClerkTestingToken({ page});
    await page.goto('http://localhost:8000/');
    await clerk.loaded({ page });
    await clerk.signIn({
      page,
      signInParams: {
        strategy: "password",
        password: process.env.E2E_CLERK_USER_PASSWORD!,
        identifier: process.env.E2E_CLERK_USER_USERNAME!,
      },
    });
  });

  test('User can add and clear pins on the map', async ({ page }) => {
    await page.goto('http://localhost:8000/');
    
    await page.screenshot({ path: 'authenticated-state.png' });
    
    await page.getByText('Section 2: Mapbox Demo').click();
    
    await page.waitForSelector('.mapboxgl-canvas', { timeout: 10000 });
    
    const clearButton = page.getByRole('button', { name: 'clear-pins-button' });
    await expect(clearButton).toBeVisible();
    
    const initialPins = await page.getByLabel(/^map-pin/).count();
    expect(initialPins).toBe(0);
    
    const mapElement = page.locator('.mapboxgl-canvas-container');
    await mapElement.click({ position: { x: 200, y: 200 } });
    
    await page.waitForSelector('[aria-label^="map-pin-"]', { timeout: 5000 });
    const pinsAfterAdd = await page.getByLabel(/^map-pin/).count();
    expect(pinsAfterAdd).toBeGreaterThan(0);
    

    await page.reload();
    
    await page.waitForSelector('.mapboxgl-canvas', { timeout: 10000 });
    
    await page.getByText('Section 2: Mapbox Demo').click();
    
    await page.waitForSelector('[aria-label^="map-pin-"]', { timeout: 5000 });
    const pinsAfterReload = await page.getByLabel(/^map-pin/).count();
    expect(pinsAfterReload).toBe(2);


    await clearButton.click();
    
    await page.waitForTimeout(500);
    const pinsAfterClear = await page.getByLabel(/^map-pin/).count();
    expect(pinsAfterClear).toBe(0);
  });
});