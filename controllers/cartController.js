const Cart = require('../models/cart');
const Product = require('../models/productSchema');
const User = require('../models/userSchema');
const Order = require('../models/orderSchema');
const Wishlist = require("../models/wishlist");
const Address = require('../models/addressSchema');
const mongoose = require('mongoose')
const util = require('util')




const cart = async (req, res) => {
    try {
        const user = req.session.user_id;

        let cart = await Cart.findOne({ user }).populate('items.productId');
        // console.log('catr',JSON.stringify(cart,null,2))

        if (!cart) {
            cart = {
                user: req.session.user,
                items: [],
            };
        }


        return res.render('cart', { cart: cart });

    } catch (error) {
        console.log(error.message);
        return res.redirect('/500')
    }
};


const addToCart = async (req, res) => {
    const { productId, quantity } = req.body;
    const userId = req.session.user; // Assuming session stores user ID
    const Quantity = Number(quantity);

    console.log("UserID: ", userId, "ProductID: ", productId, "Quantity: ", quantity);

    try {
        // Ensure user is logged in
        if (!userId) {
            return res.status(400).json({ message: 'User not logged in' });
        }

        // Fetch the user's cart
        let user = await User.findById(userId).populate("cart");
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        let cart;
        if (user.cart) {
            // Load the cart if it already exists
            cart = await Cart.findOne({ userId });
        } else {
            // Create a new cart if the user doesn't have one
            cart = new Cart({ userId, items: [] });
            user.cart = cart._id;
            await user.save();
        }

        // Check if the product already exists in the cart
        const productIndex = cart.items.findIndex((item) =>
            item.productId.toString() === productId
        );

        if (productIndex > -1) {
            // Product already exists in the cart, update quantity
            cart.items[productIndex].quantity += Quantity;
            await cart.save();
            return res.status(200).json({ success: true, message: 'Product already exists in cart' });
        } else {
            // Add new product to the cart
            cart.items.push({ productId, quantity: Quantity });
            await cart.save();
            return res.status(200).json({ success: true, message: 'Product added to cart successfully!' });
        }
    } catch (error) {
        console.error("Error adding to cart: ", error);
        res.status(500).json({ success: false, message: 'Failed to add product to cart.' });
    }
};

const updateCartQuantity = async (req, res) => {
    try {
        const { productId } = req.params; // Product ID from URL params
        const { action } = req.body; // Action: "increase" or "decrease"
        const userId = req.session.user; // Logged-in user ID

        console.log("User ID:", userId);
        console.log("Product ID:", productId);
        console.log("Action:", action);

        const cart = await Cart.findOne({ userId }).populate('items.productId');
        console.log("Cart fetched:", cart);

        if (!cart) {
            return res.redirect("/cart");
        }

        // Find the index of the product in the cart
        const itemIndex = cart.items.findIndex(
            (item) => item.productId._id.toString() === productId
        );
        console.log("Item Index:", itemIndex);

        if (itemIndex >= 0) {
            // Update the quantity based on action
            if (action === "increase") {
                cart.items[itemIndex].quantity += 1;
            } else if (action === "decrease" && cart.items[itemIndex].quantity > 1) {
                cart.items[itemIndex].quantity -= 1;
            } else {
                console.log("Invalid action or minimum quantity reached.");
            }

            console.log("Updated Quantity:", cart.items[itemIndex].quantity);

            // Save the updated cart
            await cart.save();

            console.log("Quantity updated successfully.");
        } else {
            console.log("Product not found in cart.");
        }

        res.redirect("/cart");
    } catch (error) {
        console.error("Error updating cart quantity:", error);
        res.redirect("/pageNotFound");
    }
};
const removeProductFromCart = async (req, res) => {
    try {
        const { productId } = req.params;
        const { action } = req.body;
        const userId = req.session.user;

        const cart = await Cart.findOne({ userId });

        if (!cart) {
            return res.status(404).json({ error: 'Cart not found' });
        }

        const item = cart.items.find(item => item.productId.toString() === productId);

        if (!item) {
            return res.status(404).json({ error: 'Product not found in cart' });
        }

        // Update the item's quantity based on the action
        if (action === 'increase') {
            item.quantity += 1;
        } else if (action === 'decrease' && item.quantity > 1) {
            item.quantity -= 1;
        }

        await cart.save();

        // Recalculate the total cart amount
        const cartTotal = cart.items.reduce(
            (sum, item) => sum + item.productId.salePrice * item.quantity,
            0
        );

        // Send back the updated quantity and total
        res.status(200).json({
            newQuantity: item.quantity,
            cartTotal,
        });
    } catch (error) {
        console.error('Error updating cart quantity:', error);
        res.status(500).json({ error: 'Failed to update cart quantity' });
    }
};


