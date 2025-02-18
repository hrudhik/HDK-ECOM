const Cart = require('../models/cart');
const Product = require('../models/productSchema');
const User = require('../models/userSchema');
const Order = require('../models/orderSchema');
const Wishlist = require("../models/wishlist");
const Address = require('../models/addressSchema');
const Coupon = require('../models/coupenSchema');
const razorpay = require('../config/razorpay')
const mongoose = require('mongoose');
const PDFDocument = require('pdfkit');

// const util = require('util')
const { refundToWallet } = require('../controllers/userController')




const cart = async (req, res) => {
    try {
        // const user = req.session.user_id;
        const userId = req.session.user
        let errormessage = null

        let cart = await Cart.findOne({ userId }).populate('items.productId');
        for (let i = 0; i < cart.items.length; i++) {
            let productId = cart.items[i].productId?._id
            // console.log(productId)
            const Id = new mongoose.Types.ObjectId(productId);
            const product = await Product.findById(Id)
            if (cart.items[i].quantity > product.quantity) {
                errormessage = "Insufficient stock. Please decrease the quantity and continue shopping."
            }

        }

        // console.log('catr',JSON.stringify(cart,null,2))
        const findUser = await User.findById(userId)
        // console.log(findUser)
        if (!cart) {
            cart = {
                user: req.session.user,
                items: [],
            };
        }


        return res.render('cart', { cart: cart, user: findUser, errormessage });

    } catch (error) {
        console.log(error.message);
        return res.redirect('/pagenotfound')
    }
};


