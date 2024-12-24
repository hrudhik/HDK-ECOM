const Product = require("../models/productSchema");
const Category = require("../models/categorySchema");
const Brand = require("../models/brandSchema");
const User = require("../models/userSchema");
const fs = require("fs");
const path = require("path");
const sharp = require("sharp");

const addproductpage = async (req, res) => {
    try {
        const category = await Category.find({ isListed: true });
        const brand = await Brand.find({ isBlocked: false });
        res.render("addProduct", {
            cat: category,
            brand: brand,
        });
    } catch (error) {
        console.error(error);
        res.redirect("/pagenotfound");
    }
};

const addProduct = async (req, res) => {
    try {
        const products = req.body;

        
        const existingProduct = await Product.findOne({
            productName: products.productName,
        });

        if (existingProduct) {
            return res
                .status(400)
                .json("Product already exists. Please try with another name.");
        }

        // Resize and save images
        const images = [];
        if (req.files && req.files.length > 0) {
            const uploadDir = path.join("public", "uploads", "product-images");
            if (!fs.existsSync(uploadDir)) {
                fs.mkdirSync(uploadDir, { recursive: true });
            }

            for (const file of req.files) {
                const originalImagePath = file.path;
                const resizedImagePath = path.join(uploadDir, file.filename);

                await sharp(originalImagePath)
                    .resize({ width: 440, height: 440 })
                    .toFile(resizedImagePath);

                images.push(file.filename);
            }
        }

        // Find category ID
        const categoryId = await Category.findOne({ name: products.category });
        if (!categoryId) {
            return res.status(400).json("Invalid category name");
        }

        // Create new product
        const newProduct = new Product({
            productName: products.productName,
            description: products.description,
            brand: products.brand,
            category: categoryId._id,
            regularPrice: products.regularPrice,
            salePrice: products.salePrice,
            createdOn: new Date(),
            quantity: products.quantity,
            size: products.size,
            color: products.color,
            productImage: images,
            status: "Available",
        });

        await newProduct.save();
        res.redirect("/admin/addProducts");
    } catch (error) {
        console.error("Error saving product:", error);
        res.status(500).redirect("/pagenotfound");
    }
};

const allProduct = async (req, res) => {
    try {
        const search = req.query.search || "";
        const page = req.query.page || 1;
        const limit = 4;

        const productData = await Product.find({
            $or: [
                { productName: { $regex: new RegExp(".*" + search + ".*", "i") } },
                { brand: { $regex: new RegExp(".*" + search + ".*", "i") } },
            ],
        })
            .limit(limit)
            .skip((page - 1) * limit)
            .populate("category")
            .exec();

        const count = await Product.find({
            $or: [
                { productName: { $regex: new RegExp(".*" + search + ".*", "i") } },
                { brand: { $regex: new RegExp(".*" + search + ".*", "i") } },
            ],
        }).countDocuments();

        const categories = await Category.find({ isListed: true });
        const brands = await Brand.find({ isBlocked: true });

        if (categories && brands) {
            res.render("product", {
                data: productData,
                currentPage: page,
                totalPage: Math.ceil(count / limit),
                cat: categories,
                brand: brands,
            });
        } else {
            res.redirect("/pagenotfound");
        }
    } catch (error) {
        console.error("Error fetching products:", error);
        res.redirect("/pagenotfound");
    }
};

// const allProduct = async function (req, res) {
//     const page = parseInt(req.query.page) || 1;
//     const limit = 4;
//     const skip = (page - 1) * limit;

//     try {
//         const totalProducts = await Product.countDocuments();
//         const products = await Product.find()
//             .populate('category')
//             .sort({createdAt:-1})
//             .skip(skip)
//             .limit(limit);

//         const totalPages = Math.ceil(totalProducts / limit);

//         return res.render('product', { products, currentPage: page, totalPages });
//     } catch (error) {
//         console.log(error);
//         return res.redirect('/pagenotfound')
//     }
// };

