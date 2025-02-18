const Brand=require("../models/brandSchema");
const product= require("../models/productSchema")
const mongoose= require("mongoose")




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
      const formattedName = brand.trim().toUpperCase()
     
      const findBrand = await Brand.findOne({ brandName: formattedName });

      
      if (findBrand) {
        return res.status(400).json({ message: "Brand already exists." });
      }

      if (!findBrand) {
        const newBrand = new Brand({
          brandName: formattedName,
          
        });
        await newBrand.save();
        res.status(200).json({success:true,message:"Brand added successfully!"})
      } else {
        res.status(400).json({success:false, message:"Something went wrong Please try again later. " });
      }
    } catch (error) {
      console.error(error);
      res.status(500).json({success:false, message: "Internal server error." });
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
        const id=req.query
        // console.log("brandId",id);
        
        if(!id){
            return res.status(400).redirect('/pagenotfound');
        }
        let brandId=new mongoose.Types.ObjectId(id)
        // console.log("dghjrghgjkaehrgioahroighoairghoiuh",brandId)
        await Brand.deleteOne({_id:brandId});
        res.redirect('/admin/brands');
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