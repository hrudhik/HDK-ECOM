const express= require("express");
const app= express();
const env=require("dotenv").config();
const db=require("./config/db")
db()



app.get('/',(req,res)=>{
    res.send("This site for HDK times")
});

app.listen(process.env.PORT,()=> console.log("server running :",process.env.PORT));




module.exports=app;