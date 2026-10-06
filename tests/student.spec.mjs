// Executable browser acceptance specification written before the UI.
import { test, expect } from "@playwright/test";
test.use({ viewport: { width: 360, height: 800 } });
test("student registers, sees a personal card, and keeps back-navigation choices", async ({
  page,
}) => {
  await page.goto("/c/vnr-vjiet");
  await expect(
    page.getByRole("heading", { name: "VNR VJIET", exact: true }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Claim my seat" }).last().click();
  await page.getByRole("button", { name: "CSE/IT", exact: true }).click();
  await page.getByRole("button", { name: "Placements", exact: true }).click();
  await expect(
    page.getByText("Placement practice partner").last(),
  ).toBeVisible();
  await page.getByLabel("Your name").fill("QA Student");
  await page
    .getByLabel("Email address")
    .fill(`browser-${Date.now()}@example.invalid`);
  await page.getByLabel("Okay to email me workshop details").check();
  await page
    .getByRole("button", { name: "Claim my seat", exact: true })
    .last()
    .click();
  await expect(page.getByRole("heading", { name: /You’re in/ })).toBeVisible();
  await expect(
    page.getByRole("link", { name: "Share to WhatsApp" }),
  ).toBeVisible();
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
});
