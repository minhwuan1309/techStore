const Product = require("../models/product")
const slugify = require("slugify")
const makeSKU = require("uniqid")
const ProductCategory = require("../models/productCategory")
const asyncHandler = require("express-async-handler")

// Tạo sản phẩm mới
const createProduct = asyncHandler(async (req, res) => {
  const { title, price, description, brand, category, color } = req.body
  const files = req.files
  const thumb = files?.thumb?.[0]?.path
  const images = files?.images?.map((el) => el.path)

  if (!(title && price && description && brand && category && color)) {
    return res.status(400).json({
      success: false,
      mes: "Vui lòng nhập đủ thông tin"
    })
  }

  try {
    const productData = { ...req.body }
    productData.slug = slugify(title)

    if (thumb) productData.thumb = thumb
    if (images) productData.images = images

    const newProduct = await Product.create(productData)
    
    return res.status(200).json({
      success: !!newProduct,
      mes: newProduct ? "Đã tạo sản phẩm" : "Thất bại.",
      product: newProduct
    })
  } catch (error) {
    return res.status(500).json({
      success: false,
      mes: "Đã xảy ra lỗi khi tạo sản phẩm: " + error.message
    })
  }
})

// Lấy thông tin sản phẩm theo ID
const getProduct = asyncHandler(async (req, res) => {
  const { pid } = req.params

  try {
    const product = await Product.findById(pid)
      .populate("brand", "title")
      .populate("category", "title slug")
      .populate("ratings.postedBy", "firstname lastname avatar")

    if (!product) {
      return res.status(404).json({
        success: false,
        mes: "Không tìm thấy sản phẩm"
      })
    }

    return res.status(200).json({
      success: true,
      productData: product
    })
  } catch (error) {
    return res.status(500).json({
      success: false,
      mes: "Đã xảy ra lỗi khi lấy sản phẩm: " + error.message
    })
  }
})

// Lấy danh sách sản phẩm với các tùy chọn lọc và phân trang
const getProducts = asyncHandler(async (req, res) => {
  try {
    const queries = req.query
    const excludeFields = ["limit", "sort", "page", "fields"]
    const queryObj = { ...queries }
    excludeFields.forEach((el) => delete queryObj[el])

    // Convert operator syntax
    let queryString = JSON.stringify(queryObj)
    queryString = queryString.replace(
      /\b(gte|gt|lt|lte)\b/g,
      (match) => `$${match}`
    )
    const formatedQueries = JSON.parse(queryString)

    // Chuyển đổi category slug thành _id
    if (queryObj?.category) {
      const categoryDoc = await ProductCategory.findOne({ slug: queryObj.category })
      if (categoryDoc?._id) {
        formatedQueries.category = categoryDoc._id
      } else {
        return res.status(200).json({
          success: true,
          products: [],
          counts: 0
        })
      }
    }

    // Xử lý lọc theo màu sắc
    let colorQueryObject = {}
    if (queryObj?.color) {
      delete formatedQueries.color
      const colorArr = queryObj.color.split(",")
      const colorQuery = colorArr.map((el) => ({
        color: { $regex: el, $options: "i" }
      }))
      colorQueryObject = { $or: colorQuery }
    }

    // Xử lý tìm kiếm theo từ khóa
    let queryObject = {}
    if (queryObj?.q) {
      queryObject = {
        $or: [
          { title: { $regex: queryObj.q, $options: "i" } },
          { color: { $regex: queryObj.q, $options: "i" } }
        ]
      }
    }

    // Tổng hợp điều kiện
    const qr = {
      ...formatedQueries,
      ...colorQueryObject,
      ...queryObject
    }

    // Tạo query
    let queryCommand = Product.find(qr)
      .populate("brand", "title")
      .populate("category", "title slug")

    // Sắp xếp
    if (queries.sort) {
      const sortBy = queries.sort.split(",").join(" ")
      queryCommand = queryCommand.sort(sortBy)
    }

    // Chọn trường
    if (queries.fields) {
      const fields = queries.fields.split(",").join(" ")
      queryCommand = queryCommand.select(fields)
    }

    // Phân trang
    const page = +queries.page || 1
    const limit = +queries.limit || +process.env.LIMIT_PRODUCTS || 8
    const skip = (page - 1) * limit
    queryCommand = queryCommand.skip(skip).limit(limit)

    // Thực thi truy vấn
    const response = await queryCommand.exec()
    const counts = await Product.countDocuments(qr)

    return res.status(200).json({
      success: true,
      products: response,
      counts,
      currentPage: page
    })
  } catch (error) {
    return res.status(500).json({
      success: false,
      mes: "Đã xảy ra lỗi khi lấy danh sách sản phẩm: " + error.message
    })
  }
})

