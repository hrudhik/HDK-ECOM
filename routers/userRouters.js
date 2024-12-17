const express = require('express');
const router = express.Router();
const passport = require("passport")
const userController = require('../controllers/userController');
const { userAuth, adminAuth, isLoggedIn } = require('../middlewares/auth');


router.get('/pagenotfound', userController.pagenotfound);
router.get('/', userController.loadhomepage);
router.get('/signup', userController.loadsignUp);
router.post('/signup', userController.signUp);
router.post('/verify-otp', userController.verifyotp)
router.post('/resend-otp', userController.resendotp)

router.get('/auth/google', passport.authenticate('google', { scope: ['profile', 'email'] }));
router.get('/auth/google/callback', passport.authenticate('google', { failureRedirect: '/signup' }),
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

router.get('/login', isLoggedIn, userController.loadlogin);
router.post('/login', isLoggedIn, userController.login);
router.get('/logout', userController.logout)




module.exports = router