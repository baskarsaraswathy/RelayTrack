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
        console.log('BROWSER CONSOLE ERROR:', msg.text());
        hasError = true;
      }
    });
    page.on('pageerror', err => {
      console.log('BROWSER ERROR:', err.toString());
      hasError = true;
    });
    
    await page.goto('http://localhost:5173', { waitUntil: 'networkidle0', timeout: 10000 });
    
    // Click Live Shipments tab
    await page.evaluate(() => {
      const tabs = Array.from(document.querySelectorAll('button'));
      const liveShipmentsTab = tabs.find(b => b.textContent.includes('Live Shipments'));
      if (liveShipmentsTab) liveShipmentsTab.click();
    });
    
    await page.waitForTimeout(1000); // Wait for render
    
    if (!hasError) {
      console.log('SUCCESS: No runtime errors. Page rendered successfully after clicking Live Shipments.');
    }
    
    await browser.close();
  } catch (err) {
    console.error('Puppeteer Script Error:', err);
  }
})();
