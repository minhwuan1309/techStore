const ProductCategory = require("../models/productCategory");
const asyncHandler = require("express-async-handler");
const mongoose = require("mongoose");

const createCategory = asyncHandler(async (req, res) => {
  const { title, brand } = req.body;

  if (!title || !brand) {
    return res
      .status(400)
      .json({ success: false, message: "Vui lòng nhập đủ thông tin" });
  }

  const image = req.file?.path; // Đường dẫn ảnh tải lên
  if (!image) {
    return res.status(400).json({
      success: false,
      message: "Tải lên hình ảnh thất bại.",
    });
  }

  try {
    const response = await ProductCategory.create({ ...req.body, image });
    return res.json({
      success: true,
      message: "Tạo danh mục thành công.",
      createdCategory: response,
    });
  } catch (error) {
    console.error("Lỗi khi tạo danh mục:", error);
    return res
      .status(500)
      .json({ success: false, message: "Tạo danh mục thất bại!" });
  }
});

const getCategories = asyncHandler(async (req, res) => {
  try {
    const response = await ProductCategory.find();
    return res.json({
      success: !!response,
      prodCategories: response || "Không thể lấy danh sách danh mục.",
    });
  } catch (error) {
    console.error("Lỗi khi lấy danh mục:", error);
    return res.status(500).json({ success: false, message: "Đã xảy ra lỗi." });
  }
});

const getCategoryById = asyncHandler(async (req, res) => {
  const { pcid } = req.params;

  if (!mongoose.Types.ObjectId.isValid(pcid)) {
    return res
      .status(400)
      .json({ success: false, message: "ID danh mục không hợp lệ." });
  }

  const productCategory = await ProductCategory.findById(pcid);
  if (!productCategory) {
    return res
      .status(404)
      .json({ success: false, message: "Không tìm thấy danh mục." });
  }

  res.status(200).json({ success: true, productCategory });
});

const updateCategory = asyncHandler(async (req, res) => {
  const { pcid } = req.params;
  const { title } = req.body;
  const brand = req.body.brand ? Object.values(req.body.brand) : []; // Chuyển object brand về array

  if (!title || !brand.length) {
    return res
      .status(400)
      .json({ success: false, message: "Vui lòng nhập đủ thông tin!" });
  }

  const updateData = { title, brand };
  if (req.file?.path) {
    updateData.image = req.file.path; // Cập nhật ảnh nếu có
  }

  try {
    const updatedCategory = await ProductCategory.findByIdAndUpdate(
      pcid,
      updateData,
      { new: true }
    );
    if (!updatedCategory) {
      return res
        .status(404)
        .json({ success: false, message: "Danh mục không tồn tại." });
    }
    res.json({ success: true, updatedCategory });
  } catch (error) {
    console.error("Lỗi khi cập nhật danh mục:", error);
    res
      .status(500)
      .json({ success: false, message: "Cập nhật danh mục thất bại." });
  }
});

const deleteCategory = asyncHandler(async (req, res) => {
  const { pcid } = req.params;
  try {
    const response = await ProductCategory.findByIdAndDelete(pcid);
    return res.json({
      success: !!response,
      deletedCategory: response || "Không thể xóa danh mục.",
    });
  } catch (error) {
    console.error("Lỗi khi xóa danh mục:", error);
    return res.status(500).json({ success: false, message: "Đã xảy ra lỗi." });
  }
});

module.exports = {
  createCategory,
  getCategories,
  getCategoryById,
  updateCategory,
  deleteCategory,
};
