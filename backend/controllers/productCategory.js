const ProductCategory = require("../models/productCategory")
const mongoose = require("mongoose")
const asyncHandler = require("express-async-handler")
const {slugify} = require("../utils/helper")

// Tạo danh mục sản phẩm mới
const createCategory = asyncHandler(async (req, res) => {
  const { title, brand } = req.body
  const imagePath = req.file?.path

  if (!title || !brand) {
    return res.status(400).json({
      success: false,
      message: "Vui lòng nhập đủ thông tin"
    })
  }

  if (!imagePath) {
    return res.status(400).json({
      success: false,
      message: "Tải lên hình ảnh thất bại."
    })
  }

  try {
    const slug = slugify(title)
    const createdCategory = await ProductCategory.create({ 
      ...req.body, 
      slug, 
      image: imagePath 
    })
    
    return res.status(200).json({
      success: true,
      message: "Tạo danh mục thành công.",
      createdCategory
    })
  } catch (error) {
    console.error("Lỗi khi tạo danh mục:", error)
    return res.status(500).json({
      success: false,
      message: "Tạo danh mục thất bại!"
    })
  }
})

// Lấy danh sách danh mục sản phẩm
const getCategories = asyncHandler(async (req, res) => {
  try {
    const prodCategories = await ProductCategory.find().populate("brand", "title")
    
    return res.status(200).json({
      success: !!prodCategories,
      prodCategories: prodCategories || "Không thể lấy danh sách danh mục."
    })
  } catch (error) {
    console.error("Lỗi khi lấy danh mục:", error)
    return res.status(500).json({
      success: false,
      message: "Đã xảy ra lỗi."
    })
  }
})

// Lấy thông tin danh mục theo ID
const getCategoryById = asyncHandler(async (req, res) => {
  const { pcid } = req.params

  if (!mongoose.Types.ObjectId.isValid(pcid)) {
    return res.status(400).json({
      success: false,
      message: "ID danh mục không hợp lệ."
    })
  }

  try {
    const productCategory = await ProductCategory.findById(pcid).populate("brand", "title")
    
    if (!productCategory) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy danh mục."
      })
    }

    return res.status(200).json({
      success: true,
      productCategory
    })
  } catch (error) {
    console.error("Lỗi khi lấy danh mục theo ID:", error)
    return res.status(500).json({
      success: false,
      message: "Đã xảy ra lỗi."
    })
  }
})

// Cập nhật thông tin danh mục
const updateCategory = asyncHandler(async (req, res) => {
  const { pcid } = req.params
  const { title } = req.body
  const imagePath = req.file?.path
  
  const brand = req.body.brand ? 
    (Array.isArray(req.body.brand) ? req.body.brand : Object.values(req.body.brand)) : 
    []

  if (!title || !brand.length) {
    return res.status(400).json({
      success: false,
      message: "Vui lòng nhập đủ thông tin!"
    })
  }

  try {
    const updateData = { title, brand, slug: slugify(title) }
    if (imagePath) {
      updateData.image = imagePath
    }

    const updatedCategory = await ProductCategory.findByIdAndUpdate(
      pcid,
      updateData,
      { new: true }
    )
    
    if (!updatedCategory) {
      return res.status(404).json({
        success: false,
        message: "Danh mục không tồn tại."
      })
    }
    
    return res.status(200).json({
      success: true,
      updatedCategory
    })
  } catch (error) {
    console.error("Lỗi khi cập nhật danh mục:", error)
    return res.status(500).json({
      success: false,
      message: "Cập nhật danh mục thất bại."
    })
  }
})

// Xóa danh mục
const deleteCategory = asyncHandler(async (req, res) => {
  const { pcid } = req.params

  try {
    const deletedCategory = await ProductCategory.findByIdAndDelete(pcid)
    
    if (!deletedCategory) {
      return res.status(404).json({
        success: false,
        message: "Không thể xóa danh mục."
      })
    }
    
    return res.status(200).json({
      success: true,
      deletedCategory
    })
  } catch (error) {
    console.error("Lỗi khi xóa danh mục:", error)
    return res.status(500).json({
      success: false,
      message: "Đã xảy ra lỗi."
    })
  }
})

module.exports = {
  createCategory,
  getCategories,
  getCategoryById,
  updateCategory,
  deleteCategory
}