const loadwhishlist = async (req, res) => {
    try {
        const user = req.session.user_id;

        let wishlist = await Wishlist.findOne({ user }).populate("products.productId")
        // console.log('catr',JSON.stringify(cart,null,2))

        if (!wishlist) {
            wishlist = {
                user: req.session.user,
                products: [],
            };
        }


        return res.render('wishlist', { wishlist });

    } catch (error) {
        console.log(error.message);
        return res.redirect('/500')
    }
};


const addToWishlist = async (req, res) => {
    try {
        const { productId } = req.body;
        const userId = req.session.user; // Assuming user ID is available via authentication middleware.
        console.log("userId:", userId, "productId:", productId);

        let wishlist = await Wishlist.findOne({ userId });
        console.log(wishlist)

        if (!wishlist) {
            wishlist = new Wishlist({ userId, products: [] });
        }

        // Check if product is already in the wishlist
        const productExists = wishlist.products.some((item) => item.productId.equals(productId));

        if (productExists) {
            return res.status(400).json({success:false, message: "Product already in wishlist" });
        }

        wishlist.products.push({ productId });
        await wishlist.save();

        res.status(200).json({success:true, message: "Product added to wishlist", wishlist });
    } catch (error) {
        console.error("Error adding to wishlist:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

const removeFromWishlist = async (req, res) => {
    try {
        const userId = req.session.user; // Assuming you use authentication middleware
        const { productId } = req.body;

        if (!userId) {
            return res.status(401).json({ success: false, message: "Unauthorized: User ID is missing" });
        }

        if (!productId) {
            return res.status(400).json({ success: false, message: "Product ID is required" });
        }

        // if (!mongoose.Types.ObjectId.isValid(productId)) {
        //     return res.status(400).json({ success: false, message: "Invalid Product ID" });
        // }

        // Remove the product from the user's wishlist
        const result = await Wishlist.updateOne(
            { userId },
            { $pull: { products: { productId } } } // Match the nested productId field
        );

        if (result.modifiedCount > 0) {
            return res.json({ success: true, message: "Product removed from wishlist" });
        } else if (result.matchedCount > 0) {
            return res.json({ success: false, message: "Product not found in wishlist" });
        } else {
            return res.json({ success: false, message: "Wishlist not found for this user" });
        }
    } catch (error) {
        console.error("Error removing product from wishlist:", error);
        res.status(500).json({ success: false, message: "Server error" });
    }
};



const getOrderConfirmation = async (req, res) => {
    try {
        const { orderId } = req.query;

        if (!orderId) {
            return res.status(400).json({ error: 'Order ID is required.' });
        }

        const order = await Order.findById(orderId).populate('userId');

        if (!order) {
            return res.status(404).json({ error: 'Order not found.' });
        }

        res.render('orderConfirmation', {
            orderDetails: {
                orderId: order._id,
                orderDate: order.orderDate,
                totalAmount: order.totalAmount,
                paymentMethod: order.paymentMethod,
                address: order.address,
            },
        });
    } catch (error) {
        console.error('Error fetching order confirmation:', error);
        res.status(500).json({ error: 'Failed to load order confirmation.' });
    }
};




const placeOrder = async (req, res) => {
    try {
        const userId = req.session.user;
        const { paymentMethod, totalAmount, addressId } = req.body;
        let foundAddress

        console.log(paymentMethod, ':', totalAmount, addressId

        );

        // Validate addressId
        if (!mongoose.isValidObjectId(addressId)) {
            return res.status(400).json({ error: "Invalid address ID." });
        }

        // Fetch cart and address
        const cart = await Cart.findOne({ userId }).populate('items.productId');
        const address = await Address.findOne({
            userId: new mongoose.Types.ObjectId(userId),
            "address._id": new mongoose.Types.ObjectId(addressId), // Querying the array for the address object
        });

        console.log(address);

        if (!address) {
            return res.status(400).json({ error: "The address is not selected." });
        }
        if (address) {
             foundAddress = address.address.find((addr) => addr._id.toString() === addressId);
            console.log(foundAddress);
          } else {
            console.log("Address not found");
          }

          

        // Check for missing fields
        if (!paymentMethod || !totalAmount) {
            return res.status(400).json({ error: "Payment method and total amount are required." });
        }

        // Create order items
        const orderItems = cart.items.map(item => ({
            productId: item.productId,
            quantity: item.quantity,
            price: item.productId.salePrice,
        }));

        // Create and save the order
        const order = new Order({
            userId: req.session.user,
            paymentMethod,
            totalAmount,
            items: orderItems,
            shippingAddress: foundAddress, // Include the address in the order
        });

        await order.save();

        cart.items=[];
      await cart.save();
        res.status(200).json({ message: "Order placed successfully." });
    } catch (error) {
        console.error("Error processing order:", error);
        res.status(500).json({ error: "Failed to place order. Please try again later." });
    }
};


const getcheckout = async (req, res) => {
    try {
        const userId = req.session.user; // Assuming session stores the user ID

        if (!userId) {
            return res.redirect('/login'); // Redirect to login if user not logged in
        }

        // Fetch the user's cart
        const cart = await Cart.findOne({ userId }).populate('items.productId');
        const address = await Address.findOne({ userId }).populate('address');

        if (!cart) {
            return res.render('checkout', { cart: { items: [] } }); // Render an empty cart
        }

            const cartJsonString = JSON.stringify(cart.toJSON().items)
           
            res.render('checkout', { cart,cartItems:cartJsonString, userId, address });
        
        // Render the checkout page with the cart data
    } catch (error) {
        console.error('Error in getcheckout:', error);
        // res.redirect('/500'); // Redirect to error page on failure
    }
};




const cancelOrder = async (req, res) => {
    try {
        const { orderId, productId } = req.params; // Get orderId and productId from the URL
        console.log("Order ID:", orderId);
        console.log("Product ID:", productId);
        console.log("User ID from session:", req.session.user);

        // Convert orderId to ObjectId
        const objectId = new mongoose.Types.ObjectId(orderId);
        const userId = new mongoose.Types.ObjectId(req.session.user);

        // Find the order and ensure it belongs to the user
        const order = await Order.findOne({ _id: objectId, userId });
        console.log("Order Found:", order);

        if (!order) {
            return res.status(404).json({ error: "Order not found." });
        }

        // Find the product in the items array
        const product = order.items.find(
            (item) => item.productId.toString() === productId
        );

        if (!product) {
            return res.status(404).json({ error: "Product not found in this order." });
        }

        // Check if the product is already canceled or shipped
        if (product.status === "Shipped") {
            return res.status(400).json({
                error: "Product has already been shipped and cannot be canceled.",
            });
        }
        if (product.status === "Cancelled") {
            return res.status(400).json({ error: "Product is already canceled." });
        }

        // Update the product status to "Cancelled"
        product.status = "Cancelled";
        await order.save();

        res.status(200).redirect('/userProfile')//json({ message: "Product canceled successfully." });
    } catch (error) {
        console.error("Error canceling product:", error);
        res
            .status(500)
            .json({ error: "Failed to cancel the product. Please try again later." });
    }
};











module.exports = {
    cart,
    addToCart,
    updateCartQuantity,
    removeProductFromCart,
    loadwhishlist,
    addToWishlist,
    removeFromWishlist,
    placeOrder,
    getcheckout,
    cancelOrder

}