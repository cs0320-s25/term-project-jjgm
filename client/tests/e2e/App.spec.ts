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
