const express = require('express');
const router = express.Router();
const passport = require("passport")
const userController = require('../controllers/userController');
const userproductController=require('../controllers/userproductController');
const profileController=require("../controllers/profileController");
const cartControllrer=require('../controllers/cartController')
const { userAuth, adminAuth, isLoggedIn } = require('../middlewares/auth');


router.get('/pagenotfound', userController.pagenotfound);
router.get('/', userController.loadhomepage);
router.get('/signup', userController.loadsignUp);
router.post('/signup', userController.signUp);
router.post('/verify-otp', userController.verifyotp)
router.post('/resend-otp', userController.resendotp)

router.get('/auth/google', passport.authenticate('google', { scope: ['profile', 'email'] }));
router.get('/auth/google/callback', passport.authenticate('google', { failureRedirect: '/signup' }),
  (req, res) => {
    res.redirect('/');
  }
);
// router.get('/google/callback',
//   passport.authenticate('google', { failureRedirect: '/signup' }),
//   (req, res) => {
//     res.redirect('/');
//   }
// );

router.get('/google/callback',
  passport.authenticate('google', { failureRedirect: '/signup', failureMessage: true }),
  (req, res) => {
      // If login is successful
      if (req.user) {
          return res.redirect('/');
      }
      // If login fails (e.g., blocked user)
      req.flash('error', 'Your account is blocked. Please contact support.');
      res.redirect('/signup');
  }
);

// user profile management 
router.get('/userprofile',userAuth,profileController.userProfile);
router.get('/forgotpassword',profileController.forgotpassword);
router.post('/mailverification',profileController.mailverification);
router.post('/verify-fpsotp',profileController.verifyotp);
router.post('/resendfpdotp',profileController.resendfpdotp);
router.get('/resetpassword',profileController.loadresetpassword);
router.post('/newpassword',profileController.newpassword);
router.get('/loadchangepassword',(req,res)=>{
  res.render('cangepassword');
})
router.post('/changepassword',profileController.changepassword);

//address management 
router.get('/addaddress',userAuth,profileController.getassAddress);
router.post('/addAddress',userAuth,profileController.addAddress)
router.get('/editAddress',userAuth,profileController.editAddress)
router.post('/editAddress',userAuth,profileController.postEditAddress)
router.get('/deleteAddress',userAuth,profileController.deleteAddress)

//shope page
router.get('/shope',userAuth,userController.loadshopePage);
router.get('/filterPrice',userAuth,userController.filterbyprice)
router.get('/getFilteredProducts',userAuth,userController.getFilteredProducts)

//cart
router.get('/cart',userAuth,cartControllrer.cart)
router.post('/addTocart',userAuth,cartControllrer.addToCart);
router.post("/updateQuantity/:productId",cartControllrer.updateCartQuantity);
router.get("/remove/:productId",cartControllrer.removeProductFromCart);
router.get('/wishlist',userAuth,cartControllrer.loadwhishlist);
router.post('/addTowishlist',userAuth,cartControllrer.addToWishlist)
router.post('/wishlist/remove', userAuth,cartControllrer.removeFromWishlist);
router.get("/getcheckout",userAuth, cartControllrer.getcheckout)
router.post("/checkout/process" , userAuth,cartControllrer.placeOrder);
router.post('/orders/:orderId/product/:productId/cancel',userAuth,cartControllrer.cancelOrder);


// router.get('/order-confirmation', userAuth, cartControllrer.getOrderConfirmation);




//login and logOut b 
router.get('/login', isLoggedIn, userController.loadlogin);
router.post('/login', isLoggedIn, userController.login);
router.get('/logout', userController.logout)

router.get('/productDetails',userAuth,userproductController.productDetails)




module.exports = router