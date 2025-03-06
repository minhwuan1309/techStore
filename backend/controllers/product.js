const Product = require("../models/product")
const asyncHandler = require("express-async-handler")
const slugify = require("slugify")
const makeSKU = require("uniqid")

const createProduct = asyncHandler(async (req, res) => {
  const { title, price, description, brand, category, color } = req.body;
  const thumb = req?.files?.thumb[0]?.path;
  const images = req.files?.images?.map((el) => el.path);

  if (!(title && price && description && brand && category && color))
    throw new Error("Vui lòng nhập đủ thông tin");

  req.body.slug = slugify(title);

  if (thumb) req.body.thumb = thumb;
  if (images) req.body.images = images;

  const newProduct = await Product.create(req.body);
  
  return res.status(200).json({
    success: newProduct ? true : false,
    mes: newProduct ? "Đã tạo sản phẩm" : "Thất bại.",
  });
});
const getProduct = asyncHandler(async (req, res) => {
  const { pid } = req.params
  const product = await Product.findById(pid).populate({
    path: "ratings",
    populate: {
      path: "postedBy",
      select: "firstname lastname avatar",
    },
  })
  return res.status(200).json({
    success: product ? true : false,
    productData: product ? product : "Không thể lấy thông tin sản phẩm",
  })
})
// Filtering, sorting & pagination
const getProducts = asyncHandler(async (req, res) => {
  const queries = { ...req.query }
  // Tách các trường đặc biệt ra khỏi query
  const excludeFields = ["limit", "sort", "page", "fields"]
  excludeFields.forEach((el) => delete queries[el])

  // Format lại các operators cho đúng cú pháp mongoose
  let queryString = JSON.stringify(queries)
  queryString = queryString.replace(
    /\b(gte|gt|lt|lte)\b/g,
    (macthedEl) => `$${macthedEl}`
  )
  const formatedQueries = JSON.parse(queryString)
  let colorQueryObject = {}
  if (queries?.title)
    formatedQueries.title = { $regex: queries.title, $options: "i" }
  if (queries?.category)
    formatedQueries.category = { $regex: queries.category, $options: "i" }
  if (queries?.brand)
    formatedQueries.brand = { $regex: queries.brand, $options: "i" }
  if (queries?.color) {
    delete formatedQueries.color
    const colorArr = queries.color?.split(",")
    const colorQuery = colorArr.map((el) => ({
      color: { $regex: el, $options: "i" },
    }))
    colorQueryObject = { $or: colorQuery }
  }
  let queryObject = {}
  if (queries?.q) {
    delete formatedQueries.q
    queryObject = {
      $or: [
        { color: { $regex: queries.q, $options: "i" } },
        { title: { $regex: queries.q, $options: "i" } },
        { category: { $regex: queries.q, $options: "i" } },
        { brand: { $regex: queries.q, $options: "i" } },
        // { description: { $regex: queries.q, $options: 'i' } },
      ],
    }
  }
  const qr = { ...colorQueryObject, ...formatedQueries, ...queryObject }
  let queryCommand = Product.find(qr)

  // Sorting
  if (req.query.sort) {
    const sortBy = req.query.sort.split(",").join(" ")
    queryCommand = queryCommand.sort(sortBy)
  }

  // Fields limiting
  if (req.query.fields) {
    const fields = req.query.fields.split(",").join(" ")
    queryCommand = queryCommand.select(fields)
  }

  // Pagination
  const page = +req.query.page || 1
  const limit = +req.query.limit || process.env.LIMIT_PRODUCTS
  const skip = (page - 1) * limit
  queryCommand.skip(skip).limit(limit)

  queryCommand.exec(async (err, response) => {
    if (err) throw new Error(err.message)
    const counts = await Product.find(qr).countDocuments()
    return res.status(200).json({
      success: response ? true : false,
      counts,
      products: response ? response : "Không thể lấy thông tin sản phẩm",
    })
  })
})
const updateProduct = asyncHandler(async (req, res) => {
  const { pid } = req.params;
  const files = req?.files;

  // Kiểm tra và gán ảnh thumbnail nếu có
  if (files?.thumb && files?.thumb[0]?.path) {
    req.body.thumb = files.thumb[0].path;
  }

  // Kiểm tra và lọc danh sách ảnh hợp lệ
  if (files?.images) {
    req.body.images = files.images
      .filter((image) => image && image.path)
      .map((el) => el.path);
  }

  // Tạo slug từ tiêu đề nếu có
  if (req.body && req.body.title) {
    req.body.slug = slugify(req.body.title);
  }

  // Cập nhật sản phẩm
  const updatedProduct = await Product.findByIdAndUpdate(pid, req.body, {
    new: true,
  });

  return res.status(200).json({
    success: !!updatedProduct,
    mes: updatedProduct
      ? "Cập nhật sản phẩm thành công."
      : "Không thể cập nhật sản phẩm.",
  });
});

const deleteProduct = asyncHandler(async (req, res) => {
  const { pid } = req.params;
  const deletedProduct = await Product.findByIdAndDelete(pid);
  return res.status(200).json({
    success: !!deletedProduct,
    mes: deletedProduct
      ? "Xóa sản phẩm thành công."
      : "Không thể xóa sản phẩm.",
  });
});

const ratings = asyncHandler(async (req, res) => {
  const { _id } = req.user;
  const { star, comment, pid, updatedAt } = req.body;

  if (!star || !pid) throw new Error("Vui lòng nhập đủ thông tin.");

  const ratingProduct = await Product.findById(pid);
  const alreadyRating = ratingProduct?.ratings?.find(
    (el) => el.postedBy.toString() === _id
  );

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
    );
  } else {
    // Thêm đánh giá mới
    await Product.findByIdAndUpdate(
      pid,
      {
        $push: { ratings: { star, comment, postedBy: _id, updatedAt } },
      },
      { new: true }
    );
  }

  // Tính tổng số sao
  const updatedProduct = await Product.findById(pid);
  const ratingCount = updatedProduct.ratings.length;
  const sumRatings = updatedProduct.ratings.reduce(
    (sum, el) => sum + +el.star,
    0
  );
  updatedProduct.totalRatings =
    Math.round((sumRatings * 10) / ratingCount) / 10;

  await updatedProduct.save();

  return res.status(200).json({
    success: true,
    updatedProduct,
  });
});

const uploadImagesProduct = asyncHandler(async (req, res) => {
  const { pid } = req.params;

  if (!req.files) throw new Error("Vui lòng nhập đủ thông tin.");

  const response = await Product.findByIdAndUpdate(
    pid,
    { $push: { images: { $each: req.files.map((el) => el.path) } } },
    { new: true }
  );

  return res.status(200).json({
    success: !!response,
    updatedProduct: response || "Không thể tải ảnh lên.",
  });
});

const addVarriant = asyncHandler(async (req, res) => {
  const { pid } = req.params;
  const { title, price, color } = req.body;
  const thumb = req?.files?.thumb[0]?.path;
  const images = req.files?.images?.map((el) => el.path);

  if (!title || !price || !color)
    throw new Error("Vui lòng nhập đủ thông tin.");

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
          sku: makeSKU().toUpperCase(),
        },
      },
    },
    { new: true }
  );

  return res.status(200).json({
    success: !!response,
    mes: response
      ? "Thêm thành công."
      : "Không thể thêm biến thể sản phẩm.",
  });
});


module.exports = {
  createProduct,
  getProduct,
  getProducts,
  updateProduct,
  deleteProduct,
  ratings,
  uploadImagesProduct,
  addVarriant,
}
