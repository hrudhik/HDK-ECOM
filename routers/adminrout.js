const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const customerController = require('../controllers/customercontroller');
const catogaryController=require("../controllers/categoryController");
const brandController=require("../controllers/brandController");
const productController=require('../controllers/productController')
const salesReportController = require("../controllers/salesReportController");
const { userAuth, isAdmin } = require('../middlewares/auth');
const {upload} = require('../helpers/multer')
// const { Admin } = require('mongodb');
// const multer= require('multer');
// const storage=require('../helpers/multer');
// const uploads=multer({storage:storage});




router.get('/login', adminController.loadlogin);
router.post('/admin/login', adminController.login)
router.get('/',  adminController.loaddashBoard)
router.get('/pagenotfound', adminController.pagenotfound)
router.get('/logout', adminController.logout)

// userlisting rouout
router.get('/users', customerController.customerInfo)
//blocke and unblock user rout 
router.get('/blockCustomer',customerController.customerblocked)
router.get('/unblockCustomer',customerController.customerUnblocked)

//catogery management routs
router.get('/catogary',catogaryController.categogtyInfo)
router.post('/addCatogary',catogaryController.addCatogary)
router.get('/getCategoryoffer',catogaryController.getCategoryoffer)
router.post('/addCategoryOffer',catogaryController.addCategoryOffer);

// router.post('/addCatergoryOffer',adminAuth,catogaryController.addCategoryOffer)
// router.get('/removeCategoryOffer',catogaryController.removeCategoryOffer)
router.post('/removeCategoryOffer',catogaryController.removeCategoryOffer);

router.get('/listCategory',catogaryController.getListCategory)
router.get('/unlistCategory',catogaryController.getUnlistCategory)
router.get('/editCategory',catogaryController.editCategory)
router.post('/editCategory',catogaryController.updateCategory)

//BRAND

router.get('/brands',brandController.getbrandPage)
router.post("/addBrand",upload.single("image"),brandController.addBrand)
router.get('/blockeBrand',brandController.blockBrand)
router.get('/unblockeBrand',brandController.unblockBrand)
router.get('/deletBrand',brandController.deleteBrand)


//product mandgement 

router.get("/addProducts",productController.addproductpage)
router.post('/addProduct',upload.array("images",4),productController.addProduct)
router.post('/addProduct',upload.array("images",4),productController.addProduct)
router.get('/products',productController.allProduct)
router.get('/blockProduct',productController.blockProduct)
router.get('/unblockProduct',productController.unblockProduct)
router.get('/editProduct',productController.editProduct)
router.post('/editProduct/:id',upload.array("images",4),productController.updateProduct)
router.post('/deleteImage',productController.deleteoneimage)
router.get('/productOffer',productController.getproductOffer)
router.post('/product-offer',productController.addproductoffer)

//serch
router.get('/admin/users', adminController.userserech);

router.get("/orders",  adminController.getAllOrders);
router.get("/orders/:orderId",  adminController.getOrderDetails);
router.post("/orders/:orderId/:productId/status",  adminController.updateOrderStatus);

//coupen 
router.get('/listcoupen',adminController.listCoupons)
router.post('/coupons/create',upload.single("couponImage"),adminController.createCoupons)
router.post('/deleteCoupons/:id',adminController.deletCoupens)

//salesreport

router.get('/sales-report-page', salesReportController.renderSalesReportPage);
router.get("/sales-report", salesReportController.getSalesReport);
router.post('/sales-report/pdf', salesReportController.downloadPdf);
router.post('/sales-report/excel', salesReportController.downloadExcel);



















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
