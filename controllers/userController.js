const User = require("../models/userSchema");
const Category = require('../models/categorySchema');
const Product = require('../models/productSchema');
const Brand = require('../models/brandSchema');
const nodemailer = require("nodemailer");
const env = require("dotenv").config();
const bcrypt = require('bcrypt');






const pagenotfound = async (req, res) => {

    try {
        res.render("pagenotefound")
    } catch (error) {
        res.redirect("/pagenotfound")
    }
}



const loadhomepage = async (req, res) => {
    try {
        const userId = req.session.user;
        const categoryies = await Category.find({ isListed: true });
        let productData = await Product.find({
            isBlocked: false, category: { $in: categoryies.map(category => category._id) }, quantity: { $gt: 0 }
        })

        productData.sort((a, b) => new Date(b.createdOn) - new Date(a.createdOn));
        peoductData = productData.slice(0, 4);



        // console.log('User ID from session:', userId);
        if (userId) {
            const userData = await User.findById(userId);
            // console.log('Fetched user data:', userData); 
            res.render("home", { user: userData, products: productData });
        } else {
            res.render("home", { products: productData });
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
        const categoryIds = categoryies.map((category) => category._id.toString());
        const page = parseInt(req.query.page) || 1
        const limit = 9;
        const skip = (page - 1) * limit;
        const products = await Product.find({
            isBlocked: false,
            category: { $in: categoryIds },
            quantity: { $gt: 0 },
        }).sort({ createdOn: -1 }).skip(skip).limit(limit);

        const totalProducts = await Product.countDocuments({
            isBlocked: false,
            category: { $in: categoryIds },
            quantity: { $gt: 0 },
        });
        const totalPages = Math.ceil(totalProducts / limit);

        const brands = await Brand.find({ isBlocked: false });
        const categorywithIds = categoryies.map(category => ({ _id: category._id, name: category.name }))


        res.render('shope', {
            user: userData,
            products: products,
            category: categorywithIds,
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

const filterbyprice = async (req, res) => {
    try {
        const user = req.session.user;
        const userData = await User.findOne({ _id: user });
        const brand = await Brand.find({}).lean();
        const category = await Category.find({ isListed: true });
        const totalProducts = await Product.countDocuments({
            isBlocked: false,
            // category:{$in:categoryIds},
            quantity: { $gt: 0 },
        })

        const findProduct = await Product.find({
            salePrice: { $gt: req.query.gt, $lt: req.query.lt },
            isBlocked: false,
            quantity: { $gt: 0 }
        }).lean();

        findProduct.sort((a, b) => new Date(b.createdOn) - new Date(a.createdOn));
        let ipage = 6
        let currentPage = parseInt(req.query.page) || 1
        let startIndex = (currentPage - 1) * ipage
        let endIndex = startIndex + ipage
        let totalPages = Math.ceil(findProduct.length / ipage)
        const currentProduct = findProduct.slice(startIndex, endIndex)
        req.session.filteredProducts = findProduct

        res.render('shope', {
            user: userData,
            products: currentProduct,
            category: category,
            totalProducts: totalProducts,
            brand: brand,
            totalPages,
            currentPage
        })
    } catch (error) {
        console.error(error);
        res.redirect('/pagenotfound')


    }
}

const getFilteredProducts = async (req, res) => {
    try {
        const  sort  = req.query.sort;
        let sortOption = {};
        console.log(sort);
        

        if (sort === "lowToHigh") {
            sortOption = { salePrice: 1 }
        } else if (sort === "highToLow") {
            sortOption = { salePrice: -1 }
        } else if (sort === "aToZ") {
            sortOption. productName= 1 
        } else if (sort === "zToA") {
            sortOption .  productName= -1 
        }
        console.log(sortOption );
        

        const products = await Product.find({}).sort(sortOption).lean()
        const totalProducts = await Product.find().sort(sortOption).countDocuments()


        let ipage = 6
        let currentPage = parseInt(req.query.page) || 1
        let startIndex = (currentPage - 1) * ipage
        let endIndex = startIndex + ipage
        let totalPages = Math.ceil(products.length / ipage)
        const currentProduct = products.slice(startIndex, endIndex)

        res.render('shope', {
            products, totalProducts,
            totalPages,
            currentPage
        })

    } catch (error) {
        console.log(error);
        res.redirect('/pagenotfound')

    }
}

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
    filterbyprice,
    getFilteredProducts,
    


}