const mongoose = require("mongoose");
const ObjectId = mongoose.Schema.Types.ObjectId


const orderSchema = new mongoose.Schema({
    deliveryDetails: {
        type: String,
        required: true,
    },
    user: {
        type: ObjectId,
    },
    paymentMethod: {
        type: String,
    },
    product: [
        {
            productID: {
                type: ObjectId,
                ref: "product", // Change "products" to "product"
                required: true,
            },
            quantity: {
                type: Number,
                required: true,
            },
        }],
    paymentId: {
        type: String
    },
    totalAmount: {
        type: Number,
    },
    Date: {
        type: Date,
    },
    status: {
        type: String,
    },
    totalBefore: {
        type: Number
    },
    discount: {
        type: Number,
        default: 0
    }
},
    {
        timestamps: true
    }
);

module.exports = mongoose.model("order", orderSchema);