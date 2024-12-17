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


module.exports={
    loadlogin,
    login,
    loaddashBoard,
    pagenotfound,
    logout
};