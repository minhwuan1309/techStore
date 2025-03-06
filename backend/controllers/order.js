const { formatMoney } = require("../utils/helper");
const Order = require("../models/order");
const User = require("../models/user");
const Coupon = require("../models/coupon");
const nodemailer = require("nodemailer");
const asyncHandler = require("express-async-handler");
const order = require("../models/order");
const coupon = require("../models/coupon");
const Product = require("../models/product");

const createOrder = asyncHandler(async (req, res) => {
  const { _id } = req.user;
  const {
    products,
    total,
    address,
    status,
    paymentMethod,
    discount,
    finalTotal,
  } = req.body;

  const user = await User.findById(_id);
  if (!user) throw new Error("Không tìm thấy người dùng");
  if (address) await User.findByIdAndUpdate(_id, { address, cart: [] });

  const orderData = {
    products,
    total,
    finalTotal: finalTotal || total, // Use finalTotal if provided
    discount: discount || 0, // Use discount if provided
    orderBy: _id,
    paymentMethod,
  };
  if (status) orderData.status = status;

  const newOrder = await Order.create(orderData);
  if (!newOrder) throw new Error("Tạo đơn hàng thất bại");
  await User.findByIdAndUpdate(_id, {
    $push: { orderHistory: newOrder._id },
  });

  try {
    for (const item of products) {
      const updatedProduct = await Product.findByIdAndUpdate(
        item.product,
        { $inc: { quantity: -item.quantity, sold: item.quantity } },
        { new: true }
      );
      if (!updatedProduct)
        throw new Error(`Sản phẩm với ID ${item.product} không tồn tại.`);
    }
    await sendOrderConfirmationEmail(user.email, newOrder);
    res.json({
      success: true,
      message: "Đơn hàng đã được tạo thành công",
      order: newOrder,
    });
  } catch (error) {
    console.error("Lỗi trong quá trình xử lý đơn hàng:", error.message);
    await Order.findByIdAndDelete(newOrder._id);
    throw new Error(`Quá trình xử lý đơn hàng thất bại: ${error.message}`);
  }
});


const updateStatus = asyncHandler(async (req, res) => {
  const { oid } = req.params;
  const { status } = req.body;

  const response = await Order.findByIdAndUpdate(
    oid,
    { status },
    { new: true }
  );
  return res.json({
    success: response ? true : false,
    mes: response ? "Cập nhật thành công!" : "Đã xảy ra lỗi!",
  });
});

