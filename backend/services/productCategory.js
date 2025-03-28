const ProductCategory = require("../models/productCategory")
const mongoose = require("mongoose")

class ProductCategoryService {
  async createCategory(categoryData, imagePath) {
    const { title, brand } = categoryData

    if (!title || !brand) {
      return {
        success: false,
        message: "Vui lòng nhập đủ thông tin",
        statusCode: 400
      }
    }

    if (!imagePath) {
      return {
        success: false,
        message: "Tải lên hình ảnh thất bại.",
        statusCode: 400
      }
    }

    try {
      const response = await ProductCategory.create({ ...categoryData, image: imagePath })
      return {
        success: true,
        message: "Tạo danh mục thành công.",
        createdCategory: response,
        statusCode: 200
      }
    } catch (error) {
      console.error("Lỗi khi tạo danh mục:", error)
      return {
        success: false,
        message: "Tạo danh mục thất bại!",
        statusCode: 500
      }
    }
  }

  async getCategories() {
    try {
      const response = await ProductCategory.find()
      return {
        success: !!response,
        prodCategories: response || "Không thể lấy danh sách danh mục.",
        statusCode: 200
      }
    } catch (error) {
      console.error("Lỗi khi lấy danh mục:", error)
      return {
        success: false,
        message: "Đã xảy ra lỗi.",
        statusCode: 500
      }
    }
  }

  async getCategoryById(pcid) {
    if (!mongoose.Types.ObjectId.isValid(pcid)) {
      return {
        success: false,
        message: "ID danh mục không hợp lệ.",
        statusCode: 400
      }
    }

    try {
      const productCategory = await ProductCategory.findById(pcid)
      if (!productCategory) {
        return {
          success: false,
          message: "Không tìm thấy danh mục.",
          statusCode: 404
        }
      }

      return {
        success: true,
        productCategory,
        statusCode: 200
      }
    } catch (error) {
      console.error("Lỗi khi lấy danh mục theo ID:", error)
      return {
        success: false, 
        message: "Đã xảy ra lỗi.",
        statusCode: 500
      }
    }
  }

  async updateCategory(pcid, categoryData, imagePath) {
    const { title } = categoryData
    const brand = categoryData.brand ? 
      (Array.isArray(categoryData.brand) ? categoryData.brand : Object.values(categoryData.brand)) : 
      []

    if (!title || !brand.length) {
      return {
        success: false,
        message: "Vui lòng nhập đủ thông tin!",
        statusCode: 400
      }
    }

    const updateData = { title, brand }
    if (imagePath) {
      updateData.image = imagePath
    }

    try {
      const updatedCategory = await ProductCategory.findByIdAndUpdate(
        pcid,
        updateData,
        { new: true }
      )
      if (!updatedCategory) {
        return {
          success: false,
          message: "Danh mục không tồn tại.",
          statusCode: 404
        }
      }
      return {
        success: true,
        updatedCategory,
        statusCode: 200
      }
    } catch (error) {
      console.error("Lỗi khi cập nhật danh mục:", error)
      return {
        success: false,
        message: "Cập nhật danh mục thất bại.",
        statusCode: 500
      }
    }
  }

  async deleteCategory(pcid) {
    try {
      const response = await ProductCategory.findByIdAndDelete(pcid)
      return {
        success: !!response,
        deletedCategory: response || "Không thể xóa danh mục.",
        statusCode: response ? 200 : 404
      }
    } catch (error) {
      console.error("Lỗi khi xóa danh mục:", error)
      return {
        success: false,
        message: "Đã xảy ra lỗi.",
        statusCode: 500
      }
    }
  }
}

module.exports = new ProductCategoryService()