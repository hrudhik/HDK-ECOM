const User = require("../models/userSchema");
const Category =require('../models/categorySchema');
const Product=require('../models/productSchema');
const Address= require('../models/addressSchema');
const nodemailer = require("nodemailer");
const env = require("dotenv").config();
const bcrypt = require('bcrypt');




const userProfile=async (req,res)=>{
    try {
        const userId=req.session.user;
        const userDate=await User.findById(userId);

        res.render('userProfile',{
            user:userDate
        })

    } catch (error) {
        console.error('user profile loading error:',error);
        res.redirect('/pagenotfound')
        
        
    }
}


function genarateotp() {
    return Math.floor(100000 + Math.random() * 900000).toString();
}

async function sendVerificationemail(email, otp) {
    try {
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            port: 587,
            secure: false,
            requireTLS: true,
            auth: {
                user: process.env.NODEMAILER_EMAIL,
                pass: process.env.NODEMAILER_PASSWORD

            }
        })

        const info = await transporter.sendMail({
            from: process.env.NODEMAILER_EMAIL,
            to: email,
            subject: "Verify your account",
            text: `Your otp is ${otp}`,
            html: `<b>YOur otp:${otp}</b>`
        })

        return info.accepted.length > 0

    } catch (error) {
        console.error("email sending error", error);
        return false;


    }
}

const hashpassword = async (password) => {
    try {
        const passwordHash = await bcrypt.hash(password, 10)
        return passwordHash;
    } catch (error) {
        console.log("password hasing is failed, the password is stored in readeable formate Please check the bcrypt module is working propperly ", error);

    }
}



const forgotpassword= async (req,res)=>{
    try {
        res.render('forgotpassword');
    } catch (error) {
        res.redirect('/pagenotfound');
    }
}



const mailverification=async (req,res)=>{
    try {
        const email= req.body.email
        // console.log(email)
        const findUser=await User.findOne({email});
        if (findUser){
                
            const otp = genarateotp();

            const emailsent = await sendVerificationemail(email, otp);

            if (!emailsent) {
                return res.json("email-error")
            }

            req.session.userOtp = otp;
            req.session.email = email;
            console.log(req.session.email);
            

            res.render('forgotpasswordotp');
            console.log("OTP Sent", otp);
        }else{
            res.render('forgotpassword',{
                message:"User with this email does not exist "
            })
        }
        
    } catch (error) {
        res.redirect('/pagenotfound')
        console.error(error);
        
        
    }
}

const verifyotp = async (req,res)=>{
    try {
        const enterdotp=req.body.otp;
        console.log('otp from user',enterdotp)
        console.log(req.session.userOtp)
        if( enterdotp=== req.session.userOtp){
            res.json({success:true,redirectUrl:"/resetpassword"})
            // res.send('hi')
        }else{
            res.json({success:false,message:"otp is not matching"})
        }

        
    } catch (error) {
        console.erroe(error)
        res.status(500).json({succrs:false,message:"An error ocuerd "})
        
    }
}

// const resendfpdotp =async (req,res)=>{
//     try {
//         const otp= genarateotp();
//         req.session.userOtp=otp;
//         const email= req.session.email || null
//         console.log("otp send to this mail:",email);
//         const emamilsend=await sendVerificationemail(email, otp);

//         if(emamilsend){
//             console.log("Resend otp:",otp);
//             res.status(200).json({success:true,message:"otp resend succesfull"})
//         }else{
//             res.status(500).json({success:false,message:"otp send faild"})
//         }
//     } catch (error) {
//         console.log("otp resend error:",error);
//         res.status(500).json({success:false,message:"Internal server error"})
//     }
// }

const resendfpdotp = async (req, res) => {
    try {
        const otp = genarateotp();
        const email = req.session.email;

        if (!email) {
            return res.status(400).json({ success: false, message: "Session expired. Please restart the process." });
        }

        req.session.userOtp = otp;

        const emailSent = await sendVerificationemail(email, otp);
        if (emailSent) {
            console.log("Resend OTP:", otp);
            res.status(200).json({ success: true, message: "OTP resent successfully." });
        } else {
            res.status(500).json({ success: false, message: "Failed to send OTP. Try again." });
        }
    } catch (error) {
        console.log("OTP resend error:", error);
        res.status(500).json({ success: false, message: "Internal server error." });
    }
};


const loadresetpassword=async (req,res)=>{
    try {
        res.render('resetpassword')
    } catch (error) {
        res.redirect('/pagenotfound')
    }
}

const newpassword= async (req,res)=>{
    try {
        const {newPass1 , newPass2}=req.body;
        const email= req.session.email;
        if(newPass1 === newPass2){
            const passwordHarsh= await hashpassword(newPass1);
            await User.updateOne(
                {email:email},
                {$set:{password:passwordHarsh}}
            )
            res.redirect('/login')

        }else{
            res.render('resetpassword',{
                message:"password do not match"
            })
        }
    } catch (error) {
        res.redirect('/pagenotfound')
        
    }
}
const changepassword = async (req, res) => {
    try {
        const userId = req.session.user;

        // Check if userId exists
        if (!userId) {
            return res.status(400).json({ success: false, message: "User session not found" });
        }

        const { currentPassword, newPassword } = req.body;

        // Fetch user from the database
        const user = await User.findById(userId);

        // Handle case where user is not found
        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        // Check if the current password is correct
        const isMatch = await bcrypt.compare(currentPassword, user.password);
        if (!isMatch) {
            return res.status(400).json({ success: false, message: "Current password is incorrect" });
        }

        // Hash the new password
        const hashedPassword = await bcrypt.hash(newPassword, 10);

        // Update the user's password
        user.password = hashedPassword;
        await user.save();

        res.status(200).json({ success: true, message: "Password updated successfully" });
    } catch (error) {
        console.error("Error changing password:", error);
        res.status(500).json({ success: false, message: "An error occurred" });
    }
};


module.exports={
    userProfile,
    forgotpassword,
    mailverification,
    verifyotp,
    resendfpdotp,
    loadresetpassword,
    newpassword,
    changepassword
}
