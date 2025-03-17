const mongoose = require('mongoose'); 

var couponSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true,
        uppercase: true
    },
    discount: {
        type: Number,
        required: true,
    },
    expiry: {
        type: Date,
        required: true,
    },
    isDelete: {
        type: Boolean,
        default: false
    }
}, { timestamps: true });


module.exports = mongoose.model('Coupon', couponSchema);