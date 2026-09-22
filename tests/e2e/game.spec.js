const { test, expect } = require('@playwright/test');

test.describe('T-Rex Runner game', () => {
  test('loads the game canvas and HUD', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('#game-canvas')).toBeVisible();
    await expect(page.locator('#score')).toHaveText('00000');
    await expect(page.locator('#high-score')).toBeVisible();
  });

  test('pressing space starts the game and increases the score', async ({ page }) => {
    await page.goto('/');
    await page.keyboard.press('Space');
    await page.waitForTimeout(1500);
    const score = await page.locator('#score').textContent();
    expect(Number(score)).toBeGreaterThan(0);
  });

  test('restart button exists in the DOM', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('#restart-btn')).toBeAttached();
  });

  test('shows a start overlay with a Start button before play, then hides it', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('#start-overlay')).toBeVisible();
    await expect(page.locator('#start-btn')).toBeVisible();

    await page.locator('#start-btn').click();
    await expect(page.locator('#start-overlay')).toBeHidden();
  });
});
