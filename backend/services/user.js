const User = require("../models/user")
const jwt = require("jsonwebtoken")
const crypto = require("crypto")
const sendMail = require("../utils/sendMail")
const { users } = require("../utils/constant")
const { generateAccessToken, generateRefreshToken } = require("../middlewares/jwt")

class UserService {
  constructor() {
    this.makeToken = () => crypto.randomBytes(3).toString('hex').toUpperCase()
  }

  async register(userInput) {
    const { email, password, firstname, lastname, mobile } = userInput
    
    if (!email || !password || !lastname || !firstname || !mobile)
      return {
        success: false,
        mes: "Vui lòng nhập đủ thông tin",
        statusCode: 400
      }
    
    const user = await User.findOne({ email })
    
    if (user) throw new Error("Email đã tồn tại")
    
    const token = this.makeToken()
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
    
    return {
      success: newUser ? true : false,
      mes: newUser ? "Hãy kiểm tra Email!" : "Đã xảy ra lỗi, mời bạn thử lại",
      statusCode: newUser ? 200 : 400
    }
  }


  async finalRegister(token) {
    const notActivedEmail = await User.findOne({ email: new RegExp(`${token}$`) })
    
    if (notActivedEmail) {
      notActivedEmail.email = atob(notActivedEmail?.email?.split("@")[0])
      await notActivedEmail.save()
    }
    
    return {
      success: notActivedEmail ? true : false,
      mes: notActivedEmail ? "Đăng ký thành công! Hãy đăng nhập" : "Đã xảy ra lỗi, mời bạn thử lại",
      statusCode: notActivedEmail ? 200 : 400
    }
  }

