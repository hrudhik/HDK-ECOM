const Brand=require("../models/brandSchema");
const product= require("../models/productSchema")




// const getbrandPage= async (req,res)=>{
//     try {
//         const page=parseInt(req.query.page)  || 1;
//         const limit= 4;
//         const skip=(page-1)*limit;

//         const brandData= await Brand.find({}).sort({createdAt:-1}).skip(skip).limit(limit);
//         const totalBrands= await Brand.countDocuments();
//         const totalPages =Math.ceil(totalBrands/limit);
//         const reverseBrand= brandData.reverse();
//         res.render('brand',{
//             data:reverseBrand,
//             currentPage:page,
//             totalPages:totalPages,
//             titalBrands:totalBrands
//         })

//     } catch (error) {
//         res.redirect('/pagenotfound');
//         console.error(error);
        
        
//     }
// }

// const addBrand= async (req,res)=>{
//     try {
//         const brand=raq.body.name;
//         const findBand= await Brand.findOne({brand});
//         if(!findBand){
//             const image=req.file.filename;
//             const newBrand= new Brand({
//                 brandName:brand,
//                 brandImage:image
//             })
//             await newBrand.save();
//             res.redirect('/admin/brands')
//         }
        
//     } catch (error) {
//         res.redirect('/pagenotefound')
        
//     }
// }



const getbrandPage = async (req, res) => {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = 4;
      const skip = (page - 1) * limit;
  
      const brandData = await Brand.find({})
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit);
      const totalBrands = await Brand.countDocuments();
      const totalPages = Math.ceil(totalBrands / limit);
  
      res.render('brand', {
        data: brandData,
        currentPage: page,
        totalPages: totalPages,
        totalBrands: totalBrands
      });
    } catch (error) {
      console.error(error);
      res.redirect('/pagenotfound');
    }
  };
  
  const addBrand = async (req, res) => {
    try {
      const brand = req.body.name;
      const findBrand = await Brand.findOne({ brandName: brand });
      
      if (!findBrand) {
        const image = req.file.filename; // Uploaded image filename
        const newBrand = new Brand({
          brandName: brand,
          brandImage: image
        });
        await newBrand.save();
        res.redirect('/admin/brands');
      } else {
        res.send("Brand already exists");
      }
    } catch (error) {
      console.error(error);
      res.redirect('/pagenotfound');
    }
  };


  const blockBrand=async (req,res)=>{
    try {
        const id=req.query.id;
        await Brand.updateOne({_id:id},{$set:{isBlocked:true}});
        res.redirect("/admin/brands")
    } catch (error) {
        res.redirect('/pagenotfound')
    }
  }


  const unblockBrand = async (req,res)=>{
    try {
        const id=req.query.id;
        await Brand.updateOne({_id:id},{$set:{isBlocked:false}});
        res.redirect('/admin/brands')
        
    } catch (error) {
        res.redirect('/pagenotfound')
    }
   
  }

const deleteBrand= async(req,res)=>{
    try {
        const {id}=req.query
        if(!id){
            return res.status(400).redirect('/pagenotfound');
        }
        await Brand.deleteOne({_id:id});
        res.redirect('/admin/brads');
    } catch (error) {
        console.error(error);
        res.status(500).redirect('/pagenotfound')
    }
}



module.exports={
    getbrandPage,
    addBrand,
    blockBrand,
    unblockBrand,
    deleteBrand
}