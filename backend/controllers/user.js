const { userService } = require("../services/index")
const asyncHandler = require("express-async-handler")

const register = asyncHandler(async (req, res) => {
  const result = await userService.register(req.body)
  return res.status(result.statusCode).json({
    success: result.success,
    mes: result.mes
  })
})

const finalRegister = asyncHandler(async (req, res) => {
  const { token } = req.params
  const result = await userService.finalRegister(token)
  return res.status(result.statusCode).json({
    success: result.success,
    mes: result.mes
  })
})

const login = asyncHandler(async (req, res) => {
  const result = await userService.login(req.body)
  
  if (result.success) {
    // Set refresh token in cookie
    res.cookie("refreshToken", result.refreshToken, {
      httpOnly: true,
      maxAge: 7 * 24 * 60 * 60 * 1000,
    })
    
    // Don't send refresh token in response
    delete result.refreshToken
  }
  
  return res.status(result.statusCode).json({
    success: result.success,
    accessToken: result.accessToken,
    userData: result.userData
  })
})

const getCurrent = asyncHandler(async (req, res) => {
  const result = await userService.getCurrent(req.user._id)
  return res.status(result.statusCode).json({
    success: result.success,
    rs: result.rs
  })
})

const refreshAccessToken = asyncHandler(async (req, res) => {
  const cookie = req.cookies
  if (!cookie || !cookie.refreshToken)
    throw new Error("No refresh token in cookies")
    
  const result = await userService.refreshAccessToken(cookie.refreshToken)
  return res.status(result.statusCode).json({
    success: result.success,
    newAccessToken: result.newAccessToken
  })
})

const logout = asyncHandler(async (req, res) => {
  const cookie = req.cookies
  if (!cookie || !cookie.refreshToken)
    throw new Error("No refresh token in cookies")
    
  const result = await userService.logout(cookie.refreshToken)
  
  // Clear refresh token from cookies
  res.clearCookie("refreshToken", {
    httpOnly: true,
    secure: true,
  })
  
  return res.status(result.statusCode).json({
    success: result.success,
    mes: result.mes
  })
})

const forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body
  const result = await userService.forgotPassword(email)
  return res.status(result.statusCode).json({
    success: result.success,
    mes: result.mes
  })
})

const resetPassword = asyncHandler(async (req, res) => {
  const result = await userService.resetPassword(req.body)
  return res.status(result.statusCode).json({
    success: result.success,
    mes: result.mes
  })
})

const getUsers = asyncHandler(async (req, res) => {
  const result = await userService.getUsers(req.query)
  return res.status(result.statusCode).json({
    success: result.success,
    counts: result.counts,
    users: result.users
  })
})

const deleteUser = asyncHandler(async (req, res) => {
  const { uid } = req.params
  const result = await userService.deleteUser(uid)
  return res.status(result.statusCode).json({
    success: result.success,
    mes: result.mes
  })
})

const updateUser = asyncHandler(async (req, res) => {
  const { _id } = req.user
  const avatarPath = req.file ? req.file.path : null
  const result = await userService.updateUser(_id, req.body, avatarPath)
  return res.status(result.statusCode).json({
    success: result.success,
    mes: result.mes,
    updatedUser: result.updatedUser
  })
})

const updateUserByAdmin = asyncHandler(async (req, res) => {
  const { uid } = req.params
  const result = await userService.updateUserByAdmin(uid, req.body)
  return res.status(result.statusCode).json({
    success: result.success,
    mes: result.mes,
    updatedUser: result.updatedUser
  })
})

const updateUserAddress = asyncHandler(async (req, res) => {
  const { _id } = req.user
  const result = await userService.updateUserAddress(_id, req.body.address)
  return res.status(result.statusCode).json({
    success: result.success,
    updatedUser: result.updatedUser
  })
})

const updateCart = asyncHandler(async (req, res) => {
  const { _id } = req.user
  const result = await userService.updateCart(_id, req.body)
  return res.status(result.statusCode).json({
    success: result.success,
    mes: result.mes
  })
})

const removeProductInCart = asyncHandler(async (req, res) => {
  const { _id } = req.user
  const { pid, color } = req.params
  const result = await userService.removeProductInCart(_id, pid, color)
  return res.status(result.statusCode).json({
    success: result.success,
    mes: result.mes
  })
})

const createUsers = asyncHandler(async (req, res) => {
  const result = await userService.createUsers()
  return res.status(result.statusCode).json({
    success: result.success,
    users: result.users
  })
})

const updateWishlist = asyncHandler(async (req, res) => {
  const { _id } = req.user
  const { pid } = req.params
  const result = await userService.updateWishlist(_id, pid)
  return res.status(result.statusCode).json({
    success: result.success,
    mes: result.mes
  })
})

module.exports = {
  register,
  login,
  getCurrent,
  refreshAccessToken,
  logout,
  forgotPassword,
  resetPassword,
  getUsers,
  deleteUser,
  updateUser,
  updateUserByAdmin,
  updateUserAddress,
  updateCart,
  finalRegister,
  createUsers,
  removeProductInCart,
  updateWishlist,
}