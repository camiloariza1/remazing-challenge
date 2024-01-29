import puppeteer, { Browser, Page } from 'puppeteer';
import AmazonProduct from './models/AmazonProduct';

async function scrapeProductPage(browser: Browser, link: string, keyword: string): Promise<void> {
    console.log(`scraper: Starting scrapeProductPage for link: ${link}`);
    const productPage: Page = await browser.newPage();

    try {
        console.log('scraper: Navigating to:', link);
        await productPage.goto(link);

        const title: string = await productPage.$eval('span#productTitle', el => el.textContent?.trim() || 'No title');
        const priceSelector = '#corePrice_feature_div > div:nth-child(1) > div:nth-child(1) > span:nth-child(1) > span:nth-child(1)';
        const price: string = await productPage.$eval(priceSelector, el => el.textContent?.trim() || 'No price');
        const numberOfReviews: number = await productPage.$eval('#acrCustomerReviewText', el => parseInt(el.textContent?.replace(/[^\d]/g, '') || '0'));
        const ratingText: string | null = await productPage.$eval('.a-icon-alt', el => el.textContent);
        let rating: number | null = ratingText ? parseFloat(ratingText.match(/(\d+(\.\d+)?)/)?.[0] || '0') : null;

        let dateFirstAvailable: Date = await scrapeDateFirstAvailable(productPage, keyword);

        const product = new AmazonProduct({
            title,
            price,
            averageRating: rating,
            numberOfReviews,
            url: link,
            dateFirstListed: dateFirstAvailable
        });

        console.log(`scraper: Finished processing product page: ${link}`);
        await product.save();
    } catch (error) {
        console.error(`scraper: Error scraping product page ${link}:`, error);
    } finally {
        await productPage.close();
    }
}

async function scrapeDateFirstAvailable(productPage: Page, keyword: string): Promise<Date> {
    let selector;

    switch (keyword) {
        case 'headphones':
            selector = '#productDetails_detailBullets_sections1 > tbody:nth-child(1) > tr:nth-child(9) > td:nth-child(2)';
            break;
        case 'laptop':
            selector = '#productDetails_detailBullets_sections1 > tbody:nth-child(1) > tr:nth-child(4) > td:nth-child(2)';
            break;
        case 'phone':
            selector = '#productDetails_detailBullets_sections1 > tbody:nth-child(1) > tr:nth-child(7) > td:nth-child(2)';
            break;
        case 'camera':
            return new Date('2024-01-01');
        case 'smartwatch':
            selector = '#productDetails_detailBullets_sections1 > tbody:nth-child(1) > tr:nth-child(9) > td:nth-child(2)';
            break;
        default:
            selector = '#productDetails_detailBullets_sections1 > tbody:nth-child(1) > tr:nth-child(8) > td:nth-child(2)';
    }

    if (!selector) {
        return new Date('2024-01-01');
    }

    let dateFirstAvailableText = await productPage.$eval(selector, (el: Element) => (el as HTMLElement).innerText.trim()).catch(() => null);
    if (!dateFirstAvailableText) {
        return new Date('2024-01-01');
    }

    let date = new Date(dateFirstAvailableText);
    return isNaN(date.valueOf()) ? new Date('2024-01-01') : date;
}


async function scrapeAmazon(keyword: string): Promise<void> {
    console.log("scraper: Started scraping Amazon");
    const browser = await puppeteer.launch({
        args: [
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--disable-dev-shm-usage',
            '--disable-accelerated-2d-canvas',
            '--disable-gpu'
        ]
    });

    try {
        // Loop through the first 3 pages of Amazon search results
        for (let pageNum = 1; pageNum <= 3; pageNum++) {
            const page = await browser.newPage();

            // Set up request interception to control which resources are loaded
            await page.setRequestInterception(true);
            page.on('request', (req) => {
                if (['image', 'stylesheet', 'font'].includes(req.resourceType())) {
                    req.abort();
                } else {
                    req.continue();
                }
            });

            const pageUrl = `https://www.amazon.com/s?k=${keyword}&page=${pageNum}`;
            await page.goto(pageUrl, { waitUntil: 'domcontentloaded' });

            // Extract product links from the search result page
            const productLinks = await page.$$eval('.s-result-item h2 a', links => links.map(link => link.href));

            // Close the current search result page to free up resources
            await page.close();

            // Process pages in parallel in batches
            const parallelLimit = 3; // Adjust based on system capabilities
            for (let i = 0; i < productLinks.length; i += parallelLimit) {

                // Create promises for a batch of product pages and wait for them to complete
                const promises = productLinks.slice(i, i + parallelLimit).map(link => scrapeProductPage(browser, link, keyword));
                await Promise.all(promises);
            }
        }
    } catch (error) {
        console.error(`Error scraping for keyword ${keyword}:`, error);
    } finally {
        await browser.close();
    }
}

export default scrapeAmazon