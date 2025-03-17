const User = require("../models/user")
const asyncHandler = require("express-async-handler")
const {
  generateAccessToken,
  generateRefreshToken,
} = require("../middlewares/jwt")
const jwt = require("jsonwebtoken")
const sendMail = require("../utils/sendMail")
const makeToken = require("../utils/sendMail")
const crypto = require("crypto")
const { users } = require("../utils/constant")
const user = require("../models/user")


const register = asyncHandler(async (req, res) => {
  const { email, password, firstname, lastname, mobile } = req.body
  if (!email || !password || !lastname || !firstname || !mobile)
    return res.status(400).json({
      success: false,
      mes: "Vui lòng nhập đủ thông tin",
    })
  const user = await User.findOne({ email })
  if (user) throw new Error("Email đã tồn tại")
  else {
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
    <!-- Container for the access token -->
    <div style="max-width: 500px; margin: 40px auto; padding: 20px; background-color: #f9f9f9; border: 1px solid #ddd; box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);">
      <!-- Header with a green background and bold title -->
      <div style="background-color: #4CAF50; padding: 20px; text-align: center;">
        <h1 style="color: #fff; font-size: 24px; font-weight: bold;">Chào mừng bạn đến với Tech Store!</h1>
      </div>
      
      <!-- Main content with a white background and padding -->
      <div style="padding: 20px;">
        <p>Cảm ơn bạn đã đăng ký tài khoản tại Tech Store. Vui lòng sử dụng mã dưới đây để xác nhận đăng ký tài khoản của bạn:</p>
        
        <!-- Access token container with a green background and bold text -->
        <div style="background-color: #4CAF50; padding: 20px; text-align: center; border-radius: 10px; box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);">
          <span style="font-size: 24px; font-weight: bold; color: #fff;">${token}</span>
        </div>
        
        <!-- Expiration notice with a smaller font size -->
        <p style="font-size: 16px;">Nếu bạn không yêu cầu đăng ký tài khoản, vui lòng bỏ qua email này. Mã này sẽ hết hạn sau 30 phút.</p>
        
        <!-- Footer with a smaller font size and a centered alignment -->
        <p style="font-size: 16px; text-align: center;">Trân trọng,<br />Đội ngũ hỗ trợ Tech Store</p>
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

    return res.json({
      success: newUser ? true : false,
      mes: newUser ? "Hãy kiểm tra Email!" : "Đã xảy ra lỗi, mời bạn thử lại",
    })
  }
})
const finalRegister = asyncHandler(async (req, res) => {
  // const cookie = req.cookies
  const { token } = req.params
  const notActivedEmail = await User.findOne({ email: new RegExp(`${token}$`) })
  if (notActivedEmail) {
    notActivedEmail.email = atob(notActivedEmail?.email?.split("@")[0])
    notActivedEmail.save()
  }
  return res.json({
    success: notActivedEmail ? true : false,
    mes: notActivedEmail
      ? "Đăng ký thành công! Hãy đăng nhập"
      : "Đã xảy ra lỗi, mời bạn thử lại",
  })
})
// Refresh token => Cấp mới access token
// Access token => Xác thực người dùng, quân quyên người dùng
const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body
  if (!email || !password)
    return res.status(400).json({
      success: false,
      mes: "Vui lòng nhập đủ thông tin",
    })
  
  const response = await User.findOne({ email })

    if(response.isBlocked){
      return res.json({
        success: false,
        mes: "Tài khoản của bạn đã bị chặn!",
      })
    }

  if (response && (await response.isCorrectPassword(password))) {
    // Tách password và role ra khỏi response
    const { password, role, refreshToken, ...userData } = response.toObject()
    // Tạo access token
    const accessToken = generateAccessToken(response._id, role)
    // Tạo refresh token
    const newRefreshToken = generateRefreshToken(response._id)
    // Lưu refresh token vào database
    await User.findByIdAndUpdate(
      response._id,
      { refreshToken: newRefreshToken },
      { new: true }
    )
    //npm i jsonwebtoken
    // Lưu refresh token vào cookie
    res.cookie("refreshToken", newRefreshToken, {
      httpOnly: true,
      maxAge: 7 * 24 * 60 * 60 * 1000,
    })
    return res.status(200).json({
      success: true,
      accessToken,
      userData,
    })
  } else {
    throw new Error("Lỗi!")
  }
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
  return res.status(200).json({
    success: user ? true : false,
    rs: user ? user : "Không tìm thấy người dùng",
  })
})
const refreshAccessToken = asyncHandler(async (req, res) => {
  // Lấy token từ cookies
  const cookie = req.cookies
  // Check xem có token hay không
  if (!cookie && !cookie.refreshToken)
    throw new Error("No refresh token in cookies")
  // Check token có hợp lệ hay không
  const rs = await jwt.verify(cookie.refreshToken, process.env.JWT_SECRET)
  const response = await User.findOne({
    _id: rs._id,
    refreshToken: cookie.refreshToken,
  })
  return res.status(200).json({
    success: response ? true : false,
    newAccessToken: response
      ? generateAccessToken(response._id, response.role)
      : "Refresh token not matched",
  })
})

