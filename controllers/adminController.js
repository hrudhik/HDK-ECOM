// const User=require("../models/userSchema");
// const mongoose=require('mongoose');
// const bcrypt=require('bcrypt');


// const loadlogin = async(req,res)=>{
//     try {
//         if(req.session.admin){
//             return res.redirect("/admin/dashboard");
//         }
//         res.render('adminlogin')
        
//     } catch (error) {
        
//     }
// }

// const login = async(req,res)=>{
//     try {
//         const {email,password}=req.body;
//         const admin= await User.findOne({email,isAdmin:true})
//         // console.log(admin)

//         if (admin ){
//             const passwordMatch=bcrypt.compare(password,admin.password)
//                 if(passwordMatch ){

//                 req.session.admin=true; 
//                 return res.redirect('/admin')
//             }else{
//                 res.redirect('/login')
//             }
//         }else{
//             return res.redirect('/login')
//         }
//     } catch (error) {
//         console.log("login error",error);
//         return res.redirect('/pagenotfound')
        
//     }
// }

// const loaddashBoard= async (req,res)=>{
//     if(req.session.admin){
//         try {
//             res.render('dashboard');
//         } catch  {
//             res.redirect('/pagenotfound');
            
//         }
//     }
// }
// const pagenotfound= async (req,res)=>{
//     res.render('pagenotfound')
// }



const User=require("../models/userSchema");
const mongoose=require('mongoose');
const bcrypt=require('bcrypt');


const loadlogin = async(req,res)=>{
    try {
        if(req.session.admin){
            return res.redirect("/admin/login");
        }
        res.render('adminlogin')
        
    } catch (error) {
        
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
            res.render('dashboard');
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
        res.status(500).send('Server error');
    }
}

const categoryserch= async (req, res) => {
    try {
      const search = req.query.search || ""; // Get the search term
      const currentPage = parseInt(req.query.page) || 1;
      const itemsPerPage = 10;
  
      // Search query using regex to match category names
      const query = search
        ? {
            name: { $regex: search, $options: "i" }, // 'i' for case-insensitive search
          }
        : {};
  
      // Pagination logic
      const totalCategories = await Category.countDocuments(query);
      const totalPages = Math.ceil(totalCategories / itemsPerPage);
      const categories = await Category.find(query)
        .skip((currentPage - 1) * itemsPerPage)
        .limit(itemsPerPage);
  
      res.render("catogary_management", {
        data: categories,
        totalPages,
        currentPage,
        search,
      });
    } catch (error) {
      console.error(error);
      res.status(500).send("Server error");
    }
  }

module.exports={
    loadlogin,
    login,
    loaddashBoard,
    userserech,
    categoryserch,
    pagenotfound,
    logout
};