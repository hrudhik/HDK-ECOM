const Banner= require('../models/bannerSchema');
const path= require('path');
const fs= require('fs')

const getBannerpage= async(req,res)=>{
    try {
        const findBanners= await Banner.find({});
        res.render('bannerManagement',{data:findBanners})

    } catch (error) {
        cosolelog('error in bannermangemnr loading',error);
        res.redirect('/admin/pagenotfound');
    }
}

const getaddBanner= async(req,res)=>{
    try {
        res.render('addbanner')
        
    } catch (error) {
        res.redirect('/admin/pagenotfound')
    }
}

const addBanner= async (req,res)=>{
    try {
        const data= req.body;
        const image= req.file;
        
        const newBanner= new Banner({
            image:image.filename,
            title:data.title,
            description:data.description,
            startDate:new Date(data.startDate+"T00:00:00"),
            endDate:new Date(data.endDate+"T00:00:00"),
            link:data.link
        })

        await newBanner.save()
        console.log("new created banner:",newBanner)
        res.redirect("/admin/banner")
    } catch (error) {
        
    }
}

const deletBanner= async (req,res) => {
    try {
        const bannerId= req.query.id;
        await Banner.findByIdAndDelete(bannerId)
        res.redirect('/admin/banner')
    } catch (error) {
        console.log("bannerdelting error",error);
        res.redirect("/admin/pagenotfound")

    }
    
}
module.exports={
    getBannerpage,
    getaddBanner,
    addBanner,
    deletBanner
}