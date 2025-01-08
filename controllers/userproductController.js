const Product=require('../models/productSchema');
const Category=require('../models/categorySchema');
const User=require('../models/userSchema');


// const productDetails = async (req, res) => {
//     try {
//         const userId = req.session.user; // Current logged-in user
//         const userData = await User.findById(userId); // Fetch user data
//         const productId = req.query.id; // Product ID from query params
//         const product = await Product.findById(productId).populate('category'); // Fetch product details and populate category

//         // Check if the category and offers exist
//         const findCategory = product?.category;
//         const categoryOffers = findCategory?.categoryOffer || 0;

//         // Render the product details page with required data
//         res.render('productDetails', {
//             user: userData,
//             product: product,
//             quantity: product?.quantity || 0,
//             category: findCategory,
//             categoryOffers: categoryOffers
//         });
//     } catch (error) {
//         console.error(error); // Log the error for debugging
//         res.redirect('/pagenotfound'); // Redirect to a 404 page
//     }
// };
const productDetails = async (req, res) => {
    try {
        const userId = req.session.user;

        const userData = await User.findById(userId)

        const { id: productId } = req.query;

        const product = await Product.findById(productId).populate('category');
        console.log(product,"product")

        const findCategory = product.category;
        console.log(findCategory,'category');
        
        const categoryOffer = findCategory?.categoryOffer || 0;
        const productOffer = product.productOffer || 0;

        const totalOffer = categoryOffer + productOffer

        res.render('productDetails', {
            user: userData,
            product: product,
            quantity: product.quantity,
            totalOffer: totalOffer,
            category: findCategory
        })

    } catch (error) {
        console.log("Error on fetching productdetails ", error);
        res.redirect("/pageNotFound")
    }
}


// const productDetails = async (req, res) => {
//     try {
//       const userId = req.session.user; // Current logged-in user
//       const userData = await User.findById(userId); // Fetch user data
//       const productId = req.query.id; // Product ID from query params
//       const product = await Product.findById(productId).populate('category'); // Fetch product details and populate category
  
//       // Check if the product and its category exist
//       const findCategory = product?.category;
//       const categoryOffers = findCategory?.categoryOffer || 0;
  
//       // Array of product images (default if none are provided)
//       const productImages = product.images?.length
//         ? product.images
//         : [
//             '/imgs/products/product-placeholder.jpg',
//             '/imgs/products/product-placeholder2.jpg',
//             '/imgs/products/product-placeholder3.jpg',
//             '/imgs/products/product-placeholder4.jpg',
//           ];
  
//       // Render the product details page
//       res.render('productDetails', {
//         user: userData,
//         product: product,
//         quantity: product?.quantity || 0,
//         category: findCategory,
//         categoryOffers: categoryOffers,
//         productImages: productImages, // Pass product images array to EJS
//       });
//     } catch (error) {
//       console.error(error); // Log the error for debugging
//       res.redirect('/pagenotfound'); // Redirect to a 404 page
//     }
//   };
  

module.exports={
    productDetails,
    
}