const User = require("../models/userSchema");
const Category = require('../models/categorySchema');
const Product = require('../models/productSchema');
const Brand = require('../models/brandSchema');
const Order=require('../models/orderSchema')
const nodemailer = require("nodemailer");
const env = require("dotenv").config();
const bcrypt = require('bcrypt');
const mongoose=require('mongoose')






const pagenotfound = async (req, res) => {

    try {
        res.render("pagenotefound")
    } catch (error) {
        res.redirect("/pagenotfound")
    }
}



const loadhomepage = async (req, res) => {
    try {
        // const {userName} = req.params;
        const userId = req.session.user;
        const categoryies = await Category.find({ isListed: true });
        // console.log(categoryies,'cat')
        let productData = await Product.find({
            isBlocked: false,  quantity: { $gt: 0 }
        })
        // console.log(productData,'sdfh')

        productData.sort((a, b) => new Date(b.createdOn) - new Date(a.createdOn));
        productData = productData.slice(0, 4);



        // console.log('User ID from session:', userId);
        if (userId) {
            const userData = await User.findById(userId);
            // console.log('Fetched user data:', userData); 
            res.render("home", { user: userData, products: productData });
        } else {
            res.render("home", { products: productData , });
        }
    } catch (error) {
        console.log("the home page is not loading ", error);
        res.status(500).send("internal server error");
    }
};


const loadsignUp = async (req, res) => {
    const user = req.session.user
    if (!user) {
        try {
            return res.render("signup")
        } catch (error) {
            console.log("the signup page is note loading ");
            res.status(500).send("internal server error")

        }
    } else {
        return res.redirect('/')
    }
}

function genarateotp() {
    return Math.floor(100000 + Math.random() * 900000).toString();
}

async function sendVerificationemail(email, otp) {
    try {
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            port: 587,
            secure: false,
            requireTLS: true,
            auth: {
                user: process.env.NODEMAILER_EMAIL,
                pass: process.env.NODEMAILER_PASSWORD

            }
        })

        const info = await transporter.sendMail({
            from: process.env.NODEMAILER_EMAIL,
            to: email,
            subject: "Verify your account",
            text: `Your otp is ${otp}`,
            html: `<b>YOur otp:${otp}</b>`
        })

        return info.accepted.length > 0

    } catch (error) {
        console.error("email sending error", error);
        return false;


    }
}





const signUp = async (req, res) => {
    const user = req.session.user;
    if (!user) {
        try {
            const { name, phone, email, password, cpassword } = req.body;

            if (password !== cpassword) {
                return res.render("signup", { message: "password do not match " });
            }

            const findUser = await User.findOne({ email });
            if (findUser) {
                return res.render("signup", { message: "The email is allready existing " })
            }

            const otp = genarateotp();

            const emailsent = await sendVerificationemail(email, otp);

            if (!emailsent) {
                return res.json("email-error")
            }

            req.session.userOtp = otp;
            req.session.userData = { name, phone, email, password };

            res.render('otp');
            console.log("OTP Sent", otp);

        } catch (error) {
            console.error("signUP error", error);
            res.redirect("/pagenotfound")

        }
    }
}


const hashpassword = async (password) => {
    try {
        const passwordHash = await bcrypt.hash(password, 10)
        return passwordHash;
    } catch (error) {
        console.log("password hasing is failed, the password is stored in readeable formate Please check the bcrypt module is working propperly ", error);

    }
}

const verifyotp = async (req, res) => {
    const auth = req.session.user;
    if (!auth) {
        try {
            // console.log(req.body)
            const { otp } = req.body || null
            console.log("OTP from user:", otp);

            if (otp === req.session.userOtp) {
                const user = req.session.userData;
                const hashedpassword = await hashpassword(user.password);

                const saveUserdata = new User({
                    name: user.name,
                    email: user.email,
                    phone: user.phone,
                    password: hashedpassword
                });

                await saveUserdata.save();
                req.session.user = saveUserdata._id;
                res.json({ success: true, redirectUrl: "/" });

            } else {
                res.status(400).json({ success: false, message: "Invalid OTP, please try again." });
            }
        } catch (error) {
            console.error("Error verifying OTP:", error);
            // console.error("OTP from user:", req.body.otp)
            res.status(500).json({ success: false, message: "An error occurred during OTP verification." });
        }
    }
}

