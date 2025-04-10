const User = require("../models/user")
const Product = require("../models/product")
const jwt = require("jsonwebtoken")
const crypto = require("crypto")
const sendMail = require("../utils/sendMail")
const { users } = require("../utils/constant")
const { generateAccessToken, generateRefreshToken } = require("../middlewares/jwt")
const asyncHandler = require("express-async-handler")

// Hàm tiện ích để tạo token
const makeToken = () => crypto.randomBytes(3).toString('hex').toUpperCase()

const register = asyncHandler(async (req, res) => {
  const { email, password, firstname, lastname, mobile } = req.body
  
  if (!email || !password || !lastname || !firstname || !mobile)
    return res.status(400).json({
      success: false,
      mes: "Vui lòng nhập đủ thông tin"
    })
  
  const user = await User.findOne({ email })
  
  if (user) throw new Error("Email đã tồn tại")
  
  const token = makeToken()
  const emailedited = btoa(email) + "@" + token
  
  const newUser = await User.create({
    email: emailedited,
    password,
    firstname,
    lastname,
    mobile,
  })
  
  if (newUser) {
    const html = `
    <div style="max-width: 500px; margin: 40px auto; padding: 20px; background-color: #ffffff; border: 1px solid #e0e0e0; border-radius: 15px; box-shadow: 0 8px 20px rgba(0, 0, 0, 0.1);">
      <!-- Header section -->
      <div style="background-color: #2C3E50; padding: 25px; text-align: center; border-radius: 15px 15px 0 0;">
        <h1 style="margin: 0; color: #fff; font-size: 28px; font-weight: bold; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;">Chào mừng bạn đến với Tech Store!</h1>
      </div>
      
      <!-- Main content section -->
      <div style="padding: 25px;">
        <p style="margin: 0 0 25px 0; font-size: 16px; color: #444444; line-height: 1.6; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;">
          Cảm ơn bạn đã đăng ký tài khoản tại Tech Store. Vui lòng sử dụng mã dưới đây để xác nhận đăng ký tài khoản của bạn:
        </p>
        
        <!-- Token container -->
        <div style="background-color: #3498DB; padding: 25px; text-align: center; border-radius: 10px; box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1); margin-bottom: 25px;">
          <span style="font-size: 28px; font-weight: bold; color: #fff; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;">${token}</span>
        </div>
        
        <!-- Expiration notice -->
        <p style="font-size: 16px; color: #555555; margin: 0 0 25px 0; line-height: 1.6; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;">
          Nếu bạn không yêu cầu đăng ký tài khoản, vui lòng bỏ qua email này. Mã này sẽ hết hạn sau 5 phút.
        </p>
        
        <!-- Footer section -->
        <p style="font-size: 16px; text-align: center; color: #555555; margin: 0; line-height: 1.6; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;">
          Trân trọng,<br />
          <strong>Đội ngũ hỗ trợ Tech Store</strong>
        </p>
      </div>
    </div>
    `
    
    await sendMail({
      email,
      html,
      subject: "Xác nhận đăng ký tài khoản tại Tech Store",
    })
  }
  
  setTimeout(async () => {
    await User.deleteOne({ email: emailedited })
  }, [300000])
  
  return res.status(newUser ? 200 : 400).json({
    success: newUser ? true : false,
    mes: newUser ? "Hãy kiểm tra Email!" : "Đã xảy ra lỗi, mời bạn thử lại"
  })
})

const finalRegister = asyncHandler(async (req, res) => {
  const { token } = req.params
  const notActivedEmail = await User.findOne({ email: new RegExp(`${token}$`) })
  
  if (notActivedEmail) {
    notActivedEmail.email = atob(notActivedEmail?.email?.split("@")[0])
    await notActivedEmail.save()
  }
  
  return res.status(notActivedEmail ? 200 : 400).json({
    success: notActivedEmail ? true : false,
    mes: notActivedEmail ? "Đăng ký thành công! Hãy đăng nhập" : "Đã xảy ra lỗi, mời bạn thử lại"
  })
})

