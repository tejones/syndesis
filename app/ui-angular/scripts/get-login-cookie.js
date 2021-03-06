#!/usr/bin/env node

const puppeteer = require('puppeteer');

(async () => {
  const [nodeBinary, script, url] = process.argv;

  const browser = await puppeteer.launch({
    headless: false,
    userDataDir: '.puppeteer_data',
    ignoreHTTPSErrors: true
  });
  const page = await browser.newPage();
  await page.goto(url);

  //code to wait for user to enter username and password, and click `login`

  await browser.waitForTarget(target => target.url() === `${url}/`);

  await page.waitForNavigation({
    waitUntil: 'load'
  });
  const cookies = await page.cookies();
  // Don't print anything else out of this file except the cookie value :-)
  console.log(cookies.map(c => `${c.name}=${c.value}`).join(';'));
  await browser.close();
})();
