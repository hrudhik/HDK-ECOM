const razorpayInstance = require("../config/razorpay");
const crypto = require("crypto");
const mongoose = require("mongoose");
// const Cart = require("../models/cart"); // Adjust as per your file structure
const Order = require("../models/orderSchema");
const { log } = require("console");
// const Address = require("../models/addressSchema");
// const Coupon = require('../models/coupenSchema');
// const Product= require('../models/productSchema')


const verifyPayment = async (req, res) => {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, OrderId } = req.body;

    try {
        const keySecret = process.env.RAZORPAY_KEY_SECRET;
        const generatedSignature = crypto
            .createHmac('sha256', keySecret)
            .update(`${razorpay_order_id}|${razorpay_payment_id}`)
            .digest('hex');

        if (generatedSignature === razorpay_signature) {
            // console.log("orderId",OrderId)
            const order = await Order.findById(OrderId)
            // console.log(order)


            order.paymentstatus = "Paid"
            order.save()

            return res.json({ success: true, message: "Order placed successfully after online payment." });
        } else {
            res.status(400).json({ success: false, message: "Invalid payment signature" });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Unable to verify payment" });
    }
};

const paymentsuccess = async (req, res) => {
    try {
        // const orderId=req.query
        // const order=await Order.findById(orderId)
        res.render('paymentsucces')
    } catch (error) {
        console.log("error in rendering payment success page ", error)
        res.redirect('/pagenotfound')
    }
}

const retrypayment = async (req, res) => {
    try {
        const { orderId } = req.body;
        console.log(orderId);

        const orderid = new mongoose.Types.ObjectId(orderId);
        const order = await Order.findOne({ _id: orderid });

        const options = {
            amount: order.totalAmount * 100, // Convert to paise
            currency: "INR",
            receipt: `retry_payment${Date.now()}`
        };

        const newRazorpay = await razorpayInstance.orders.create(options);
        console.log(newRazorpay);

        return res.json({
            success: true,
            message: "Razorpay payment initiated",
            razorpayOrderId: newRazorpay.id, // Correct key
            amount: newRazorpay.amount / 100, // Convert back to rupees for frontend
            currency: newRazorpay.currency,
            orderId: orderId
        });
    } catch (error) {
        console.log("error in retry payment:", error);
        res.redirect('/pagenotfound');
    }
};



const updatepaymentstatus = async (req, res) => {
    try {
        const { orderId } = req.body;
        const order = await Order.findById(orderId)
        console.log(order);
        

        order.paymentstatus = "Paid"
        order.save();
        return res.json({ success: true, message: "Payment successful!", order });
    } catch (error) {
        console.error("Payment update error:", error);
        res.status(500).json({ success: false, message: "Failed to update payment status." });
    }
}
module.exports = {
    verifyPayment,
    paymentsuccess,
    retrypayment,
    updatepaymentstatus
};