const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body
  
  if (!email || !password)
    return res.status(400).json({
      success: false,
      mes: "Vui lòng nhập đủ thông tin"
    })
  
  const user = await User.findOne({ email })
  
  if (!user) throw new Error("Không tìm thấy người dùng")
  
  if (user.isBlocked) {
    return res.status(403).json({
      success: false,
      mes: "Tài khoản của bạn đã bị chặn!"
    })
  }
  
  const isPasswordMatch = await user.isCorrectPassword(password)
  
  if (!isPasswordMatch) throw new Error("Mật khẩu không đúng")
  
  // Tách password và role ra khỏi response
  const { password: pwd, role, refreshToken, ...userData } = user.toObject()
  
  // Tạo access token và refresh token
  const accessToken = generateAccessToken(user._id, role)
  const newRefreshToken = generateRefreshToken(user._id)
  
  // Lưu refresh token vào database
  await User.findByIdAndUpdate(
    user._id,
    { refreshToken: newRefreshToken },
    { new: true }
  )
  
  // Set refresh token in cookie
  res.cookie("refreshToken", newRefreshToken, {
    httpOnly: true,
    maxAge: 7 * 24 * 60 * 60 * 1000,
  })
  
  return res.status(200).json({
    success: true,
    accessToken,
    userData
  })
})

const getCurrent = asyncHandler(async (req, res) => {
  const { _id } = req.user
  const user = await User.findById(_id)
    .select("-refreshToken -password")
    .populate({
      path: "cart",
      populate: {
        path: "product",
        select: "title thumb price",
      },
    })
    .populate("wishlist", "title thumb price color")
  
  return res.status(user ? 200 : 404).json({
    success: user ? true : false,
    rs: user ? user : "Không tìm thấy người dùng"
  })
})

const refreshAccessToken = asyncHandler(async (req, res) => {
  const cookie = req.cookies
  if (!cookie || !cookie.refreshToken)
    throw new Error("No refresh token in cookies")
  
  try {
    const decoded = await jwt.verify(cookie.refreshToken, process.env.JWT_SECRET)
    const user = await User.findOne({
      _id: decoded._id,
      refreshToken: cookie.refreshToken,
    })
    
    if (!user) throw new Error("Refresh token không hợp lệ")
    
    const newAccessToken = generateAccessToken(user._id, user.role)
    
    return res.status(200).json({
      success: true,
      newAccessToken
    })
  } catch (error) {
    throw new Error("Refresh token không hợp lệ hoặc đã hết hạn")
  }
})

const logout = asyncHandler(async (req, res) => {
  const cookie = req.cookies
  if (!cookie || !cookie.refreshToken)
    throw new Error("No refresh token in cookies")
  
  // Xóa refresh token ở db
  const result = await User.findOneAndUpdate(
    { refreshToken: cookie.refreshToken },
    { refreshToken: "" },
    { new: true }
  )
  
  // Clear refresh token from cookies
  res.clearCookie("refreshToken", {
    httpOnly: true,
    secure: true,
  })
  
  return res.status(200).json({
    success: !!result,
    mes: "Đã đăng xuất"
  })
})

const forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body
  if (!email) throw new Error("Hãy nhập Email")
  
  const user = await User.findOne({ email })
  if (!user) throw new Error("Không tìm thấy người dùng")
  
  const resetToken = user.createPasswordChangedToken()
  await user.save()
  
  const html = `
  <div style="font-family: Arial, sans-serif line-height: 1.6 color: #333">
    <h1 style="color: #FF5733">Yêu cầu đặt lại mật khẩu</h1>
    <p>Xin chào,</p>
    <p>Bạn đã yêu cầu đặt lại mật khẩu cho tài khoản của mình. Vui lòng nhấn vào đường dẫn dưới đây để thay đổi mật khẩu:</p>
    <p style="text-align: center margin: 20px 0">
      <a href="${process.env.CLIENT_URL}/reset-password/${resetToken}" 
         style="background-color: #FF5733 color: #fff padding: 10px 20px text-decoration: none border-radius: 5px font-weight: bold">
         Đặt lại mật khẩu
      </a>
    </p>
    <p style="color: #555">Lưu ý: Đường dẫn này chỉ có hiệu lực trong vòng <strong>15 phút</strong>.</p>
    <p>Nếu bạn không yêu cầu đặt lại mật khẩu, vui lòng bỏ qua email này. Tài khoản của bạn vẫn an toàn.</p>
    <p>Trân trọng,<br />Đội ngũ hỗ trợ Digital World</p>
  </div>
  `
  
  const mailData = {
    email,
    html,
    subject: "Đặt lại mật khẩu tài khoản tại Tech Store",
  }
  
  const rs = await sendMail(mailData)
  
  return res.status(rs.response?.includes("OK") ? 200 : 400).json({
    success: rs.response?.includes("OK") ? true : false,
    token: resetToken,
    mes: rs.response?.includes("OK")
      ? "Vui lòng kiểm tra email của bạn."
      : "Đã xảy ra lỗi. Vui lòng thử lại sau."
  })
})

