const mongoose = require('mongoose');
const Product = require('../src/models/AmazonProduct');

mongoose.connect('mongodb://localhost:27017/amazon-scraping', {
    useNewUrlParser: true, 
    useUnifiedTopology: true 
}).then(() => {
    console.log("Connected to MongoDB");
    addTestProduct();
}).catch(err => {
    console.error("Error connecting to MongoDB:", err);
});

async function addTestProduct() {
    try {
        const testProduct = new Product({
            title: 'Test Product',
            price: 19.99,
            numberOfReviews: 100,
            averageRating: 4.5,
            dateFirstListed: new Date()
        });

        await testProduct.save();
        console.log('Product saved:', testProduct);
    } catch (error) {
        console.error('Error saving product:', error);
    } finally {
        mongoose.disconnect();
    }
}