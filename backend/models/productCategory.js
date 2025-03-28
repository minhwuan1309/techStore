const mongoose = require('mongoose'); 

var productCategorySchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        unique: true,
    },
    brand: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Brand'
        }
    ],
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