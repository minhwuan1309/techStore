const Order = require("../models/order")
const User = require("../models/user")
const Product = require("../models/product")
const nodemailer = require("nodemailer")
const { formatMoney } = require("../utils/helper")

class OrderService {
  async createOrder(userId, orderData) {
    const {
      products,
      total,
      address,
      status,
      paymentMethod,
      discount,
      finalTotal,
    } = orderData

    if (!products || products.length === 0) {
      return {
        success: false,
        message: "Danh sách sản phẩm không hợp lệ!",
        statusCode: 400
      }
    }

    if (!paymentMethod) {
      return {
        success: false,
        message: "Thiếu phương thức thanh toán!",
        statusCode: 400
      }
    }

    const orderData2 = {
      products,
      total,
      finalTotal: finalTotal || total,
      discount: discount || 0,
      orderBy: userId,
      paymentMethod,
    }

    if (status) orderData2.status = status

    try {
      const newOrder = await Order.create(orderData2)  
      if (newOrder) {
        const user = await User.findById(userId)
        if (user && user.email) {
          await this.sendOrderConfirmationEmail(user.email, newOrder)
        }
      }

      return {
        success: true,
        message: "Đơn hàng đã được tạo thành công",
        order: newOrder,
        statusCode: 200
      }
    } catch (error) {
      return {
        success: false,
        message: "Lỗi server khi tạo đơn hàng",
        error: error.message,
        statusCode: 500
      }
    }
  }

  async updateStatus(orderId, statusData) {
    console.log("Đang cập nhật trạng thái đơn hàng:", orderId, statusData); // Debug

    const { status } = statusData

    const response = await Order.findByIdAndUpdate(
      orderId,
      { status },
      { new: true }
    )

    return {
      success: response ? true : false,
      mes: response ? "Cập nhật thành công!" : "Đã xảy ra lỗi!",
      statusCode: response ? 200 : 400
    }
  }

  async getUserOrders(userId, queries) {
    const excludeFields = ["limit", "sort", "page", "fields"]
    const queryObj = { ...queries }
    
    excludeFields.forEach((el) => delete queryObj[el])

    let queryString = JSON.stringify(queryObj)
    queryString = queryString.replace(
      /\b(gte|gt|lt|lte)\b/g,
      (macthedEl) => `$${macthedEl}`
    )
    
    const formatedQueries = JSON.parse(queryString)
    const qr = { ...formatedQueries, orderBy: userId }

    let queryCommand = Order.find(qr)

    if (queries.sort) {
      const sortBy = queries.sort.split(",").join(" ")
      queryCommand = queryCommand.sort(sortBy)
    }

    if (queries.fields) {
      const fields = queries.fields.split(",").join(" ")
      queryCommand = queryCommand.select(fields)
    }

    const page = +queries.page || 1
    const limit = +queries.limit || process.env.LIMIT_PRODUCTS
    const skip = (page - 1) * limit
    queryCommand.skip(skip).limit(limit)

    try {
      const response = await queryCommand
      const validOrders = await Promise.all(
        response.map(async (order) => {
          const orderExists = await Order.findById(order._id)
          return orderExists ? order : null 
        })
      )
      const filteredOrders = validOrders.filter((order) => order !== null)

      const counts = await Order.find(qr).countDocuments()
      
      return {
        success: filteredOrders.length > 0,
        counts,
        orders: filteredOrders.length > 0 ? filteredOrders : "Không có đơn hàng hợp lệ",
        statusCode: 200
      }
    } catch (error) {
      return {
        success: false,
        message: "Đã xảy ra lỗi khi lấy danh sách đơn hàng",
        error: error.message,
        statusCode: 500
      }
    }
  }

  async getOrders(queries) {
    const excludeFields = ["limit", "sort", "page", "fields"]
    const queryObj = { ...queries }
    
    excludeFields.forEach((el) => delete queryObj[el])

    let queryString = JSON.stringify(queryObj)
    queryString = queryString.replace(
      /\b(gte|gt|lt|lte)\b/g,
      (matchedEl) => `$${matchedEl}`
    )
    
    const formatedQueries = JSON.parse(queryString)
    const qr = { ...formatedQueries }

    let queryCommand = Order.find(qr).populate(
      "orderBy",
      "firstname lastname email mobile address"
    )

    if (queries.sort) {
      const sortBy = queries.sort.split(",").join(" ")
      queryCommand = queryCommand.sort(sortBy)
    }

    if (queries.fields) {
      const fields = queries.fields.split(",").join(" ")
      queryCommand = queryCommand.select(fields)
    }

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

      return {
        success: orders.length > 0,
        counts,
        orders,
        statusCode: 200
      }
    } catch (error) {
      return {
        success: false,
        message: "Đã xảy ra lỗi khi lấy danh sách đơn hàng",
        error: error.message,
        statusCode: 500
      }
    }
  }

  async deleteOrderByAdmin(orderId, userId) {
    try {
      const rs = await Order.findByIdAndDelete(orderId)
      await User.findByIdAndUpdate(
        userId,
        { $pull: { orderHistory: orderId } },
        { new: true }
      )
      
      return {
        success: rs ? true : false,
        mes: rs ? "Đã xoá đơn hàng" : "Đã xảy ra lỗi",
        statusCode: rs ? 200 : 400
      }
    } catch (error) {
      return {
        success: false,
        message: "Đã xảy ra lỗi khi xóa đơn hàng",
        error: error.message,
        statusCode: 500
      }
    }
  }

  getCountPreviousDay(count = 1, date = new Date()) {
    const previous = new Date(date.getTime())
    previous.setDate(date.getDate() - count)
    return previous
  }

  async getDashboard(queries) {
    const { to, from, type } = queries
    const format = type === "MTH" ? "%Y-%m" : "%Y-%m-%d"
    const start = from || this.getCountPreviousDay(7, new Date(to))
    const end = to || this.getCountPreviousDay(0)
    
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
        ])
        
      return {
        success: true,
        data: {
          users,
          totalSuccess,
          totalFailed,
          soldQuantities,
          chartData,
          pieData,
        },
        statusCode: 200
      }
    } catch (error) {
      return {
        success: false,
        message: "Đã xảy ra lỗi khi lấy dữ liệu tổng quan",
        error: error.message,
        statusCode: 500
      }
    }
  }

  async sendOrderConfirmationEmail(userEmail, orderDetails) {
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
        <p>Đơn hàng của bạn đã được xác nhận.</p>
        <p><strong>Nếu bạn đã nhận hàng, vui lòng xác nhận bằng cách nhấn vào nút dưới đây:</strong></p>
        <a href="${confirmationUrl}" 
          style="background-color: #28a745 color: white padding: 10px 20px text-decoration: none border-radius: 5px">
          Đã nhận được đơn hàng
        </a>
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
}

module.exports = new OrderService()