const Brand = require('../models/brand')
const asyncHandler = require('express-async-handler')

const createNewBrand = asyncHandler(async (req, res) => {
  try {
    const response = await Brand.create(req.body)
    
    return res.status(response ? 200 : 400).json({
      success: !!response,
      createdBrand: response || "Không thể tạo thương hiệu mới"
    })
  } catch (error) {
    console.error(error.message)
    res.status(500).json({ success: false, mes: error.message })
  }
})

const getBrands = asyncHandler(async (req, res) => {
  try {
    const brands = await Brand.find()
    
    return res.status(brands ? 200 : 404).json({
      success: !!brands,
      brands: brands || [],
      message: brands ? undefined : "Không tìm thấy thương hiệu"
    })
  } catch (error) {
    console.error(error.message)
    res.status(500).json({ success: false, mes: error.message })
  }
})

const updateBrand = asyncHandler(async (req, res) => {
  try {
    const { bid } = req.params
    
    const response = await Brand.findByIdAndUpdate(bid, req.body, { new: true })
    
    return res.status(response ? 200 : 400).json({
      success: !!response,
      updatedBrand: response || "Không thể cập nhật thương hiệu"
    })
  } catch (error) {
    console.error(error.message)
    res.status(500).json({ success: false, mes: error.message })
  }
})

const deleteBrand = asyncHandler(async (req, res) => {
  try {
    const { bid } = req.params
    
    const response = await Brand.findByIdAndDelete(bid)
    
    return res.status(response ? 200 : 400).json({
      success: !!response,
      deletedBrand: response || "Không thể xóa thương hiệu"
    })
  } catch (error) {
    console.error(error.message)
    res.status(500).json({ success: false, mes: error.message })
  }
})

module.exports = {
  createNewBrand,
  getBrands,
  updateBrand,
  deleteBrand
}