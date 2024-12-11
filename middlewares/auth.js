const User = require("../models/userSchema");
const user= require("../models/userSchema");



const userAuth= (req,res,next)=>{
     
    if(req.session.user){
        User.findById(req.session.user)
        .then(data=>{
            if(data&&!data.isBlocked){
                next();
            }else{
                res.redirect("/login")
            }
        })
        .catch(error=>{
            console.log("error in user auth middleware",error);
            res.status(500).send("internal server error")
        })

    }else(
        res.redirect('/login')
    )
}

const adminAuth=(req,res,next)=>{
    User.findOne({isAdmin:true})
    .then(data=>{
        if(data){
            next()
        }else{
            res.redirect('/admin/login')
        }
    })
    .catch(error=>{
        console.log("adminAuth middleware is error ",error);
        res.status(500).send("internal server error")
    })
}
// const adminAuth = (req, res, next) => {
//     if (!req.session.user) {
//         // Redirect users to login if not logged in
//         return res.redirect('/login');
//     }
//     next();
// };
const isLoggedIn = (req, res, next) => {
    if (req.session.user) {
        // Redirect logged-in users to the home page
        return res.redirect('/');
    }
    next();
};

module.exports={
    adminAuth,
    userAuth,
    isLoggedIn
    
}