const Brand = require('../models/brand')

class BrandService {
  async createNewBrand(brandData) {
    const response = await Brand.create(brandData)
    return {
      success: !!response,
      createdBrand: response || "Không thể tạo thương hiệu mới",
      statusCode: response ? 200 : 400
    }
  }

  async getBrands() {
    const brands = await Brand.find()
    return {
      success: !!brands,
      brands: brands || [],
      statusCode: brands ? 200 : 404,
      mes: brands ? undefined : "Không tìm thấy thương hiệu"
    }
  }

  async updateBrand(brandId, brandData) {
    const response = await Brand.findByIdAndUpdate(brandId, brandData, { new: true })
    return {
      success: !!response,
      updatedBrand: response || "Không thể cập nhật thương hiệu",
      statusCode: response ? 200 : 400
    }
  }

  async deleteBrand(brandId) {
    const response = await Brand.findByIdAndDelete(brandId)
    return {
      success: !!response,
      deletedBrand: response || "Không thể xóa thương hiệu",
      statusCode: response ? 200 : 400
    }
  }
}

module.exports = new BrandService()