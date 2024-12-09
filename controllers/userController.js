const User=require("../models/userSchema");
const nodemailer= require("nodemailer");
const env = require("dotenv").config();   






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

const loadsignUp=async(req,res)=>{
    try {
        return res.render("signup")
    } catch (error) {
        console.log("the signup page is note loading ");
        res.status(500).send("internal server error")
        
    }
}

function genarateotp(){
    return Math.floor(100000 + Math.random()*900000).toString();
}

async function sendVerificationemail(email,otp){
    try {
        const transporter= nodemailer.createTransport({
            service:'gmail',
            port:587,
            secure:false,
            requireTLS:true,
            auth:{
                user:process.env.NODEMAILER_EMAIL,
                pass:process.env.NODEMAILER_PASSWORD

            }
        })

        const info= await transporter.sendMail({
            from:process.env.NODEMAILER_EMAIL,
            to:email,
            subject:"Verify your account",
            text:`Your otp is ${otp}`,
            html:`<b>YOur otp:${otp}</b>`
        })

        return info.accepted.length >0
        
    } catch (error) {
        console.error("email sending error",error);
        return false;
        
        
    }
}





const signUp=async(req,res)=>{
    try {
        const {name,phone,email,password,cpassword}=req.body;

        if(password !== cpassword){
            return res.render("signup",{message:"password do not match "});
        }

        const findUser= await User.findOne({email});
        if(findUser){
            return res.render("signup",{message:"The email is allready existing "})
        }

        const otp= genarateotp();

        const emailsent = await sendVerificationemail(email,otp);

        if(!emailsent){
            return res.json("email-error")
        }

        req.session.userOtp=otp;
        req.session.userData={name,phone,email,password};

        res.render('otp');
        console.log("OTP Sent",otp);
        
    } catch (error) {
        console.error("signUP error",error);
        res.redirect("/pagenotfound")
        
    }
}

// //main
// const verifyotp=async(req,res)=>{
//     try {
//         const {otp}=req.body;

//         console.log(otp);

//         if(otp){
//             const user=req.session.userData;

//             const saveUserdata=new User({
//                 name:user.name,
//                 email:user.email,
//                 phone:user.phone,
//                 password:user.password
//             })

//             await saveUserdata.save();
//             req.session.user=saveUserdata._id;
//             // res.json({success:true, redirectUrl:"/"})
//             res.redirect('/')
//         }else{
//             res.status(400).json({success:false,message:"Invalide ITP, please try again "})
//         }
//     } catch (error) {
//         console.error("error verifying otp",error);
//         res.status(500).json({success:false,message:"an error occured"})
//     }
// }


// // const resendotp= async(req,res)=>{
// //     try {
// //         const {email}=req.session.userData;
// //         if(!email){
// //             return res.status(400).json({success:false,message:"Email not found in session "})
// //         }

// //         const otp=generateotp();
// //         req.session.userOtp=otp;

// //         const emailSent= await sendVerificationemail(email,otp);
// //         if(emailSent){
// //             console.log("REsend OTP,",otp);
// //             res.status(200).json({success:true,message:"otp resend succesfully"})

            
// //         }else{
// //             res.status(500).json({success:false,message:"Failed to resend OTP.Please ty again"}); 
// //         }
// //         console.log(otp);
        
// //     } catch (error) {
// //         console.error("Error sending OTP",error)
// //         res.status(500).json({succes:false,message:"Internal Server error. Please tey again "})
// //     }
// // }

// const resendotp = async (req, res) => {
//     try {
//         const { email } = req.session.userData;
//         if (!email) {
//             return res.status(400).json({ success: false, message: "Email not found in session." });
//         }

//         const otp = genarateotp();
//         req.session.userOtp = otp; // Update session with new OTP

//         console.log("Generated Resend OTP:", otp); // Log for debugging

//         const emailSent = await sendVerificationemail(email, otp);
//         if (emailSent) {
//             console.log("Resent OTP successfully:", otp);
//             res.status(200).json({ success: true, message: "OTP resent successfully." });
//         } else {
//             res.status(500).json({ success: false, message: "Failed to resend OTP. Please try again." });
//         }
//     } catch (error) {
//         console.error("Error resending OTP:", error);
//         res.status(500).json({ success: false, message: "Internal server error. Please try again." });
//     }
// };



const verifyotp= async(req,res)=>{
    try {
        const {otp}=req.body;
        console.log(otp);

        if(otp === req.session.userOtp){
            const user= req.session.userData
            const saveUserdata=new User({
                 name:user.name,
                 email:user.email,
                 phone:user.phone,
                 password:user.password


        })
          await saveUserdata.save();
          req.session.user= saveUserdata._id;  
         res.json({success:true,redirectUrl:"/"}); 
        
    }else{
        res.status(400).json({success:false,message:"invalied otp , please try again "})
    }
} catch (error) {
    console.error("error verifying otp",error); 
    res.status(500).json({success:false,message:"an error occured"})
    }
}
const resendotp=async(req,res)=>{
    try {
        const {email}= req.session.userData;
        if(!email){
            return res.status(400).json({success:false,message:"Email not found in session  "});

        }
        const otp = genarateotp();
        req.session.userOtp=otp; 
        
        const emailSent= await sendVerificationemail(email,otp);
        if(emailSent){
            console.log("Resend otp:",otp);
            res.status(200).json({success:true,message:"OTP resend succesfully "});

        }else{
            res.status(500).json({success:false,message:"failed to resend otp please try again "})
        }
    } catch (error) {
        console.error("error resending otp ",error);
        res.status(500).json({success:false,message:"internal server erroer"})
    }
}

module.exports={
    loadhomepage,
    pagenotfound,
    loadsignUp,
    signUp,
    verifyotp,
    resendotp
}