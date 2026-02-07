// Script to capture Web API screenshots (Swagger UI)
const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

// Create webapi images directory
const imagesDir = path.join(__dirname, '..', 'docs', 'images', 'webapi');
if (!fs.existsSync(imagesDir)) {
  fs.mkdirSync(imagesDir, { recursive: true });
}

async function captureWebAPIScreenshots() {
  const browser = await chromium.launch({
    headless: false,
    slowMo: 1000,
  });

  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 },
    ignoreHTTPSErrors: true,
  });

  const page = await context.newPage();

  async function toggleResource(tagName) {
    const headerSelectors = [
      `.opblock-tag-section:has(.opblock-tag:has-text("${tagName}")) .opblock-tag`,
      `.opblock-tag:has-text("${tagName}")`,
      `h3.opblock-tag:has-text("${tagName}")`,
      `[data-tag="${tagName}"] .opblock-tag`,
    ];

    for (const selector of headerSelectors) {
      const target = page.locator(selector).first();
      if (await target.count() > 0) {
        await target.click();
        return true;
      }
    }
    return false;
  }

  async function captureExpandedResource(tagName, outputFile) {
    const clicked = await toggleResource(tagName);

    if (!clicked) {
      throw new Error(`Could not find Swagger resource tag: ${tagName}`);
    }

    await page.waitForTimeout(1500);

    await page.screenshot({
      path: path.join(imagesDir, outputFile),
      fullPage: true,
    });
  }

  function toKebabCase(value) {
    return value
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }

  try {
    console.log('Capturing Web API screenshots...\n');

    // 1. Swagger UI landing
    console.log('1) Opening Swagger UI...');
    await page.goto('https://localhost:44378/swagger/index.html', { waitUntil: 'networkidle', timeout: 30000 });
    await page.waitForTimeout(2000);

    const resourceTags = await page.locator('.opblock-tag').allTextContents();
    const tags = resourceTags
      .map((tag) => tag.trim())
      .filter((tag) => tag.length > 0);

    if (tags.length === 0) {
      throw new Error('No Swagger resources were found.');
    }

    let previousTag = null;
    let step = 2;
    for (const tagName of tags) {
      if (previousTag) {
        await toggleResource(previousTag);
        await page.waitForTimeout(300);
      }

      const outputFile = `swagger-${toKebabCase(tagName)}-resource-expanded.png`;
      console.log(`${step}) Capturing expanded ${tagName} resource...`);
      await captureExpandedResource(tagName, outputFile);
      console.log(`   Saved: ${outputFile}\n`);

      previousTag = tagName;
      step += 1;
    }

    console.log('All Web API screenshots captured successfully!');
    console.log(`Screenshots saved to: ${imagesDir}\n`);
  } catch (error) {
    console.error('Error taking screenshots:', error.message);
    console.error('\nStack trace:', error.stack);
  } finally {
    await browser.close();
  }
}

captureWebAPIScreenshots().catch(console.error);