const logout = asyncHandler(async (req, res) => {
  const cookie = req.cookies
  if (!cookie || !cookie.refreshToken)
    throw new Error("No refresh token in cookies")
  // Xóa refresh token ở db
  await User.findOneAndUpdate(
    { refreshToken: cookie.refreshToken },
    { refreshToken: "" },
    { new: true }
  )
  // Xóa refresh token ở cookie trình duyệt
  res.clearCookie("refreshToken", {
    httpOnly: true,
    secure: true,
  })
  return res.status(200).json({
    success: true,
    mes: "Đã đăng xuất",
  })
})
// Client gửi email
// Server check email có hợp lệ hay không => Gửi mail + kèm theo link (password change token)
// Client check mail => click link
// Client gửi api kèm token
// Check token có giống với token mà server gửi mail hay không
// Change password

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

  const data = {
    email,
    html,
    subject: "Đặt lại mật khẩu tài khoản tại Tech Store",
  }

  const rs = await sendMail(data)

  return res.status(200).json({
    success: rs.response?.includes("OK") ? true : false,
    mes: rs.response?.includes("OK")
      ? "Vui lòng kiểm tra email của bạn."
      : "Đã xảy ra lỗi. Vui lòng thử lại sau.",
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
    success: !!user,
    mes: user ? "Cập nhật mật khẩu thành công" : "Đã xảy ra lỗi",
  })
})


const getUsers = asyncHandler(async (req, res) => {
  const queries = { ...req.query }
  const excludeFields = ["limit", "sort", "page", "fields"]
  excludeFields.forEach((el) => delete queries[el])

  let queryString = JSON.stringify(queries)
  queryString = queryString.replace(
    /\b(gte|gt|lt|lte)\b/g,
    (macthedEl) => `$${macthedEl}`
  )
  const formatedQueries = JSON.parse(queryString)
  if (queries?.name)
    formatedQueries.name = { $regex: queries.name, $options: "i" }
  if (req.query.q) {
    delete formatedQueries.q
    formatedQueries["$or"] = [
      { firstname: { $regex: req.query.q, $options: "i" } },
      { lastname: { $regex: req.query.q, $options: "i" } },
      { email: { $regex: req.query.q, $options: "i" } },
    ]
  }
  let queryCommand = User.find(formatedQueries)

  if (req.query.sort) {
    const sortBy = req.query.sort.split(",").join(" ")
    queryCommand = queryCommand.sort(sortBy)
  }

  if (req.query.fields) {
    const fields = req.query.fields.split(",").join(" ")
    queryCommand = queryCommand.select(fields)
  }

  const page = +req.query.page || 1
  const limit = +req.query.limit || process.env.LIMIT_PRODUCTS
  const skip = (page - 1) * limit
  queryCommand.skip(skip).limit(limit)
  queryCommand.exec(async (err, response) => {
    if (err) throw new Error(err.message)
    const counts = await User.find(formatedQueries).countDocuments()
    return res.status(200).json({
      success: !!response,
      counts,
      users: response || "Không thể lấy danh sách người dùng",
    })
  })
})

