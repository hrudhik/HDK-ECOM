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
            totalPages,
            totalCatagorys
        });
    } catch (error) {
        console.log(error);
        res.redirect('/pagenotfound');
    }
};

const addCatogary = async (req, res) => {
    const { name, description } = req.body;

    if (!name || !description) {
        return res.status(400).json({ status: false, message: "Name and description are required." });
    }

    try {
        const formattedName = name.trim().charAt(0).toUpperCase() + name.trim().slice(1).toLowerCase();

        const existingCategory = await category.findOne({ name: formattedName });
        if (existingCategory) {
            return res.status(400).json({
                status: false,
                message: "Category already exists!"
            });
        }

        const newCategory = new category({
            name: formattedName,
            description: description.trim(),
        });

        await newCategory.save();
        return res.status(201).json({ status: true, message: "Category added successfully!" });

    } catch (error) {
        console.error("Error adding category:", error);
        return res.status(500).json({ status: false, message: "Internal server error." });
    }
};


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
const updateCategory = async (req, res) => {
    try {
        const id = req.query.id;
        const { categoryName, description } = req.body;

        // Format category name (Capitalize first letter, rest lowercase)
        const formattedName = categoryName.trim().charAt(0).toUpperCase() + categoryName.trim().slice(1).toLowerCase();

        // Check if another category with the same name exists (excluding current ID)
        const existingCategory = await Category.findOne({ name: formattedName, _id: { $ne: id } });

        if (existingCategory) {
            return res.status(400).json({ error: "Category already exists. Please choose another name." });
        }

        // Update the category
        const updatedCategory = await Category.findByIdAndUpdate(
            id,
            { name: formattedName, description: description.trim() },
            { new: true }
        );

        if (updatedCategory) {
            return res.status(200).json({ success: true, message: "Category updated successfully." });
        } else {
            return res.status(404).json({ error: "Category not found." });
        }
    } catch (error) {
        console.error("Error updating category:", error);
        return res.status(500).json({ error: "Internal server error." });
    }
};


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