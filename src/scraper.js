const puppeteer = require('puppeteer');
const mongoose = require('mongoose');
const AmazonProduct = require('./models/AmazonProduct');

mongoose.connect('mongodb://mongo:27017/amazon-scraping').then(() => {
    console.log('MongoDB Connected');
}).catch(err => {
    console.error('MongoDB Connection Error:', err);
});

async function scrapeAmazon(keyword) {
    const browser = await puppeteer.launch({
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    for (let pageNum = 1; pageNum <= 3; pageNum++) {
        const page = await browser.newPage();
        const pageUrl = `https://www.amazon.com/s?k=${keyword}&page=${pageNum}`;
        await page.goto(pageUrl);

        const productLinksSelector = '.s-result-item h2 a';
        await page.waitForSelector(productLinksSelector);
        const productLinks = await page.$$eval(productLinksSelector, links => links.map(link => link.href));

        for (let link of productLinks) {
            const productPage = await browser.newPage();
            console.log('Navigating to:', link);
            await productPage.goto(link);

            // Add logic to scrape data from the product detail page
            const title = await productPage.$eval('span#productTitle', el => el.innerText.trim());
            const price = await productPage.$eval('#corePrice_feature_div > div:nth-child(1) > div:nth-child(1) > span:nth-child(1) > span:nth-child(1)', el => el.innerText.trim()).catch(() => 'No price');
            const numberOfReviews = await productPage.$eval('#acrCustomerReviewText', el => parseInt(el.innerText.replace(/[^\d]/g, ''))).catch(() => 0);
            const ratingText = await productPage.$eval('.a-icon-alt', el => el.innerText).catch(() => null);
            let rating = null;
            if (ratingText) {
                const ratingMatch = ratingText.match(/(\d+(\.\d+)?)/);
                rating = ratingMatch ? parseFloat(ratingMatch[0]) : null;
            }
            let dateFirstAvailableText = await productPage.$eval('#productDetails_detailBullets_sections1 > tbody:nth-child(1) > tr:nth-child(8) > td:nth-child(2)', el => el.innerText.trim()).catch(() => null);

            let dateFirstAvailable = null;
            if (dateFirstAvailableText) {
                // Parse the date string (adjust format as needed)
                dateFirstAvailable = new Date(dateFirstAvailableText);
                if (isNaN(dateFirstAvailable.valueOf())) {
                    // Handle invalid date
                    dateFirstAvailable = null;
                }
            }

            const product = new AmazonProduct({
                title,
                price,
                averageRating: rating,
                numberOfReviews,
                url: link,
                dateFirstListed: new Date(dateFirstAvailable)
            });

            await product.save();
            await productPage.close();
        }

        await page.close();
    }

    await browser.close();
}

const keywords = ['laptop', 'book', 'camera', 'headphones', 'smartwatch'];
const selectedKeyword = keywords[Math.floor(Math.random() * keywords.length)];

scrapeAmazon(selectedKeyword);