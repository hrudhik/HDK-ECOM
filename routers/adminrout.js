const express=require('express');
const router=express.Router();
const adminController = require('../controllers/adminController');
const {userAuth,adminAuth}=require('../middlewares/auth');


router.get('/login',adminController.loadlogin);
router.post('/admin/login',adminController.login)
router.get('/',adminAuth,adminController.loaddashBoard)
router.get('/pagenotfound',adminController.pagenotfound)














module.exports=router