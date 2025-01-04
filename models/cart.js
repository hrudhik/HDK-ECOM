const mongoose=require('mongoose');
const {Schema}=mongoose;

const CartSchema= new Schema({
    userId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'User',
        required:true
    },
    items:[{
        productId:{type:mongoose.Schema.Types.ObjectId,
            ref:'Product',
            required:true
        },
        quantity:{type:Number,
            required:true,
            min:1
        }
    }],
    // totalPrice:{
    //     type:Number,
    //     default:0
    // }
});

const Cart = mongoose.model('Cart', CartSchema);
module.exports=Cart;

