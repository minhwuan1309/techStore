const mongoose = require("mongoose") 
const asyncHandler = require("express-async-handler")
const Order = require("../models/order")
const User = require("../models/user")
const Product = require("../models/product")
const nodemailer = require("nodemailer")
const { formatMoney } = require("../utils/helper")

const createOrder = asyncHandler(async (req, res) => {
  const userId = req.user._id
  const {
    products,
    total,
    address,
    status,
    paymentMethod,
    discount,
    finalTotal,
  } = req.body

  // Validate order data
  if (!products || products.length === 0) {
    return res.status(400).json({
      success: false,
      message: "Danh sách sản phẩm không hợp lệ!"
    })
  }

  if (!paymentMethod) {
    return res.status(400).json({
      success: false,
      message: "Thiếu phương thức thanh toán!"
    })
  }

  // Create order object
  const orderData = {
    products,
    total,
    finalTotal: finalTotal || total,
    discount: discount || 0,
    orderBy: userId,
    paymentMethod,
  }

  if (status) orderData.status = status

  try {
    // Check if all products have sufficient quantity
    for (const product of products) {
      if (!product.product || !mongoose.Types.ObjectId.isValid(product.product)) {
        return res.status(400).json({
          success: false,
          message: `ID sản phẩm không hợp lệ: ${product.title}`,
        })
      }
    
      const productDoc = await Product.findById(product.product)
      if (!productDoc) {
        return res.status(400).json({
          success: false,
          message: `Sản phẩm ${product.title} không tồn tại!`,
        })
      }
    }
    

    const newOrder = await Order.create(orderData)  
    
    if (newOrder) {
      // Update product quantities
      for (const product of products) {
        await Product.findByIdAndUpdate(
          product.product,
          { $inc: { quantity: -product.quantity, sold: product.quantity } },
          { new: true }
        )
      }

      const user = await User.findById(userId)
      if (user && user.email) {
        await sendOrderConfirmationEmail(user.email, newOrder)
      }
    }

    return res.status(200).json({
      success: true,
      message: "Đơn hàng đã được tạo thành công",
      order: newOrder
    })
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Lỗi server khi tạo đơn hàng",
      error: error.message
    })
  }
})

const updateStatus = asyncHandler(async (req, res) => {
  const { oid } = req.params
  const { status } = req.body

  console.log("Đang cập nhật trạng thái đơn hàng:", oid, status); // Debug
  
  try {
    const response = await Order.findByIdAndUpdate(
      oid,
      { status },
      { new: true }
    )

    if (response) {
      return res.status(200).json({
        success: true,
        mes: `Cập nhật thành công đơn hàng ${oid}!`,
        status: response.status
      })
    } else {
      return res.status(400).json({
        success: false,
        mes: "Đã xảy ra lỗi!"
      })
    }
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Lỗi server khi cập nhật trạng thái",
      error: error.message
    })
  }
})

const getUserOrders = asyncHandler(async (req, res) => {
  const userId = req.user._id
  const queries = req.query
  
  // Handle filtering, sorting, pagination
  const excludeFields = ["limit", "sort", "page", "fields"]
  const queryObj = { ...queries }
  
  excludeFields.forEach((el) => delete queryObj[el])

  let queryString = JSON.stringify(queryObj)
  queryString = queryString.replace(
    /\b(gte|gt|lt|lte)\b/g,
    (macthedEl) => `$${macthedEl}`
  )
  
  const formatedQueries = JSON.parse(queryString)
  const qr = { ...formatedQueries, orderBy: userId, isDelete: false }

  let queryCommand = Order.find(qr)

  // Sorting
  if (queries.sort) {
    const sortBy = queries.sort.split(",").join(" ")
    queryCommand = queryCommand.sort(sortBy)
  }

  // Field limiting
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
    const response = await queryCommand
    
    // Validate orders
    const validOrders = await Promise.all(
      response.map(async (order) => {
        const orderExists = await Order.findById(order._id)
        return orderExists ? order : null 
      })
    )
    const filteredOrders = validOrders.filter((order) => order !== null)

    const counts = await Order.find(qr).countDocuments()
    
    return res.status(200).json({
      success: filteredOrders.length > 0,
      counts,
      orders: filteredOrders.length > 0 ? filteredOrders : "Không có đơn hàng hợp lệ"
    })
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Đã xảy ra lỗi khi lấy danh sách đơn hàng",
      error: error.message
    })
  }
})

const getOrders = asyncHandler(async (req, res) => {
  const queries = req.query
  
  // Handle filtering, sorting, pagination
  const excludeFields = ["limit", "sort", "page", "fields"]
  const queryObj = { ...queries }
  
  excludeFields.forEach((el) => delete queryObj[el])

  let queryString = JSON.stringify(queryObj)
  queryString = queryString.replace(
    /\b(gte|gt|lt|lte)\b/g,
    (matchedEl) => `$${matchedEl}`
  )
  
  const formatedQueries = JSON.parse(queryString)
  const qr = { ...formatedQueries, isDelete: false }

  let queryCommand = Order.find(qr).populate(
    "orderBy",
    "firstname lastname email mobile address"
  )

  // Sorting
  if (queries.sort) {
    const sortBy = queries.sort.split(",").join(" ")
    queryCommand = queryCommand.sort(sortBy)
  }

  // Field limiting
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
    const response = await queryCommand

    const orders = response.map((order) => ({
      ...order.toObject(),
      finalTotal: order.total - order.total * (order.discount / 100),
    }))

    const counts = await Order.find(qr).countDocuments()

    return res.status(200).json({
      success: orders.length > 0,
      counts,
      orders
    })
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Đã xảy ra lỗi khi lấy danh sách đơn hàng",
      error: error.message
    })
  }
})

