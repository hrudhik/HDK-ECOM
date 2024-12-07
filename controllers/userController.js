






const pagenotfound= async(req,res)=>{

    try {
        res.render("pagenotefound")        
    } catch (error) {
        res.redirect("/pagenotfound")
    }
}

const loadhomepage= async(req,res)=>{
    try {
        return res.render("home")
    } catch (error) {
        console.log("the home page is note loading ");
        res.status(500).send("internal server error")
        
    }
}

module.exports={
    loadhomepage,
    pagenotfound
}