const deleteUser = asyncHandler(async (req, res) => {
  const { uid } = req.params
  const response = await User.findByIdAndDelete(uid)
  return res.status(200).json({
    success: !!response,
    mes: response
      ? `Đã xóa người dùng với email ${response.email}`
      : "Không tìm thấy người dùng",
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
  return res.status(200).json({
    success: !!response,
    mes: response ? "Cập nhật thành công" : "Đã xảy ra lỗi",
  })
})
const updateUserByAdmin = asyncHandler(async (req, res) => {
  const { uid } = req.params
  if (Object.keys(req.body).length === 0)
    throw new Error("Vui lòng nhập đủ thông tin!")
  const response = await User.findByIdAndUpdate(uid, req.body, {
    new: true,
  }).select("-password -role -refreshToken")
  return res.status(200).json({
    success: !!response,
    mes: response ? "Cập nhật thành công" : "Đã xảy ra lỗi",
  })
})
const updateUserAddress = asyncHandler(async (req, res) => {
  const { _id } = req.user
  if (!req.body.address) throw new Error("Thiếu địa chỉ đầu vào")
  const response = await User.findByIdAndUpdate(
    _id,
    { $push: { address: req.body.address } },
    { new: true }
  ).select("-password -role -refreshToken")
  return res.status(200).json({
    success: !!response,
    updatedUser: response || "Đã xảy ra lỗi",
  })
})
const updateCart = asyncHandler(async (req, res) => {
  const { _id } = req.user
  const { pid, quantity = 1, color, price, thumbnail, title } = req.body
  if (!pid || !color) throw new Error("Vui lòng nhập đủ thông tin!")

  const user = await User.findById(_id).select("cart")
  const alreadyProduct = user?.cart?.find(
    (el) => el.product.toString() === pid && el.color === color
  )

  if (alreadyProduct) {
    const response = await User.updateOne(
      { cart: { $elemMatch: alreadyProduct } },
      {
        $set: {
          "cart.$.quantity": quantity,
          "cart.$.price": price,
          "cart.$.thumbnail": thumbnail,
          "cart.$.title": title,
        },
      },
      { new: true }
    )
    return res.status(200).json({
      success: !!response,
      mes: response ? "Đã cập nhật giỏ hàng của bạn" : "Đã xảy ra lỗi",
    })
  } else {
    const response = await User.findByIdAndUpdate(
      _id,
      {
        $push: {
          cart: { product: pid, quantity, color, price, thumbnail, title },
        },
      },
      { new: true }
    )
    return res.status(200).json({
      success: !!response,
      mes: response ? "Đã thêm sản phẩm vào giỏ hàng" : "Đã xảy ra lỗi",
    })
  }
})

const removeProductInCart = asyncHandler(async (req, res) => {
  const { _id } = req.user
  const { pid, color } = req.params
  const user = await User.findById(_id).select("cart")
  const alreadyProduct = user?.cart?.find(
    (el) => el.product.toString() === pid && el.color === color
  )

  if (!alreadyProduct)
    return res.status(200).json({
      success: true,
      mes: "Giỏ hàng đã được cập nhật",
    })

  const response = await User.findByIdAndUpdate(
    _id,
    { $pull: { cart: { product: pid, color } } },
    { new: true }
  )
  return res.status(200).json({
    success: !!response,
    mes: response ? "Đã xóa sản phẩm khỏi giỏ hàng" : "Đã xảy ra lỗi",
  })
})

const createUsers = asyncHandler(async (req, res) => {
  const response = await User.create(users)
  return res.status(200).json({
    success: !!response,
    users: response || "Đã xảy ra lỗi",
  })
})

const updateWishlist = asyncHandler(async (req, res) => {
  const { pid } = req.params
  const { _id } = req.user

  const user = await User.findById(_id)
  const alreadyInWishlist = user.wishlist?.find((el) => el.toString() === pid)

  if (alreadyInWishlist) {
    const response = await User.findByIdAndUpdate(
      _id,
      { $pull: { wishlist: pid } },
      { new: true }
    )
    return res.json({
      success: !!response,
      mes: response
        ? "Đã xóa sản phẩm khỏi danh sách yêu thích."
        : "Không thể cập nhật danh sách yêu thích!",
    })
  } else {
    const response = await User.findByIdAndUpdate(
      _id,
      { $push: { wishlist: pid } },
      { new: true }
    )
    return res.json({
      success: !!response,
      mes: response
        ? "Đã thêm sản phẩm vào danh sách yêu thích."
        : "Không thể cập nhật danh sách yêu thích!",
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