const resetPassword = asyncHandler(async (req, res) => {
  const { password, token } = req.body
  
  if (!password || !token) throw new Error("Vui lòng nhập đủ thông tin!")
  
  const passwordResetToken = crypto
    .createHash("sha256")
    .update(token)
    .digest("hex")
  
  const user = await User.findOne({
    passwordResetToken,
    passwordResetExpires: { $gt: Date.now() },
  })
  
  if (!user) throw new Error("Mã đặt lại mật khẩu không hợp lệ")
  
  user.password = password
  user.passwordResetToken = undefined
  user.passwordChangedAt = Date.now()
  user.passwordResetExpires = undefined
  
  await user.save()
  
  return res.status(200).json({
    success: true,
    mes: "Cập nhật mật khẩu thành công"
  })
})

const getUsers = asyncHandler(async (req, res) => {
  const queries = req.query
  const excludeFields = ["limit", "sort", "page", "fields"]
  const queryObj = { ...queries }
  
  excludeFields.forEach((field) => delete queryObj[field])
  
  let queryString = JSON.stringify(queryObj)
  queryString = queryString.replace(
    /\b(gte|gt|lt|lte)\b/g,
    (match) => `$${match}`
  )
  
  const formatedQueries = JSON.parse(queryString)
  
  if (queryObj?.name)
    formatedQueries.name = { $regex: queryObj.name, $options: "i" }
  
  if (queries.q) {
    delete formatedQueries.q
    formatedQueries["$or"] = [
      { firstname: { $regex: queries.q, $options: "i" } },
      { lastname: { $regex: queries.q, $options: "i" } },
      { email: { $regex: queries.q, $options: "i" } },
    ]
  }
  
  // Pagination
  const page = +queries.page || 1
  const limit = +queries.limit || process.env.LIMIT_PRODUCTS
  const skip = (page - 1) * limit
  
  // Build query
  let userQuery = User.find(formatedQueries)
  
  // Sort
  if (queries.sort) {
    const sortBy = queries.sort.split(",").join(" ")
    userQuery = userQuery.sort(sortBy)
  }
  
  // Field limiting
  if (queries.fields) {
    const fields = queries.fields.split(",").join(" ")
    userQuery = userQuery.select(fields)
  }
  
  // Execute query
  userQuery = userQuery.skip(skip).limit(limit)
  
  const users = await userQuery.exec()
  const counts = await User.find(formatedQueries).countDocuments()
  
  return res.status(200).json({
    success: true,
    counts,
    users
  })
})

const getUser = asyncHandler(async (req, res) => {
  const { uid } = req.params
  const user = await User.findById(uid).select("-password -refreshToken")

  return res.status(user ? 200 : 404).json({
    success: !!user,
    mes: user ? "Tìm thấy người dùng" : "Không tìm thấy người dùng",
    user
  })
})

const deleteUser = asyncHandler(async (req, res) => {
  const { uid } = req.params
  const response = await User.findByIdAndDelete(uid)
  
  return res.status(response ? 200 : 404).json({
    success: !!response,
    mes: response
      ? `Đã xóa người dùng với email ${response.email}`
      : "Không tìm thấy người dùng"
  })
})

const updateUser = asyncHandler(async (req, res) => {
  const { _id } = req.user
  const { firstname, lastname, email, mobile, address } = req.body
  const data = { firstname, lastname, email, mobile, address }
  
  if (req.file) data.avatar = req.file.path
  
  if (!_id || Object.keys(req.body).length === 0)
    throw new Error("Vui lòng nhập đủ thông tin!")
  
  const response = await User.findByIdAndUpdate(_id, data, {
    new: true,
  }).select("-password -role -refreshToken")
  
  return res.status(response ? 200 : 400).json({
    success: !!response,
    mes: response ? "Cập nhật thành công" : "Đã xảy ra lỗi",
    updatedUser: response
  })
})

const updateUserByAdmin = asyncHandler(async (req, res) => {
  const { uid } = req.params
  
  if (Object.keys(req.body).length === 0)
    throw new Error("Vui lòng nhập đủ thông tin!")
  
  const response = await User.findByIdAndUpdate(uid, req.body, {
    new: true,
  }).select("-password -refreshToken")
  
  return res.status(response ? 200 : 400).json({
    success: !!response,
    mes: response ? "Cập nhật thành công" : "Đã xảy ra lỗi",
    updatedUser: response
  })
})

