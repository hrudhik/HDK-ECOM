const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const customerController = require('../controllers/customercontroller');
const catogaryController=require("../controllers/categoryController");
const brandController=require("../controllers/brandController");
const productController=require('../controllers/productController')
const salesReportController = require("../controllers/salesReportController");
const { userAuth, adminAuth } = require('../middlewares/auth');
const dashboardController= require('../controllers/dashboardController')
const {upload} = require('../helpers/multer')


router.get('/login', adminController.loadlogin);
router.post('/admin/login', adminController.login)
router.get('/',  adminAuth,adminController.loaddashBoard)
router.get('/pagenotfound', adminController.pagenotfound)
router.get('/logout', adminController.logout)

// userlisting rouout
router.get('/users',adminAuth, customerController.customerInfo)
//blocke and unblock user rout 
router.get('/blockCustomer',adminAuth,customerController.customerblocked)
router.get('/unblockCustomer',adminAuth,customerController.customerUnblocked)

//catogery management routs
router.get('/catogary',adminAuth,catogaryController.categogtyInfo)
router.post('/addCatogary',adminAuth,catogaryController.addCatogary)
router.get('/getCategoryoffer',adminAuth,catogaryController.getCategoryoffer)
router.post('/addCategoryOffer',adminAuth,catogaryController.addCategoryOffer);

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
// router.post('/addProduct',upload.array("images",4),productController.addProduct)
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
router.get("/sales-report/filter", salesReportController.getSalesReport);
router.get('/sales-report/pdf', salesReportController.downloadPdf);
router.get('/sales-report/excel', salesReportController.downloadExcel);



router.get('/best-selling-products',dashboardController.bestproduct);
router.get('/sales-report',dashboardController.graph)
router.get('/best-selling-brands',dashboardController.bestbrand)
router.get('/best-selling-categories',dashboardController.bestcategory)


















module.exports = router
