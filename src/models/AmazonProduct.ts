import mongoose, { Schema, Document } from 'mongoose';

// Define an interface representing a document in MongoDB.
interface IAmazonProduct extends Document {
    title: string;
    price: string;
    numberOfReviews: number;
    averageRating: number;
    dateFirstListed: Date;
    url: string;
}

// Define the schema
const productSchema = new Schema<IAmazonProduct>({
    title: { type: String, required: true },
    price: { type: String, required: true },
    numberOfReviews: { type: Number, required: true },
    averageRating: { type: Number, required: true },
    dateFirstListed: { type: Date, required: true },
    url: { type: String, required: true }
});

// Export the model
export default mongoose.model<IAmazonProduct>('AmazonProduct', productSchema);