const express=require('express');
const router=express.Router();
const userController = require('../controllers/userController');
 

router.get('/pagenotfound',userController.pagenotfound);
router.get('/',userController.loadhomepage);
router.get('/signup',userController.loadsignUp);
router.post('/signup',userController.signUp);
router.post('/verify-otp',userController.verifyotp)
router.post('/resend-otp',userController.resendotp)






module.exports=router