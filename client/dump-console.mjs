import { chromium } from 'playwright';

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  
  page.on('console', msg => console.log(`[BROWSER CONSOLE] ${msg.type()}: ${msg.text()}`));
  page.on('pageerror', err => console.log(`[BROWSER ERROR] ${err.name}: ${err.message}\n${err.stack}`));
  
  console.log("Navigating to http://localhost:5173 ...");
  try {
    await page.goto('http://localhost:5173', { waitUntil: 'load', timeout: 10000 });
  } catch (err) {
    console.log("Navigation error: ", err.message);
  }
  
  await new Promise(r => setTimeout(r, 2000));
  await browser.close();
})();
