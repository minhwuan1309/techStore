const { categoryService } = require("../services/index")
const asyncHandler = require("express-async-handler")

const createCategory = asyncHandler(async (req, res) => {
  const imagePath = req.file?.path
  const result = await categoryService.createCategory(req.body, imagePath)
  return res.status(result.statusCode).json({
    success: result.success,
    message: result.message,
    createdCategory: result.createdCategory
  })
})

const getCategories = asyncHandler(async (req, res) => {
  const result = await categoryService.getCategories()
  return res.status(result.statusCode).json({
    success: result.success,
    prodCategories: result.prodCategories
  })
})

const getCategoryById = asyncHandler(async (req, res) => {
  const { pcid } = req.params
  const result = await categoryService.getCategoryById(pcid)
  return res.status(result.statusCode).json({
    success: result.success,
    ...(result.success ? { productCategory: result.productCategory } : { message: result.message })
  })
})

const updateCategory = asyncHandler(async (req, res) => {
  const { pcid } = req.params
  const imagePath = req.file?.path
  const result = await categoryService.updateCategory(pcid, req.body, imagePath)
  return res.status(result.statusCode).json({
    success: result.success,
    ...(result.success ? { updatedCategory: result.updatedCategory } : { message: result.message })
  })
})

const deleteCategory = asyncHandler(async (req, res) => {
  const { pcid } = req.params
  const result = await categoryService.deleteCategory(pcid)
  return res.status(result.statusCode).json({
    success: result.success,
    ...(result.success 
      ? { deletedCategory: result.deletedCategory } 
      : { message: result.message })
  })
})

module.exports = {
  createCategory,
  getCategories,
  getCategoryById,
  updateCategory,
  deleteCategory,
}