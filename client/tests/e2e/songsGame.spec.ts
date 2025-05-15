import { expect, test } from "@playwright/test";
import { clerkSetup } from "@clerk/testing/playwright";


const FRONTEND = "http://localhost:8000";

test.beforeEach(async ({ page }) => {
  // Go to homepage
  await page.goto(FRONTEND);

  // Initialize Clerk
  await clerkSetup({
    frontendApiUrl: process.env.CLERK_FRONTEND_API,
  });

  // Open sign-in modal
  await page.getByRole("button", { name: "Sign in", exact: true }).click();


  //  fill & submit
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

test("User can see the game UI and start a round", async ({ page }) => {
  // Wait for genre selection screen
  await expect(page.getByLabel("Select a genre")).toBeVisible();

  // Select a genre from a dropdown or buttons (adjust if needed)
  await page.selectOption("#genre-dropdown", "Hiphop");

  // Expect round and input field to appear
  await expect(page.getByText(/Round/i)).toBeVisible();
  await expect(page.getByPlaceholder("Enter your guess")).toBeVisible();
  await expect(page.getByRole("button", { name: "Submit" })).toBeVisible();
});

test("User can submit a wrong guess and see feedback", async ({ page }) => {
  await page.selectOption("#genre-dropdown", "Hiphop");

  // Type wrong guess
  await page.getByPlaceholder("Enter your guess").fill("wrong answer");
  await page.getByRole("button", { name: "Submit" }).click();

  // Wait for feedback
  await expect(page.getByText(/try again/i)).toBeVisible();
});

test("User sees next round after clicking 'Next Song'", async ({ page }) => {
  await page.selectOption("#genre-dropdown", "Hiphop");

  // Submit a wrong guess to enable next round
  await page.getByPlaceholder("Enter your guess").fill("wrong answer");
  await page.getByRole("button", { name: "Submit" }).click();

  // Click "Next Song"
  await expect(page.getByRole("button", { name: "Next Song" })).toBeVisible();
  await page.getByRole("button", { name: "Next Song" }).click();

  // Confirm round increased
  await expect(page.getByText(/Round 2/i)).toBeVisible();
});

test("Game ends after 5 rounds", async ({ page }) => {
  await page.selectOption("#genre-dropdown", "Hiphop");

  // Go through 5 rounds with wrong guesses
  for (let i = 0; i < 5; i++) {
    await page.getByPlaceholder("Enter your guess").fill("wrong answer");
    await page.getByRole("button", { name: "Submit" }).click();
    await page.getByRole("button", { name: "Next Song" }).click();
  }

  await expect(page.getByText(/Game Over/i)).toBeVisible();
});
