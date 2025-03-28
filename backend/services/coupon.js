const Coupon = require('../models/coupon')

class CouponService {
  async createNewCoupon(couponData) {
    const { name, discount, expiry } = couponData
    if (!name || !discount || !expiry) throw new Error("Vui lòng nhập đủ thông tin!")

    const response = await Coupon.create({
      ...couponData,
      expiry: Date.now() + +expiry * 24 * 60 * 60 * 1000,
    })

    return {
      success: !!response,
      createdCoupon: response || "Không thể tạo mã giảm giá mới",
      statusCode: response ? 200 : 400
    }
  }

  async getCoupons() {
    const response = await Coupon.find().select("-createdAt -updatedAt")
    
    return {
      success: !!response,
      coupons: response || "Không thể lấy mã giảm giá",
      statusCode: response ? 200 : 400
    }
  }

  async updateCoupon(couponId, couponData) {
    if (Object.keys(couponData).length === 0)
      throw new Error("Vui lòng nhập đủ thông tin!")

    if (couponData.expiry)
      couponData.expiry = Date.now() + +couponData.expiry * 24 * 60 * 60 * 1000

    const response = await Coupon.findByIdAndUpdate(couponId, couponData, { new: true })

    return {
      success: !!response,
      updatedCoupon: response || "Không thể cập nhật mã giảm giá",
      statusCode: response ? 200 : 400
    }
  }

  async deleteCoupon(couponId) {
    const response = await Coupon.findByIdAndDelete(couponId)

    return {
      success: !!response,
      deletedCoupon: response || "Không thể xóa mã giảm giá",
      statusCode: response ? 200 : 400
    }
  }

  async checkCoupon(couponName) {
    if (!couponName) {
      return {
        success: false,
        message: "Vui lòng nhập mã giảm giá",
        statusCode: 400
      }
    }

    const foundCoupon = await Coupon.findOne({ name: couponName.toUpperCase() })

    if (!foundCoupon) {
      return {
        success: false,
        message: "Mã giảm giá không hợp lệ",
        statusCode: 400
      }
    }

    if (new Date(foundCoupon.expiry) < new Date()) {
      return {
        success: false,
        message: "Mã giảm giá đã hết hạn",
        statusCode: 400
      }
    }

    return {
      success: true,
      discount: foundCoupon.discount,
      message: "Mã giảm giá hợp lệ",
      statusCode: 200
    }
  }
}

module.exports = new CouponService()