import type { Page } from '@playwright/test';
import { expect, test } from '@playwright/test';
import path from 'path';

/**
 * End-to-End tests for Questline Exporter App
 * Tests the complete user workflow from file upload to questline interaction
 */

const PROJECT_ROOT = process.cwd();

test.describe('Questline Exporter App - E2E Tests', () => {
  // Note: Update this path to point to an actual test questline ZIP file
  const testZipPath = path.join(PROJECT_ROOT, 'public/assets/theme.zip');

  test.beforeEach(async ({ page }: { page: Page }) => {
    await page.goto('/');
    // Wait for the app to load
    await page.waitForSelector('.App', { state: 'attached', timeout: 10000 });
  });

  test('should load the application successfully', async ({ page }: { page: Page }) => {
    // Check for app bar (mobile header)
    const appBarTitle = page.locator('.app-bar__title');
    await expect(appBarTitle).toBeVisible();
    await expect(appBarTitle).toHaveText('Questline Demo');

    // Check for GitHub link in app bar
    const githubLink = page.locator('.app-bar__github-link');
    await expect(githubLink).toBeVisible();
    await expect(githubLink).toHaveAttribute(
      'href',
      'https://github.com/michael-h-patrianna/questline-exporter-test'
    );
  });

  test('should display initial upload screen', async ({ page }: { page: Page }) => {
    // Check for file upload button (in desktop sidebar, visible on large screens)
    await page.setViewportSize({ width: 1400, height: 900 });
    await page.waitForTimeout(200);

    const uploadButton = page.locator('.desktop-sidebar .file-input-button');
    await expect(uploadButton).toBeVisible();
    await expect(uploadButton).toHaveText('Choose ZIP File');

    // Check for file input with correct accept attribute
    const fileInput = page.locator('.desktop-sidebar input[type="file"].file-input-hidden');
    await expect(fileInput).toHaveAttribute('accept', '.zip');
  });

  test('should display hamburger menu on mobile', async ({ page }: { page: Page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    await page.waitForTimeout(200); // Wait for resize

    // Check for hamburger button
    const hamburger = page.locator('.app-bar__hamburger');
    await expect(hamburger).toBeVisible();
  });

  test('should hide hamburger menu on desktop', async ({ page }: { page: Page }) => {
    // Set desktop viewport
    await page.setViewportSize({ width: 1400, height: 900 });
    await page.waitForTimeout(200); // Wait for resize

    // Hamburger should not be visible on desktop (CSS display: none)
    const hamburger = page.locator('.app-bar__hamburger');
    await expect(hamburger).not.toBeVisible();
  });

  test('should open and close drawer on mobile', async ({ page }: { page: Page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    await page.waitForTimeout(200);

    // Open drawer
    const hamburger = page.locator('.app-bar__hamburger');
    await hamburger.click();

    // Check drawer is open
    const drawer = page.locator('.app-drawer.is-open');
    await expect(drawer).toBeVisible({ timeout: 2000 });

    // Close drawer by clicking close button
    const closeButton = page.locator('.app-drawer__close');
    await closeButton.click();

    // Wait for drawer to close
    await page.waitForTimeout(300);

    // Check drawer is closed (no longer has is-open class)
    await expect(page.locator('.app-drawer.is-open')).not.toBeVisible();
  });

  test('should close drawer on ESC key', async ({ page }: { page: Page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    await page.waitForTimeout(200);

    // Open drawer
    const hamburger = page.locator('.app-bar__hamburger');
    await hamburger.click();

    // Check drawer is open
    const drawer = page.locator('.app-drawer.is-open');
    await expect(drawer).toBeVisible({ timeout: 2000 });

    // Press ESC
    await page.keyboard.press('Escape');

    // Wait for drawer to close
    await page.waitForTimeout(300);

    // Check drawer is closed
    await expect(page.locator('.app-drawer.is-open')).not.toBeVisible();
  });

  test('should display desktop sidebar on large screens', async ({ page }: { page: Page }) => {
    // Set desktop viewport
    await page.setViewportSize({ width: 1400, height: 900 });

    // Wait a moment for CSS to apply
    await page.waitForTimeout(100);

    // Desktop sidebar should be visible (check for upload section which is always there)
    const uploadSection = page.locator('.desktop-sidebar .upload-section');
    await expect(uploadSection).toBeVisible();
  });

  test.skip('should upload and extract questline theme successfully', async ({
    page,
  }: {
    page: Page;
  }) => {
    // Skip if test file doesn't exist - this is a placeholder
    // Create test ZIP file before running this test

    // Upload the ZIP file
    const fileInput = page.locator('input[type="file"]').first();
    await fileInput.setInputFiles(testZipPath);

    // Wait for extraction to complete
    await expect(page.getByText('Questline Settings')).toBeVisible({ timeout: 10000 });

    // Verify questline viewer is displayed
    await expect(page.locator('.questline-viewer')).toBeVisible();

    // Verify control panels are visible
    await expect(page.getByText('Components Included:')).toBeVisible();
  });

  test.skip('should display questline ID and frame dimensions', async ({
    page,
  }: {
    page: Page;
  }) => {
    const fileInput = page.locator('input[type="file"]').first();
    await fileInput.setInputFiles(testZipPath);

    await expect(page.getByText('Questline Settings')).toBeVisible({ timeout: 10000 });

    // Check for questline ID display
    await expect(page.getByText(/ID:/)).toBeVisible();

    // Check for frame size display
    await expect(page.getByText(/Frame Size:/)).toBeVisible();

    // Check for total quests display
    await expect(page.getByText(/Total Quests:/)).toBeVisible();
  });

  test.skip('should adjust questline dimensions with sliders', async ({ page }: { page: Page }) => {
    const fileInput = page.locator('input[type="file"]').first();
    await fileInput.setInputFiles(testZipPath);

    await expect(page.getByText('Questline Settings')).toBeVisible({ timeout: 10000 });

    // Find width slider
    const widthLabel = page.getByText(/Questline Width:/);
    await expect(widthLabel).toBeVisible();

    const widthInput = page.locator('input[type="range"]').filter({
      has: page.locator('xpath=ancestor::label[contains(., "Questline Width")]'),
    });

    const initialWidth = await widthInput.inputValue();

    // Adjust width
    await widthInput.fill('350');
    const newWidth = await widthInput.inputValue();
    expect(newWidth).toBe('350');
    expect(newWidth).not.toBe(initialWidth);
  });

  test('should toggle component visibility', async ({ page }: { page: Page }) => {
    // Set desktop viewport first to see sidebar
    await page.setViewportSize({ width: 1400, height: 900 });
    await page.waitForTimeout(200);

    // Wait for auto-loaded theme (check desktop sidebar specifically)
    await expect(page.locator('.desktop-sidebar').getByText('Questline Settings')).toBeVisible({
      timeout: 10000,
    });

    // Find background toggle button in desktop sidebar
    const backgroundButton = page
      .locator('.desktop-sidebar')
      .getByRole('button', { name: /background/i });
    await expect(backgroundButton).toBeVisible();

    // Verify the background is initially visible
    const background = page.locator('.questline-background');
    await expect(background).toBeVisible();

    // Click to toggle (hide)
    await backgroundButton.click();
    await page.waitForTimeout(100);

    // Verify the background is now hidden
    await expect(background).not.toBeVisible();

    // Verify button has component-hidden class
    const hiddenClass = await backgroundButton.getAttribute('class');
    expect(hiddenClass).toContain('component-hidden');

    // Click again to toggle back (show)
    await backgroundButton.click();
    await page.waitForTimeout(100);

    // Verify background is visible again
    await expect(background).toBeVisible();

    // Verify button no longer has component-hidden class
    const visibleClass = await backgroundButton.getAttribute('class');
    expect(visibleClass).not.toContain('component-hidden');
  });

  test.skip('should cycle quest states when clicked', async ({ page }: { page: Page }) => {
    const fileInput = page.locator('input[type="file"]').first();
    await fileInput.setInputFiles(testZipPath);

    await expect(page.getByText('Questline Settings')).toBeVisible({ timeout: 10000 });

    // Find first quest
    const quest = page.locator('.quest-renderer').first();
    await expect(quest).toBeVisible();

    // Click to cycle through states: locked -> active -> unclaimed -> completed -> locked
    await quest.click();
    await page.waitForTimeout(100);

    await quest.click();
    await page.waitForTimeout(100);

    await quest.click();
    await page.waitForTimeout(100);

    // Should cycle back to locked
    await quest.click();
    await page.waitForTimeout(100);
  });

  test.skip('should cycle header states when clicked', async ({ page }: { page: Page }) => {
    const fileInput = page.locator('input[type="file"]').first();
    await fileInput.setInputFiles(testZipPath);

    await expect(page.getByText('Questline Settings')).toBeVisible({ timeout: 10000 });

    // Find header component
    const header = page.locator('.header-renderer');
    await expect(header).toBeVisible();

    // Click to cycle: active -> success -> fail -> active
    await header.click();
    await expect(page.getByAltText(/Header success/i)).toBeVisible();

    await header.click();
    await expect(page.getByAltText(/Header fail/i)).toBeVisible();

    await header.click();
    await expect(page.getByAltText(/Header active/i)).toBeVisible();
  });

  test.skip('should cycle rewards states when clicked', async ({ page }: { page: Page }) => {
    const fileInput = page.locator('input[type="file"]').first();
    await fileInput.setInputFiles(testZipPath);

    await expect(page.getByText('Questline Settings')).toBeVisible({ timeout: 10000 });

    // Find rewards component
    const rewards = page.locator('.rewards-renderer');
    await expect(rewards).toBeVisible();

    // Click to cycle: active -> fail -> claimed -> active
    await rewards.click();
    await page.waitForTimeout(100);

    await rewards.click();
    await page.waitForTimeout(100);

    await rewards.click();
    await page.waitForTimeout(100);
  });

  test.skip('should handle button interactions', async ({ page }: { page: Page }) => {
    const fileInput = page.locator('input[type="file"]').first();
    await fileInput.setInputFiles(testZipPath);

    await expect(page.getByText('Questline Settings')).toBeVisible({ timeout: 10000 });

    // Find button
    const button = page.locator('.button-renderer');
    await expect(button).toBeVisible();

    // Hover should change button state
    await button.hover();
    await page.waitForTimeout(100);

    // Click button
    await button.click();
    await page.waitForTimeout(100);

    // Move mouse away
    await page.mouse.move(0, 0);
    await page.waitForTimeout(100);
  });

  test.skip('should display interaction help guide', async ({ page }: { page: Page }) => {
    const fileInput = page.locator('input[type="file"]').first();
    await fileInput.setInputFiles(testZipPath);

    await expect(page.getByText('Questline Settings')).toBeVisible({ timeout: 10000 });

    // Check for interaction guide
    await expect(page.getByText('Interaction Guide:')).toBeVisible();
    await expect(page.getByText(/Click quests to cycle/i)).toBeVisible();
    await expect(page.getByText(/Click header to cycle/i)).toBeVisible();
  });

  test.skip('should maintain state across multiple interactions', async ({
    page,
  }: {
    page: Page;
  }) => {
    const fileInput = page.locator('input[type="file"]').first();
    await fileInput.setInputFiles(testZipPath);

    await expect(page.getByText('Questline Settings')).toBeVisible({ timeout: 10000 });

    // Perform multiple interactions
    // 1. Cycle header
    const header = page.locator('.header-renderer');
    await header.click();

    // 2. Click quest
    const quest = page.locator('.quest-renderer').first();
    await quest.click();

    // 3. Toggle component visibility
    const backgroundButton = page.getByRole('button', { name: /background/i }).first();
    await backgroundButton.click();

    // Verify all states are maintained
    await expect(page.getByAltText(/Header success/i)).toBeVisible();
    await expect(page.locator('.questline-background')).not.toBeVisible();
  });

  test.skip('should handle error for invalid file upload', async ({ page }: { page: Page }) => {
    // The file input has accept=".zip" so browser should filter
    const fileInput = page.locator('input[type="file"]').first();
    await expect(fileInput).toHaveAttribute('accept', '.zip');

    // If a non-ZIP file somehow gets through, app should handle gracefully
  });

  test('should have proper ARIA attributes', async ({ page }: { page: Page }) => {
    // AppBar should be accessible
    const appBar = page.locator('.app-bar');
    await expect(appBar).toBeVisible();

    // Hamburger button should have proper aria labels
    const hamburger = page.locator('.app-bar__hamburger');
    await expect(hamburger).toHaveAttribute('aria-label', 'Open menu');
  });

  test('should be responsive', async ({ page }: { page: Page }) => {
    // Test at different viewport sizes
    const viewports = [
      { width: 375, height: 667, name: 'Mobile' },
      { width: 768, height: 1024, name: 'Tablet' },
      { width: 1400, height: 900, name: 'Desktop' },
    ];

    for (const viewport of viewports) {
      await page.setViewportSize({ width: viewport.width, height: viewport.height });
      await page.waitForTimeout(200);

      // App should be visible at all sizes
      await expect(page.locator('.App')).toBeVisible();

      // Upload button should be visible in desktop sidebar for large screens
      if (viewport.width >= 1024) {
        const uploadButton = page.locator('.desktop-sidebar .file-input-button');
        await expect(uploadButton).toBeVisible();
      }
    }
  });

  test('should prevent body scroll when drawer is open', async ({ page }: { page: Page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    await page.waitForTimeout(200);

    // Open drawer
    const hamburger = page.locator('.app-bar__hamburger');
    await hamburger.click();

    // Wait for drawer to open
    const drawer = page.locator('.app-drawer.is-open');
    await expect(drawer).toBeVisible({ timeout: 2000 });

    // Check that body has overflow: hidden
    const bodyOverflow = await page.evaluate(() => {
      return window.getComputedStyle(document.body).overflow;
    });

    expect(bodyOverflow).toBe('hidden');

    // Close drawer
    const closeButton = page.locator('.app-drawer__close');
    await closeButton.click();

    // Wait for drawer animation to complete
    await page.waitForTimeout(400);

    // Check that body overflow is restored
    const restoredOverflow = await page.evaluate(() => {
      return window.getComputedStyle(document.body).overflow;
    });

    expect(restoredOverflow).not.toBe('hidden');
  });
});
