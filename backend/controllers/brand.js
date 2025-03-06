const Brand = require('../models/brand')
const asyncHandler = require('express-async-handler')

const createNewBrand = asyncHandler(async (req, res) => {
  const response = await Brand.create(req.body);
  return res.json({
    success: !!response,
    createdBrand: response || "Không thể tạo thương hiệu mới",
  });
});

const getBrands = asyncHandler(async (req, res) => {
  const brands = await Brand.find();
  if (brands) {
    return res.status(200).json({ success: true, brands });
  } else {
    return res
      .status(404)
      .json({ success: false, message: "Không tìm thấy thương hiệu" });
  }
});

const updateBrand = asyncHandler(async (req, res) => {
  const { bid } = req.params;
  const response = await Brand.findByIdAndUpdate(bid, req.body, { new: true });
  return res.json({
    success: !!response,
    updatedBrand: response || "Không thể cập nhật thương hiệu",
  })
});

const deleteBrand = asyncHandler(async (req, res) => {
  const { bid } = req.params;
  const response = await Brand.findByIdAndDelete(bid);
  return res.json({
    success: !!response,
    deletedBrand: response || "Không thể xóa thương hiệu",
  });
});


module.exports = {
    createNewBrand,
    getBrands,
    updateBrand,
    deleteBrand
}