const updateUserAddress = asyncHandler(async (req, res) => {
  const { _id } = req.user
  const { address } = req.body
  
  if (!address) throw new Error("Thiếu địa chỉ đầu vào")
  
  const response = await User.findByIdAndUpdate(
    _id,
    { $push: { address: address } },
    { new: true }
  ).select("-password -role -refreshToken")
  
  return res.status(response ? 200 : 400).json({
    success: !!response,
    updatedUser: response || "Đã xảy ra lỗi"
  })
})

const updateCart = asyncHandler(async (req, res) => {
  const { _id } = req.user
  const { pid, quantity = 1, color} = req.body
  
  if (!pid || !color) throw new Error("Vui lòng nhập đủ thông tin!")
  
  const product = await Product.findById(pid).select("title thumb price")
  if (!product) throw new Error("Không tìm thấy sản phẩm")

  const user = await User.findById(_id).select("cart")
  const alreadyProduct = user?.cart?.find(
    (el) => el.product.toString() === pid && el.color === color
  )
  
  let response
  if (alreadyProduct) {
    response = await User.updateOne(
      { _id, "cart.product": pid, "cart.color": color },
      {
        $set: {
          "cart.$.quantity": quantity,
          "cart.$.price": product.price,
          "cart.$.thumbnail": product.thumb,
          "cart.$.title": product.title,
        },
      },
      { new: true }
    )
    
    return res.status(response ? 200 : 400).json({
      success: !!response,
      mes: response ? "Đã cập nhật giỏ hàng của bạn" : "Đã xảy ra lỗi"
    })
  } else {
    response = await User.findByIdAndUpdate(
      _id,
      {
        $push: {
          cart: { 
            product: pid, 
            quantity, 
            color, 
            price: product.price, 
            thumbnail: product.thumb, 
            title: product.title 
          },
        },
      },
      { new: true }
    )
    
    return res.status(response ? 200 : 400).json({
      success: !!response,
      mes: response ? "Đã thêm sản phẩm vào giỏ hàng" : "Đã xảy ra lỗi"
    })
  }
})

const removeProductInCart = asyncHandler(async (req, res) => {
  const { _id } = req.user
  const { pid, color } = req.params
  
  if (!_id || !pid || !color) {
    return res.status(400).json({
      success: false,
      mes: "Thiếu thông tin để xóa sản phẩm khỏi giỏ hàng"
    })
  }

  const user = await User.findById(_id).select("cart")
  if (!user) {
    return res.status(404).json({
      success: false,
      mes: "Không tìm thấy người dùng"
    })
  }

  const cartItemIndex = user.cart.findIndex(
    el => el.product.toString() === pid && el.color === color
  )

  if (cartItemIndex === -1) {
    return res.status(200).json({
      success: true,
      mes: "Sản phẩm không có trong giỏ hàng"
    })
  }

  // Xóa sản phẩm khỏi mảng cart
  user.cart.splice(cartItemIndex, 1)
  await user.save()

  return res.status(200).json({
    success: true,
    mes: "Đã xóa sản phẩm khỏi giỏ hàng"
  })
})

const createUsers = asyncHandler(async (req, res) => {
  const response = await User.create(users)
  
  return res.status(response ? 200 : 400).json({
    success: !!response,
    users: response || "Đã xảy ra lỗi"
  })
})

const updateWishlist = asyncHandler(async (req, res) => {
  const { _id } = req.user
  const { pid } = req.params
  
  const user = await User.findById(_id)
  const alreadyInWishlist = user.wishlist?.find((el) => el.toString() === pid)
  
  let response
  if (alreadyInWishlist) {
    response = await User.findByIdAndUpdate(
      _id,
      { $pull: { wishlist: pid } },
      { new: true }
    )
    
    return res.status(response ? 200 : 400).json({
      success: !!response,
      mes: response
        ? "Đã xóa sản phẩm khỏi danh sách yêu thích."
        : "Không thể cập nhật danh sách yêu thích!"
    })
  } else {
    response = await User.findByIdAndUpdate(
      _id,
      { $push: { wishlist: pid } },
      { new: true }
    )
    
    return res.status(response ? 200 : 400).json({
      success: !!response,
      mes: response
        ? "Đã thêm sản phẩm vào danh sách yêu thích."
        : "Không thể cập nhật danh sách yêu thích!"
    })
  }
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
  getUser,
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