  async login(loginData) {
    const { email, password } = loginData
    
    if (!email || !password)
      return {
        success: false,
        mes: "Vui lòng nhập đủ thông tin",
        statusCode: 400
      }
    
    const user = await User.findOne({ email })
    
    if (!user) throw new Error("Không tìm thấy người dùng")
    
    if (user.isBlocked) {
      return {
        success: false,
        mes: "Tài khoản của bạn đã bị chặn!",
        statusCode: 403
      }
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
    
    return {
      success: true,
      accessToken,
      userData,
      refreshToken: newRefreshToken,
      statusCode: 200
    }
  }

  async getCurrent(userId) {
    const user = await User.findById(userId)
      .select("-refreshToken -password")
      .populate({
        path: "cart",
        populate: {
          path: "product",
          select: "title thumb price",
        },
      })
      .populate("wishlist", "title thumb price color")
    
    return {
      success: user ? true : false,
      rs: user ? user : "Không tìm thấy người dùng",
      statusCode: user ? 200 : 404
    }
  }

  async refreshAccessToken(refreshToken) {
    if (!refreshToken) throw new Error("No refresh token provided")
    
    try {
      const decoded = await jwt.verify(refreshToken, process.env.JWT_SECRET)
      const user = await User.findOne({
        _id: decoded._id,
        refreshToken: refreshToken,
      })
      
      if (!user) throw new Error("Refresh token không hợp lệ")
      
      const newAccessToken = generateAccessToken(user._id, user.role)
      
      return {
        success: true,
        newAccessToken,
        statusCode: 200
      }
    } catch (error) {
      throw new Error("Refresh token không hợp lệ hoặc đã hết hạn")
    }
  }

  async logout(refreshToken) {
    if (!refreshToken) throw new Error("No refresh token in cookies")
    
    // Xóa refresh token ở db
    const result = await User.findOneAndUpdate(
      { refreshToken },
      { refreshToken: "" },
      { new: true }
    )
    
    return {
      success: !!result,
      mes: "Đã đăng xuất",
      statusCode: 200
    }
  }

  async forgotPassword(email) {
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
    
    return {
      success: rs.response?.includes("OK") ? true : false,
      mes: rs.response?.includes("OK")
        ? "Vui lòng kiểm tra email của bạn."
        : "Đã xảy ra lỗi. Vui lòng thử lại sau.",
      statusCode: rs.response?.includes("OK") ? 200 : 400
    }
  }

  async resetPassword(resetData) {
    const { password, token } = resetData
    
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
    
    return {
      success: true,
      mes: "Cập nhật mật khẩu thành công",
      statusCode: 200
    }
  }

  async getUsers(queries) {
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
    
    return {
      success: true,
      counts,
      users,
      statusCode: 200
    }
  }

  async deleteUser(userId) {
    const response = await User.findByIdAndDelete(userId)
    
    return {
      success: !!response,
      mes: response
        ? `Đã xóa người dùng với email ${response.email}`
        : "Không tìm thấy người dùng",
      statusCode: response ? 200 : 404
    }
  }

  async updateUser(userId, userData, avatarPath = null) {
    const { firstname, lastname, email, mobile, address } = userData
    const data = { firstname, lastname, email, mobile, address }
    
    if (avatarPath) data.avatar = avatarPath
    
    if (!userId || Object.keys(userData).length === 0)
      throw new Error("Vui lòng nhập đủ thông tin!")
    
    const response = await User.findByIdAndUpdate(userId, data, {
      new: true,
    }).select("-password -role -refreshToken")
    
    return {
      success: !!response,
      mes: response ? "Cập nhật thành công" : "Đã xảy ra lỗi",
      updatedUser: response,
      statusCode: response ? 200 : 400
    }
  }

  async updateUserByAdmin(userId, userData) {
    if (Object.keys(userData).length === 0)
      throw new Error("Vui lòng nhập đủ thông tin!")
    
    const response = await User.findByIdAndUpdate(userId, userData, {
      new: true,
    }).select("-password -role -refreshToken")
    
    return {
      success: !!response,
      mes: response ? "Cập nhật thành công" : "Đã xảy ra lỗi",
      updatedUser: response,
      statusCode: response ? 200 : 400
    }
  }

  async updateUserAddress(userId, address) {
    if (!address) throw new Error("Thiếu địa chỉ đầu vào")
    
    const response = await User.findByIdAndUpdate(
      userId,
      { $push: { address: address } },
      { new: true }
    ).select("-password -role -refreshToken")
    
    return {
      success: !!response,
      updatedUser: response || "Đã xảy ra lỗi",
      statusCode: response ? 200 : 400
    }
  }

  async updateCart(userId, productData) {
    const { pid, quantity = 1, color, price, thumbnail, title } = productData
    
    if (!pid || !color) throw new Error("Vui lòng nhập đủ thông tin!")
    
    const user = await User.findById(userId).select("cart")
    const alreadyProduct = user?.cart?.find(
      (el) => el.product.toString() === pid && el.color === color
    )
    
    let response
    if (alreadyProduct) {
      response = await User.updateOne(
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
      
      return {
        success: !!response,
        mes: response ? "Đã cập nhật giỏ hàng của bạn" : "Đã xảy ra lỗi",
        statusCode: response ? 200 : 400
      }
    } else {
      response = await User.findByIdAndUpdate(
        userId,
        {
          $push: {
            cart: { product: pid, quantity, color, price, thumbnail, title },
          },
        },
        { new: true }
      )
      
      return {
        success: !!response,
        mes: response ? "Đã thêm sản phẩm vào giỏ hàng" : "Đã xảy ra lỗi",
        statusCode: response ? 200 : 400
      }
    }
  }

  async removeProductInCart(userId, pid, color) {
    const user = await User.findById(userId).select("cart")
    const alreadyProduct = user?.cart?.find(
      (el) => el.product.toString() === pid && el.color === color
    )
    
    if (!alreadyProduct)
      return {
        success: true,
        mes: "Giỏ hàng đã được cập nhật",
        statusCode: 200
      }
    
    const response = await User.findByIdAndUpdate(
      userId,
      { $pull: { cart: { product: pid, color } } },
      { new: true }
    )
    
    return {
      success: !!response,
      mes: response ? "Đã xóa sản phẩm khỏi giỏ hàng" : "Đã xảy ra lỗi",
      statusCode: response ? 200 : 400
    }
  }

  async createUsers() {
    const response = await User.create(users)
    
    return {
      success: !!response,
      users: response || "Đã xảy ra lỗi",
      statusCode: response ? 200 : 400
    }
  }

  async updateWishlist(userId, productId) {
    const user = await User.findById(userId)
    const alreadyInWishlist = user.wishlist?.find((el) => el.toString() === productId)
    
    let response
    if (alreadyInWishlist) {
      response = await User.findByIdAndUpdate(
        userId,
        { $pull: { wishlist: productId } },
        { new: true }
      )
      
      return {
        success: !!response,
        mes: response
          ? "Đã xóa sản phẩm khỏi danh sách yêu thích."
          : "Không thể cập nhật danh sách yêu thích!",
        statusCode: response ? 200 : 400
      }
    } else {
      response = await User.findByIdAndUpdate(
        userId,
        { $push: { wishlist: productId } },
        { new: true }
      )
      
      return {
        success: !!response,
        mes: response
          ? "Đã thêm sản phẩm vào danh sách yêu thích."
          : "Không thể cập nhật danh sách yêu thích!",
        statusCode: response ? 200 : 400
      }
    }
  }
}

module.exports = new UserService()