const puppeteer = require('puppeteer');
const mongoose = require('mongoose');
const AmazonProduct = require('./models/AmazonProduct');

mongoose.connect('mongodb://mongo:27017/amazon-scraping', {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => {
    console.log('MongoDB Connected');
}).catch(err => {
    console.error('MongoDB Connection Error:', err);
});

async function scrapeAmazon(keyword) {

    const browser = await puppeteer.launch({
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    for (let page = 1; page <= 3; page++) {
        const page = await browser.newPage();
        const pageUrl = `https://www.amazon.com/s?k=${keyword}&page=${page}`;
        await page.goto(pageUrl);

        const productSelector = '.s-result-item';
        await page.waitForSelector(productSelector);

        let products = await page.$$eval(productSelector, items => {
            return items.map(item => {
                let title = item.querySelector('h2 a span')?.innerText || 'No title';
                let price = item.querySelector('.a-price .a-offscreen')?.innerText || 'No price';
                let numberOfReviews = item.querySelector('.a-size-small .a-link-normal')?.innerText;
                numberOfReviews = numberOfReviews ? parseInt(numberOfReviews.replace(/[^\d]/g, '')) : 0;
                let ratingText = item.querySelector('.a-icon-alt')?.innerText;
                let url = item.querySelector('h2 a')?.href;

                let rating = null;
                if (ratingText) {
                    let ratingMatch = ratingText.match(/(\d+(\.\d+)?) out of 5 stars/);
                    rating = ratingMatch ? parseFloat(ratingMatch[1]) : null;
                }

                return { title, price, rating, numberOfReviews, url };
            });
        });

        // Filter out undefined data and save to MongoDB
        for (let data of products.filter(p => p.title && p.price && p.rating && p.numberOfReviews && p.url)) {
            let product = new AmazonProduct({
                title: data.title,
                price: data.price,
                averageRating: data.rating,
                numberOfReviews: data.numberOfReviews,
                url: data.url,
                dateFirstListed: new Date() // This is a placeholder
            });

            await product.save();
        }
        await page.close();
    }

    await browser.close();
}

const keywords = ['laptop', 'book', 'camera', 'headphones', 'smartwatch'];
const selectedKeyword = keywords[Math.floor(Math.random() * keywords.length)];

scrapeAmazon(selectedKeyword);
