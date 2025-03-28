const { productService } = require("../services/index")
const asyncHandler = require("express-async-handler")

const createProduct = asyncHandler(async (req, res) => {
  const result = await productService.createProduct(req.body, req.files)
  return res.status(result.statusCode).json({
    success: result.success,
    mes: result.mes
  })
})

const getProduct = asyncHandler(async (req, res) => {
  const { pid } = req.params
  const result = await productService.getProduct(pid)
  return res.status(result.statusCode).json({
    success: result.success,
    productData: result.productData
  })
})

const getProducts = asyncHandler(async (req, res) => {
  const result = await productService.getProducts(req.query)
  return res.status(result.statusCode).json({
    success: result.success,
    counts: result.counts,
    products: result.products
  })
})

const updateProduct = asyncHandler(async (req, res) => {
  const { pid } = req.params
  const result = await productService.updateProduct(pid, req.body, req.files)
  return res.status(result.statusCode).json({
    success: result.success,
    mes: result.mes
  })
})

const deleteProduct = asyncHandler(async (req, res) => {
  const { pid } = req.params
  const result = await productService.deleteProduct(pid)
  return res.status(result.statusCode).json({
    success: result.success,
    mes: result.mes
  })
})

const ratings = asyncHandler(async (req, res) => {
  const { _id } = req.user
  const result = await productService.ratings(_id, req.body)
  return res.status(result.statusCode).json({
    success: result.success,
    updatedProduct: result.updatedProduct
  })
})

const uploadImagesProduct = asyncHandler(async (req, res) => {
  const { pid } = req.params
  const result = await productService.uploadImagesProduct(pid, req.files)
  return res.status(result.statusCode).json({
    success: result.success,
    updatedProduct: result.updatedProduct,
    mes: result.mes
  })
})

const addVarriant = asyncHandler(async (req, res) => {
  const { pid } = req.params
  const result = await productService.addVarriant(pid, req.body, req.files)
  return res.status(result.statusCode).json({
    success: result.success,
    mes: result.mes
  })
})

module.exports = {
  createProduct,
  getProduct,
  getProducts,
  updateProduct,
  deleteProduct,
  ratings,
  uploadImagesProduct,
  addVarriant
}