const blockProduct = async (req, res) => {
    try {
        let id = req.query.id;
        await Product.updateOne({ _id: id }, { $set: { isBlocked: true } });
        res.redirect("/admin/products");
    } catch (error) {
        res.redirect("/pagenotfound");
    }
};

const unblockProduct = async (req, res) => {
    const id = req.query.id;
    await Product.updateOne({ _id: id }, { $set: { isBlocked: false } });
    res.redirect("/admin/products");
};

const editProduct = async (req, res) => {
    try {
        const id = req.query.id;
        const product = await Product.findOne({ _id: id });
        const category = await Category.find({});
        const brand = await Brand.find({});
        res.render("editProduct", {
            product: product,
            cat: category,
            brand: brand,
        });
    } catch (error) {
        console.error(error);
        res.redirect("/pagenotdound");
    }
};

// const updateProduct=async (req,res)=>{
//     try {
//         const id = req.params.id;
//         console.log("id",id)
//         const product = await Product.findOne({_id:id});
//         console.log("product")

//         const data = req.body;
//         console.log(data)
//         const existingProduct= await Product.findOne({
//             productName:data.productName,
//             _id:{$ne:id}
//         })
//         console.log(existingProduct)

//         if(existingProduct){
//             return res.status(400).json({error:"Product is allready exist, Please try again with another name "})
//         }

//         console.log("exist")

//         const image=[];
//         console.log("image")

//         if(req.files && req.files.length>0){
//             for(let i=0;i<req.files.length;i++){
//                 image.push(req.files[i].filename)
//             }

//         }

//         const updateFields={
//             productName:data.productName,
//             description:data.description,
//             brand:data.brand,
//             category:product.category,
//             regularPrice:product.regularPrice,
//             salePrice:data.salePrice,
//             quantity:data.quantity,
//             size:data.size,
//             color:data.color
//         }
//         console.log("hai")
//         if(req.files.length>0){
//             updateFields.$push={productImage:{$each:image}}
//         }
//         console.log("hello")
//         await Product.findByIdAndUpdate(id,updateFields,{new:true});
//         res.redirect('/admin/products')

//     } catch (error) {
//         // console.error(error);
//         res.redirect('/pagenotfound')

//     }
// }

const updateProduct = async (req, res) => {
    try {
        const id = req.params.id.replace(/^id=/, "");
        // console.log("Extracted Product ID:", id);

        if (!id.match(/^[0-9a-fA-F]{24}$/)) {
            return res.status(400).json({ error: "Invalid Product ID format" });
        }

        const product = await Product.findOne({ _id: id });
        if (!product) {
            return res.status(404).json({ error: "Product not found" });
        }

        const data = req.body;
        // console.log("Request body data:", data);

        const existingProduct = await Product.findOne({
            productName: data.productName,
            _id: { $ne: id },
        });
        if (existingProduct) {
            return res.status(400).json({
                error: "Product already exists. Please try again with another name.",
            });
        }

        const image = [];
        if (req.files && req.files.length > 0) {
            for (let i = 0; i < req.files.length; i++) {
                image.push(req.files[i].filename);
            }
        }

        const updateFields = {
            productName: data.productName,
            description: data.description,
            brand: data.brand,
            category: product.category,
            regularPrice: data.regularPrice,
            salePrice: data.salePrice,
            quantity: data.quantity,
            size: data.size,
            color: data.color,
        };

        if (image.length > 0) {
            updateFields.$push = { productImage: { $each: image } };
        }

        console.log("Update fields:", updateFields);

        await Product.findByIdAndUpdate(id, updateFields, { new: true });

        console.log("Product updated successfully");
        res.redirect("/admin/products");
    } catch (error) {
        console.error("Error updating product:", error);
        res.redirect("/pagenotfound");
    }
};

// const deleteoneimage = async (req, res) => {
//     try {
//         const { imageNameToServer, productIdToServer } = req.body;
//         const product = await Product.findByIdAndUpdate(productIdToServer, {
//             $pull: { productImage: imageNameToServer },
//         });
//         const imagePath = path.join(
//             "public",
//             "uplods",
//             "re-image",
//             imageNameToServer
//         );
//         if (fs.existsSync(imagePath)) {
//             await fs.unlinkSync(imagePath);
//             console.log(`Image ${imageNameToServer}delete successfully `);
//         } else {
//             console.log(`Image ${imageNameToServer}not found `);
//         }
//         res.send({ status: true });
//     } catch (error) {
//         console.error(error);

