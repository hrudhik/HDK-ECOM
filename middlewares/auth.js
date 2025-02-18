const User = require("../models/userSchema");
const user = require("../models/userSchema");



const userAuth = (req, res, next) => {

    if (req.session.user) {
        User.findById(req.session.user)
            .then(data => {
                if (data && !data.isBlocked) {
                    next();
                } else {
                    res.redirect("/login")
                }
            })
            .catch(error => {
                console.log("error in user auth middleware", error);
                res.status(500).send("internal server error")
            })

    } else (
        res.redirect('/login')
    )
}
const isAdmin = (req, res, next) => {
    if (req.session.user && req.session.user.role === "admin") {
        return next();
    }
    res.redirect("/login");  // Redirect to login if not admin
};

const isLoggedIn = (req, res, next) => {
    if (req.session.user) {
        // Redirect logged-in users to the home page
        return res.redirect('/admin/login');
    }
    next();
};

const adminAuth=(req,res,next)=>{
    if(!req.session.admin){
        res.redirect('/admin/login')
    }else{
        next()
    }
}


module.exports = {
    isAdmin,
    userAuth,
    isLoggedIn,
    adminAuth

}