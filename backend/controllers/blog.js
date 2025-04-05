const Blog = require("../models/blog")
const asyncHandler = require("express-async-handler")

const createNewBlog = asyncHandler(async (req, res) => {
  try {
    const { title, description, hashtags } = req.body
    const imagePath = req.file?.path
    
    if (!imagePath || !title || !description || !hashtags) {
      return res.status(400).json({
        success: false,
        mes: "Vui lòng nhập đủ thông tin!"
      })
    }
    
    const response = await Blog.create({ ...req.body, image: imagePath })
    
    return res.status(201).json({
      success: !!response,
      mes: "Created blog.",
      response
    })
  } catch (error) {
    console.error(error.message)
    res.status(500).json({ success: false, mes: error.message })
  }
})

const updateBlog = asyncHandler(async (req, res) => {
  try {
    const { bid } = req.params
    const imagePath = req.file?.path
    const data = { ...req.body }
    
    if (imagePath) data.image = imagePath
    
    const updatedBlog = await Blog.findByIdAndUpdate(bid, data, { new: true })
    
    return res.status(updatedBlog ? 200 : 400).json({
      success: !!updatedBlog,
      mes: updatedBlog ? "Cập nhật thành công." : "Không thể cập nhật bài viết",
      updatedBlog
    })
  } catch (error) {
    console.error(error.message)
    res.status(500).json({ success: false, mes: error.message })
  }
})

const getBlogs = asyncHandler(async (req, res) => {
  try {
    const queries = req.query
    const excludeFields = ["limit", "sort", "page", "fields"]
    const queryObj = { ...queries }
    
    excludeFields.forEach((field) => delete queryObj[field])
    
    let queryString = JSON.stringify(queryObj)
    queryString = queryString.replace(
      /\b(gte|gt|lt|lte)\b/g,
      (match) => `$${match}`
    )
    
    const formatedQueries = JSON.parse(queryString)
    let queryObject = {}
    
    if (queries?.q) {
      delete formatedQueries.q
      queryObject = {
        $or: [{ title: { $regex: queries.q, $options: "i" } }],
      }
    }
    
    const qr = { ...formatedQueries, ...queryObject }
    
    // Pagination
    const page = +queries.page || 1
    const limit = +queries.limit || process.env.LIMIT_PRODUCTS
    const skip = (page - 1) * limit
    
    // Build query
    let queryCommand = Blog.find(qr)
    
    // Sort
    if (queries.sort) {
      const sortBy = queries.sort === "createdAt:asc" ? "createdAt" : "-createdAt"
      queryCommand = queryCommand.sort(sortBy)
    } else {
      queryCommand = queryCommand.sort("-createdAt") // Default: newest first
    }
    
    // Field limiting
    if (queries.fields) {
      const fields = queries.fields.split(",").join(" ")
      queryCommand = queryCommand.select(fields)
    }
    
    // Pagination
    queryCommand = queryCommand.skip(skip).limit(limit)
    
    // Execute query
    const blogs = await queryCommand.exec()
    const counts = await Blog.find(qr).countDocuments()
    
    return res.status(200).json({
      success: true,
      counts,
      blogs
    })
  } catch (error) {
    console.error(error.message)
    res.status(500).json({ success: false, mes: error.message })
  }
})

const likeBlog = asyncHandler(async (req, res) => {
  try {
    const { _id } = req.user
    const { bid } = req.params
    
    const blog = await Blog.findById(bid)
    
    if (!blog) {
      return res.status(404).json({
        success: false,
        mes: "Không tìm thấy bài viết!"
      })
    }
    
    const alreadyDisliked = blog?.dislikes?.find((el) => el.toString() === _id)
    if (alreadyDisliked) {
      const response = await Blog.findByIdAndUpdate(
        bid,
        { $pull: { dislikes: _id } },
        { new: true }
      )
      
      return res.status(response ? 200 : 400).json({
        success: !!response,
        rs: response
      })
    }
    
    const isLiked = blog?.likes?.find((el) => el.toString() === _id)
    if (isLiked) {
      const response = await Blog.findByIdAndUpdate(
        bid,
        { $pull: { likes: _id } },
        { new: true }
      )
      
      return res.status(response ? 200 : 400).json({
        success: !!response,
        rs: response
      })
    } else {
      const response = await Blog.findByIdAndUpdate( 
        bid,
        { $push: { likes: _id } },
        { new: true }
      )
      
      return res.status(response ? 200 : 400).json({
        success: !!response,
        rs: response
      })
    }
  } catch (error) {
    console.error(error.message)
    res.status(500).json({ success: false, mes: error.message })
  }
})

