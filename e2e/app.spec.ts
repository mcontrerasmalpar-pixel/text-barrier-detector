import { test, expect } from "../playwright-fixture";

test("analyzes text in the React UI using @maky/text-barrier-core", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByText("Text Barrier Detector")).toBeVisible();
  await page.locator("textarea").fill("The report was written by the team. She is turned on.");
  await page.getByRole("button", { name: /Analyze/i }).click();
  await expect(page.getByText("Readability Band (A1–C2)")).toBeVisible();
  await expect(page.getByText("CEFR-inspired heuristic, not a certification.")).toBeVisible();
});