//         res.redirect("/pagenotfound");
//     }
// };

// const fs = require('fs');
// const path = require('path');
// const Product = require('./models/Product'); // Adjust path to your Product model
// const deleteoneimage = async (req, res) => {
//     try {
//         const { imageNameToServer, productIdToServer } = req.body;

//         // Validate request body
//         if (!imageNameToServer || !productIdToServer) {
//             return res.status(400).send({ status: false, message: "Invalid data" });
//         }

//         // Update product in the database
//         const product = await Product.findByIdAndUpdate(productIdToServer, {
//             $pull: { productImage: imageNameToServer },
//         });

//         if (!product) {
//             return res.status(404).send({ status: false, message: "Product not found" });
//         }

//         // Build the file path
//         const imagePath = path.join(__dirname, "public", "uploads", "product-images", imageNameToServer);

//         // Delete the image file
//         if (fs.existsSync(imagePath)) {
//             fs.unlinkSync(imagePath); // Synchronous file deletion
//             console.log(`Image ${imageNameToServer} deleted successfully.`);
//         } else {
//             console.log(`Image ${imageNameToServer} not found.`);
//         }

//         res.send({ status: true });
//     } catch (error) {
//         console.error("Error deleting image:", error);
//         res.status(500).send({ status: false, message: "Internal Server Error" });
//     }
// };
// const fs = require('fs');
// const path = require('path');

// const deleteoneimage= async (req, res) => {
//   const {imgname,id}= req.params
//   console.log(imgname)
//     console.log('id',id)

//   try {
//     // Remove the image from the database using $pull
//     const product = await Product.findByIdAndUpdate(
//       productId,
//       { $pull: { images: imageName } },
//       { new: true } // Return the updated document
//     );

//     if (!product) {
//       return res.status(404).json({ message: 'Product not found!', type: 'error' });
//     }

//     // Delete the image file from the server (if stored locally)
//     const imagePath = path.join(__dirname, 'public/uploads/', imageName);
//     if (fs.existsSync(imagePath)) {
//       fs.unlinkSync(imagePath);
//     }

//     res.json({ message: 'Image deleted successfully!', type: 'success' });
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ message: 'Something went wrong!', type: 'error' });
//   }
// };
const deleteoneimage = async (req, res) => {
    try {
        const { imageNameToServer, productIdToServer } = req.body;
        console.log(imageNameToServer, productIdToServer)

        // Validate request body
        if (!imageNameToServer || !productIdToServer) {
            return res.status(400).json({ status: false, message: "Invalid data provided" });
        }

        // Find the product and pull the image name from the productImage array
        const product = await Product.findByIdAndUpdate(productIdToServer, {
            $pull: { productImage: imageNameToServer },
        });

        if (!product) {
            return res.status(404).json({ status: false, message: "Product not found" });
        }

        // Build the file path to delete the image file
        const imagePath = path.join(__dirname, "public", "uploads", "product-images", imageNameToServer);

        if (fs.existsSync(imagePath)) {
            fs.unlink(imagePath, (err) => {
                if (err) {
                    console.error("Failed to delete file:", err);
                    return res.status(500).json({ status: false, message: "File deletion failed" });
                }
                console.log(`Image ${imageNameToServer} deleted successfully.`);
            });
        } else {
            console.log(`Image ${imageNameToServer} not found.`);
        }

        res.status(200).json({ status: true, message: "Image deleted successfully" });
    } catch (error) {
        console.error("Error deleting image:", error);
        res.status(500).json({ status: false, message: "Internal Server Error" });
    }
};




module.exports = {
    addproductpage,
    addProduct,
    allProduct,
    unblockProduct,
    blockProduct,
    editProduct,
    updateProduct,
    deleteoneimage,
};