const dislikeBlog = asyncHandler(async (req, res) => {
  try {
    const { _id } = req.user
    const { bid } = req.params
    
    if (!bid) {
      return res.status(400).json({
        success: false,
        mes: "Vui lòng nhập đủ thông tin!"
      })
    }
    
    const blog = await Blog.findById(bid)
    
    if (!blog) {
      return res.status(404).json({
        success: false,
        mes: "Không tìm thấy bài viết!"
      })
    }
    
    const alreadyLiked = blog?.likes?.find((el) => el.toString() === _id)
    if (alreadyLiked) {
      const response = await Blog.findByIdAndUpdate(
        bid,
        { $pull: { likes: _id } },
        { new: true }
      )
      
      return res.status(response ? 200 : 400).json({
        success: !!response,
        rs: response
      })
    }
    
    const isDisliked = blog?.dislikes?.find((el) => el.toString() === _id)
    if (isDisliked) {
      const response = await Blog.findByIdAndUpdate(
        bid,
        { $pull: { dislikes: _id } },
        { new: true }
      )
      
      return res.status(response ? 200 : 400).json({
        success: !!response,
        rs: response
      })
    } else {
      const response = await Blog.findByIdAndUpdate(
        bid,
        { $push: { dislikes: _id } },
        { new: true }
      )
      
      return res.status(response ? 200 : 400).json({
        success: !!response,
        rs: response
      })
    }
  } catch (error) {
    console.error(error.message)
    res.status(500).json({ success: false, mes: error.message })
  }
})

const getBlog = asyncHandler(async (req, res) => {
  try {
    const { bid } = req.params
    
    const blog = await Blog.findByIdAndUpdate(
      bid,
      { $inc: { numberViews: 1 } },
      { new: true }
    )
      .populate("likes", "firstname lastname")
      .populate("dislikes", "firstname lastname")
    
    return res.status(blog ? 200 : 404).json({
      success: !!blog,
      rs: blog
    })
  } catch (error) {
    console.error(error.message)
    res.status(500).json({ success: false, mes: error.message })
  }
})

const deleteBlog = asyncHandler(async (req, res) => {
  try {
    const { bid } = req.params
    
    const blog = await Blog.findByIdAndDelete(bid)
    
    return res.status(blog ? 200 : 400).json({
      success: !!blog,
      deletedBlog: blog || "Đã xảy ra lỗi"
    })
  } catch (error) {
    console.error(error.message)
    res.status(500).json({ success: false, mes: error.message })
  }
})

const uploadImagesBlog = asyncHandler(async (req, res) => {
  try {
    const { bid } = req.params
    const imagePath = req.file?.path
    
    if (!imagePath) {
      return res.status(400).json({
        status: false,
        mes: "Vui lòng nhập đủ thông tin!"
      })
    }
    
    const response = await Blog.findByIdAndUpdate(
      bid,
      { image: imagePath },
      { new: true }
    )
    
    return res.status(response ? 200 : 400).json({
      status: !!response,
      updatedBlog: response || "Không thể tải ảnh lên bài viết"
    })
  } catch (error) {
    console.error(error.message)
    res.status(500).json({ success: false, mes: error.message })
  }
})

module.exports = {
  createNewBlog,
  updateBlog,
  getBlogs,
  likeBlog,
  dislikeBlog,
  getBlog,
  deleteBlog,
  uploadImagesBlog,
}