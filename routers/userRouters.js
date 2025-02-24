const express = require("express");
const router = express.Router();
const passport = require("passport");
const userController = require("../controllers/userController");
const userproductController = require("../controllers/userproductController");
const profileController = require("../controllers/profileController");
const cartControllrer = require("../controllers/cartController");
const paymentController = require("../controllers/paymentController");
const { userAuth, adminAuth, isLoggedIn } = require("../middlewares/auth");

router.get("/pagenotfound", userController.pagenotfound);
router.get("/", userController.loadhomepage);
router.get("/signup", userController.loadsignUp);
router.post("/signup", userController.signUp);
router.post("/verify-otp", userController.verifyotp);
router.post("/resend-otp", userController.resendotp);

router.get(
  "/auth/google",
  passport.authenticate("google", {
    scope: ["profile", "email"],
    prompt: "select_account",
  })
);
router.get(
  "/auth/google/callback",
  passport.authenticate("google", { failureRedirect: "/signup" }),
  (req, res) => {
    console.log(req.session, "this is from the goole auth session ");
    res.redirect("/");
  }
);
// router.get('/google/callback',
//   passport.authenticate('google', { failureRedirect: '/signup' }),
//   (req, res) => {
//     res.redirect('/');
//   }
// );

router.get(
  "/google/callback",
  passport.authenticate("google", {
    failureRedirect:
      "/signup?errorr=Your account is blocked. Please contact support.",
    failureMessage: true,
  }),
  (req, res) => {
    // If login is successful
    if (req.user.isBlocked === false) {
      req.session.user = req.user._id;
      // console.log(req.user._id)
      return res.redirect("/");
    } else {
      console.log("Your account is blocked. Please contact support.");
      res.redirect(
        "/signup?errorr=Your account is blocked. Please contact support."
      );
    }
  }
);

// user profile management
router.get("/userprofile", userAuth, profileController.userProfile);
router.get("/forgotpassword", profileController.forgotpassword);
router.post("/mailverification", profileController.mailverification);
router.post("/verify-fpsotp", profileController.verifyotp);
router.post("/resendfpdotp", profileController.resendfpdotp);
router.get("/resetpassword", profileController.loadresetpassword);
router.post("/newpassword", profileController.newpassword);
router.get("/loadchangepassword", profileController.loadchangepassword);
router.post("/changepassword", profileController.changepassword);

//address management
router.get("/addaddress", userAuth, profileController.getassAddress);
router.post("/addAddress", userAuth, profileController.addAddress);
router.get("/editAddress", userAuth, profileController.editAddress);
router.post("/editAddress", userAuth, profileController.postEditAddress);
router.get("/deleteAddress", userAuth, profileController.deleteAddress);

//shope page
router.get("/shope", userAuth, userController.loadshopePage);

router.get("/shop", userController.categoryfilter);
//search
router.get("/search", userController.searchProducts);

//cart
router.get("/cart", userAuth, cartControllrer.cart);
router.post("/addTocart", userAuth, cartControllrer.addToCart);
router.post("/updateQuantity/:productId", cartControllrer.updateCartQuantity);
router.get("/remove/:productId", cartControllrer.removeProductFromCart);
router.get("/wishlist", userAuth, cartControllrer.loadwhishlist);
router.post("/addTowishlist", userAuth, cartControllrer.addToWishlist);
router.post("/wishlist/remove", userAuth, cartControllrer.removeFromWishlist);
router.get("/getcheckout", userAuth, cartControllrer.getcheckout);
router.post("/checkout/process", userAuth, cartControllrer.placeorder);
router.post(
  "/orders/:orderId/product/:productId/cancel",
  userAuth,
  cartControllrer.cancelOrder
);
router.post(
  "/orders/:orderId/product/:productId/return",
  userAuth,
  cartControllrer.returnOrder
);
router.post("/checkout/apply-coupon", userAuth, cartControllrer.applyCoupon);
router.post(
  "/checkout/add-address",
  userAuth,
  cartControllrer.checkoutaddAddress
);
router.get("/invoice", userAuth, cartControllrer.invoice);
router.get("/download-invoice", userAuth, cartControllrer.generateInvoicePdf);

// user profile aditional routes

router.get("/orderdetails", userAuth, cartControllrer.getOrderList);
router.get("/addressmanagement", userAuth, userController.addressmanagement);

//login and logOut b
router.get("/login", isLoggedIn, userController.loadlogin);
router.post("/login", isLoggedIn, userController.login);
router.get("/logout", userController.logout);
router.get("/productDetails", userAuth, userproductController.productDetails);

// wallet
router.get("/wallet", userAuth, userController.getWallet);
router.post("/top-up", userAuth, userController.topUpWallet);

// Route to verify Razorpay payment
router.post("/verify-payment", userAuth, paymentController.verifyPayment);
router.get("/paymentsuccess", userAuth, paymentController.paymentsuccess);
router.get("/paymentfailer", userAuth, (req, res) => {
  res.render("paymentfailer");
});
router.post("/retrypayment", userAuth, paymentController.retrypayment);
router.post("/update-payment-status",userAuth,paymentController.updatepaymentstatus);

module.exports = router;
