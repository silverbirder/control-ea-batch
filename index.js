const puppeteer = require('puppeteer');

exports.getVipData = async (req, res) => {
    const browser = await puppeteer.launch({
        args: [
            '--no-sandbox',
            '--disable-setuid-sandbox'
        ]
    });
    const page = await browser.newPage();
    await page.goto('https://www.google.com/', {waitUntil: 'networkidle2'});
    var data = await page.evaluate((selector) => {
        return document.querySelector(selector).textContent;
    }, "body");
    browser.close();
    res.send(data);
};