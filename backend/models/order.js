const mongoose = require("mongoose") 

var orderSchema = new mongoose.Schema(
  {
    products: [
      {
        product: { type: mongoose.Types.ObjectId, ref: "Product" },
        quantity: Number,
        color: String,
        price: Number,
        thumbnail: String,
        title: String,
      },
    ],
    status: {
      type: String,
      default: "Pending",
      enum: ["Cancelled", "Succeed", "Pending"],
    },
    total: Number,
    discount: {
      type: Number, // Phần trăm giảm giá
      default: 0,
    },
    coupon: {
      type: String, // Mã giảm giá
      default: null,
    },
    finalTotal: Number, // Tổng tiền sau giảm giá
    orderBy: {
      type: mongoose.Types.ObjectId,
      ref: "User",
    },
    paymentMethod: {
      type: String,
      enum: ["COD", "PAYPAL", "MOMO"],
      required: true,
    },
    isDelete: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);


module.exports = mongoose.model("Order", orderSchema)
