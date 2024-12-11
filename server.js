const express= require("express");
const app= express();
const session = require('express-session');
const passport=require('./config/passport')
const path = require("path");
const env=require("dotenv").config();
const db=require("./config/db")
const userRouters=require("./routers/userRouters");
const adminrouters= require("./routers/adminrout")
db()



app.use(express.json());
app.use(express.urlencoded({extended:true}))
app.use(session({
    secret:process.env.SESSION_SEACRET,
    // secret:'mySecret',
    resave:false,
    saveUninitialized:true,
    cookie:{
        secure:false,
        httpOnly:true,
        maxAge:72*60*60*1000
    }
    
}))

app.use(passport.initialize());
app.use(passport.session());
app.use((req, res, next) => {
    res.locals.user = req.user || null; // Make `req.user` available in all templates
    next();
});




app.set("view engine","ejs");
app.set("views",[path.join(__dirname,'views/user'),path.join(__dirname,'views/admin')]);
app.use(express.static(path.join(__dirname,'public')));



// app.get('/',(req,res)=>{
//     res.send("This site for HDK times")
// });

app.use("/",userRouters);
app.use("/admin",adminrouters)

app.listen(process.env.PORT,()=> console.log("server running :",process.env.PORT));




module.exports=app;