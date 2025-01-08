const { default: mongoose } = require("mongoose");
const Category = require("../models/categorySchema");
const category = require("../models/categorySchema");
const Product=require("../models/productSchema");
// const mongoose=require("mongoose")






// const categogtyInfo = async (req, res) => {
//     try {
//         const page = parseInt(req.query.page) || 1;
//         const limit = 4;
//         const skip = (page - 1) * limit;

//         const carogaryData = await category.find({})
//             .skip(skip)
//             .limit(limit);


//         const totalCatagorys = await category.countDocuments();
//         const totalPages = Math.ceil(totalCatagorys / limit);
//         res.render('categary_management', {
//             cat: carogaryData,
//             currentPage: page,
//             totalPages: totalPages.totalCatagorys,
//             totalCatagorys: totalCatagorys
//         });



//     } catch (error) {
//         console.log(error);
//         res.redirect('/pagenotdound')


//     }
// }

// const addCatogary=async(req,res)=>{
//     const{name,description}=req.body;

//     try {
//         const existCatogary=await category.findOne({name}); 
//         if(existCatogary){
//             return res.status(400).json({error:"Cateogary already exist"})
//         }
//         const newcategory= new category({
//             name,
//             description,
//         })
//         await newcategory.save();
//         return res.json({messsage :"catogary add succes full "})

//     } catch (error) {
//         res.status(500).json({error:"internal server error "});
//         console.log(error)
//     }
// }
const categogtyInfo = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = 4;
        const skip = (page - 1) * limit;

        const carogaryData = await category.find({})
            .skip(skip)
            .limit(limit);

        const totalCatagorys = await category.countDocuments();
        const totalPages = Math.ceil(totalCatagorys / limit);

        res.render('categary_management', {
            cat: carogaryData,
            currentPage: page,
            totalPages: totalPages, // Fixed
            totalCatagorys: totalCatagorys // Fixed
        });
    } catch (error) {
        console.log(error);
        res.redirect('/pagenotfound');
    }
};


const addCatogary = async (req, res) => {
    const { name, description } = req.body;

    // Input validation
    if (!name || !description) {
        return res.status(400).json({ status: false, error: "Name and description are required." });
    }

    try {
        // Standardize the category name format: First letter capital, rest lowercase
        const formattedName = name.trim().charAt(0).toUpperCase() + name.trim().slice(1).toLowerCase();

        // Check if the category already exists
        const existingCategory = await category.findOne({ name: formattedName });
        if (existingCategory) {
            return res.status(400).json({
                message: 'Category already exists!',
                type: 'error', 
              });;
        }
        
        // Create and save the new category
        const newCategory = new category({
            name: formattedName, // Save the standardized format
            description: description.trim(),
        });

        await newCategory.save();
        // location.reload();


        return res.redirect('/admin/catogary');
    } catch (error) {
        console.error("Error adding category:", error);
        return res.status(500).json({ status: false, error: "Internal server error." });
    }
};





// const addCategoryOffer= async (req,res)=>{
//     try {
//        const {categoryId,offer}=req.body;
//        const products=await Product.find();
//        if(offer<0 ||offer>100 ){
//         return res.status(500).send("the offer musbe 0-100")
//        }
//        const category= await Category.findById(categoryId);

//        if(!category){
//         return res.status(500).send("the category not found ");
//        }
//        category.categoryOffres=offer
//        await category.save();

//        products.forEach((product)=>{
       
//         let productof= product.regularPrice-(product.regularPrice*product.productOffer)/100 ||0;
//         let catoff=  product.regularPrice-(product.regularPrice*offer)/100 ||0;
           
//         const finalPrice=Math.max(productof,catoff);
//           product.salePrice=finalPrice;
         
//        })
//        await products.save();
       
//        res.redirect('/admin/catogary');
       
       

//     //    const products= await Product.find({category:categoryId});

//     //    for(const product of products){
//     //     const discount= (product.regularPrice*offer)/100
//     //     // product.salePrice=product.regularPrice-discount;
//     //     await product.save();
//     //    }


//     } catch (error) {
//         res.status(500).json({status:false,message:"internal server error"})
//         console.error(error);
        
