import { test, expect } from '@playwright/test';

test('capture portfolio screenshot', async ({ page }) => {
  // Go to the local dev server
  await page.goto('http://localhost:3000');
  
  // Wait for the fonts and GSAP animations to settle
  await page.waitForTimeout(2000);
  
  // Take a full page screenshot
  await page.screenshot({ path: 'audit-screenshot.png', fullPage: true });
});
