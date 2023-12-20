const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    title: String,
    price: String,
    numberOfReviews: Number,
    averageRating: Number,
    numberOfReviews: Number,
    dateFirstListed: Date,
    url: String
});

module.exports = mongoose.model('AmazonProduct', productSchema);
