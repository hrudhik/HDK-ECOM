// const mongoose = require('mongoose');
// const {Schema}=mongoose;

// const coupenSchema= new Schema({
//     code:{
//         type:String,
//         required:true,
//         unique:true
//     },
//     discountPercentage:{
//         type:Number,
//         required:true
//     },
//     statDate:{
//         type:Date,
//         required:true
//     },
//     endDate:{
//         type:Date,
//         required:true
//     },
//     isActive:{
//         type:Boolean,
//         required:true
//     },
//     createdAt:{
//         type:Date,
//         default:new Date
//     }    
// })


// const Coupen= mongoose.model('Coupen',coupenSchema );

// module.exports={Coupen}


const mongoose = require("mongoose");
const { Schema } = mongoose;

const couponSchema = new Schema({
    code: {
        type: String,
        required: true,
        unique: true, // Ensures coupon codes are unique
    },
    discountPercentage: {
        type: Number,
        required: true,
    },
    startDate: {
        type: Date,
        required: true,
    },
    endDate: {
        type: Date,
        required: true,
    },
    isActive: {
        type: Boolean,
        default: true,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
    couponImage:{
        type:String,
        required:true,
    },
    minPurchaseAmount: { 
        type: Number,
        required: true,
    },
});

const Coupon = mongoose.model("Coupon", couponSchema);

module.exports = Coupon;