const Product = require("../models/product")
const slugify = require("slugify")
const makeSKU = require("uniqid")
const ProductCategory  = require("../models/productCategory")

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
    try {
      const product = await Product.findById(productId)
      .populate("brand", "title")
      .populate("category", "title slug")
      .populate("ratings.postedBy", "firstname lastname avatar")
  
      if (!product) {
        return {
          success: false,
          statusCode: 404,
          mes: "Không tìm thấy sản phẩm"
        };
      }
  
      return {
        success: true,
        statusCode: 200,
        productData: product
      };
    } catch (error) {
      return {
        success: false,
        statusCode: 500,
        mes: "Đã xảy ra lỗi khi lấy sản phẩm",
      };
    }
  }
  
  

  async getProducts(queries) {
    try {
      const excludeFields = ["limit", "sort", "page", "fields"];
      const queryObj = { ...queries };
      excludeFields.forEach((el) => delete queryObj[el]);
  
      // Convert operator syntax
      let queryString = JSON.stringify(queryObj);
      queryString = queryString.replace(
        /\b(gte|gt|lt|lte)\b/g,
        (match) => `$${match}`
      );
      const formatedQueries = JSON.parse(queryString);
  
      // 🔍 Convert category slug → _id
      if (queryObj?.category) {
        const categoryDoc = await ProductCategory.findOne({ slug: queryObj.category });
        if (categoryDoc?._id) {
          formatedQueries.category = categoryDoc._id;
        } else {
          return {
            success: true,
            products: [],
            counts: 0,
            statusCode: 200,
          };
        }
      }
  
      // 🔍 Color filter (multi-color support)
      let colorQueryObject = {};
      if (queryObj?.color) {
        delete formatedQueries.color;
        const colorArr = queryObj.color.split(",");
        const colorQuery = colorArr.map((el) => ({
          color: { $regex: el, $options: "i" },
        }));
        colorQueryObject = { $or: colorQuery };
      }
  
      // 🔍 Keyword search (q)
      let queryObject = {};
      if (queryObj?.q) {
        queryObject = {
          $or: [
            { title: { $regex: queryObj.q, $options: "i" } },
            { color: { $regex: queryObj.q, $options: "i" } },
          ],
        };
      }
  
      // 🔎 Tổng hợp điều kiện
      const qr = {
        ...formatedQueries,
        ...colorQueryObject,
        ...queryObject,
      };
  
      // Tạo query
      let queryCommand = Product.find(qr)
        .populate("brand", "title")
        .populate("category", "title slug");
  
      // Sort
      if (queries.sort) {
        const sortBy = queries.sort.split(",").join(" ");
        queryCommand = queryCommand.sort(sortBy);
      }
  
      // Field selection
      if (queries.fields) {
        const fields = queries.fields.split(",").join(" ");
        queryCommand = queryCommand.select(fields);
      }
  
      // Pagination
      const page = +queries.page || 1;
      const limit = +queries.limit || +process.env.LIMIT_PRODUCTS || 8;
      const skip = (page - 1) * limit;
      queryCommand = queryCommand.skip(skip).limit(limit);
  
      // Run query
      const response = await queryCommand.exec();
      const counts = await Product.countDocuments(qr);
  
      return {
        success: true,
        products: response,
        counts,
        currentPage: page,
        statusCode: 200,
      };
    } catch (error) {
      return {
        success: false,
        message: "Đã xảy ra lỗi khi lấy danh sách sản phẩm.",
        statusCode: 500,
      };
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