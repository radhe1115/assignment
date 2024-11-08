import { Router } from "express";
const router = Router();
import Data from "./data.js";

// GET: Retrieve all data for the dashboard (no pagination or filtering)
router
  .get("/transacData", async (req, res) => {
    try {
      // Fetch all data without any filtering or pagination
      const data = await Data.find().sort({ dateOfSale:-1 });

      // Send the retrieved data as a response
      res.json(data);
    } catch (err) {
      res.status(500).json({ error: "Failed to retrieve data." });
    }
  })
  .get("/search", async (req, res) => {
    try {
      const { search = "", page = 1, perPage = 10 } = req.query;

      // Pagination variables
      const pageNum = parseInt(page) || 1;
      const limit = parseInt(perPage) || 10;
      const skip = (pageNum - 1) * limit;

      // Build the search query
      const searchQuery = {
        $or: [
          { title: { $regex: search, $options: "i" } },
          { description: { $regex: search, $options: "i" } },
          { price: { $regex: search, $options: "i" } },
        ],
      };

      // Fetch matching data with pagination
      const data = await Data.find(search ? searchQuery : {})
        .skip(skip)
        .limit(limit)
        .sort({ id: 1 });

      // Get total count of matching records
      const total = await Data.countDocuments(search ? searchQuery : {});

      // Return paginated and filtered results
      res.json({
        page: pageNum,
        perPage: limit,
        total,
        transactions: data,
      });
    } catch (err) {
      res.status(500).json({ error: "Failed to retrieve data." });
    }
  })
  .get("/statistics/:month", async (req, res) => {
    const { month } = req.params;
    const monthNumber = new Date(`${month} 1, 2000`).getMonth() + 1; // Convert month name to month number

    try {
        const soldItems = await Data.countDocuments({
            $expr: { $eq: [{ $month: "$dateOfSale" }, monthNumber] },
            sold: true
        });

        const notSoldItems = await Data.countDocuments({
            $expr: { $eq: [{ $month: "$dateOfSale" }, monthNumber] },
            sold: false
        });
        const totalSales = await Data.aggregate([
            {
                $match: {
                    $expr: { $eq: [{ $month: "$dateOfSale" }, monthNumber] },
                    sold: true
                }
            },
            {
                $group: {
                    _id: null,
                    total: { $sum: "$price"  }
                }
            }
        ]);
        res.json({
            totalSoldItems: soldItems,
            totalNotSoldItems: notSoldItems,
            totalSalesAmount: totalSales.length > 0 ? totalSales[0].total : 0,
        });
    } catch (err) {
        res.status(500).json({ error: "Failed to retrieve statistics." });
    }
})

.get("/barchart/:month", async (req, res) => {
  const { month } = req.params;
  const monthNumber = new Date(`${month} 1, 2000`).getMonth() + 1; // Convert month name to month number

  try {
      const priceRanges = await Data.aggregate([
          {
              $match: {
                  $expr: { $eq: [{ $month: "$dateOfSale" }, monthNumber] }
              }
          },
          {
              $bucket: {
                  groupBy: "$price", // Group by price field
                  boundaries: [0, 100, 200, 300, 400, 500, 600, 700, 800, 900, Infinity], // Define price range boundaries
                  default: "901-above", // Label for prices above 900
                  output: {
                      count: { $sum: 1 } // Count the number of items in each bucket
                  }
              }
          }
      ]);

      res.json(priceRanges);
  } catch (err) {
      res.status(500).json({ error: "Failed to retrieve bar chart data." });
  }
})
.get("/piechart/:month", async (req, res) => {
  const { month } = req.params;
  const monthNumber = new Date(`${month} 1, 2000`).getMonth() + 1; // Convert month name to month number

  try {
      const categories = await Data.aggregate([
          {
              $match: {
                  $expr: { $eq: [{ $month: "$dateOfSale" }, monthNumber] }
              }
          },
          {
              $group: {
                  _id: "$category", // Group by category
                  itemCount: { $sum: 1 } // Count the number of items in each category
              }
          }
      ]);

      res.json(categories);
  } catch (err) {
      res.status(500).json({ error: "Failed to retrieve pie chart data." });
  }
})

.get("/combined/:month", async (req, res) => {
  const { month } = req.params;

  try {
      // Fetch data from all APIs concurrently
      const [statistics, barChart, pieChart] = await Promise.all([
          fetch(`http://localhost:3000/api/statistics/${month}`).then(res => res.json()),
          fetch(`http://localhost:3000/api/barchart/${month}`).then(res => res.json()),
          fetch(`http://localhost:3000/api/piechart/${month}`).then(res => res.json())
      ]);

      // Combine the responses into a single object
      res.json({
          statistics,
          barChart,
          pieChart
      });
  } catch (err) {
      res.status(500).json({ error: "Failed to retrieve combined data." });
  }
})


  // DELETE: API to delete duplicate transactions based on the custom 'id' field (Number type)
  .delete("/remove-duplicates", async (req, res) => {
    try {
      // Step 1: Find duplicates based on the 'id' field (custom id)
      const duplicates = await Data.aggregate([
        {
          $group: {
            _id: "$id", // Group by the custom 'id' field
            uniqueIds: { $addToSet: "$_id" }, // Collect unique MongoDB _ids
            count: { $sum: 1 }, // Count occurrences of each 'id'
          },
        },
        {
          $match: {
            count: { $gt: 1 }, // Filter to get only duplicates (count greater than 1)
          },
        },
      ]);

      // Step 2: Loop through the duplicates and keep only one entry for each 'id'
      const bulkOperations = [];
      duplicates.forEach((duplicate) => {
        // Keep the first occurrence and remove the rest
        const [first, ...duplicatesToDelete] = duplicate.uniqueIds;
        bulkOperations.push({
          deleteMany: {
            filter: { _id: { $in: duplicatesToDelete } }, // Delete all except the first
          },
        });
      });

      // Step 3: Perform bulk deletion of duplicates
      if (bulkOperations.length > 0) {
        await Data.bulkWrite(bulkOperations);
      }

      res.json({
        message: "Duplicate entries removed based on 'id' field",
        totalRemoved: bulkOperations.length,
      });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Failed to remove duplicates." });
    }
  });

export default router;