const getUserOrders = asyncHandler(async (req, res) => {
  const queries = { ...req.query };
  const { _id } = req.user;

  const excludeFields = ["limit", "sort", "page", "fields"];
  excludeFields.forEach((el) => delete queries[el]);

  // Format lại các operators cho đúng cú pháp mongoose
  let queryString = JSON.stringify(queries);
  queryString = queryString.replace(
    /\b(gte|gt|lt|lte)\b/g,
    (macthedEl) => `$${macthedEl}`
  );
  const formatedQueries = JSON.parse(queryString);
  // Truy vấn các đơn hàng của người dùng theo orderBy (_id)
  const qr = { ...formatedQueries, orderBy: _id };

  let queryCommand = Order.find(qr);

  // Sorting
  if (req.query.sort) {
    const sortBy = req.query.sort.split(",").join(" ");
    queryCommand = queryCommand.sort(sortBy);
  }

  // Fields limiting
  if (req.query.fields) {
    const fields = req.query.fields.split(",").join(" ");
    queryCommand = queryCommand.select(fields);
  }

  // Pagination
  const page = +req.query.page || 1;
  const limit = +req.query.limit || process.env.LIMIT_PRODUCTS;
  const skip = (page - 1) * limit;
  queryCommand.skip(skip).limit(limit);

  try {
    // Lấy danh sách đơn hàng của người dùng
    const response = await queryCommand;

    // Kiểm tra các đơn hàng hợp lệ
    const validOrders = await Promise.all(
      response.map(async (order) => {
        const orderExists = await Order.findById(order._id);
        return orderExists ? order : null; // Chỉ giữ lại đơn hàng hợp lệ
      })
    );

    // Lọc bỏ các đơn hàng không hợp lệ
    const filteredOrders = validOrders.filter((order) => order !== null);

    // Trả về kết quả
    const counts = await Order.find(qr).countDocuments();
    return res.status(200).json({
      success: filteredOrders.length > 0,
      counts,
      orders:
        filteredOrders.length > 0 ? filteredOrders : "Không có đơn hàng hợp lệ",
    });
  } catch (error) {
    console.error("Lỗi trong quá trình xử lý đơn hàng:", error.message);
    return res.status(500).json({
      success: false,
      message: "Đã xảy ra lỗi khi lấy danh sách đơn hàng",
    });
  }
});
const getOrders = asyncHandler(async (req, res) => {
  const queries = { ...req.query };

  // Tách các trường đặc biệt ra khỏi query
  const excludeFields = ["limit", "sort", "page", "fields"];
  excludeFields.forEach((el) => delete queries[el]);

  // Format lại các operators cho đúng cú pháp mongoose
  let queryString = JSON.stringify(queries);
  queryString = queryString.replace(
    /\b(gte|gt|lt|lte)\b/g,
    (matchedEl) => `$${matchedEl}`
  );
  const formatedQueries = JSON.parse(queryString);
  const qr = { ...formatedQueries };

  let queryCommand = Order.find(qr).populate(
    "orderBy",
    "firstname lastname email mobile address"
  );

  // Sorting
  if (req.query.sort) {
    const sortBy = req.query.sort.split(",").join(" ");
    queryCommand = queryCommand.sort(sortBy);
  }

  // Fields limiting
  if (req.query.fields) {
    const fields = req.query.fields.split(",").join(" ");
    queryCommand = queryCommand.select(fields);
  }

  // Pagination
  const page = +req.query.page || 1;
  const limit = +req.query.limit || process.env.LIMIT_PRODUCTS;
  const skip = (page - 1) * limit;
  queryCommand.skip(skip).limit(limit);

  // Execute query
  const response = await queryCommand;

  const orders = response.map((order) => ({
    ...order.toObject(),
    finalTotal: order.total - order.total * (order.discount / 100),
  }));

  const counts = await Order.find(qr).countDocuments();

  return res.status(200).json({
    success: orders.length > 0,
    counts,
    orders,
  });
});