const resendotp = async (req, res) => {
    try {
        const { email } = req.session.userData;
        if (!email) {
            return res.status(400).json({ success: false, message: "Email not found in session  " });

        }
        const otp = genarateotp();
        req.session.userOtp = otp;

        const emailSent = await sendVerificationemail(email, otp);
        if (emailSent) {
            console.log("Resend otp:", otp);
            res.status(200).json({ success: true, message: "OTP resend succesfully " });

        } else {
            res.status(500).json({ success: false, message: "failed to resend otp please try again " })
        }
    } catch (error) {
        console.error("error resending otp ", error);
        res.status(500).json({ success: false, message: "internal server erroer" })
    }
}


const loadlogin = async (req, res) => {
    try {
        if (!req.session.user) {
            return res.render("login")
        } else {
            res.redirect('/')
        }
    } catch (error) {
        res.redirect("/pagenotfound")

    }
}

const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        const findUser = await User.findOne({ isAdmin: 0, email: email });

        if (!findUser) {
            return res.render("login", { message: "User not found " });
        }
        if (findUser.isBlocked) {
            return res.render("login", { message: "User is blocked by admin " })
        }

        const passwordMatch = await bcrypt.compare(password, findUser.password);

        if (!passwordMatch) {
            return res.render("login", { message: "Incorrect password " });

        }

        req.session.user = findUser._id;
        // console.log(req.session.user);

        res.redirect('/');
        console.log("user login succesfull")

    } catch (error) {
        console.error("login error", error);
        res, render = ("login", { message: "login failed. Please try again " })

    }
}
const logout = async (req, res) => {
    try {
        req.session.destroy((err) => {
            if (err) {
                console.log("Session destroy error", err.message);
                return res.redirect('/pagenotfound');
            }
            return res.redirect('/login');
        })
    } catch (error) {
        console.error("Log out error", error);
        res.redirect('/pagenotfound')

    }
}

const loadshopePage = async (req, res) => {
    try {
        const user = req.session.user;
        const categoryies = await Category.find({ isListed: true });
        const userData = await User.findOne({ _id: user });
        req.session.categoryId=null
        // const categoryIds = categoryies.map((category) => category._id.toString());
        const page = parseInt(req.query.page) || 1
        const limit = 9;
        const skip = (page - 1) * limit;
        const products = await Product.find({
            isBlocked: false,
            // category: { $in: categoryIds }
            quantity: { $gt: 0 },
        }).sort({ createdOn: -1 }).skip(skip).limit(limit);

        const totalProducts = await Product.countDocuments({
            isBlocked: false,
            // category: { $in: categoryIds },
            quantity: { $gt: 0 },
        });
        const totalPages = Math.ceil(totalProducts / limit);

        const brands = await Brand.find({ isBlocked: false });
        // const categorywithIds = categoryies.map(category => ({ _id: category._id, name: category.name }))


        res.render('shope', {
            user: userData,
            products: products,
            category: categoryies,
            brand: brands,
            totalProducts: totalProducts,
            currentPage: page,
            totalPages: totalPages,
        })
    } catch (error) {
        console.error(error)
        res.redirect('/pagenotfound')


    }
}