const addToCart = async (req, res) => {
    const { productId, quantity } = req.body;
    const userId = req.session.user; 
    const Quantity = Number(quantity);

    // console.log("UserID: ", userId, "ProductID: ", productId, "Quantity: ", quantity);

    try {
        
        if (!userId) {
            return res.status(400).json({ message: 'User not logged in' });
        }

        
        let user = await User.findById(userId).populate("cart");
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        let cart;
        if (user.cart) {
           
            cart = await Cart.findOne({ userId });
        } else {
            
            cart = new Cart({ userId, items: [] });
            user.cart = cart._id;
            await user.save();
        }

        
        const productIndex = cart.items.findIndex((item) =>
            item.productId.toString() === productId
        );

        if (productIndex > -1) {
            
            return res.status(200).json({ success: true, message: 'Product already exists in cart' });
        } else {
           
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
        const { productId } = req.params;
        const { action } = req.body;
        const userId = req.session.user;


        const product = await Product.findOne({ _id: productId })
        const cart = await Cart.findOne({ userId }).populate('items.productId');

        // console.log(product);

        if (!cart) {
            return res.redirect("/cart");
        }


        const itemIndex = cart.items.findIndex(
            (item) => item.productId._id.toString() === productId
        );
        if (cart.items[itemIndex].quantity >= product.quantity && action === "increase") {
            return res.json({
                success: false,
                message: "the stock is finished"
            })
        }
        if (itemIndex >= 0) {
            // if( cart.items[itemIndex].quantity>product.quantity ){
            //     return res.json({success:false,message :"the stock is limited"})
            // }

            if (action === "increase" && cart.items[itemIndex].quantity < 5) {
                cart.items[itemIndex].quantity += 1;
            } else if (action === "decrease" && cart.items[itemIndex].quantity > 1) {
                cart.items[itemIndex].quantity -= 1;
            } else {
                console.log("Invalid action or minimum quantity reached.");
            }
            await cart.save();

            return res.json({
                newQuantity: cart.items[itemIndex].quantity,
                cartTotal: cart.items.reduce((sum, item) => sum + item.productId.salePrice * item.quantity, 0),
            });

        } else {
            console.log("Product not found in cart.");
        }
        return res.status(404).json({ message: "product is not found in cart" })
    } catch (error) {
        console.error("Error updating cart quantity:", error);
        res.redirect("/pageNotFound");
    }
};
const removeProductFromCart = async (req, res) => {
    try {
        const { productId } = req.params;


        const userId = req.session.user;
        // console.log("userId form update cartQuatnity",userId)
        const id = new mongoose.Types.ObjectId(userId)
        const produt = new mongoose.Types.ObjectId(productId)

        // const updatedCart= await Cart.findByIdAndUpdate({id},{$pull:{items:{produt}}},{new:true});

        const cart = await Cart.findOne({ userId });

        if (!cart) {
            return res.status(404).json({ error: 'Cart not found' });
        }
        // await cart.findOneAndUpdate(  { $pull: { items: { productId } } }, { new: true });
        cart.items = cart.items.filter((item) => item.productId.toString() !== productId);

        // if (!item) {
        //     return res.status(404).json({ error: 'Product not found in cart' });
        // }



        await cart.save();

        res.redirect('/cart')
    } catch (error) {
        console.error('Error updating cart quantity:', error);
        res.status(500).json({ error: 'Failed to update cart quantity' });
    }
};


const loadwhishlist = async (req, res) => {
    try {
        const userId = req.session.user;
        // console.log(userId);


        let wishlist = await Wishlist.findOne({ userId }).populate("products.productId")
        const user = await User.findById(userId)
        // console.log(user);

        // console.log('catr',JSON.stringify(cart,null,2))

        if (!wishlist) {
            wishlist = {
                user: req.session.user,
                products: [],
            };
        }


        return res.render('wishlist', { wishlist, user });

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
            return res.status(400).json({ success: false, message: "Product already in wishlist" });
        }

        wishlist.products.push({ productId });
        await wishlist.save();

        res.status(200).json({ success: true, message: "Product added to wishlist", wishlist });
    } catch (error) {
        console.error("Error adding to wishlist:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

const removeFromWishlist = async (req, res) => {
    try {
        const userId = req.session.user; // Assuming you use authentication middleware
        const { productId } = req.body;
        console.log(productId, "productId from whishlit")

        if (!userId) {
            return res.status(401).json({ success: false, message: "Unauthorized: User ID is missing" });
        }

        if (!productId) {
            return res.status(400).json({ success: false, message: "Product ID is required" });
        }
        console.log('USER ID', userId)
        const whishlit = await Wishlist.findOneAndUpdate({ userId }, { $pull: { products: { productId } } }, { new: true });
        console.log(whishlit, "jhfgyjfuity53io5uy");

        res.status(200).json({ success: true, message: "product removed succees" })
    } catch (error) {
        console.error("Error removing product from wishlist:", error);
        res.status(500).json({ success: false, message: "Server error" });
    }
};



// const getOrderConfirmation = async (req, res) => {
//     try {
//         const { orderId } = req.query;

//         if (!orderId) {
//             return res.status(400).json({ error: 'Order ID is required.' });
//         }

//         const order = await Order.findById(orderId).populate('userId');

//         if (!order) {
//             return res.status(404).json({ error: 'Order not found.' });
//         }

//         res.render('orderConfirmation', {
//             orderDetails: {
//                 orderId: order._id,
//                 orderDate: order.orderDate,
//                 totalAmount: order.totalAmount,
//                 paymentMethod: order.paymentMethod,
//                 address: order.address,
//             },
//         });
//     } catch (error) {
//         console.error('Error fetching order confirmation:', error);
//         res.status(500).json({ error: 'Failed to load order confirmation.' });
//     }
// };


const placeorder = async (req, res) => {
    const userId = req.session.user;
    const { paymentMethod, totalAmount, addressId, couponCode } = req.body;
    let discount
    let couponId

    console.log("paymentmethod", paymentMethod);
    console.log("amount", totalAmount)
    // console.log('addressId',addressId)


    // console.log("discount:",discount)

    try {
        if (paymentMethod === 'COD') {
            try {


                let foundAddress

                if (couponCode) {
                    const coupon = await Coupon.findOne({ code: couponCode, isActive: true });
                    // console.log("coupon:",coupon);
                    if (coupon) {
                        if (totalAmount > coupon.minPurchaseAmount) {
                            console.log(coupon.minPurchaseAmount)
                            discount = Math.round((totalAmount * coupon.discountPercentage) / 100);
                            couponId = coupon._id
                            console.log("discount:", discount);
                        }
                        // res.status(200).json({ totalAmount, message: "Coupon applied successfully!" });

                    }
                }

                // Validate addressId
                if (!mongoose.isValidObjectId(addressId)) {
                    return res.status(400).json({ error: "Invalid address ID." });
                }

                // Fetch cart and address
                const cart = await Cart.findOne({ userId }).populate('items.productId');
                console.log('thsi is cart', cart)
                const address = await Address.findOne({
                    userId: new mongoose.Types.ObjectId(userId),
                    "address._id": new mongoose.Types.ObjectId(addressId), // Querying the array for the address object
                });

                // console.log(address);

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
                // console.log('orderItems',orderItems);

                // Create and save the order
                const order = new Order({
                    userId: req.session.user,
                    paymentMethod,
                    totalAmount: totalAmount - discount || totalAmount,
                    items: orderItems,
                    shippingAddress: foundAddress, // Include the address in the order
                    discount: discount
                });
                // console.log('order',order);
                if (couponId) {
                    order.couponId = couponId
                }

                await order.save();
                for (let i = 0; i < cart.items.length; i++) {
                    const product = await Product.findById(cart.items[i].productId._id);
                    if (product) {
                        if (product.quantity >= cart.items[i].quantity) {
                            product.quantity -= cart.items[i].quantity
                            await product.save();
                        } else {
                            return res.status(400).json({ success: false, message: `Insufficient stock for product: ${product.productName}.` })
                        }
                    } else {
                        return res.status(400).json({ succes: false, message: "the product should not found" })
                    }
                }


                cart.items = [];

                await cart.save();
                console.log("order Placed success")
                return res.status(200).json({ message: "Order placed successfully." });
            } catch (error) {
                console.error("Error processing order:", error);
                return res.status(500).json({ error: "Failed to place order. Please try again later." });
            }
        } else if (paymentMethod === 'Online') {

            console.log(totalAmount)
            console.log(discount)


            let finalAmount;
            if (couponCode) {
                const coupon = await Coupon.findOne({ code: couponCode, isActive: true });
                if (coupon && totalAmount > coupon.minPurchaseAmount) {
                    discount = Math.round((totalAmount * coupon.discountPercentage) / 100);
                    couponId = coupon._id

                }
            }

            finalAmount = totalAmount - discount || totalAmount;


            // Payment is verified, proceed to place the order
            // const userId = req.session.user; // Assuming userId is stored in session
            // const { addressId, items, totalAmount, couponCode } = req.body.orderData; // Pass this data from the frontend

            console.log("online payment total amount", totalAmount)

            // Validate coupon if applied
            // if (couponCode) {
            //     const coupon = await Coupon.findOne({ code: couponCode, isActive: true });
            //     if (coupon && totalAmount > coupon.minPurchaseAmount) {
            //         discount = Math.round((totalAmount * coupon.discountPercentage) / 100);
            //         couponId=coupon._id

            //     }
            // }

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

            const orderItems = cart.items.map(item => ({
                productId: item.productId,
                quantity: item.quantity,
                price: item.productId.salePrice,
            }));

            const order = new Order({
                userId: req.session.user,
                paymentMethod: "Online",
                totalAmount: totalAmount - discount || totalAmount,
                items: orderItems,
                shippingAddress: foundAddress,
                discount: discount
            });
            if (couponId) {
                order.couponId = couponId
            }

            await order.save();

            for (let i = 0; i < cart.items.length; i++) {
                const product = await Product.findById(cart.items[i].productId._id);
                if (product) {
                    if (product.quantity >= cart.items[i].quantity) {
                        product.quantity -= cart.items[i].quantity
                        await product.save();
                    } else {
                        return res.status(400).json({ success: false, message: `Insufficient stock for product: ${product.productName}.` })
                    }
                } else {
                    return res.status(400).json({ succes: false, message: "the product should not found" })
                }
            }


            cart.items = [];
            await cart.save()


            const options = {
                amount: finalAmount * 100, // Convert to paise
                currency: 'INR',
                receipt: `order_rcptid_${Date.now()}`,
            };

            const razorpayOrder = await razorpay.orders.create(options);

            return res.json({
                success: true,
                message: "Razorpay payment initiated",
                razorpayOrderId: razorpayOrder.id,
                amount: razorpayOrder.amount,
                currency: razorpayOrder.currency,
                orderId: order._id
            });


        } else if (paymentMethod === "Wallet") {

            try {

                const user = await User.findById(userId);

                if (!user || user.wallet.balance < totalAmount) {
                    return res.status(400).json({ message: '"Insufficient wallet balance."' })
                }

                let foundAddress

                if (couponCode) {
                    const coupon = await Coupon.findOne({ code: couponCode, isActive: true });
                    // console.log("coupon:",coupon);
                    if (coupon) {
                        if (totalAmount > coupon.minPurchaseAmount) {
                            console.log(coupon.minPurchaseAmount)
                            discount = Math.round((totalAmount * coupon.discountPercentage) / 100);
                            couponId = coupon._id
                            console.log("discount:", discount);
                        }
                        // return res.status(200).json({ totalAmount, message: "Coupon applied successfully!" });

                    }
                }


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

                // console.log(address);

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
                    totalAmount: totalAmount - discount || totalAmount,
                    items: orderItems,
                    shippingAddress: foundAddress, // Include the address in the order
                    paymentstatus: "Paid",
                    discount: discount
                });
                if (couponId) {
                    order.couponId = couponId
                }
                console.log('orderd items', order)
                await order.save();

                user.wallet.balance -= totalAmount - discount || totalAmount
                user.wallet.transactions.push({
                    type: "debit",
                    amount: totalAmount - discount || totalAmount,
                    description: `Refund for Order ${order._id}`
                })
                await user.save()

                for (let i = 0; i < cart.items.length; i++) {
                    const product = await Product.findById(cart.items[i].productId._id);
                    if (product) {
                        if (product.quantity >= cart.items[i].quantity) {
                            product.quantity -= cart.items[i].quantity
                            await product.save();
                        } else {
                            return res.status(400).json({ success: false, message: `Insufficient stock for product: ${product.productName}.` })
                        }
                    } else {
                        return res.status(400).json({ succes: false, message: "the product should not found" })
                    }
                }

                cart.items = [];
                await cart.save();
                return res.status(200).json({ message: "Order placed successfully." });
            } catch (error) {
                console.error("Error processing order:", error);
                return res.status(500).json({ error: "Failed to place order. Please try again later." });
            }

        } else {
            return res.status(400).json({ success: false, message: 'Invalid payment method' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Unable to process order' });
    }
}

const getcheckout = async (req, res) => {
    try {
        const userId = req.session.user; // Assuming session stores the user ID
        const coupons = await Coupon.find({ isActive: true });
        const user = await User.findById(userId)

        if (!userId) {
            return res.redirect('/login'); // Redirect to login if user not logged in
        }

        // Fetch the user's cart
        const cart = await Cart.findOne({ userId }).populate('items.productId');
        const address = await Address.findOne({ userId }).populate('address');

        if (!cart) {
            return res.render('checkout', { cart: { items: [] }, coupons }); // Render an empty cart
        }

        const cartJsonString = JSON.stringify(cart.toJSON().items)

        res.render('checkout', { cart, cartItems: cartJsonString, userId, address, coupons, user });

        // Render the checkout page with the cart data
    } catch (error) {
        console.error('Error in getcheckout:', error);
        // res.redirect('/500'); // Redirect to error page on failure
    }
};

const applyCoupon = async (req, res) => {
    try {
        const { couponCode, totalAmount } = req.body;

        // Check if coupon code is provided
        if (!couponCode) {
            return res.status(400).json({ error: "Coupon code is required." });
        }

        // Find the coupon in the database
        const coupon = await Coupon.findOne({ code: couponCode, isActive: true });

        // Check if the coupon is valid
        if (!coupon) {
            return res.status(400).json({ error: "Invalid or expired coupon code." });
        }

        // Check if the total amount meets the minimum purchase amount
        // console.log("total:",totalAmount);
        // console.log('couponmin amount:',coupon.minPurchaseAmount)

        if (totalAmount > coupon.minPurchaseAmount) {
            // console.log(coupon.minPurchaseAmount)
            const discountAmount = (totalAmount * coupon.discountPercentage) / 100;

            // // Respond with the discount amount
            return res.status(200).json({
                discountAmount,
                message: "Coupon applied successfully!"
            });

        } else {
            console.log(totalAmount)
            return res.status(400).json({
                error: `This coupon requires a minimum purchase of ${coupon.minPurchaseAmount}.`
            });
        }


    } catch (error) {
        console.error("Error validating coupon:", error);
        res.status(500).json({ error: "Failed to apply coupon. Please try again later." });
    }
};

const cancelOrder = async (req, res) => {
    try {
        const { orderId, productId } = req.params; // Extract orderId and productId from request parameters
        const userId = req.session.user; // Get the logged-in user's ID

        // Find the order and ensure it belongs to the user
        const order = await Order.findOne({ _id: orderId, userId });

        if (!order) {
            return res.status(404).json({ error: "Order not found." });
        }


        // Find the product in the items array
        const product = order.items.find(
            (item) => item.productId.toString() === productId
        );
        console.log("order cancelled product",product)

        if (!product) {
            return res.status(404).json({ error: "Product not found in this order." });
        }

        let returnPrice
        if (order.discount > 0) {
            const coupon = await Coupon.findById(order.couponId);
            // console.log("coupon",coupon)
            if (coupon.minPurchaseAmount <= product.price) {
                returnPrice = product.price *product.quantity
                order.totalAmount-=returnPrice

            }else{
                returnPrice = (product.price - order.discount)*product.quantity
                order.discount = 0
                order.totalAmount-=returnPrice
            }
        }
        // console.log("order",order)
        // console.log("returnPrice",returnPrice
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
        const findproduct = await Product.findById(productId)
        // console.log("findProducut:",findproduct)
        findproduct.quantity += product.quantity
        findproduct.save()

        // Attempt refund only for online payments
        if (order.paymentMethod === "Online") {
            try {
                const refundResult = await refundToWallet(orderId, userId, returnPrice || product.price);
                console.log("Refund Result:", refundResult);
            } catch (refundError) {
                console.warn("Refund skipped:", refundError.message);
            }
        } else if (order.paymentMethod === "Wallet") {
            try {
                const refundResult = await refundToWallet(orderId, userId, product.price);
                console.log("Refund Result:", refundResult);
            } catch (refundError) {
                console.warn("Refund skipped:", refundError.message);
            }
        }
        console.log("orderamount:", returnPrice || product.price)
        res.redirect("/userProfile"); // Or use res.status(200).json() based on frontend handling
    } catch (error) {
        console.error("Error canceling product:", error);
        res
            .status(500)
            .json({ error: "Failed to cancel the product. Please try again later." });
    }
};


const returnOrder = async (req, res) => {
    try {
        const { orderId, productId } = req.params;
        const { returnReason } = req.body;
        // console.log("this is the return reason:",returnReason)
        const userId = req.session.user;

        const order = await Order.findOne({ _id: orderId });

        if (!order) {
            return res.status(404).json({ error: "Order not found." });
        }

        const product = order.items.find(
            (item) => item.productId.toString() === productId
        );

        if (!product) {
            return res.status(404).json({ error: "Product not found in this order." });
        }
        const findProducut = await Product.findById(productId)
        findProducut.quantity += product.quantity
        findProducut.save()
        if (product.status === "Return") {
            return res.status(400).json({ success: false, message: "The product is already returned." });
        }

        let returnPrice
        if (order.discount > 0) {
            const coupon = await Coupon.findById(order.couponId);
            // console.log("coupon",coupon)
            if (coupon.minPurchaseAmount <= product.price) {
                returnPrice = product.price *product.quantity
                order.totalAmount-=returnPrice

            }else{
                returnPrice = (product.price - order.discount)*product.quantity
                order.discount = 0
                order.totalAmount-=returnPrice
            }
        }

        // Update the product status to "Return"
        product.status = "Return";
        product.returnReason = returnReason
        await order.save();

        // Attempt refund based on conditions
        if (order.paymentMethod === "Online" || (order.paymentMethod === "COD" && order.status === "Delivered") || order.paymentMethod === "Wallet") {
            try {
                const refundResult = await refundToWallet(orderId, userId, returnPrice || product.price);
                console.log("Refund Result:", refundResult);
            } catch (refundError) {
                console.warn("Refund skipped:", refundError.message);
            }
        }

        res.redirect('/orderdetails');
    } catch (error) {
        console.error("Error processing return:", error);
        res.status(500).json({ success: false, message: "Failed to return the product. Please try again later." });
    }
};
const checkoutaddAddress = async (req, res) => {
    try {
        const userId = req.session.user;
        const userData = await User.findOne({ _id: userId });

        const { addresType, name, city, state, pincode, landMark, phone, altPhone } = req.body;

        let userAddress = await Address.findOne({ userId: userData._id });

        let newAddress;
        if (!userAddress) {
            // If no address exists, create a new one
            newAddress = new Address({
                userId: userData._id,
                address: [{ addresType, name, city, state, pincode, landMark, phone, altPhone }]
            });
            await newAddress.save();
        } else {
            // If address exists, push new entry into the array
            userAddress.address.push({ addresType, name, city, state, pincode, landMark, phone, altPhone });
            await userAddress.save();
        }

        res.status(200).json({
            success: true,
            addresses: userAddress ? userAddress.address : newAddress.address,
            message: "Address added successfully"
        });

    } catch (error) {
        console.error("Checkout address adding error:", error);
        res.status(500).json({ success: false, message: "Failed to add address" });
    }
};



const invoice = async (req, res) => {
    try {
        const { orderId } = req.query
        // console.log(orderId)
        const Id = new mongoose.Types.ObjectId(orderId)
        const order = await Order.findById(Id).populate('userId').populate('items.productId')

        // console.log(order);

        res.render('invoice', { order })
    } catch (error) {
        console.log("error in getting invoice", error);
        res.redirect('/pagenotfound');

    }
}
const generateInvoicePdf = async (req, res) => {
    try {
        const { orderId } = req.query;

        // Fetch the order details
        const Id = new mongoose.Types.ObjectId(orderId);
        const order = await Order.findById(Id)
            .populate("userId")
            .populate("items.productId");

        if (!order) {
            return res.status(404).send("Order not found");
        }

        // Create a new PDF document
        const pdfDoc = new PDFDocument({ margin: 30 });

        // Set the response headers for the PDF download
        res.setHeader("Content-Type", "application/pdf");
        res.setHeader(
            "Content-Disposition",
            `attachment; filename=Invoice_${order._id}.pdf`
        );

        // Pipe the PDF to the response
        pdfDoc.pipe(res);

        // Add title and header
        pdfDoc
            .fontSize(18)
            .text("Invoice", { align: "center" })
            .moveDown(0.5);
        pdfDoc
            .fontSize(12)
            .text(`Order ID: ${order._id}`, { align: "center" })
            .moveDown(0.2);
        pdfDoc
            .text(`Date: ${order.createdAt.toDateString()}`, { align: "center" })
            .moveDown(0.5);
        pdfDoc
            .fontSize(14)
            .text(`Customer Name: ${order?.userId?.name || "N/A"}`)
            .moveDown(0.2);
        pdfDoc.text(`Email: ${order?.userId?.email || "N/A"}`).moveDown(1);

        // Table layout settings
        const tableTop = 200;
        const columnWidths = [200, 70, 100, 70, 100];
        const rowHeight = 20;
        const xStart = 50;
        let y = tableTop;

        // Draw table headers
        pdfDoc
            .fontSize(12)
            .font("Helvetica-Bold")
            .rect(xStart, y, columnWidths[0], rowHeight).stroke()
            .text("Item", xStart + 5, y + 5);

        pdfDoc
            .rect(xStart + columnWidths[0], y, columnWidths[1], rowHeight).stroke()
            .text("Quantity", xStart + columnWidths[0] + 5, y + 5);

        pdfDoc
            .rect(xStart + columnWidths[0] + columnWidths[1], y, columnWidths[2], rowHeight).stroke()
            .text("Status", xStart + columnWidths[0] + columnWidths[1] + 5, y + 5);

        pdfDoc
            .rect(xStart + columnWidths[0] + columnWidths[1] + columnWidths[2], y, columnWidths[3], rowHeight).stroke()
            .text("Price", xStart + columnWidths[0] + columnWidths[1] + columnWidths[2] + 5, y + 5);

        pdfDoc
            .rect(xStart + columnWidths[0] + columnWidths[1] + columnWidths[2] + columnWidths[3], y, columnWidths[4], rowHeight).stroke()
            .text("discount", xStart + columnWidths[0] + columnWidths[1] + columnWidths[2] + columnWidths[3] + 5, y + 5);


        y += rowHeight;

        // Draw table rows for each item
        pdfDoc.fontSize(10).font("Helvetica");
        order.items.forEach((item) => {
            const itemName = item?.productId?.productName || "N/A";
            const quantity = item.quantity || 0;
            const status = item.status || "N/A";
            const price = item.price || 0;
            const discount = order.discount
            const total = quantity * price;

            pdfDoc.rect(xStart, y, columnWidths[0], rowHeight).stroke()
                .text(itemName, xStart + 5, y + 5);

            pdfDoc.rect(xStart + columnWidths[0], y, columnWidths[1], rowHeight).stroke()
                .text(quantity.toString(), xStart + columnWidths[0] + 5, y + 5);

            pdfDoc.rect(xStart + columnWidths[0] + columnWidths[1], y, columnWidths[2], rowHeight).stroke()
                .text(status, xStart + columnWidths[0] + columnWidths[1] + 5, y + 5);

            pdfDoc.rect(xStart + columnWidths[0] + columnWidths[1] + columnWidths[2], y, columnWidths[3], rowHeight).stroke()
                .text(`₹${price.toFixed(2)}`, xStart + columnWidths[0] + columnWidths[1] + columnWidths[2] + 5, y + 5);

            pdfDoc.rect(xStart + columnWidths[0] + columnWidths[1] + columnWidths[2] + columnWidths[3], y, columnWidths[4], rowHeight).stroke()
                .text(`₹${discount.toFixed(2)}`, xStart + columnWidths[0] + columnWidths[1] + columnWidths[2] + columnWidths[3] + 5, y + 5);


            y += rowHeight;

            // Add a new page if content overflows
            if (y > 750) {
                pdfDoc.addPage();
                y = tableTop;
            }
        });

        // Add total amount
        pdfDoc
            .fontSize(12)
            .font("Helvetica-Bold")
            .text(`Total Amount: ₹${order.totalAmount.toFixed(2)}`, xStart, y + 20);

        // Finalize the PDF
        pdfDoc.end();
    } catch (error) {
        console.error("Error generating invoice PDF:", error);
        res.status(500).send("Failed to generate invoice PDF");
    }
};

const getOrderList = async (req, res) => {

    try {
        const userId = req.session.user;
        const page = parseInt(req.query.page) || 1;
        const limit = 5;
        const skip = (page - 1) * limit;
        const total = await Order.find({ userId }).countDocuments();
        const totalPages = Math.ceil(total / limit)
        const orderDetails = await Order.find({ userId }).sort({ createdAt: -1 }).skip(skip).limit(limit).populate("items.productId")
        const user = await User.findById(userId)


        res.render("orderlisting", { orderDetails, currentPage: page, totalPages, user })


    } catch (error) {
        console.log("Error geting the order listing page:", error);
        res.redirect('/pagenotfound')
    }


}



module.exports = {
    cart,
    addToCart,
    updateCartQuantity,
    removeProductFromCart,
    loadwhishlist,
    addToWishlist,
    removeFromWishlist,
    placeorder,
    getcheckout,
    cancelOrder,
    returnOrder,
    applyCoupon,
    checkoutaddAddress,
    invoice,
    generateInvoicePdf,
    getOrderList

}