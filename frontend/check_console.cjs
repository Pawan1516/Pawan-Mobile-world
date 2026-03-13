const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  
  page.on('console', msg => {
    if (msg.type() === 'error') {
      console.log('PAGE ERROR:', msg.text());
    } else {
      console.log('PAGE LOG:', msg.text());
    }
  });

  page.on('pageerror', error => {
    console.log('UNCAUGHT EXCEPTION:', error.message);
  });

  page.on('requestfailed', request => {
    console.log('REQUEST FAILED:', request.url(), request.failure().errorText);
  });

  try {
    await page.goto('http://localhost:5173/');
    // Wait for 2 seconds using the newer Promise method
    await new Promise(r => setTimeout(r, 2000));
  } catch (err) {
    console.log('GOTO FAILED:', err);
  }

  await browser.close();
})();