const categoryfilter = async (req, res) => {
    try {
        const { category, sort, priceRange } = req.query;
        const page = parseInt(req.query.page) || 1;
        const limit = 9;
        const skip = (page - 1) * limit;

        const filters = {
            isBlocked: false,
            quantity: { $gt: 0 },
        };

        // Add category filter
        if (category && mongoose.Types.ObjectId.isValid(category)) {
            filters.category = new mongoose.Types.ObjectId(category);
            req.session.categoryId = category;
        } else if (req.session.categoryId && mongoose.Types.ObjectId.isValid(req.session.categoryId)) {
            filters.category = new mongoose.Types.ObjectId(req.session.categoryId);
        }

        // Add price range filter
        if (priceRange) {
            // console.log("priceRange",priceRange)
            const [gt, lt] = priceRange.split('-').map(Number);
            filters.salePrice={}
            // console.log("gt lt",gt, lt)
            if(!isNaN(gt)){
                filters.salePrice.$gte=gt
            }
            if(!isNaN(lt)){
                filters.salePrice.$lte=lt
            }
            
        }

        
        let products = Product.find(filters).skip(skip).limit(limit);

      
        if (sort === 'lowToHigh') {
            products = products.sort({ salePrice: 1 });
        } else if (sort === 'highToLow') {
            products = products.sort({ salePrice: -1 });
        } else if (sort === 'aToZ') {
            products = products.sort({ productName: 1 });
        } else if (sort === 'zToA') {
            products = products.sort({ productName: -1 });
        }

      
        const totalProducts = await Product.countDocuments(filters);
        const totalPages = Math.ceil(totalProducts / limit);

        
        res.render('shope', {
            user: req.session.user,
            products: await products,
            category: await Category.find({ isListed: true }),
            totalProducts,
            currentPage: page,
            totalPages,
        });
    } catch (error) {
        console.error("Error in categoryfilter:", error);
        res.redirect('/pagenotfound');
    }
};


const topUpWallet = async (req, res) => {
    try {
        const userId = req.session.user;
        const { amount } = req.body;

        const user = await User.findById(userId);
        if (!user.wallet) {
            user.wallet = {
                balance: 0,
                transactions: []
            };
        }       

        user.wallet.balance += Number(amount);
        user.wallet.transactions.push({
            type: "credit",
            amount: Number(amount),
            description: "Wallet Top-Up"
        });
        await user.save();

        res.redirect("/userprofile");
    } catch (error) {
        console.error("Error topping up wallet:", error);
        res.status(500).send("Failed to top up wallet.");
    }
};

const refundToWallet = async (orderId, userId, amount) => {
    try {
        console.log('orderId',orderId,'amount:',amount);
        
        // Fetch the user details
        const user = await User.findById(userId);

        if (!user) {
            throw new Error("User not found.");
        }

        // Refund the amount to the wallet
        user.wallet.balance += amount; // Add the refunded amount
        user.wallet.transactions.push({
            type: "credit",
            amount: amount,
            description: `Refund for Order #${orderId}`,
        });

        // Save the updated user
        await user.save();

        return { success: true, walletBalance: user.wallet.balance };
    } catch (error) {
        console.error("Error processing refund:", error);
        throw error; // Propagate the error to the calling function
    }
};
const searchProducts = async (req, res) => {
    try {
        const { query, page = 1, limit = 10 } = req.query; // Default to page 1, limit 10
        const searchRegex = new RegExp(query, 'i'); // Case-insensitive search
        const category= await Category.find({isListed:false})
        const skip = (page - 1) * limit;

        // Fetch products with pagination
        const products = await Product.find({
            $or: [
                { productName: searchRegex },
                { description: searchRegex }
            ]
        })
            .skip(skip)
            .limit(parseInt(limit));

        // Get total product count for pagination
        const totalProducts = await Product.countDocuments({
            $or: [
                { productName: searchRegex },
                { description: searchRegex }
            ]
        });

        const totalPages = Math.ceil(totalProducts / limit);

        res.render('shope', {
            products,
            category,
            totalProducts,
            totalPages,
            currentPage: parseInt(page),
            query
        });
    } catch (error) {
        console.error('Error searching products:', error);
        res.redirect('/pagenotfound');
    }
};

module.exports = {
    loadhomepage,
    pagenotfound,
    loadsignUp,
    signUp,
    verifyotp,
    resendotp,
    loadlogin,
    login,
    logout,
    loadshopePage,
    // filterbyprice,
    // getFilteredProducts,
    topUpWallet,
    refundToWallet,
    categoryfilter,
    searchProducts
    


}