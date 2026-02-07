// Script to capture Angular application screenshots
const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

const imagesDir = path.join(__dirname, '..', 'docs', 'images', 'angular');
if (!fs.existsSync(imagesDir)) {
  fs.mkdirSync(imagesDir, { recursive: true });
}

async function captureAngularScreenshots() {
  const browser = await chromium.launch({
    headless: false,
    slowMo: 800,
  });

  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 },
    ignoreHTTPSErrors: true,
  });

  const page = await context.newPage();

  const userIconSelectors = [
    'button:has(mat-icon:has-text("account_circle"))',
    'button[aria-label*="user" i]',
    'button[aria-label*="account" i]',
    'button mat-icon:has-text("account_circle")',
    'button mat-icon:has-text("person")',
    'mat-toolbar button:last-child',
  ];

  async function openUserMenu() {
    for (const selector of userIconSelectors) {
      const icon = page.locator(selector).first();
      if (await icon.count() > 0) {
        await icon.click({ timeout: 5000 });
        await page.waitForTimeout(500);
        return true;
      }
    }
    return false;
  }

  async function clickFirstAvailable(selectors) {
    for (const selector of selectors) {
      try {
        const element = page.locator(selector).first();
        if (await element.count() > 0) {
          await element.click({ timeout: 5000 });
          return true;
        }
      } catch (e) {
        // continue
      }
    }
    return false;
  }

  try {
    console.log('Capturing Angular application screenshots...\n');

    // 1) Anonymous dashboard (before login)
    console.log('1) Capturing anonymous dashboard before login...');
    await page.goto('http://localhost:4200/dashboard', { waitUntil: 'networkidle', timeout: 30000 });
    await page.waitForTimeout(1500);
    await page.screenshot({
      path: path.join(imagesDir, 'application-dashboard-anonymous.png'),
      fullPage: false,
    });
    console.log('   Saved: application-dashboard-anonymous.png\n');

    // 2) Open user menu with login link (anonymous)
    console.log('2) Capturing user menu with login link...');
    const menuOpenedBeforeLogin = await openUserMenu();
    if (!menuOpenedBeforeLogin) {
      throw new Error('Could not open user menu before login.');
    }
    await page.screenshot({
      path: path.join(imagesDir, 'angular-login-page.png'),
      fullPage: false,
    });
    console.log('   Saved: angular-login-page.png\n');

    // 3) Login via IdentityServer
    console.log('3) Logging in via IdentityServer...');
    await page.goto('http://localhost:4200/login', { waitUntil: 'load', timeout: 30000 });

    if (!page.url().includes('44310')) {
      await page.goto('https://localhost:44310/Account/Login', { waitUntil: 'networkidle', timeout: 30000 });
    }

    await page.fill('input[name="Username"], input[name="username"], input#Username', 'ashtyn1');
    await page.fill('input[name="Password"], input[name="password"], input#Password', 'Pa$$word123');
    await page.waitForTimeout(400);

    await page.screenshot({
      path: path.join(imagesDir, 'identityserver-login-ashtyn1.png'),
      fullPage: false,
    });
    console.log('   Saved: identityserver-login-ashtyn1.png');

    await clickFirstAvailable([
      'button[type="submit"]',
      'button:has-text("Login")',
      'input[type="submit"]',
    ]);

    await page.waitForURL('http://localhost:4200/**', { timeout: 30000 }).catch(async () => {
      await page.goto('http://localhost:4200/dashboard', { waitUntil: 'networkidle', timeout: 30000 });
    });
    await page.waitForTimeout(1500);
    console.log('   Logged in successfully\n');

    // 4) Employee CRUD screenshots
    console.log('4) Capturing employee list page...');
    await page.goto('http://localhost:4200/employees', { waitUntil: 'networkidle', timeout: 30000 });
    await page.waitForTimeout(1500);
    await page.screenshot({
      path: path.join(imagesDir, 'employee-list-page.png'),
      fullPage: true,
    });
    console.log('   Saved: employee-list-page.png');

    console.log('5) Capturing search and filtering UI...');
    await page.screenshot({
      path: path.join(imagesDir, 'search-filtering-ui.png'),
      fullPage: true,
    });
    console.log('   Saved: search-filtering-ui.png');

    console.log('6) Capturing create employee form...');
    await page.goto('http://localhost:4200/employees/create', { waitUntil: 'networkidle', timeout: 30000 });
    await page.waitForTimeout(1200);
    await page.screenshot({
      path: path.join(imagesDir, 'employee-form.png'),
      fullPage: true,
    });
    console.log('   Saved: employee-form.png');

    console.log('7) Capturing CRUD operations overview...');
    await page.goto('http://localhost:4200/employees', { waitUntil: 'networkidle', timeout: 30000 });
    await page.waitForTimeout(1200);
    await page.screenshot({
      path: path.join(imagesDir, 'crud-operations.png'),
      fullPage: true,
    });
    console.log('   Saved: crud-operations.png\n');

    // 8) Logout menu screenshot, logout confirmation page, click Here
    console.log('8) Capturing user menu with logout link...');
    await page.goto('http://localhost:4200/dashboard', { waitUntil: 'networkidle', timeout: 30000 });
    await page.waitForTimeout(1000);
    const menuOpenedAfterLogin = await openUserMenu();
    if (!menuOpenedAfterLogin) {
      throw new Error('Could not open user menu after login.');
    }

    await page.screenshot({
      path: path.join(imagesDir, 'user-menu-logout-link.png'),
      fullPage: false,
    });
    console.log('   Saved: user-menu-logout-link.png');

    const logoutClicked = await clickFirstAvailable([
      '[role="menuitem"]:has-text("Logout")',
      '[role="menuitem"]:has-text("Log out")',
      'button:has-text("Logout")',
      'a:has-text("Logout")',
      'a[href*="logout" i]',
    ]);
    if (!logoutClicked) {
      throw new Error('Could not click Logout menu item.');
    }

    // Capture the intermediate IdentityServer confirmation page with "Click Here"
    await page.waitForTimeout(1200);
    await page.screenshot({
      path: path.join(imagesDir, 'identityserver-logout-intermediate.png'),
      fullPage: true,
    });
    console.log(`   Saved: identityserver-logout-intermediate.png (URL: ${page.url()})`);

    const hereClicked = await clickFirstAvailable([
      'a:has-text("Click Here")',
      'a:has-text("here")',
      'a:has-text("click here")',
      'form button[type="submit"]',
      'form input[type="submit"]',
    ]);

    if (hereClicked) {
      await page.waitForURL('http://localhost:4200/**', { timeout: 30000 }).catch(async () => {
        await page.goto('http://localhost:4200', { waitUntil: 'networkidle', timeout: 30000 });
      });
      console.log('   Clicked Here and redirected back to Angular.\n');
    } else {
      console.log('   Could not find Click Here link/button on logout page.\n');
    }

    console.log('Angular screenshot flow completed successfully.');
    console.log(`Screenshots saved to: ${imagesDir}\n`);
  } catch (error) {
    console.error('Error taking screenshots:', error.message);
    console.error('\nStack trace:', error.stack);
  } finally {
    await browser.close();
  }
}

captureAngularScreenshots().catch(console.error);
