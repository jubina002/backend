const mongoose = require('mongoose')
const orderSchema = new mongoose.Schema({
orderNumber:{
    type: String,
    default: Math.floor(Math.random() * 10000000000)
},
cart: [
    {
        productName: {
            type: String,
            
        },
        productPrice: {
            type: Number,
        },
        productCategory: {
            type: String,
        },
        productImage: {
            type: String,
        },
        productQuantity:{
            type: Number,
        }
    }
], 
totalAmount: {
    type: Number,
},
shippingAddress:{
    type: String,
},
status: {
    type: String,
    default: "handling"
},
orderedDate: {
type: Date,
default: Date.noe
},
user:{
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
}


})
module.exports = mongoose.model("OrderModal", orderSchema)