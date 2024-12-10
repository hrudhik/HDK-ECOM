const express=require('express');
const router=express.Router();
const passport=require("passport")
const userController = require('../controllers/userController');
 

router.get('/pagenotfound',userController.pagenotfound);
router.get('/',userController.loadhomepage);
router.get('/signup',userController.loadsignUp);
router.post('/signup',userController.signUp);
router.post('/verify-otp',userController.verifyotp)
router.post('/resend-otp',userController.resendotp)

router.get('/auth/google',passport.authenticate('google',{scope:['profile','email']}));
router.get('/auth/google/callback',passport.authenticate('google',{failureRedirect:'/signup'}),
    (req, res) => {
        res.redirect('/');
    }
);
router.get('/google/callback', 
    passport.authenticate('google', { failureRedirect: '/signup' }), 
    (req, res) => {
      res.redirect('/');
    }
  );

  router.get('/login',userController.loadlogin);
  router.post('/login',userController.login);




module.exports=router