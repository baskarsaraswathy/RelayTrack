const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({ headless: 'new' });
  const page = await browser.newPage();
  
  page.on('console', msg => console.log('BROWSER_LOG:', msg.text()));
  page.on('pageerror', error => console.log('BROWSER_ERROR:', error.message));
  page.on('requestfailed', request =>
    console.log(`REQUEST_FAILED: ${request.url()} - ${request.failure().errorText}`)
  );

  console.log('Navigating to http://127.0.0.1:5173...');
  await page.goto('http://127.0.0.1:5173', { waitUntil: 'networkidle0', timeout: 15000 });
  
  console.log('Page loaded. Checking for data...');
  // Wait a bit just in case
  await new Promise(r => setTimeout(r, 2000));
  
  // Extract text from KPI cards
  const kpiText = await page.evaluate(() => {
    return document.body.innerText.substring(0, 500); // Check first 500 chars to see if we see "Loading" or real data
  });
  console.log('PAGE TEXT SAMPLE:', kpiText.replace(/\n/g, ' '));
  
  // Check if API endpoints were hit (from the backend logs we could also see this)
  await browser.close();
  console.log('Test complete.');
})().catch(console.error);
