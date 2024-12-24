const express = require('express');
const router = express.Router();
const passport = require("passport")
const userController = require('../controllers/userController');
const userproductController=require('../controllers/userproductController');
const profileController=require("../controllers/profileController")
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
router.post('/changepassword',profileController.changepassword)

//login and logOut 
router.get('/login', isLoggedIn, userController.loadlogin);
router.post('/login', isLoggedIn, userController.login);
router.get('/logout', userController.logout)

router.get('/productDetails',userAuth,userproductController.productDetails)




module.exports = router