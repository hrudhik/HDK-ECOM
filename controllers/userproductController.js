const Product=require('../models/productSchema');
const Category=require('../models/categorySchema');
const User=require('../models/userSchema');
const mongoose= require('mongoose')


const productDetails = async (req, res) => {
    try {
        const userId = req.session.user;

        const userData = await User.findById(userId)

        const { id: productId } = req.query;
        console.log(productId)
        const productid=  new mongoose.Types.ObjectId(productId)

        const product = await Product.findById(productid).populate('category');
        console.log(product,"product")

        const findCategory = product.category;
        console.log(findCategory,'category');

        const relatedproducts=await Product.find({ isBlocked:false,category:findCategory._id,_id:{$ne:productId}}).limit(4)

        
        const categoryOffer = findCategory?.categoryOffer || 0;
        const productOffer = product.productOffer || 0;


        const totalOffer = categoryOffer + productOffer

        res.render('productDetails', {
            user: userData,
            product: product,
            quantity: product.quantity,
            totalOffer: totalOffer,
            category: findCategory,
            relatedproducts:relatedproducts
        })

    } catch (error) {
        console.log("Error on fetching productdetails ", error);
        res.redirect("/pageNotFound")
    }
}


  

module.exports={
    productDetails,
    
}