const deleteOrderByAdmin = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const rs = await Order.findByIdAndDelete(id);
  await User.findByIdAndUpdate(
    req.user._id,
    { $pull: { orderHistory: id } },
    { new: true }
  );
  return res.json({
    success: rs ? true : false,
    mes: rs ? "Đã xoá đơn hàng" : "Đã xảy ra lỗi",
  });
});
function getCountPreviousDay(count = 1, date = new Date()) {
  const previous = new Date(date.getTime());
  previous.setDate(date.getDate() - count);
  return previous;
}
const getDashboard = asyncHandler(async (req, res) => {
  const { to, from, type } = req.query;
  const format = type === "MTH" ? "%Y-%m" : "%Y-%m-%d";
  const start = from || getCountPreviousDay(7, new Date(to));
  const end = to || getCountPreviousDay(0);
  const [users, totalSuccess, totalFailed, soldQuantities, chartData, pieData] =
    await Promise.all([
      User.aggregate([
        {
          $match: {
            $and: [
              { createdAt: { $gte: new Date(start) } },
              { createdAt: { $lte: new Date(end) } },
            ],
          },
        },
        {
          $group: {
            _id: null,
            count: { $sum: 1 },
          },
        },
      ]),
      Order.aggregate([
        {
          $match: {
            $and: [
              { createdAt: { $gte: new Date(start) } },
              { createdAt: { $lte: new Date(end) } },
              { status: "Succeed" },
            ],
          },
        },
        {
          $group: {
            _id: null,
            count: { $sum: "$total" },
          },
        },
      ]),
      Order.aggregate([
        {
          $match: {
            $and: [
              { createdAt: { $gte: new Date(start) } },
              { createdAt: { $lte: new Date(end) } },
              { status: "Pending" },
            ],
          },
        },
        {
          $group: {
            _id: null,
            count: { $sum: "$total" },
          },
        },
      ]),
      Order.aggregate([
        {
          $match: {
            $and: [
              { createdAt: { $gte: new Date(start) } },
              { createdAt: { $lte: new Date(end) } },
              { status: "Succeed" },
            ],
          },
        },
        {
          $group: {
            _id: null,
            count: { $sum: { $sum: "$products.quantity" } },
          },
        },
      ]),
      Order.aggregate([
        {
          $match: {
            $and: [
              { createdAt: { $gte: new Date(start) } },
              { createdAt: { $lte: new Date(end) } },
              { status: "Succeed" },
            ],
          },
        },
        { $unwind: "$createdAt" },
        {
          $group: {
            _id: {
              $dateToString: {
                format,
                date: "$createdAt",
              },
            },
            sum: { $sum: "$total" },
          },
        },
        {
          $project: {
            date: "$_id",
            sum: 1,
            _id: 0,
          },
        },
      ]),
      Order.aggregate([
        {
          $match: {
            $and: [
              { createdAt: { $gte: new Date(start) } },
              { createdAt: { $lte: new Date(end) } },
            ],
          },
        },
        { $unwind: "$status" },
        {
          $group: {
            _id: "$status",
            sum: { $sum: 1 },
          },
        },
        {
          $project: {
            status: "$_id",
            sum: 1,
            _id: 0,
          },
        },
      ]),
    ]);
  return res.json({
    success: true,
    data: {
      users,
      totalSuccess,
      totalFailed,
      soldQuantities,
      chartData,
      pieData,
    },
  });
});

const sendOrderConfirmationEmail = async (userEmail, orderDetails) => {
  const transporter = nodemailer.createTransport({
    service: "Gmail",
    auth: {
      user: process.env.EMAIL_NAME,
      pass: process.env.EMAIL_APP_PASSWORD,
    },
  });

  const mailOptions = {
    from: process.env.EMAIL_NAME,
    to: userEmail,
    subject: "Xác nhận đơn hàng",
    html: `
      <h1>Cảm ơn bạn đã đặt hàng!</h1>
      <p>Đơn hàng của bạn đã được xác nhận. Chi tiết đơn hàng như sau:</p>
      <table style="width: 100%; border-collapse: collapse; text-align: left;">
        <thead>
          <tr>
            <th style="border: 1px solid #ddd; padding: 8px;">Sản phẩm</th>
            <th style="border: 1px solid #ddd; padding: 8px;">Số lượng</th>
            <th style="border: 1px solid #ddd; padding: 8px;">Giá</th>
          </tr>
        </thead>
        <tbody>
          ${orderDetails.products
            .map(
              (product) => `
                <tr>
                  <td style="border: 1px solid #ddd; padding: 8px;">${
                    product.title
                  }</td>
                  <td style="border: 1px solid #ddd; padding: 8px;">${
                    product.quantity
                  }</td>
                  <td style="border: 1px solid #ddd; padding: 8px;">${formatMoney(
                    product.price * product.quantity
                  )} VNĐ</td>
                </tr>
              `
            )
            .join("")}
        </tbody>
      </table>
      <p style="margin-top: 20px;"><strong>Tổng cộng:</strong> ${formatMoney(
        orderDetails.total * 25000
      )} VNĐ</p>
      <p><strong>Phương thức thanh toán:</strong> ${
        orderDetails.paymentMethod
      }</p>
      <p>Đơn hàng của bạn sẽ được giao trong vòng 2 ngày.</p>
    `,
  };

  await transporter.sendMail(mailOptions);
};

module.exports = {
  createOrder,
  updateStatus,
  getUserOrders,
  getOrders,
  deleteOrderByAdmin,
  getDashboard,
};
