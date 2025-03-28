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

const confirmReceivedOrder = asyncHandler(async (req, res)=>{
  const {orderId} = req.params
  const result = await orderService.updateStatus(orderId, {status: 'Succeed'})

  if(result.success){
    return res.status(200).json({
      success: true,
      message: 'Cập nhật trạng thái đơn hàng thành công'
    })
  }else{
    return res.status(400).json({
      success: false,
      message: 'Không thể cập nhật trạng thái đơn hàng'
    })
  }
})

module.exports = {
  createOrder,
  updateStatus,
  getUserOrders,
  getOrders,
  deleteOrderByAdmin,
  getDashboard,
  confirmReceivedOrder
}