import express from "express";
import { connect } from "mongoose";
import fetch from "node-fetch";
import postNewData from "./data.js"; // Model from data.js
import dataRoutes from "./dataRoutes.js"
import cors from 'cors';

const app = express();
const PORT = process.env.PORT || 3000;



// Connect to MongoDB database
connect("mongodb://127.0.0.1:27017/myTransac")
    .then(() => {
        console.log("Connected to MongoDB");
    })
    .catch((err) => {
        console.error("Error connecting to MongoDB", err);
    });


//middlewarre
app.use('/api', dataRoutes);

app.use(cors({ origin: 'http://localhost:3000/api' }));

// Function to fetch and save transaction data
async function postData() {
    try {
        const transac = await fetch(
            "https://s3.amazonaws.com/roxiler.com/product_transaction.json"
        );
        const response = await transac.json();

        for (let i = 0; i < response.length; i++) {
            const post = new postNewData({
                id: response[i]["id"],
                title: response[i]["title"],
                price: response[i]["price"],
                description: response[i]["description"],
                category: response[i]["category"],
                image: response[i]["image"],
                sold: response[i]["sold"],
                dateOfSale: response[i]["dateOfSale"],
            });
            await post.save(); // Save each post with 'await'
        }

        console.log("Data saved successfully.");
    } catch (err) {
        console.error("Error fetching or saving data", err);
    }
}

postData();

// Start the server
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
