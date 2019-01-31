const puppeteer = require('puppeteer');
const node_html_parser  = require('node-html-parser');

const target_host = 'https://www.fxstreet.jp';
const target_path = 'economic-calendar';
const detail_selector = "#fxst-calendartable > tbody > tr.fxit-eventrow > td > div";

getVipData = async (req, res) => {
    const browser = await puppeteer.launch({
        args: [
            '--no-sandbox',
            '--disable-setuid-sandbox'
        ]
    });
    const page = await browser.newPage();
    // dummy access to avoid advertising
    await page.goto(target_host + '/' + target_path, {waitUntil: 'networkidle2'});

    await page.reload();
    // wait for the search box to appear
    await page.waitFor(5000);

    // extract html
    const innerDataList = await page.evaluate((selector) => {
        const list = Array.from(document.querySelectorAll(selector));
        return list.map(data => {
            return data.innerHTML;
        });
    }, detail_selector);

    // format to desired data
    const parsedDataList = innerDataList.map(value => {
       const parsedHtml = node_html_parser.parse(value);
       const dateHtml = parsedHtml.querySelector('.fxit-eventInfo-time').removeWhitespace().toString();
       const currencyHtml = parsedHtml.querySelector('.fxit-event-name').removeWhitespace().toString();
       const titleHtml = parsedHtml.querySelector('.fxit-event-title').removeWhitespace().toString();
       const volatilityHtml = parsedHtml.querySelector('.fxit-eventInfo-vol-c').removeWhitespace().toString();
       return {
           date: node_html_parser.parse(dateHtml).text,
           currency: node_html_parser.parse(currencyHtml).text,
           title: node_html_parser.parse(titleHtml).text,
           volatility: node_html_parser.parse(volatilityHtml).text
       }
    });

    // save
    // ...
    browser.close();

    res.send(parsedDataList)
};

exports.getVipData = getVipData;