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
const bannerController= require('../controllers/bannerController')
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
router.post('/removeCategoryOffer',adminAuth,catogaryController.removeCategoryOffer);

router.get('/listCategory',adminAuth,catogaryController.getListCategory)
router.get('/unlistCategory',adminAuth,catogaryController.getUnlistCategory)
router.get('/editCategory',adminAuth,catogaryController.editCategory)
router.post('/editCategory',adminAuth,catogaryController.updateCategory)

//BRAND

router.get('/brands',adminAuth,brandController.getbrandPage)
router.post("/addBrand",adminAuth,upload.single("image"),brandController.addBrand)
router.get('/blockeBrand',adminAuth,brandController.blockBrand)
router.get('/unblockeBrand',adminAuth,brandController.unblockBrand)
router.get('/deletBrand',adminAuth,brandController.deleteBrand)


//product mandgement 

router.get("/addProducts",adminAuth,productController.addproductpage)
router.post('/addProduct',adminAuth,upload.array("images",4),productController.addProduct)
// router.post('/addProduct',upload.array("images",4),productController.addProduct)
router.get('/products',adminAuth,productController.allProduct)
router.get('/blockProduct',adminAuth,productController.blockProduct)
router.get('/unblockProduct',adminAuth,productController.unblockProduct)
router.get('/editProduct',adminAuth,productController.editProduct)
router.post('/editProduct/:id',adminAuth,upload.array("images",4),productController.updateProduct)
router.post('/deleteImage',adminAuth,productController.deleteoneimage)
router.get('/productOffer',adminAuth,productController.getproductOffer)
router.post('/product-offer',adminAuth,productController.addproductoffer)
router.get('/removeproductOffer',adminAuth,productController.removeOffer)

//serch
router.get('/admin/users',adminAuth, adminController.userserech);

router.get("/orders", adminAuth, adminController.getAllOrders);
router.get("/orders/:orderId",adminAuth,  adminController.getOrderDetails);
router.post("/orders/:orderId/:productId/status", adminAuth, adminController.updateOrderStatus);

//coupen 
router.get('/listcoupen',adminAuth,adminController.listCoupons)
router.post('/coupons/create',adminAuth,adminController.createCoupons)
router.post('/deleteCoupons/:id',adminAuth,adminController.deletCoupens)

//salesreport

router.get('/sales-report-page', adminAuth,salesReportController.renderSalesReportPage);
router.get("/sales-report/filter",adminAuth, salesReportController.getSalesReport);
router.get('/sales-report/pdf', adminAuth,salesReportController.downloadPdf);
router.get('/sales-report/excel', adminAuth,salesReportController.downloadExcel);



router.get('/best-selling-products',adminAuth,dashboardController.bestproduct);
router.get('/sales-report',adminAuth,dashboardController.graph)
router.get('/best-selling-brands',adminAuth,dashboardController.bestbrand)
router.get('/best-selling-categories',adminAuth,dashboardController.bestcategory)

//BannerMangement

router.get('/banner',adminAuth,bannerController.getBannerpage);
router.get('/addBanner',adminAuth,bannerController.getaddBanner);
router.post('/addBanner',adminAuth,upload.single("images"),bannerController.addBanner);
router.get('/deleteBanner',adminAuth,bannerController.deletBanner);











module.exports = router
