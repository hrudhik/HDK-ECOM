const Product=require('../models/productSchema');
const Category=require('../models/categorySchema');
const Brand= require('../models/brandSchema');
const User=require('../models/userSchema');
const fs=require('fs');
const path=require('path');
const sharp= require('sharp');



const addproductpage= async (req,res)=>{
    try {
        const category= await Category.find({isListed:true});
        const brand= await Brand.find({isBlocked:false});
        res.render('addProduct',{
            cat:category,
            brand:brand
        });
        
    } catch (error) {
        console.error(error);
        res.redirect('/pagenotfound');

        
    }
}




module.exports={
    addproductpage,
}