const getDeletedOrders = asyncHandler(async (req, res) => {
  const queries = req.query
  
  // Handle filtering, sorting, pagination
  const excludeFields = ["limit", "sort", "page", "fields"]
  const queryObj = { ...queries }
  
  excludeFields.forEach((el) => delete queryObj[el])

  let queryString = JSON.stringify(queryObj)
  queryString = queryString.replace(
    /\b(gte|gt|lt|lte)\b/g,
    (matchedEl) => `$${matchedEl}`
  )
  
  const formatedQueries = JSON.parse(queryString)
  const qr = { ...formatedQueries, isDelete: true }

  let queryCommand = Order.find(qr).populate(
    "orderBy",
    "firstname lastname email mobile address"
  )

  // Sorting
  if (queries.sort) {
    const sortBy = queries.sort.split(",").join(" ")
    queryCommand = queryCommand.sort(sortBy)
  }

  // Field limiting
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
    const response = await queryCommand

    const orders = response.map((order) => ({
      ...order.toObject(),
      finalTotal: order.total - order.total * (order.discount / 100),
    }))

    const counts = await Order.find(qr).countDocuments()

    return res.status(200).json({
      success: orders.length > 0,
      counts,
      orders
    })
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Đã xảy ra lỗi khi lấy danh sách đơn hàng đã xóa",
      error: error.message
    })
  }
})

const deleteOrderByAdmin = asyncHandler(async (req, res) => {
  const { id } = req.params
  const userId = req.user._id
  
  try {
    const rs = await Order.findByIdAndUpdate(
      id,
      { isDelete: true },
      { new: true }
    )
    
    return res.status(rs ? 200 : 400).json({
      success: rs ? true : false,
      mes: rs ? "Đã xoá đơn hàng" : "Đã xảy ra lỗi",
      status: `Xoá mềm đơn hàng ${id}`
    })
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Đã xảy ra lỗi khi xóa đơn hàng",
      error: error.message
    })
  }
})

// Helper function to get previous day
const getCountPreviousDay = (count = 1, date = new Date()) => {
  const previous = new Date(date.getTime())
  previous.setDate(date.getDate() - count)
  return previous
}

const getDashboard = asyncHandler(async (req, res) => {
  const { to, from, type } = req.query
  const format = type === "MTH" ? "%Y-%m" : "%Y-%m-%d"
  const start = from || getCountPreviousDay(7, new Date(to))
  const end = to || getCountPreviousDay(0)
  
  try {
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
                { isDelete: false },
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
                { isDelete: false },
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
                { isDelete: false },
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
                { isDelete: false },
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
                { isDelete: false },
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
      ])
      
    return res.status(200).json({
      success: true,
      data: {
        users,
        totalSuccess,
        totalFailed,
        soldQuantities,
        chartData,
        pieData,
      }
    })
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Đã xảy ra lỗi khi lấy dữ liệu tổng quan",
      error: error.message
    })
  }
})

// Helper function for sending confirmation email
const sendOrderConfirmationEmail = async (userEmail, orderDetails) => {
  const transporter = nodemailer.createTransport({
    service: "Gmail",
    auth: {
      user: process.env.EMAIL_NAME,
      pass: process.env.EMAIL_APP_PASSWORD,
    },
  })

  const confirmationUrl = `${process.env.CLIENT_URL}/confirm-order/${orderDetails._id}`

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
      orderDetails.total
    )} VNĐ</p>
    <p><strong>Phương thức thanh toán:</strong> ${
      orderDetails.paymentMethod
    }</p>
    <p>Đơn hàng của bạn sẽ được giao trong vòng 2 ngày.</p>
    
    <div style="margin-top: 30px; text-align: center;">
      <a href="${confirmationUrl}" style="background-color: #4CAF50; color: white; padding: 14px 20px; text-align: center; text-decoration: none; display: inline-block; border-radius: 5px; font-weight: bold; font-size: 16px;">
        Đã nhận được đơn hàng
      </a>
    </div>
    <p style="margin-top: 20px; font-size: 14px; color: #666;">Vui lòng nhấn vào nút trên khi bạn đã nhận được đơn hàng để xác nhận với chúng tôi.</p>
  `,
  }

  try {
    await transporter.sendMail(mailOptions)
    return true
  } catch (error) {
    console.error("Lỗi khi gửi email xác nhận đơn hàng:", error.message)
    return false
  }
}

const confirmOrder = async (req, res) => {
  try {
    const { oid } = req.params
    
    const updatedOrder = await Order.findByIdAndUpdate(
      oid,
      { status: "Succeed" },
      { new: true }
    )

    if (!updatedOrder) {
      const errorResponse = {
        success: false,
        message: "Không tìm thấy đơn hàng"
      }
      
      if (req.headers['content-type'] === 'application/json') {
        return res.status(404).json(errorResponse)
      } else {
        return res.redirect(`${process.env.CLIENT_URL}/order-confirmed?success=false&message=${encodeURIComponent(errorResponse.message)}`)
      }
    }

    const successResponse = {
      success: true,
      message: "Đã cập nhật trạng thái đơn hàng thành công",
      order: updatedOrder
    }
    
    if (req.headers['content-type'] === 'application/json') {
      return res.status(200).json(successResponse)
    } else {
      return res.redirect(`${process.env.CLIENT_URL}/order-confirmed?success=true`)
    }
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    })
  }
}

module.exports = {
  createOrder,
  updateStatus,
  getUserOrders,
  getOrders,
  getDeletedOrders,
  deleteOrderByAdmin,
  getDashboard,
  confirmOrder
}