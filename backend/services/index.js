const userService = require('./user')
const productService = require('./product')
const categoryService = require('./productCategory')
const orderService = require('./order')
const blogService = require('./blog')
const brandService = require('./brand')
const couponService = require('./coupon')

module.exports = {
    userService,
    productService,
    categoryService,
    orderService,
    blogService,
    brandService,
    couponService
}