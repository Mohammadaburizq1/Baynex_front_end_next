import { chromium } from '@playwright/test';

const browser = await chromium.launch();
const page = await browser.newPage();

// Tablet view
await page.setViewportSize({ width: 768, height: 1024 });
await page.goto('http://localhost:3000/store/demo-restaurant', { waitUntil: 'networkidle' });
await page.screenshot({ path: 'C:/Users/user/Desktop/storefront_tablet.png', fullPage: true });

// Check for console errors
const errors = [];
page.on('console', msg => { if (msg.type() === 'error') errors.push(msg.text()); });
await page.goto('http://localhost:3000/store/demo-restaurant', { waitUntil: 'networkidle' });

// Scroll to bottom to capture everything
await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
await page.screenshot({ path: 'C:/Users/user/Desktop/storefront_desktop_bottom.png', fullPage: false });

await browser.close();
console.log('Errors:', errors);
