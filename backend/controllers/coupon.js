const Coupon = require('../models/coupon')
const asyncHandler = require('express-async-handler')

const createNewCoupon = asyncHandler(async (req, res) => {
  const { name, discount, expiry } = req.body;
  if (!name || !discount || !expiry) throw new Error("Vui lòng nhập đủ thông tin!");

  const response = await Coupon.create({
    ...req.body,
    expiry: Date.now() + +expiry * 24 * 60 * 60 * 1000,
  });

  return res.json({
    success: !!response,
    createdCoupon: response || "Không thể tạo mã giảm giá mới",
  });
});

const getCoupons = asyncHandler(async (req, res) => {
  const response = await Coupon.find().select("-createdAt -updatedAt");
  return res.json({
    success: !!response,
    coupons: response || "Không thể lấy mã giảm giá",
  });
});

const updateCoupon = asyncHandler(async (req, res) => {
  const { cid } = req.params;
  if (Object.keys(req.body).length === 0)
    throw new Error("Vui lòng nhập đủ thông tin!");

  if (req.body.expiry)
    req.body.expiry = Date.now() + +req.body.expiry * 24 * 60 * 60 * 1000;

  const response = await Coupon.findByIdAndUpdate(cid, req.body, { new: true });

  return res.json({
    success: !!response,
    updatedCoupon: response || "Không thể cập nhật mã giảm giá",
  });
});

const deleteCoupon = asyncHandler(async (req, res) => {
  const { cid } = req.params;
  const response = await Coupon.findByIdAndDelete(cid);

  return res.json({
    success: !!response,
    deletedCoupon: response || "Không thể xóa mã giảm giá",
  });
});

const checkCoupon = asyncHandler(async (req, res) => {
  const { coupon } = req.body;

  if (!coupon) {
    return res
      .status(400)
      .json({ success: false, message: "Vui lòng nhập mã giảm giá" });
  }

  const foundCoupon = await Coupon.findOne({ name: coupon.toUpperCase() });

  if (!foundCoupon) {
    return res
      .status(400)
      .json({ success: false, message: "Mã giảm giá không hợp lệ" });
  }

  if (new Date(foundCoupon.expiry) < new Date()) {
    return res
      .status(400)
      .json({ success: false, message: "Mã giảm giá đã hết hạn" });
  }

  return res.status(200).json({
    success: true,
    discount: foundCoupon.discount,
    message: "Mã giảm giá hợp lệ",
  });
});


module.exports = {
    createNewCoupon,
    getCoupons,
    updateCoupon,
    deleteCoupon,
    checkCoupon
}