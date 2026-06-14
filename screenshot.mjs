import { chromium } from '@playwright/test';

const browser = await chromium.launch();
const page = await browser.newPage();

await page.setViewportSize({ width: 1440, height: 900 });
await page.goto('http://localhost:3000/store/demo-restaurant', { waitUntil: 'networkidle' });
await page.screenshot({ path: 'C:/Users/user/Desktop/storefront_desktop.png', fullPage: true });

await page.setViewportSize({ width: 390, height: 844 });
await page.screenshot({ path: 'C:/Users/user/Desktop/storefront_mobile.png', fullPage: true });

await browser.close();
console.log('done');
