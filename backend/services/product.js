const Product = require("../models/product")
const slugify = require("slugify")
const makeSKU = require("uniqid")

class ProductService {
  async createProduct(productData, files) {
    const { title, price, description, brand, category, color } = productData
    const thumb = files?.thumb?.[0]?.path
    const images = files?.images?.map((el) => el.path)

    if (!(title && price && description && brand && category && color))
      throw new Error("Vui lòng nhập đủ thông tin")

    productData.slug = slugify(title)

    if (thumb) productData.thumb = thumb
    if (images) productData.images = images

    const newProduct = await Product.create(productData)
    
    return {
      success: !!newProduct,
      mes: newProduct ? "Đã tạo sản phẩm" : "Thất bại.",
      statusCode: newProduct ? 200 : 400
    }
  }

  async getProduct(productId) {
    const product = await Product.findById(productId).populate({
      path: "ratings",
      populate: {
        path: "postedBy",
        select: "firstname lastname avatar",
      },
    })
    
    return {
      success: !!product,
      productData: product ? product : "Không thể lấy thông tin sản phẩm",
      statusCode: product ? 200 : 404
    }
  }

  async getProducts(queries) {
    // Tách các trường đặc biệt ra khỏi query
    const excludeFields = ["limit", "sort", "page", "fields"]
    const queryObj = { ...queries }
    excludeFields.forEach((el) => delete queryObj[el])

    // Format lại các operators cho đúng cú pháp mongoose
    let queryString = JSON.stringify(queryObj)
    queryString = queryString.replace(
      /\b(gte|gt|lt|lte)\b/g,
      (macthedEl) => `$${macthedEl}`
    )
    
    const formatedQueries = JSON.parse(queryString)
    let colorQueryObject = {}
    
    if (queryObj?.title)
      formatedQueries.title = { $regex: queryObj.title, $options: "i" }
    if (queryObj?.category)
      formatedQueries.category = { $regex: queryObj.category, $options: "i" }
    if (queryObj?.brand)
      formatedQueries.brand = { $regex: queryObj.brand, $options: "i" }
    if (queryObj?.color) {
      delete formatedQueries.color
      const colorArr = queryObj.color?.split(",")
      const colorQuery = colorArr.map((el) => ({
        color: { $regex: el, $options: "i" },
      }))
      colorQueryObject = { $or: colorQuery }
    }
    
    let queryObject = {}
    if (queryObj?.q) {
      delete formatedQueries.q
      queryObject = {
        $or: [
          { color: { $regex: queryObj.q, $options: "i" } },
          { title: { $regex: queryObj.q, $options: "i" } },
          { category: { $regex: queryObj.q, $options: "i" } },
          { brand: { $regex: queryObj.q, $options: "i" } },
        ],
      }
    }
    
    const qr = { ...colorQueryObject, ...formatedQueries, ...queryObject }
    let queryCommand = Product.find(qr)
    .populate("brand", "title")
    .populate("category", "title")
  

    // Sorting
    if (queries.sort) {
      const sortBy = queries.sort.split(",").join(" ")
      queryCommand = queryCommand.sort(sortBy)
    }

    // Fields limiting
    if (queries.fields) {
      const fields = queries.fields.split(",").join(" ")
      queryCommand = queryCommand.select(fields)
    }

    // Pagination
    const page = +queries.page || 1
    const limit = +queries.limit || process.env.LIMIT_PRODUCTS
    const skip = (page - 1) * limit
    queryCommand.skip(skip).limit(limit)
    
    try {
      const response = await queryCommand.exec()
      const counts = await Product.find(qr).countDocuments()
      
      return {
        success: true,
        counts,
        products: response,
        statusCode: 200
      }
    } catch (error) {
      throw new Error(error.message)
    }
  }

  async updateProduct(productId, updateData, files) {
    // Kiểm tra và gán ảnh thumbnail nếu có
    if (files?.thumb && files?.thumb[0]?.path) {
      updateData.thumb = files.thumb[0].path
    }

    // Kiểm tra và lọc danh sách ảnh hợp lệ
    if (files?.images) {
      updateData.images = files.images
        .filter((image) => image && image.path)
        .map((el) => el.path)
    }

    // Tạo slug từ tiêu đề nếu có
    if (updateData && updateData.title) {
      updateData.slug = slugify(updateData.title)
    }

    // Cập nhật sản phẩm
    const updatedProduct = await Product.findByIdAndUpdate(productId, updateData, {
      new: true,
    })

    return {
      success: !!updatedProduct,
      mes: updatedProduct
        ? "Cập nhật sản phẩm thành công."
        : "Không thể cập nhật sản phẩm.",
      statusCode: updatedProduct ? 200 : 400
    }
  }

  async deleteProduct(productId) {
    const deletedProduct = await Product.findByIdAndDelete(productId)
    
    return {
      success: !!deletedProduct,
      mes: deletedProduct
        ? "Xóa sản phẩm thành công."
        : "Không thể xóa sản phẩm.",
      statusCode: deletedProduct ? 200 : 400
    }
  }

  async ratings(userId, ratingData) {
    const { star, comment, pid, updatedAt } = ratingData

    if (!star || !pid) throw new Error("Vui lòng nhập đủ thông tin.")

    const ratingProduct = await Product.findById(pid)
    const alreadyRating = ratingProduct?.ratings?.find(
      (el) => el.postedBy.toString() === userId
    )

    if (alreadyRating) {
      // Cập nhật đánh giá
      await Product.updateOne(
        {
          ratings: { $elemMatch: alreadyRating },
        },
        {
          $set: {
            "ratings.$.star": star,
            "ratings.$.comment": comment,
            "ratings.$.updatedAt": updatedAt,
          },
        },
        { new: true }
      )
    } else {
      // Thêm đánh giá mới
      await Product.findByIdAndUpdate(
        pid,
        {
          $push: { ratings: { star, comment, postedBy: userId, updatedAt } },
        },
        { new: true }
      )
    }

    // Tính tổng số sao
    const updatedProduct = await Product.findById(pid)
    const ratingCount = updatedProduct.ratings.length
    const sumRatings = updatedProduct.ratings.reduce(
      (sum, el) => sum + +el.star,
      0
    )
    updatedProduct.totalRatings =
      Math.round((sumRatings * 10) / ratingCount) / 10

    await updatedProduct.save()

    return {
      success: true,
      updatedProduct,
      statusCode: 200
    }
  }

  async uploadImagesProduct(productId, files) {
    if (!files) throw new Error("Vui lòng nhập đủ thông tin.")

    const response = await Product.findByIdAndUpdate(
      productId,
      { $push: { images: { $each: files.map((el) => el.path) } } },
      { new: true }
    )

    return {
      success: !!response,
      updatedProduct: response,
      mes: response ? "Tải ảnh thành công" : "Không thể tải ảnh lên.",
      statusCode: response ? 200 : 400
    }
  }

  async addVarriant(productId, variantData, files) {
    const { title, price, color } = variantData
    const thumb = files?.thumb?.[0]?.path
    const images = files?.images?.map((el) => el.path)

    if (!title || !price || !color)
      throw new Error("Vui lòng nhập đủ thông tin.")

    const response = await Product.findByIdAndUpdate(
      productId,
      {
        $push: {
          varriants: {
            color,
            price,
            title,
            thumb,
            images,
            sku: makeSKU().toUpperCase(),
          },
        },
      },
      { new: true }
    )

    return {
      success: !!response,
      mes: response
        ? "Thêm thành công."
        : "Không thể thêm biến thể sản phẩm.",
      statusCode: response ? 200 : 400
    }
  }
}

module.exports = new ProductService()