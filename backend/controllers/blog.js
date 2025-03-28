const { blogService } = require("../services/index")
const asyncHandler = require("express-async-handler")

const createNewBlog = asyncHandler(async (req, res) => {
  try {
    const imagePath = req.file?.path
    const result = await blogService.createNewBlog(req.body, imagePath)
    
    return res.status(result.statusCode).json({
      success: result.success,
      mes: result.mes,
      response: result.response
    })
  } catch (error) {
    console.error(error.message)
    res.status(500).json({ success: false, mes: error.message })
  }
})

const updateBlog = asyncHandler(async (req, res) => {
  const { bid } = req.params
  const imagePath = req.file?.path
  const result = await blogService.updateBlog(bid, req.body, imagePath)
  
  return res.status(result.statusCode).json({
    success: result.success,
    mes: result.mes,
    updatedBlog: result.updatedBlog
  })
})

const getBlogs = asyncHandler(async (req, res) => {
  const result = await blogService.getBlogs(req.query)
  
  return res.status(result.statusCode).json({
    success: result.success,
    counts: result.counts,
    blogs: result.blogs
  })
})

const likeBlog = asyncHandler(async (req, res) => {
  const { _id } = req.user
  const { bid } = req.params
  
  const result = await blogService.likeBlog(_id, bid)
  
  return res.status(result.statusCode).json({
    success: result.success,
    rs: result.rs
  })
})

const dislikeBlog = asyncHandler(async (req, res) => {
  const { _id } = req.user
  const { bid } = req.params
  
  const result = await blogService.dislikeBlog(_id, bid)
  
  return res.status(result.statusCode).json({
    success: result.success,
    rs: result.rs
  })
})

const getBlog = asyncHandler(async (req, res) => {
  const { bid } = req.params
  
  const result = await blogService.getBlog(bid)
  
  return res.status(result.statusCode).json({
    success: result.success,
    rs: result.rs
  })
})

const deleteBlog = asyncHandler(async (req, res) => {
  const { bid } = req.params
  
  const result = await blogService.deleteBlog(bid)
  
  return res.status(result.statusCode).json({
    success: result.success,
    deletedBlog: result.deletedBlog
  })
})

const uploadImagesBlog = asyncHandler(async (req, res) => {
  const { bid } = req.params
  const imagePath = req.file?.path
  
  const result = await blogService.uploadImagesBlog(bid, imagePath)
  
  return res.status(result.statusCode).json({
    status: result.success,
    updatedBlog: result.updatedBlog
  })
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