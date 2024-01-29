import mongoose from 'mongoose';
import scrapeAmazon from './scraper';

// Connect to the MongoDB instance
mongoose.connect('mongodb://mongo:27017/amazon-scraping')
    .then(() => {
        console.log('app: MongoDB Connected');
        console.log('app: Started crawling Amazon.com...');

        // List of keywords for crawling
        const keywords: string[] = ['laptop', 'phone', 'camera', 'headphones', 'smartwatch'];

        // Randomly select one of the keywords
        const selectedKeyword: string = keywords[Math.floor(Math.random() * keywords.length)];
        scrapeAmazon(selectedKeyword);
    })
    .catch((err: mongoose.Error) => {
        console.error('app: MongoDB Connection Error:', err);
    });
