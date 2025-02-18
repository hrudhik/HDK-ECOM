

const User=require("../models/userSchema");
const mongoose=require('mongoose');
const bcrypt=require('bcrypt');
const Order = require("../models/orderSchema");
const Product = require("../models/productSchema");
const Coupon= require("../models/coupenSchema");


const loadlogin = async(req,res)=>{
    try {
        if(req.session.admin){
            return res.redirect("/admin/login");
        }
        res.render('adminlogin')
        
    } catch (error) {
        res.redirect('/pagenotfound')
    }
}

const login = async(req,res)=>{
    try {
        const {email,password}=req.body;
        const admin= await User.findOne({email,isAdmin:true})

        if (admin ){
            const passwordMatch=bcrypt.compare(password,admin.password)
                if(passwordMatch ){

                req.session.admin=true; 
                return res.redirect('/admin')
            }else{
                res.redirect('/admin/login')
            }
        }else{
            return res.redirect('/admin/login')
        }
    } catch (error) {
        console.log("login error",error);
        return res.redirect('/pagenotfound')
        
    }
}

const loaddashBoard= async (req,res)=>{
    if(req.session.admin){
        try {
            res.render('admindashboard');
        } catch  {
            res.redirect('/pagenotfound');
            
        }
    }
}
const pagenotfound= async (req,res)=>{
    res.render('pagenotfound')
}
const logout= async(req,res)=>{
    try {
        req.session.destroy( err=>{
            if(err){
                console.log("error destroying session")
                return res.redirect('/pagenotfound')
            }
            res.redirect('/admin/login')
        })
    } catch (error) {
        console.log("unexpected error during logout",error);
        res.redirect('/pagenotfound')
    }
}
const userserech=async (req, res) => {
    try {
        const search = req.query.search || '';
        const currentPage = parseInt(req.query.page) || 1;
        const itemsPerPage = 10;

        // Search logic: find users by name or email (you can adjust it)
        const query = search ? {
            $or: [
                { name: { $regex: search, $options: 'i' } },
                // { email: { $regex: search, $options: 'i' } },
            ],
        } : {};

        // Pagination logic
        const totalCustomers = await User.countDocuments(query);
        const totalPages = Math.ceil(totalCustomers / itemsPerPage);
        const customers = await User.find(query)
            .skip((currentPage - 1) * itemsPerPage)
            .limit(itemsPerPage);

        res.render('admin/users', {
            data: customers,
            totalPages,
            currentPage,
            search,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({success:false,message :"User not found"});
    }
}

// const categoryserch= async (req, res) => {
//     try {
//       const search = req.query.search || ""; // Get the search term
//       const currentPage = parseInt(req.query.page) || 1;
//       const itemsPerPage = 10;
  
//       // Search query using regex to match category names
//       const query = search
//         ? {
//             name: { $regex: search, $options: "i" }, // 'i' for case-insensitive search
//           }
//         : {};
  
//       // Pagination logic
//       const totalCategories = await Category.countDocuments(query);
//       const totalPages = Math.ceil(totalCategories / itemsPerPage);
//       const categories = await Category.find(query)
//         .skip((currentPage - 1) * itemsPerPage)
//         .limit(itemsPerPage);
  
//       res.render("catogary_management", {
//         data: categories,
//         totalPages,
//         currentPage,
//         search,
//       });
//     } catch (error) {
//       console.error(error);
//       res.status(500).json({success:false,message:"category not found"})
//     }
//   }

  const getAllOrders = async (req, res) => {
    try {
        const page=parseInt(req.query.page)||1;
        const limit=5;
        const skip=(page-1)*limit;

        const totalOrders=await Order.find().countDocuments();
        const orders = (await Order.find().populate("userId").sort({ createdAt: -1 }).skip(skip).limit(limit));  // Sorting by date descending
        const totalPages=Math.ceil(totalOrders/limit)
        res.render("orders", { orders,currentPage:page,totalPages });

    } catch (error) {
        console.error(error);
       res.redirect('/pagenotfound')
    }
};

const getOrderDetails = async (req, res) => {
    try {
        const { orderId } = req.params;
        // console.log(orderId);
        
        const order = await Order.findById(orderId).populate("userId").populate("items.productId");
        if (!order) {
            return res.status(404).json({ error: "Order not found" });
        }
        res.render("orderDetails", { order });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Failed to fetch order details" });
    }
};

const updateOrderStatus = async (req, res) => {
    try {
        const { orderId,productId } = req.params;
        const { status} = req.body;  // New status from the form
        

        if (!["Pending", "Shipped", "Delivered","Return", "Cancelled"].includes(status)) {
            return res.status(400).json({ error: "Invalid status" });
        }

        const order = await Order.findById(orderId);
        if (!order) {
            return res.status(404).json({ error: "Order not found" });
        }
        const product = order.items.find(
            (item) => item.productId.toString() === productId
        );
        if (!product) {
            return res.status(404).json({ error: "Product not found in this order" });
        }
        product.status = status;
        order.paymentstatus="Paid"
        await order.save();

        res.redirect(`/admin/orders/${orderId}`);  // Redirect to the order details page
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Failed to update order status" });
    }
};

const getAllProducts = async (req, res) => {
    try {
        const products = await Product.find();
        res.render("inventory", { products });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Failed to fetch products" });
    }
};


const listCoupons = async(req,res)=>{
    try {
        const coupons = await Coupon.find({}).sort({ createdAt: -1 });
        res.render('coupens',{coupons})
    } catch (error) {
        console.log(error);
        res.status(500).redirect('/addmin/pagenotfound')
    }
}


const createCoupons = async (req, res) => {
    try {
        const { code, discountPercentage, startDate, endDate, minPurchaseAmount } = req.body;
        if (new Date(startDate) >= new Date(endDate)) {
            return res.status(500).send("Start date must be before the end date.");
        }

        const { filename } = req.file;
        const today= new Date();

        const newCoupon = new Coupon({
            code,
            discountPercentage,
            startDate: today,
            endDate,
            couponImage: filename,
            minPurchaseAmount, // Add this
        });

        await newCoupon.save();
        res.redirect("/admin/listcoupen");
    } catch (error) {
        console.log(error);
        res.status(500).redirect('/admin/pagenotfound');
    }
};



const deletCoupens = async (req, res) => {
    try {
        const { id } = req.params;
        await Coupon.findByIdAndDelete(id);
        res.redirect("/admin/listcoupen");
    } catch (error) {
        console.error(error);
        res.status(500).send("Error deleting coupon.");
    }
};


module.exports={
    loadlogin,
    login,
    loaddashBoard,
    userserech,
    // categoryserch,
    pagenotfound,
    logout,
    getAllOrders,
    getOrderDetails,
    updateOrderStatus,
    getAllProducts,
        // showAddProductForm,
        // addProduct,
        // showEditProductForm,
        // editProduct,
        // deleteProduct,
    listCoupons,
    createCoupons,
    deletCoupens
};