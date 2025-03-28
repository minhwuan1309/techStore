const { brandService } = require('../services/index')
const asyncHandler = require('express-async-handler')

const createNewBrand = asyncHandler(async (req, res) => {
  const result = await brandService.createNewBrand(req.body);
  return res.status(result.statusCode).json({
    success: result.success,
    createdBrand: result.createdBrand
  });
});

const getBrands = asyncHandler(async (req, res) => {
  const result = await brandService.getBrands();
  return res.status(result.statusCode).json({
    success: result.success,
    brands: result.brands,
    message: result.mes
  });
});

const updateBrand = asyncHandler(async (req, res) => {
  const { bid } = req.params;
  const result = await brandService.updateBrand(bid, req.body);
  return res.status(result.statusCode).json({
    success: result.success,
    updatedBrand: result.updatedBrand
  });
});

const deleteBrand = asyncHandler(async (req, res) => {
  const { bid } = req.params;
  const result = await brandService.deleteBrand(bid);
  return res.status(result.statusCode).json({
    success: result.success,
    deletedBrand: result.deletedBrand
  });
});

module.exports = {
    createNewBrand,
    getBrands,
    updateBrand,
    deleteBrand
}