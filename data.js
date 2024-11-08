import { connect, Schema, model } from "mongoose";

// Connect to MongoDB database
connect("mongodb://127.0.0.1:27017/myTransac");

const transacSchema = new Schema({
    id: {
        type: Number,
        required: true,
    },
    title: {
        type: String,
        required: true,
    },
    price: {
        type:Number,
        required: true,
    },
    description: {
        type: String,
        required: true,
    },
    category: {
        type: String,
        required: true,
    },
    image: {
        type: String,
        required: true,
    },
    sold: {
        type: String,
        required: true,
    },
    dateOfSale: {
        type: Date,
        required: true,
    },
});

 export default model("dataFromAPI", transacSchema);
