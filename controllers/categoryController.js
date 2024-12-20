const Category = require("../models/categorySchema");
const category = require("../models/categorySchema");
const Product=require("../models/productSchema");






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
// const addCatogary = async (req, res) => {
//     const { name, description } = req.body;

//     try {
//         const existCatogary = await category.findOne({ name });
//         if (existCatogary) {
//             return res.status(400).json({ error: "Category already exists" });
//         }

//         const newCategory = new category({
//             name,
//             description,
//         });

//         await newCategory.save();
//         return res.json({ message: "Category added successfully." });
//     } catch (error) {
//         console.log(error);
//         res.status(500).json({ error: "Internal server error" });
//     }
// };
const addCatogary = async (req, res) => {
    const { name, description } = req.body;
    // console.log(name,description)

    // Input validation
    if (!name || !description) {
        return res.status(400).json({ status: false, error: "Name and description are required." });
    }

    try {
        // Check if the category already exists
        const existingCategory = await category.findOne({ name: name.trim() });
        if (existingCategory) {
            return res.status(400).json({ status: false, error: "Category already exists." });
        }

        // Create and save the new category
        const newCategory = new category({
            name: name.trim(), // Trim whitespace
            description: description.trim(),
        });

        await newCategory.save();

        return res.redirect('/admin/catogary');
    } catch (error) {
        console.error("Error adding category:", error);
        return res.status(500).json({ status: false, error: "Internal server error." });
    }
};


const addCategoryOffer= async (req,res)=>{
    try {
        const percentage= parseInt(req.body.percentage);
        const categoryId= req.body.categoryId;
        const Category= await category.findById(categoryId);
        if(!Category){
            return res.status(400).json({status:false,message:"category cant found"})
        }
        const products=  await Product.find({category:categoryId});
        const hasProductOffer= products.some((product)=>product.productOffer>percentage);
        if(hasProductOffer){
            return res.json({status:false, message:"Product in this catogary have already offer "})
        }
        await Category.updateOne({_id:categoryId},{$set:{categoryOffer:percentage}});

        for(const product of products){
            product.productOffer=percentage;
            product.salePrice=product.regularPrice //-Math.floor(product.regularPrice*(percentage/100));
            await product.save();
 
        }
        res.json({status:true});
    } catch (error) {
        res.status(500).json({status:false,message:"internal server error"})
        console.error(error);
        
    }
}

const removeCategoryOffer=async (req,res)=>{
    try {
        const categoryId=req.body.categoryId;
        const Category = await category.findById({categoryId});
        if(!Category){
            return res.status(400).json({status:false,message:"category not found"})
        }

        // const percentage=category.addCategoryOffer;
        const products= await Product.find({category:categoryId});

        if(products.length>0){
            for(const product of products){
                product.salePrice = product.regularPrice //+=Math.floor(product.regularPrice*(percentage/100 ));
                product.productOffer=0
                await product.save()
            }
        }
        Category.categoryOffer=0
        await Category.save()
       
    } catch (error) {
        res.status(500).json({status:false,message:"internal server error"}) 
        console.error(error);
        
    }
}

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

module.exports = {
    categogtyInfo,
    addCatogary,
    addCategoryOffer,
    removeCategoryOffer,
    getListCategory,
    getUnlistCategory,
    editCategory,
    updateCategory
    
}