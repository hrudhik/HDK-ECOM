const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const customerController = require('../controllers/customercontroller');
const catogaryController=require("../controllers/categoryController");
const brandController=require("../controllers/brandController");
const productController=require('../controllers/productController')

const { userAuth, adminAuth } = require('../middlewares/auth');
// const { Admin } = require('mongodb');
const multer= require('multer');
const storage=require('../helpers/multer');
const uploads=multer({storage:storage});




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
router.get('/editCategory',adminAuth,catogaryController.editCategory)
router.post('/editCategory',adminAuth,catogaryController.updateCategory)

//BRAND

router.get('/brands',adminAuth,brandController.getbrandPage)
router.post("/addBrand",adminAuth,uploads.single("image"),brandController.addBrand)
router.get('/blockeBrand',adminAuth,brandController.blockBrand)
router.get('/unblockeBrand',adminAuth,brandController.unblockBrand)
router.get('/deletBrand',adminAuth,brandController.deleteBrand)


//product mandgement 

router.get("/addProducts",adminAuth,productController.addproductpage)
















module.exports = router


// const express = require('express');
// const router = express.Router();
// const adminController = require('../controllers/adminController');
// const customerController = require('../controllers/customercontroller');
// const catogaryController=require("../controllers/categoryController");
// const brandController=require("../controllers/brandController");
// const { userAuth, adminAuth } = require('../middlewares/auth');
// // const { Admin } = require('mongodb');
// const multer= require('multer');
// const storage=require('../helpers/multer');
// const uploads=multer({storage:storage});


// const express = require('express');
// const router = express.Router();
// const adminController = require('../controllers/adminController');
// const customerController = require('../controllers/customercontroller');
// const categoryController = require("../controllers/categoryController");
// const brandController = require("../controllers/brandController");
// const { userAuth, adminAuth } = require('../middlewares/auth');
// const { upload } = require('../helpers/multer'); // Import the upload instance

// router.get('/login', adminController.loadlogin);
// router.post('/admin/login', adminController.login);
// router.get('/', adminAuth, adminController.loaddashBoard);
// router.get('/pagenotfound', adminController.pagenotfound);
// router.get('/logout', adminController.logout);

// // User management routes
// router.get('/users', adminAuth, customerController.customerInfo);
// router.get('/blockCustomer', adminAuth, customerController.customerblocked);
// router.get('/unblockCustomer', adminAuth, customerController.customerUnblocked);

// // Category management routes
// router.get('/catogary', adminAuth, categoryController.categogtyInfo);
// router.post('/addCatogary', adminAuth, categoryController.addCatogary);
// router.get('/listCategory', adminAuth, categoryController.getListCategory);
// router.get('/unlistCategory', adminAuth, categoryController.getUnlistCategory);
// router.get('/editCategory', adminAuth, categoryController.editCategory);
// router.post('/editCategory', adminAuth, categoryController.updateCategory);

// // Brand management routes
// router.get('/brands', adminAuth, brandController.getbrandPage);
// router.post("/addBrand", adminAuth, upload.single("image"), brandController.addBrand);

// module.exports = router;
