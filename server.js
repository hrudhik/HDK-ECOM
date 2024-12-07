const express= require("express");
const app= express();
const path = require("path");
const env=require("dotenv").config();
const db=require("./config/db")
const userRouters=require("./routers/userRouters");
db()



app.use(express.json());
app.use(express.urlencoded({extended:true}))


app.set("view engine","ejs");
app.set("views",[path.join(__dirname,'views/user'),path.join(__dirname,'views/admin')]);
app.use(express.static(path.join(__dirname,'public')));



// app.get('/',(req,res)=>{
//     res.send("This site for HDK times")
// });

app.use("/",userRouters);

app.listen(process.env.PORT,()=> console.log("server running :",process.env.PORT));




module.exports=app;