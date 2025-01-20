// const mongoose = require("mongoose");

// const orderSchema = new mongoose.Schema({
//     userId: {
//         type: mongoose.Schema.Types.ObjectId,
//         ref: "User",
//         required: true,
//     },
//     items: [
//         {
//             productId: { type: mongoose.Schema.Types.ObjectId, ref: "Product",required:true },
//             quantity: { type: Number, required: true },
//             price: { type: Number, required: true },
//         },
//     ],
//     shippingAddress: {
//         name: String,
//         address: String,
//         city: String,
//         zipCode: String,
//         phone: String,
//     },
//     paymentMethod: {
//         type: String,
//         enum: ["COD", "Online"],
//         required: true,
//     },
//     totalAmount: {
//         type: Number,
//         required: true,
//     },
//     status: {
//         type: String,
//         enum: ["Pending", "Shipped", "Delivered", "Cancelled"],
//         default: "Pending",
//     },
//     createdAt: {
//         type: Date,
//         default: Date.now,
//     },
//      isCanceled: { type: Boolean, default: false },
// });

// module.exports = mongoose.model("Order", orderSchema);



const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    items: [
        {
            productId: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
            quantity: { type: Number, required: true },
            price: { type: Number, required: true },
            status: {
                type: String,
                enum: ["Pending", "Shipped", "Delivered","Return", "Cancelled"],
                default: "Pending", 
            },
        },
    ],
    shippingAddress: {
        name: String,
        address: String,
        city: String,
        pincode: Number,
        phone: Number,
    },
    paymentMethod: {
        type: String,
        enum: ["COD", "Online","Wallet"],
        required: true,
    },
    totalAmount: {
        type: Number,
        required: true,
    },
    status: {
        type: String,
        enum: ["Pending", "Shipped", "Delivered", "Return","Cancelled"],
        default: "Pending",
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

module.exports = mongoose.model("Order", orderSchema);
