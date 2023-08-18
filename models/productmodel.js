const { ObjectId } = require('mongodb');
const mongoose=require('mongoose')
// const category =require('./category');
const productSchema = new mongoose.Schema({
    productname:{
        type:String,
        required:true
    },
    brand:{
        type:String,
        required:true
    },
    price: {
        type: Number,
        required: true
    },
    description:{
        type:String,
        required:true
    },
    image: {
        type: Array,
        required: true
    },
    category: {
        type: ObjectId,
        ref: 'category',
        required: true
    },
    quantity:{
        type: Number,
        required: true

    },
    status:{
        type:Boolean,
        default:false
    }
})
module.exports = mongoose.model('product',productSchema);
