const razorpayInstance = require("../config/razorpay");
const crypto = require("crypto");
const mongoose = require("mongoose");
const Cart = require("../models/cart"); // Adjust as per your file structure
const Order = require("../models/orderSchema");
const Address = require("../models/addressSchema");
const Coupon= require('../models/coupenSchema');

// const verifyPayment = async (req, res) => {
//     const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

//     try {
//         const keySecret = process.env.RAZORPAY_KEY_SECRET;
//         const generatedSignature = crypto
//             .createHmac('sha256', keySecret)
//             .update(`${razorpay_order_id}|${razorpay_payment_id}`)
//             .digest('hex');

//         if (generatedSignature === razorpay_signature) {
//             // Payment is verified, order can be confirmed
            
//             res.json({ success: true, message: 'Payment verified successfully' });
//         } else {
//             res.status(400).json({ success: false, message: 'Invalid payment signature' });
//         }
//     } catch (error) {
//         console.error(error);
//         res.status(500).json({ success: false, message: 'Unable to verify payment' });
//     }
// }
const verifyPayment = async (req, res) => {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

    try {
        const keySecret = process.env.RAZORPAY_KEY_SECRET;
        const generatedSignature = crypto
            .createHmac('sha256', keySecret)
            .update(`${razorpay_order_id}|${razorpay_payment_id}`)
            .digest('hex');

        if (generatedSignature === razorpay_signature) {
            // Payment is verified, proceed to place the order
            const userId = req.session.user; // Assuming userId is stored in session
            const { addressId, items, totalAmount, couponCode } = req.body.orderData; // Pass this data from the frontend
            let discount = 0;
            console.log("online payment total amount",totalAmount)

            // Validate coupon if applied
            if (couponCode) {
                const coupon = await Coupon.findOne({ code: couponCode, isActive: true });
                if (coupon && totalAmount > coupon.minPurchaseAmount) {
                    discount = Math.round((totalAmount * coupon.discountPercentage) / 100);
                }
            }

            // Validate addressId
            if (!mongoose.isValidObjectId(addressId)) {
                return res.status(400).json({ success: false, message: "Invalid address ID." });
            }

            // Fetch cart and address
            const cart = await Cart.findOne({ userId }).populate('items.productId');
            const address = await Address.findOne({
                userId: new mongoose.Types.ObjectId(userId),
                "address._id": new mongoose.Types.ObjectId(addressId),
            });

            if (!address) {
                return res.status(400).json({ success: false, message: "Invalid address." });
            }

            const foundAddress = address.address.find((addr) => addr._id.toString() === addressId);

            // Create order items
            const orderItems = cart.items.map(item => ({
                productId: item.productId,
                quantity: item.quantity,
                price: item.productId.salePrice,
            }));

            // Create and save the order
            const order = new Order({
                userId: req.session.user,
                paymentMethod: "Online",
                totalAmount: totalAmount - discount || totalAmount,
                items: orderItems,
                shippingAddress: foundAddress,
            });

            await order.save();

            // Clear the cart
            cart.items = [];
            await cart.save();

            return res.json({ success: true, message: "Order placed successfully after online payment." });
        } else {
            res.status(400).json({ success: false, message: "Invalid payment signature" });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Unable to verify payment" });
    }
};


module.exports = {
    verifyPayment,
};