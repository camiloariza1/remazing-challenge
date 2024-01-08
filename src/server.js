require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const AmazonProduct = require('./models/AmazonProduct');
const app = express();
const port = 3000;
const resultLimit = process.env.RESULT_LIMIT || 25;

// Connect to MongoDB
mongoose.connect('mongodb://mongo:27017/amazon-scraping', {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => {
    console.log('server: MongoDB Connected');
}).catch(err => {
    console.error('server: MongoDB Connection Error:', err);
});

// API endpoint to get products
app.get('/products', async (req, res) => {
    try {
        // Fetch products from the database, sorted by title and limited by resultLimit
        const products = await AmazonProduct.find({}).sort({ title: 1 }).limit(resultLimit);
        res.json(products);
    } catch (err) {
        console.error(err);
        res.status(500).send('An error occurred');
    }
});

// Start the Express server
app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});