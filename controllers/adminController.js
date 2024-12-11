const User=require("../models/userSchema");
const mongoose=require('mongoose');
const bcrypt=require('bcrypt');


const loadlogin = async(req,res)=>{
    try {
        if(req.session.admin){
            return res.redirect("/admin/dashboard");
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
                res.redirect('/login')
            }
        }else{
            return res.redirect('/login')
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


module.exports={
    loadlogin,
    login,
    loaddashBoard,
    pagenotfound
};