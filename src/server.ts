import dotenv from 'dotenv';
import express, { Request, Response } from 'express';
import mongoose from 'mongoose';
import AmazonProduct from './models/AmazonProduct';

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;
const resultLimit = parseInt(process.env.RESULT_LIMIT || '25', 10);

// Connect to MongoDB
mongoose.connect('mongodb://mongo:27017/amazon-scraping')
    .then(() => console.log('server: MongoDB Connected'))
    .catch((err: Error) => console.error('server: MongoDB Connection Error:', err));

// API endpoint to get products
app.get('/products', async (req: Request, res: Response) => {
    try {
        const products = await AmazonProduct.find({}).sort({ title: 1 }).limit(resultLimit);
        res.json(products);
    } catch (err) {
        console.error(err);
        res.status(500).send('An error occurred');
    }
});

// Start the Express server
app.listen(port, () => console.log(`Server running on port ${port}`));
