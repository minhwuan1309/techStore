const e = require("express")
const { orderService } = require("../services/index")
const asyncHandler = require("express-async-handler")

const createOrder = asyncHandler(async (req, res) => {
  const { _id } = req.user
  const result = await orderService.createOrder(_id, req.body)
  return res.status(result.statusCode).json({
    success: result.success,
    message: result.message,
    order: result.order
  })
})

const updateStatus = asyncHandler(async (req, res) => {
  const { oid } = req.params
  const result = await orderService.updateStatus(oid, req.body)
  return res.status(result.statusCode).json({
    success: result.success,
    mes: result.mes
  })
})

const getUserOrders = asyncHandler(async (req, res) => {
  const { _id } = req.user
  const result = await orderService.getUserOrders(_id, req.query)
  return res.status(result.statusCode).json({
    success: result.success,
    counts: result.counts,
    orders: result.orders
  })
})

const getOrders = asyncHandler(async (req, res) => {
  const result = await orderService.getOrders(req.query)
  return res.status(result.statusCode).json({
    success: result.success,
    counts: result.counts,
    orders: result.orders
  })
})

const deleteOrderByAdmin = asyncHandler(async (req, res) => {
  const { id } = req.params
  const { _id } = req.user
  const result = await orderService.deleteOrderByAdmin(id, _id)
  return res.status(result.statusCode).json({
    success: result.success,
    mes: result.mes
  })
})

const getDashboard = asyncHandler(async (req, res) => {
  const result = await orderService.getDashboard(req.query)
  return res.status(result.statusCode).json({
    success: result.success,
    data: result.data
  })
})

const confirmOrder = async (req, res) => {
  try {
    const { oid } = req.params
    const response = await orderService.confirmOrder(oid)

    if (req.headers['content-type'] === 'application/json') {
      return res.status(response.statusCode).json(response)
    }

    if (response.success) {
      return res.redirect(`${process.env.CLIENT_URL}/order-confirmed?success=true`)
    } else {
      return res.redirect(`${process.env.CLIENT_URL}/order-confirmed?success=false&message=${encodeURIComponent(response.message)}`)
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
  deleteOrderByAdmin,
  getDashboard,
  confirmOrder
}