// Cập nhật thông tin sản phẩm
const updateProduct = asyncHandler(async (req, res) => {
  const { pid } = req.params
  const files = req.files
  const updateData = { ...req.body }

  try {
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
    if (updateData.title) {
      updateData.slug = slugify(updateData.title)
    }

    // Cập nhật sản phẩm
    const updatedProduct = await Product.findByIdAndUpdate(pid, updateData, {
      new: true
    })

    return res.status(updatedProduct ? 200 : 400).json({
      success: !!updatedProduct,
      mes: updatedProduct
        ? "Cập nhật sản phẩm thành công."
        : "Không thể cập nhật sản phẩm.",
      updateData
    })
  } catch (error) {
    return res.status(500).json({
      success: false,
      mes: "Đã xảy ra lỗi khi cập nhật sản phẩm: " + error.message
    })
  }
})

// Xóa sản phẩm
const deleteProduct = asyncHandler(async (req, res) => {
  const { pid } = req.params

  try {
    const deletedProduct = await Product.findByIdAndDelete(pid)
    
    return res.status(deletedProduct ? 200 : 400).json({
      success: !!deletedProduct,
      mes: deletedProduct
        ? "Xóa sản phẩm thành công."
        : "Không thể xóa sản phẩm."
    })
  } catch (error) {
    return res.status(500).json({
      success: false,
      mes: "Đã xảy ra lỗi khi xóa sản phẩm: " + error.message
    })
  }
})

// Đánh giá sản phẩm
const ratings = asyncHandler(async (req, res) => {
  const { _id } = req.user
  const { star, comment, pid, updatedAt } = req.body

  try {
    if (!star || !pid) {
      return res.status(400).json({
        success: false,
        mes: "Vui lòng nhập đủ thông tin."
      })
    }

    const ratingProduct = await Product.findById(pid)
    if (!ratingProduct) {
      return res.status(404).json({
        success: false,
        mes: "Không tìm thấy sản phẩm."
      })
    }

    const alreadyRating = ratingProduct?.ratings?.find(
      (el) => el.postedBy.toString() === _id
    )

    if (alreadyRating) {
      // Cập nhật đánh giá
      await Product.updateOne(
        {
          ratings: { $elemMatch: alreadyRating }
        },
        {
          $set: {
            "ratings.$.star": star,
            "ratings.$.comment": comment,
            "ratings.$.updatedAt": updatedAt
          }
        },
        { new: true }
      )
    } else {
      // Thêm đánh giá mới
      await Product.findByIdAndUpdate(
        pid,
        {
          $push: { ratings: { star, comment, postedBy: _id, updatedAt } }
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

    return res.status(200).json({
      success: true,
      updatedProduct
    })
  } catch (error) {
    return res.status(500).json({
      success: false,
      mes: "Đã xảy ra lỗi khi đánh giá sản phẩm: " + error.message
    })
  }
})

// Tải lên hình ảnh cho sản phẩm
const uploadImagesProduct = asyncHandler(async (req, res) => {
  const { pid } = req.params
  const files = req.files

  try {
    if (!files || files.length === 0) {
      return res.status(400).json({
        success: false,
        mes: "Vui lòng tải lên ít nhất một hình ảnh."
      })
    }

    const response = await Product.findByIdAndUpdate(
      pid,
      { $push: { images: { $each: files.map((el) => el.path) } } },
      { new: true }
    )

    return res.status(response ? 200 : 400).json({
      success: !!response,
      updatedProduct: response,
      mes: response ? "Tải ảnh thành công" : "Không thể tải ảnh lên."
    })
  } catch (error) {
    return res.status(500).json({
      success: false,
      mes: "Đã xảy ra lỗi khi tải ảnh: " + error.message
    })
  }
})

// Thêm biến thể sản phẩm
const addVarriant = asyncHandler(async (req, res) => {
  const { pid } = req.params
  const { title, price, color } = req.body
  const files = req.files
  const thumb = files?.thumb?.[0]?.path
  const images = files?.images?.map((el) => el.path)

  try {
    if (!title || !price || !color) {
      return res.status(400).json({
        success: false,
        mes: "Vui lòng nhập đủ thông tin."
      })
    }

    const response = await Product.findByIdAndUpdate(
      pid,
      {
        $push: {
          varriants: {
            color,
            price,
            title,
            thumb,
            images,
            sku: makeSKU().toUpperCase()
          }
        }
      },
      { new: true }
    )

    return res.status(response ? 200 : 400).json({
      success: !!response,
      mes: response
        ? "Thêm thành công."
        : "Không thể thêm biến thể sản phẩm."
    })
  } catch (error) {
    return res.status(500).json({
      success: false,
      mes: "Đã xảy ra lỗi khi thêm biến thể: " + error.message
    })
  }
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