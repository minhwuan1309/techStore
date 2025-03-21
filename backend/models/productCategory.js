const mongoose = require('mongoose'); 

var productCategorySchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        unique: true,
    },
    brand: {
        type: Array,
        required: true,
    },
    image:{
        type: String,
    },
    isDelete: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true
});


module.exports = mongoose.model('ProductCategory', productCategorySchema);