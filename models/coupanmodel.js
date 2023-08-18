const mongoose = require("mongoose");
const couponSchema = mongoose.Schema({
    couponcode: {
        type: String,
        required: true
    },
    couponamount: {
        type: Number,
        required: true
    },
    mincartamount: {
        type: Number,
    },
    expiredate: {
        type: Date
    },
    status: {
        type: Boolean,
        default: true
    },
})

module.exports = mongoose.model('coupon', couponSchema)