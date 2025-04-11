const Coupon = require('../models/coupon')
const asyncHandler = require('express-async-handler')

const createNewCoupon = asyncHandler(async (req, res) => {
  try {
    const { name, discount, expiry } = req.body
    
    if (!name || !discount || !expiry) {
      return res.status(400).json({
        success: false,
        mes: "Vui lòng nhập đủ thông tin!"
      })
    }
    
    const response = await Coupon.create({
      ...req.body,
      expiry: Date.now() + +expiry * 24 * 60 * 60 * 1000,
    })
    
    return res.status(response ? 200 : 400).json({
      success: !!response,
      mes: "Tạo mã giảm giá thành công",
      createdCoupon: response || "Không thể tạo mã giảm giá mới"
    })
  } catch (error) {
    console.error(error.message)
    res.status(500).json({ success: false, mes: error.message })
  }
})

const getCoupons = asyncHandler(async (req, res) => {
  try {
    const response = await Coupon.find().select("-createdAt -updatedAt")
    
    return res.status(response ? 200 : 400).json({
      success: !!response,
      coupons: response || "Không thể lấy mã giảm giá"
    })
  } catch (error) {
    console.error(error.message)
    res.status(500).json({ success: false, mes: error.message })
  }
})

const updateCoupon = asyncHandler(async (req, res) => {
  try {
    const { cid } = req.params
    const couponData = { ...req.body }
    
    if (Object.keys(couponData).length === 0) {
      return res.status(400).json({
        success: false,
        mes: "Vui lòng nhập đủ thông tin!"
      })
    }
    
    if (couponData.expiry) {
      couponData.expiry = Date.now() + +couponData.expiry * 24 * 60 * 60 * 1000
    }
    
    const response = await Coupon.findByIdAndUpdate(cid, couponData, { new: true })
    
    return res.status(response ? 200 : 400).json({
      success: !!response,
      mes: "Cập nhật mã giảm giá thành công",
      updatedCoupon: couponData
    })
  } catch (error) {
    console.error(error.message)
    res.status(500).json({ success: false, mes: error.message })
  }
})

const deleteCoupon = asyncHandler(async (req, res) => {
  try {
    const { cid } = req.params
    
    const response = await Coupon.findByIdAndDelete(cid)
    
    return res.status(response ? 200 : 400).json({
      success: !!response,
      mes: "Xóa mã giảm giá thành công",
    })
  } catch (error) {
    console.error(error.message)
    res.status(500).json({ success: false, mes: error.message })
  }
})

const checkCoupon = asyncHandler(async (req, res) => {
  const { coupon, couponCode } = req.body;
  const code = coupon || couponCode;

  if (!code) {
    return res
      .status(400)
      .json({ success: false, message: "Vui lòng nhập mã giảm giá" });
  }

  const foundCoupon = await Coupon.findOne({ name: code.toUpperCase() });

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