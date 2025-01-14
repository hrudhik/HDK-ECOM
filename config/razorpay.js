const Razorpay = require("razorpay");

const razorpayInstance = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID, // Replace with your Razorpay Key ID from .env
    key_secret: process.env.RAZORPAY_KEY_SECRET, // Replace with your Razorpay Key Secret from .env
});

module.exports = razorpayInstance;
