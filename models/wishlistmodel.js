const mongoose = require('mongoose');
const ObjectId = mongoose.Schema.Types.ObjectId;

const wishlistSchema = new mongoose.Schema({
  user: {
    type: ObjectId,
    ref: 'User', 
    required: true,
  },
  product: [
    {
      productId: {
        type: ObjectId,
        ref: 'product', 
        required: true,
      },
      productname:{
        type:String,
        required:true
    },
      quantity: {
        type: Number,
        default: 1,
      },
      price: {
        type: Number,
        default: 0,
      },
      totalPrice: {
        type: Number,
        default: 0,
      },
    },
  ],
});

module.exports = mongoose.model('Wishlist', wishlistSchema);
