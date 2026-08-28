const puppeteer = require('puppeteer-core');

(async () => {
  try {
    const browser = await puppeteer.launch({ 
      executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe',
      headless: "new"
    });
    const page = await browser.newPage();
    
    let hasError = false;
    page.on('console', msg => {
      if (msg.type() === 'error') {
        if (!msg.text().includes('404')) { // ignore favicon
          console.log('BROWSER CONSOLE ERROR:', msg.text());
          hasError = true;
        }
      }
    });
    page.on('pageerror', err => {
      console.log('BROWSER ERROR:', err.toString());
      hasError = true;
    });
    
    await page.goto('http://localhost:5173', { waitUntil: 'networkidle0', timeout: 10000 });
    
    const tabs = ['Command Center', 'Live Shipments', 'Risk Monitor', 'Route Planner', 'Legacy Feed', 'Offline Sync', 'Settings'];
    
    for (const tabName of tabs) {
      console.log(`Clicking ${tabName}...`);
      await page.evaluate((name) => {
        const buttons = Array.from(document.querySelectorAll('button'));
        const tabBtn = buttons.find(b => b.textContent.includes(name));
        if (tabBtn) tabBtn.click();
      }, tabName);
      await new Promise(r => setTimeout(r, 500)); // wait for render
    }
    
    if (!hasError) {
      console.log('ALL TABS RENDERED SUCCESSFULLY WITH NO UNCAUGHT ERRORS.');
    } else {
      console.log('FAILED: Errors detected.');
    }
    
    await browser.close();
  } catch (err) {
    console.error('Puppeteer Script Error:', err);
  }
})();
