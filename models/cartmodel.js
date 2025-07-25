const { ObjectId } = require("mongodb")
const mongoose = require("mongoose")

const productSchema = new mongoose.Schema({

    productID: {
        type: ObjectId,
        required: true,
    },
    productname: {
        type: String
    },
    price: {
        type: Number,

    },
    quantity: {
        type: Number,
    }
})

const cartSchema = new mongoose.Schema({

 userID: {
        type: ObjectId,
        // required: true
    },
    products: [productSchema],
    Total: {
        type: Number,
        required: false
    },
    discountPrice: {
        type: Number,
        required: false,
        default: 0
    },
    discountTotal: {
        type: Number,
        required: false
    }
})

module.exports = mongoose.model('cart', cartSchema)