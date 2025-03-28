const mongoose = require('mongoose'); 

var productSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true
    },
    slug: {
        type: String,
        required: true,
        lowercase: true
    },
    description: {
        type: Array,
        required: true,
    },
    brand: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Brand',
        required: true
    },
    thumb: {
        type: String,
        required: true
    },
    price: {
        type: Number,
        required: true
    },
    category: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'ProductCategory',
        required: true
    },
    quantity: {
        type: Number,
        default: 0
    },
    sold: {
        type: Number,
        default: 0
    },
    images: {
        type: Array
    },
    color: {
        type: String,
        require: true
    },
    ratings: [
        {
            star: { type: Number },
            postedBy: { type: mongoose.Types.ObjectId, ref: 'User' },
            comment: { type: String },
            updatedAt: { type: Date }
        }
    ],
    totalRatings: {
        type: Number,
        default: 0
    },
    isDelete: {
        type: Boolean,
        default: false
    },
    varriants: [
        {
            color: String,
            price: Number,
            thumb: String,
            images: Array,
            title: String,
            sku: String
        }
    ]
}, {
    timestamps: true
});


module.exports = mongoose.model('Product', productSchema);