//     }
// }
const addCategoryOffer = async (req, res) => {
    try {
        const { categoryId, offer } = req.body;

        // Validate the offer range
        if (offer < 0 || offer > 100) {
            return res.status(500).send("The offer must be between 0-100");
        }

        // Find the category by ID
        const category = await Category.findById(categoryId);
        if (!category) {
            return res.status(500).send("The category was not found");
        }

        // Update the category offer
        category.categoryOffres = offer;
        await category.save();

        // Get all products
        const products = await Product.find({category:categoryId});
        // console.log(products)

        // Update the salePrice for each product
        for (const product of products) {
            const productOfferPrice =
                product.regularPrice - (product.regularPrice * product.productOffer) / 100 || 0;
                // console.log("product:",productOfferPrice);
                
            const categoryOfferPrice =
                product.regularPrice - (product.regularPrice * offer) / 100 || 0;
                // console.log("cat:",categoryOfferPrice)

            const finalPrice = Math.min(productOfferPrice, categoryOfferPrice);
            // console.log("final",finalPrice)
            product.salePrice = Math.round(finalPrice);

            // Save the updated product
            await product.save();
        }

        // Redirect to the category page
        res.redirect('/admin/catogary');
    } catch (error) {
        res.status(500).json({ status: false, message: "Internal server error" });
        console.error(error);
    }
};


// const removeCategoryOffer=async (req,res)=>{
//     try {
//         const id=req.query.id;
//         let categoryId=new mongoose.Types.ObjectId(id)
//         const Category = await category.findOne({_id:categoryId});
//         if(!Category){
//             return res.status(400).json({status:false,message:"category not found"})
//         }

//         // const percentage=category.addCategoryOffer;
//         // const products= await Product.find({category:categoryId});

//         // if(products.length>0){
//         //     for(const product of products){
//         //         product.salePrice = product.regularPrice //+=Math.floor(product.regularPrice*(percentage/100 ));
//         //         product.productOffer=0
//         //         await product.save()
//         //     }
//         // }
//         Category.categoryOffres=0
//         await Category.save()
//         res.redirect('/admin/catogary')
       
//     } catch (error) {
//         res.status(500).json({status:false,message:"internal server error"}) 
//         console.error(error);
        
//     }
// }

const removeCategoryOffer = async (req, res) => {
    try {
      // Assuming you're sending categoryId in the request body
      const categoryId = req.body.categoryId;
  
      // Validate if categoryId is valid
      if (!mongoose.Types.ObjectId.isValid(categoryId)) {
        return res.status(400).json({ success: false, message: 'Invalid category ID' });
      }
  
      // Find and delete the category offer (example logic)
      const Category = await category.findOne({ _id: categoryId });
  
      if (!Category) {
        return res.status(404).json({ success: false, message: 'Category not found' });
      }
      Category.categoryOffres=0;
      await Category.save()
      // Success response
      res.status(200).json({ success: true, message: 'Category offer removed successfully' });
    } catch (error) {
      console.error(error); // Log error for debugging
      res.status(500).json({ success: false, message: 'Internal server error' });
    }
  };
  

const getListCategory= async(req,res)=>{
    try {
        let id= req.query.id;
        await Category.updateOne({_id:id},{$set:{isListed:false}})
        res.redirect('/admin//catogary');
    } catch (error) {
        res.redirect("/pagenotfound")
        
    }
}

const getUnlistCategory= async (req,res)=>{
    try {
        let id= req.query.id;
        await Category.updateOne({_id:id},{$set:{isListed:true}})
        res.redirect('/admin//catogary')
    } catch (error) {
        res.redirect('/pagenotfound')
    }
}
const editCategory=async (req,res)=>{
    try {
        const id=req.query.id;
        // console.log("this id:",id)
        const category=await Category.findOne({_id:id})
        res.render("editCategory",{category:category});
    } catch (error) {
        res.redirect('/pagenotfound')
        
    }
}

const updateCategory= async (req,res)=>{
    try {
        const id= req.query.id;
        // console.log("the id is ",id)
        const {categoryName,description}=req.body;
        const  existingcategory= await Category.findOne({name:categoryName});
        
        if(existingcategory){
            return res.status(400).json({error:"Category already exist, Please choose any another name"})
        }

        const updateCategory= await Category.findByIdAndUpdate({_id:id},{name:categoryName,description:description},{new:true}) ;

        if(updateCategory){
            res.redirect('/admin/catogary')
        }else{
            res.status(400).json({error:"category not found "})
        }

    } catch (error) {
        res.status(500).json({error:"internal server error "})
        console.error(error);
    }
}

const getCategoryoffer= async(req,res)=>{
    try {
        const categories= await Category.find()
        res.render('addcategoryoffer',{categories})
    } catch (error) {
        
    }
}

module.exports = {
    categogtyInfo,
    addCatogary,
    addCategoryOffer,
    removeCategoryOffer,
    getListCategory,
    getUnlistCategory,
    editCategory,
    updateCategory,
    getCategoryoffer
    
}