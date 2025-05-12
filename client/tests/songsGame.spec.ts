import { expect, test } from "@playwright/test";

test.beforeEach(async ({ page }) => {
  // Go to your app’s homepage where the game starts
  await page.goto("http://localhost:8000");
});


 // Clerk testing
 test("testing integration functionality", async ({ page }) => {
  // Fill in Clerk test credentials
  await page.getByLabel("Email address").fill("notreal@brown.edu");
  await page.getByRole("button", { name: "Continue", exact: true }).click();

  // Wait for password input to show up
  await page.getByPlaceholder("Enter your password").fill("notrealnotreal");
  await page.getByRole("button", { name: "Continue", exact: true }).click();
 });

// test("User can see the game UI and start a round", async ({ page }) => {
//   // Wait for genre selection screen
//   await expect(page.getByLabel("Select a genre")).toBeVisible();

//   // Select a genre from a dropdown or buttons (adjust if needed)
//   await page.selectOption("#genre-dropdown", "Hiphop");

//   // Expect round and input field to appear
//   await expect(page.getByText(/Round/i)).toBeVisible();
//   await expect(page.getByPlaceholder("Enter your guess")).toBeVisible();
//   await expect(page.getByRole("button", { name: "Submit" })).toBeVisible();
// });

// test("User can submit a wrong guess and see feedback", async ({ page }) => {
//   await page.selectOption("#genre-dropdown", "Hiphop");

//   // Type wrong guess
//   await page.getByPlaceholder("Enter your guess").fill("wrong answer");
//   await page.getByRole("button", { name: "Submit" }).click();

//   // Wait for feedback
//   await expect(page.getByText(/try again/i)).toBeVisible();
// });

// test("User sees next round after clicking 'Next Song'", async ({ page }) => {
//   await page.selectOption("#genre-dropdown", "Hiphop");

//   // Submit a wrong guess to enable next round
//   await page.getByPlaceholder("Enter your guess").fill("wrong answer");
//   await page.getByRole("button", { name: "Submit" }).click();

//   // Click "Next Song"
//   await expect(page.getByRole("button", { name: "Next Song" })).toBeVisible();
//   await page.getByRole("button", { name: "Next Song" }).click();

//   // Confirm round increased
//   await expect(page.getByText(/Round 2/i)).toBeVisible();
// });

// test("Game ends after 5 rounds", async ({ page }) => {
//   await page.selectOption("#genre-dropdown", "Hiphop");

//   // Go through 5 rounds with wrong guesses
//   for (let i = 0; i < 5; i++) {
//     await page.getByPlaceholder("Enter your guess").fill("wrong answer");
//     await page.getByRole("button", { name: "Submit" }).click();
//     await page.getByRole("button", { name: "Next Song" }).click();
//   }

//   await expect(page.getByText(/Game Over/i)).toBeVisible();
// });
