const Blog = require("../models/blog")
const asyncHandler = require("express-async-handler")

const createNewBlog = asyncHandler(async (req, res) => {
  try{
  const { title, description, hashtags } = req.body;
    if (!req.file) throw new Error("Vui lòng nhập đủ thông tin!");
    if (!title || !description || !hashtags)
      throw new Error("Vui lòng nhập đủ thông tin!");
    const response = await Blog.create({ ...req.body, image: req.file.path });
    res.json({ success: true, mes: "Created blog.", response });
  }catch{
    console.error(error.message); // Log lỗi tại đây
    res.status(500).json({ success: false, mes: error.message });
  }
});

const updateBlog = asyncHandler(async (req, res) => {
  const { bid } = req.params;
  const response = await Blog.findByIdAndUpdate(bid, req.body, { new: true });
  return res.json({
    success: !!response,
    mes: response ? "Cập nhật thành công." : "Không thể cập nhật bài viết",
  });
});

const getBlogs = asyncHandler(async (req, res) => {
  const queries = { ...req.query };
  const excludeFields = ["limit", "sort", "page", "fields"];
  excludeFields.forEach((el) => delete queries[el]);
  let queryString = JSON.stringify(queries);
  queryString = queryString.replace(
    /\b(gte|gt|lt|lte)\b/g,
    (matchedEl) => `$${matchedEl}`
  );
  const formatedQueries = JSON.parse(queryString);
  let queryObject = {};
  if (queries?.q) {
    delete formatedQueries.q;
    queryObject = {
      $or: [{ title: { $regex: queries.q, $options: "i" } }],
    };
  }
  const qr = { ...formatedQueries, ...queryObject };
  let queryCommand = Blog.find(qr);
  if (req.query.sort) {
    const sortBy =
      req.query.sort === "createdAt:asc" ? "createdAt" : "-createdAt"; // Tăng dần hoặc giảm dần
    queryCommand = queryCommand.sort(sortBy);
  } else {
    queryCommand = queryCommand.sort("-createdAt"); // Mặc định: Mới nhất
  }


  if (req.query.fields) {
    const fields = req.query.fields.split(",").join(" ");
    queryCommand = queryCommand.select(fields);
  }
  const page = +req.query.page || 1;
  const limit = +req.query.limit || process.env.LIMIT_PRODUCTS;
  const skip = (page - 1) * limit;
  queryCommand.skip(skip).limit(limit);
  queryCommand.exec(async (err, response) => {
    if (err) throw new Error(err.message);
    const counts = await Blog.find(qr).countDocuments();
    return res.status(200).json({
      success: !!response,
      counts,
      blogs: response || "Không thể lấy thông tin bài viết",
    });
  });
});

const likeBlog = asyncHandler(async (req, res) => {
  const { _id } = req.user;
  const { bid } = req.params;
  const blog = await Blog.findById(bid);
  const alreadyDisliked = blog?.dislikes?.find((el) => el.toString() === _id);
  if (alreadyDisliked) {
    const response = await Blog.findByIdAndUpdate(
      bid,
      { $pull: { dislikes: _id } },
      { new: true }
    );
    return res.json({
      success: !!response,
      rs: response,
    });
  }
  const isLiked = blog?.likes?.find((el) => el.toString() === _id);
  if (isLiked) {
    const response = await Blog.findByIdAndUpdate(
      bid,
      { $pull: { likes: _id } },
      { new: true }
    );
    return res.json({
      success: !!response,
      rs: response,
    });
  } else {
    const response = await Blog.findByIdAndUpdate(
      bid,
      { $push: { likes: _id } },
      { new: true }
    );
    return res.json({
      success: !!response,
      rs: response,
    });
  }
});

const dislikeBlog = asyncHandler(async (req, res) => {
  const { _id } = req.user;
  const { bid } = req.params;
  if (!bid) throw new Error("Vui lòng nhập đủ thông tin!");
  const blog = await Blog.findById(bid);
  const alreadyLiked = blog?.likes?.find((el) => el.toString() === _id);
  if (alreadyLiked) {
    const response = await Blog.findByIdAndUpdate(
      bid,
      { $pull: { likes: _id } },
      { new: true }
    );
    return res.json({
      success: !!response,
      rs: response,
    });
  }
  const isDisliked = blog?.dislikes?.find((el) => el.toString() === _id);
  if (isDisliked) {
    const response = await Blog.findByIdAndUpdate(
      bid,
      { $pull: { dislikes: _id } },
      { new: true }
    );
    return res.json({
      success: !!response,
      rs: response,
    });
  } else {
    const response = await Blog.findByIdAndUpdate(
      bid,
      { $push: { dislikes: _id } },
      { new: true }
    );
    return res.json({
      success: !!response,
      rs: response,
    });
  }
});

const getBlog = asyncHandler(async (req, res) => {
  const { bid } = req.params;
  const blog = await Blog.findByIdAndUpdate(
    bid,
    { $inc: { numberViews: 1 } },
    { new: true }
  )
    .populate("likes", "firstname lastname")
    .populate("dislikes", "firstname lastname");
  return res.json({
    success: !!blog,
    rs: blog,
  });
});

const deleteBlog = asyncHandler(async (req, res) => {
  const { bid } = req.params;
  const blog = await Blog.findByIdAndDelete(bid);
  return res.json({
    success: !!blog,
    deletedBlog: blog || "Đã xảy ra lỗi",
  });
});

const uploadImagesBlog = asyncHandler(async (req, res) => {
  const { bid } = req.params;
  if (!req.file) throw new Error("Vui lòng nhập đủ thông tin!");
  const response = await Blog.findByIdAndUpdate(
    bid,
    { image: req.file.path },
    { new: true }
  );
  return res.status(200).json({
    status: !!response,
    updatedBlog: response || "Không thể tải ảnh lên bài viết",
  });
});


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
