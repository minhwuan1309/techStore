const { couponService } = require('../services/index')
const asyncHandler = require('express-async-handler')

const createNewCoupon = asyncHandler(async (req, res) => {
  const result = await couponService.createNewCoupon(req.body);
  return res.status(result.statusCode).json({
    success: result.success,
    createdCoupon: result.createdCoupon
  });
});

const getCoupons = asyncHandler(async (req, res) => {
  const result = await couponService.getCoupons();
  return res.status(result.statusCode).json({
    success: result.success,
    coupons: result.coupons
  });
});

const updateCoupon = asyncHandler(async (req, res) => {
  const { cid } = req.params;
  const result = await couponService.updateCoupon(cid, req.body);
  return res.status(result.statusCode).json({
    success: result.success,
    updatedCoupon: result.updatedCoupon
  });
});

const deleteCoupon = asyncHandler(async (req, res) => {
  const { cid } = req.params;
  const result = await couponService.deleteCoupon(cid);
  return res.status(result.statusCode).json({
    success: result.success,
    deletedCoupon: result.deletedCoupon
  });
});

const checkCoupon = asyncHandler(async (req, res) => {
  const { coupon } = req.body;
  const result = await couponService.checkCoupon(coupon);
  return res.status(result.statusCode).json({
    success: result.success,
    discount: result.discount,
    message: result.message
  });
});

module.exports = {
    createNewCoupon,
    getCoupons,
    updateCoupon,
    deleteCoupon,
    checkCoupon
}