const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const customerController = require('../controllers/customercontroller');
const catogaryController=require("../controllers/categoryController")
const { userAuth, adminAuth } = require('../middlewares/auth');
const { Admin } = require('mongodb');


router.get('/login', adminController.loadlogin);
router.post('/admin/login', adminController.login)
router.get('/', adminAuth, adminController.loaddashBoard)
router.get('/pagenotfound', adminController.pagenotfound)
router.get('/logout', adminController.logout)

// userlisting rouout
router.get('/users', adminAuth,customerController.customerInfo)
//blocke and unblock user rout 
router.get('/blockCustomer',adminAuth,customerController.customerblocked)
router.get('/unblockCustomer',adminAuth,customerController.customerUnblocked)

//catogery management routs
router.get('/catogary',adminAuth,catogaryController.categogtyInfo)
router.post('/addCatogary',adminAuth,catogaryController.addCatogary)

// router.post('/addCatergoryOffer',adminAuth,catogaryController.addCategoryOffer)
// router.get('/removeCategoryOffer',adminAuth,catogaryController.removeCategoryOffer)

router.get('/listCategory',adminAuth,catogaryController.getListCategory)
router.get('/unlistCategory',adminAuth,catogaryController.getUnlistCategory)















module.exports = router