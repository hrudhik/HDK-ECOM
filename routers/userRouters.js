const express=require('express');
const router=express.Router();
const userController = require('../controllers/userController');
 

router.get('/pagenotfound',userController.pagenotfound);
router.get('/',userController.loadhomepage);





module.exports=router