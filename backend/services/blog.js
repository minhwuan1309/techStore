const Blog = require("../models/blog")
const asyncHandler = require("express-async-handler")

class BlogService {
  async createNewBlog(blogData, imagePath) {
    const { title, description, hashtags } = blogData
    
    if (!imagePath || !title || !description || !hashtags)
      throw new Error("Vui lòng nhập đủ thông tin!")
    
    const response = await Blog.create({ ...blogData, image: imagePath })
    
    return {
      success: !!response,
      mes: "Created blog.",
      response,
      statusCode: response ? 201 : 400
    }
  }

  async updateBlog(blogId, blogData, imagePath = null) {
    const data = { ...blogData }
    
    if (imagePath) data.image = imagePath
    
    const response = await Blog.findByIdAndUpdate(blogId, data, { new: true })
    
    return {
      success: !!response,
      mes: response ? "Cập nhật thành công." : "Không thể cập nhật bài viết",
      updatedBlog: response,
      statusCode: response ? 200 : 400
    }
  }

  async getBlogs(queries) {
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
    
    return {
      success: true,
      counts,
      blogs,
      statusCode: 200
    }
  }

  async likeBlog(userId, blogId) {
    const blog = await Blog.findById(blogId)
    
    if (!blog) throw new Error("Không tìm thấy bài viết!")
    
    const alreadyDisliked = blog?.dislikes?.find((el) => el.toString() === userId)
    if (alreadyDisliked) {
      const response = await Blog.findByIdAndUpdate(
        blogId,
        { $pull: { dislikes: userId } },
        { new: true }
      )
      
      return {
        success: !!response,
        rs: response,
        statusCode: response ? 200 : 400
      }
    }
    
    const isLiked = blog?.likes?.find((el) => el.toString() === userId)
    if (isLiked) {
      const response = await Blog.findByIdAndUpdate(
        blogId,
        { $pull: { likes: userId } },
        { new: true }
      )
      
      return {
        success: !!response,
        rs: response,
        statusCode: response ? 200 : 400
      }
    } else {
      const response = await Blog.findByIdAndUpdate( 
        blogId,
        { $push: { likes: userId } },
        { new: true }
      )
      
      return {
        success: !!response,
        rs: response,
        statusCode: response ? 200 : 400
      }
    }
  }

  async dislikeBlog(userId, blogId) {
    if (!blogId) throw new Error("Vui lòng nhập đủ thông tin!")
    
    const blog = await Blog.findById(blogId)
    
    if (!blog) throw new Error("Không tìm thấy bài viết!")
    
    const alreadyLiked = blog?.likes?.find((el) => el.toString() === userId)
    if (alreadyLiked) {
      const response = await Blog.findByIdAndUpdate(
        blogId,
        { $pull: { likes: userId } },
        { new: true }
      )
      
      return {
        success: !!response,
        rs: response,
        statusCode: response ? 200 : 400
      }
    }
    
    const isDisliked = blog?.dislikes?.find((el) => el.toString() === userId)
    if (isDisliked) {
      const response = await Blog.findByIdAndUpdate(
        blogId,
        { $pull: { dislikes: userId } },
        { new: true }
      )
      
      return {
        success: !!response,
        rs: response,
        statusCode: response ? 200 : 400
      }
    } else {
      const response = await Blog.findByIdAndUpdate(
        blogId,
        { $push: { dislikes: userId } },
        { new: true }
      )
      
      return {
        success: !!response,
        rs: response,
        statusCode: response ? 200 : 400
      }
    }
  }

  async getBlog(blogId) {
    const blog = await Blog.findByIdAndUpdate(
      blogId,
      { $inc: { numberViews: 1 } },
      { new: true }
    )
      .populate("likes", "firstname lastname")
      .populate("dislikes", "firstname lastname")
    
    return {
      success: !!blog,
      rs: blog,
      statusCode: blog ? 200 : 404
    }
  }

  async deleteBlog(blogId) {
    const blog = await Blog.findByIdAndDelete(blogId)
    
    return {
      success: !!blog,
      deletedBlog: blog || "Đã xảy ra lỗi",
      statusCode: blog ? 200 : 400
    }
  }

  async uploadImagesBlog(blogId, imagePath) {
    if (!imagePath) throw new Error("Vui lòng nhập đủ thông tin!")
    
    const response = await Blog.findByIdAndUpdate(
      blogId,
      { image: imagePath },
      { new: true }
    )
    
    return {
      success: !!response,
      updatedBlog: response || "Không thể tải ảnh lên bài viết",
      statusCode: response ? 200 : 400
    }
  }
}

module.exports = new BlogService()