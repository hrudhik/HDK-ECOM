const express = require('express');
const router = express.Router();
const Product= require('../models/productSchema')
const Category= require('../models/categorySchema')
const Order = require('../models/orderSchema');  // Your Order model

// 📊 Sales Report API (Yearly, Monthly)
// router.get('/sales-report')
const graph =async (req, res) => {
    try {
        const { filter } = req.query;
        let dateFrom;

        if (filter === "monthly") {
            dateFrom = new Date();
            dateFrom.setMonth(dateFrom.getMonth() - 1);
        } else if (filter === "yearly") {
            dateFrom = new Date();
            dateFrom.setFullYear(dateFrom.getFullYear() - 1);
        } else if(filter ==="weekly"){
            dateFrom=new Date();
            dateFrom.setDate(dateFrom.getDate() - 7);
        }else{
            return res.status(400).json({ message: "Invalid filter" });
        }

        const sales = await Order.aggregate([
            { $match: { createdAt: { $gte: dateFrom } } },
            { $group: { _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } }, totalSales: { $sum: "$totalAmount" } } },
            { $sort: { _id: 1 } }
        ]);

        res.json(sales);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}
;

// 📊 Most Sold Product

const bestproduct = async (req, res) => {
    try {
        const products = await Order.aggregate([
            { $unwind: "$items" },
            { $group: { _id: "$items.productId", totalSold: { $sum: "$items.quantity" } } },
            { $sort: { totalSold: -1 } },
            { $limit: 5 }
        ]);

        console.log('product bar', products);

        // Corrected Promise.all() usage
        const graphdetails = await Promise.all(products.map(async (item) => {
            const product = await Product.findById(item._id, 'productName');
            return {
                productName: product ? product.productName : "Unknown Product",
                totalSold: item.totalSold
            };
        }));

        // console.log("Product details: ", graphdetails);

        res.json(graphdetails);  // Send the updated response with product names
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};


// 📊 Most Sold Brand
// router.get('/best-selling-brands')
const bestbrand= async (req, res) => {
    try {
        const brands = await Order.aggregate([
            { $unwind: "$items" },
            { $lookup: { from: "products", localField: "items.productId", foreignField: "_id", as: "product" } },
            { $unwind: "$product" },
            { $group: { _id: "$product.brand", totalSold: { $sum: "$items.quantity" } } },
            { $sort: { totalSold: -1 } },
            { $limit: 5 }
        ])
        res.json(brands);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// 📊 Most Sold Category
// router.get('/best-selling-categories')
const bestcategory = async (req, res) => {
    try {
        const categories = await Order.aggregate([
            { $unwind: "$items" },
            { $lookup: { from: "products", localField: "items.productId", foreignField: "_id", as: "product" } },
            { $unwind: "$product" },
            { $group: { _id: "$product.category", totalSold: { $sum: "$items.quantity" } } },
            { $sort: { totalSold: -1 } },
            { $limit: 5 }
        ]);

        // Corrected Promise.all() usage to fetch category details
        const categoryDetails = await Promise.all(categories.map(async (item) => {
            const category = await Category.findById(item._id, 'name');
            return {
                categoryName: category ? category.name : "Unknown Category",
                totalSold: item.totalSold
            };
        }));

        // console.log("Category details: ", categoryDetails);

        res.json(categoryDetails);  // Send the updated response with category names
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

module.exports={
    graph,
    bestcategory,
    bestbrand,
    bestproduct,

}

