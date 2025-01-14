const mongoose = require("mongoose");
// const { search } = require("../server");
const {Schema}= mongoose;



const userSchema = new Schema({

    name:{
        type:String,
        require: true
    },
    email:{
         type:String,
         required:true,
         unique:true
    },
    phone:{
        type:String,
        required: false,
        unique: false,
        sparse:true,
        default:null
    },
    googleId:{
        type:String,
        unique: true,
        
    },
    password:{

        type:String,
        required:false
    },
    isBlocked:{
        type:Boolean,
        default:false
    },
    isAdmin:{
        type:Boolean,
        default:false
    },
    cart:{
        type:Schema.Types.ObjectId,
        ref:"Cart"
    },
    wallet: {
        balance: { type: Number, default: 0 },
        transactions: [
          {
            type: { type: String, enum: ["credit", "debit"], required: true },
            amount: { type: Number, required: true },
            description: { type: String, required: true },
            date: { type: Date, default: Date.now }
          }
        ]
      },
    orderhistory:[{
        type:Schema.Types.ObjectId,
        ref:"Order"
    }],
    createdOn:{
        type:Date,
        default:Date.now
    },
    refrelCode:{
        type:String
    },
    redeemed:{
        type:Boolean
    },
    redeemedUsers:[{
        type:Schema.Types.ObjectId,
        // ref:"User"
    }],
    searchHistory:[{
        catogary:{
            type:Schema.Types.ObjectId,
            ref:"Category"
        },
        brand:{
            type:String
        },
        searchOn:{
            type:Date,
            default:Date.now

        }
    }]
})

const User= mongoose.model("User",userSchema);

module.exports=User;