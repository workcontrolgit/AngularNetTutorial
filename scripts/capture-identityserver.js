// Script to capture IdentityServer screenshots
const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

// Create identityserver images directory
const imagesDir = path.join(__dirname, '..', 'docs', 'images', 'identityserver');
if (!fs.existsSync(imagesDir)) {
  fs.mkdirSync(imagesDir, { recursive: true });
}

async function captureIdentityServerScreenshots() {
  const browser = await chromium.launch({
    headless: false,
    slowMo: 1000,
  });

  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 },
    ignoreHTTPSErrors: true,
  });

  const page = await context.newPage();

  try {
    console.log('Capturing IdentityServer screenshots...\n');

    // 1. Open IdentityServer login page
    console.log('1) Opening IdentityServer login page...');
    await page.goto('https://localhost:44310/Account/Login', { waitUntil: 'networkidle', timeout: 30000 });
    await page.waitForTimeout(2000);
    console.log('   Login page loaded\n');

    // 2. IdentityServer Login Page with admin credentials
    console.log('2) Capturing IdentityServer login with admin credentials...');
    await page.fill('input[name="Username"], input[name="username"], input#Username', 'admin');
    await page.fill('input[name="Password"], input[name="password"], input#Password', 'Pa$$word123');
    await page.waitForTimeout(500);

    await page.screenshot({
      path: path.join(imagesDir, 'identityserver-login-admin.png'),
      fullPage: false,
    });
    console.log('   Saved: identityserver-login-admin.png\n');

    // 3. IdentityServer Admin UI
    console.log('3) Navigating to IdentityServer Admin UI...');
    await page.goto('https://localhost:44303', { waitUntil: 'networkidle', timeout: 30000 });
    await page.waitForTimeout(2000);

    // Check if we need to login to Admin UI
    const hasLoginForm = await page.locator('input[name="Username"], input[name="username"]').count() > 0;

    if (hasLoginForm) {
      console.log('   Logging in with admin credentials...');

      // Fill in admin credentials
      await page.fill('input[name="Username"], input[name="username"]', 'admin');
      await page.fill('input[name="Password"], input[name="password"]', 'Pa$$word123');

      // Click login button
      const submitSelectors = [
        'button[type="submit"]',
        'button:has-text("Login")',
        'button:has-text("Sign In")',
        'input[type="submit"]',
      ];

      let submitted = false;
      for (const selector of submitSelectors) {
        try {
          const button = page.locator(selector).first();
          if (await button.count() > 0) {
            await button.click({ timeout: 5000 });
            submitted = true;
            break;
          }
        } catch (e) {
          // continue trying submit selectors
        }
      }

      if (!submitted) {
        await page.press('input[name="Password"], input[name="password"], input#Password', 'Enter');
      }

      // Wait for dashboard to load
      await page.waitForTimeout(5000);
      console.log('   Logged in successfully');
    } else {
      console.log('   Already logged in or no login required');
    }

    await page.screenshot({
      path: path.join(imagesDir, 'identityserver-admin-dashboard.png'),
      fullPage: false,
    });
    console.log('   Saved: identityserver-admin-dashboard.png\n');

    // 4. Clients configuration list
    console.log('4) Navigating to Clients configuration screen...');
    await page.goto('https://localhost:44303/Configuration/Clients', { waitUntil: 'networkidle', timeout: 30000 });
    await page.waitForTimeout(2000);
    await page.screenshot({
      path: path.join(imagesDir, 'identityserver-clients-list.png'),
      fullPage: true,
    });
    console.log('   Saved: identityserver-clients-list.png\n');

    // 5. Edit TalentManagement client and capture Urls tab
    console.log('5) Navigating to TalentManagement client edit page...');
    await page.goto('https://localhost:44303/Configuration/Client/2', { waitUntil: 'networkidle', timeout: 30000 });
    await page.waitForTimeout(2000);

    // Try to switch to Urls tab if tab navigation is available
    const urlsTabSelectors = [
      'a:has-text("Urls")',
      'button:has-text("Urls")',
      '[role="tab"]:has-text("Urls")',
      'li:has-text("Urls")',
    ];
    let urlsTabClicked = false;
    for (const selector of urlsTabSelectors) {
      try {
        const tab = page.locator(selector).first();
        if (await tab.count() > 0) {
          await tab.click({ timeout: 5000 });
          urlsTabClicked = true;
          break;
        }
      } catch (e) {
        // continue trying Urls tab selectors
      }
    }

    if (!urlsTabClicked) {
      console.log('   Urls tab was not auto-detected; capturing current client edit view.');
    } else {
      await page.waitForTimeout(1500);
    }

    await page.screenshot({
      path: path.join(imagesDir, 'identityserver-client-talentmanagement-urls-tab.png'),
      fullPage: true,
    });
    console.log('   Saved: identityserver-client-talentmanagement-urls-tab.png\n');

    // 6. Advanced tab > Grant Types sub tab
    console.log('6) Capturing Advanced tab - Grant Types...');
    const advancedTabSelectors = [
      'a:has-text("Advanced")',
      'button:has-text("Advanced")',
      '[role="tab"]:has-text("Advanced")',
      'li:has-text("Advanced")',
    ];
    for (const selector of advancedTabSelectors) {
      try {
        const advancedTab = page.locator(selector).first();
        if (await advancedTab.count() > 0) {
          await advancedTab.click({ timeout: 5000 });
          break;
        }
      } catch (e) {
        // continue trying advanced tab selectors
      }
    }
    await page.waitForTimeout(1500);

    const grantTypesSelectors = [
      'a:has-text("Grant Types")',
      'button:has-text("Grant Types")',
      '[role="tab"]:has-text("Grant Types")',
      'li:has-text("Grant Types")',
    ];
    for (const selector of grantTypesSelectors) {
      try {
        const grantTab = page.locator(selector).first();
        if (await grantTab.count() > 0) {
          await grantTab.click({ timeout: 5000 });
          break;
        }
      } catch (e) {
        // continue trying grant types selectors
      }
    }
    await page.waitForTimeout(1500);
    await page.screenshot({
      path: path.join(imagesDir, 'identityserver-client-talentmanagement-advanced-grant-types.png'),
      fullPage: true,
    });
    console.log('   Saved: identityserver-client-talentmanagement-advanced-grant-types.png\n');

    // 7. Advanced tab > Token sub tab
    console.log('7) Capturing Advanced tab - Token...');
    for (const selector of advancedTabSelectors) {
      try {
        const advancedTab = page.locator(selector).first();
        if (await advancedTab.count() > 0) {
          await advancedTab.click({ timeout: 5000 });
          break;
        }
      } catch (e) {
        // continue trying advanced tab selectors
      }
    }
    await page.waitForTimeout(1200);

    const tokenSelectors = [
      'a:has-text("Token")',
      'button:has-text("Token")',
      '[role="tab"]:has-text("Token")',
      'li:has-text("Token")',
    ];
    for (const selector of tokenSelectors) {
      try {
        const tokenTab = page.locator(selector).first();
        if (await tokenTab.count() > 0) {
          await tokenTab.click({ timeout: 5000 });
          break;
        }
      } catch (e) {
        // continue trying token selectors
      }
    }
    await page.waitForTimeout(1500);
    await page.screenshot({
      path: path.join(imagesDir, 'identityserver-client-talentmanagement-advanced-token.png'),
      fullPage: true,
    });
    console.log('   Saved: identityserver-client-talentmanagement-advanced-token.png\n');

    // 8. Swagger UI
    console.log('8) Capturing Swagger UI...');
    await page.goto('https://localhost:44302/swagger/index.html', { waitUntil: 'networkidle', timeout: 30000 });
    await page.waitForTimeout(2000);
    await page.screenshot({
      path: path.join(imagesDir, 'identityserver-swagger-ui.png'),
      fullPage: true,
    });
    console.log('   Saved: identityserver-swagger-ui.png\n');

    console.log('All IdentityServer screenshots captured successfully!');
    console.log(`Screenshots saved to: ${imagesDir}\n`);

  } catch (error) {
    console.error('Error taking screenshots:', error.message);
    console.error('\nStack trace:', error.stack);
  } finally {
    await browser.close();
  }
}

captureIdentityServerScreenshots().catch(console.error);

