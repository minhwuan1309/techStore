import React, { useEffect, useState } from "react"
import payment from "assets/payment.svg"
import { useSelector } from "react-redux"
import { formatMoney, calculateTotal } from "utils/helpers"
import { Congrat, Paypal } from "components"
import withBaseComponent from "hocs/withBaseComponent"
import { getCurrent } from "store/user/asyncActions"
import Swal from "sweetalert2"
import { useDispatch } from "react-redux"
import { removeFromCart } from "store/user/userSlice"
import { apiCreateOrder } from "apis"
import { Link, useLocation } from "react-router-dom"
import { apiCheckCoupon, apiRemoveCart } from "apis"

const Checkout = ({ dispatch, navigate }) => {
  const location = useLocation()
  const { current } = useSelector((state) => state.user)
  const [isSuccess, setIsSuccess] = useState(false)
  const [paymentMethod, setPaymentMethod] = useState("")
  const [couponCode, setCouponCode] = useState("")
  const [discount, setDiscount] = useState(0)
  dispatch = useDispatch()
  const selectedProducts = JSON.parse(localStorage.getItem("selectedProducts")) || []
  
  const total = selectedProducts?.reduce(
    (sum, el) => sum + el.price * el.quantity,
    0
  )
  const [finalTotal, setFinalTotal] = useState(total)

  useEffect(() => {
    if (isSuccess) dispatch(getCurrent())
  }, [isSuccess])

  useEffect(() => {
    if (paymentMethod === "COD") {
      const total = Math.round(
        +selectedProducts?.reduce((sum, el) => +el?.price * el.quantity + sum, 0)
      )
      Swal.fire({
        icon: "info",
        title: "Thanh toán",
        text: `Vui lòng trả bằng tiền mặt số tiền ${formatMoney(
          total
        )} VNĐ khi nhận hàng.`,
        showConfirmButton: true,
        confirmButtonText: "Thanh toán",
        showCancelButton: true,
        cancelButtonText: "Quay lại",
      }).then((result) => {
        if (result.isConfirmed) {
          handleSaveOrder()
        } else {
          setPaymentMethod("")
        }
      })
    }
  }, [paymentMethod])

  const handleSaveOrder = async () => {
    if (!current?._id) {
      Swal.fire("Lỗi!", "Không tìm thấy thông tin người dùng!", "error")
      return
    }
  
    const payload = {
      products: selectedProducts.map((el) => ({
        product: el._id,
        quantity: el.quantity,
        price: el.price,
        title: el.title,
        thumbnail: el.thumbnail || "",
      })),
      total: Math.round(
        selectedProducts.reduce((sum, el) => el.price * el.quantity + sum, 0)
      ),
      finalTotal: Math.round(finalTotal),
      discount: discount || 0,
      address: current.address || "Chưa có địa chỉ",
      paymentMethod,
      orderBy: current._id,
    }
  
    try {
      const response = await apiCreateOrder({ ...payload, status: "Pending" })
      if (response.success) {
        for (const product of selectedProducts) {
          console.log("Trying to remove from cart:", product._id, product.color)
        
          if (!product.color) {
            console.warn("Thiếu color -> không xoá được:", product)
            continue
          }
        
          await apiRemoveCart(product._id, product.color)
        
          const cartItem = current?.cart?.find(
            (item) =>
              item.product?._id === product._id && item.color === product.color
          );
        
          if (cartItem) {
            dispatch(removeFromCart(cartItem._id)); // xoá đúng phần tử trong Redux cart
          }
        }        
        
        await dispatch(getCurrent())
        localStorage.removeItem("selectedProducts");
        setIsSuccess(true);
      
        Swal.fire("Thành công!", "Đơn hàng đã được đặt!", "success").then(() =>
          navigate("/")
        )
      } else {
        Swal.fire("Lỗi!", response.message || "Không thể tạo đơn hàng!", "error")
      }
    } catch (error) {
      console.error("Lỗi khi tạo đơn hàng:", error)
      Swal.fire("Lỗi!", "Lỗi server khi tạo đơn hàng!", "error")
    }
  }


  const handleApplyCoupon = async () => {
    const response = await apiCheckCoupon({ coupon: couponCode })

    if (response.success) {
      const discountAmount = (response.discount / 100) * total // Tính giảm giá
      setDiscount(response.discount)
      setFinalTotal(total - discountAmount) // Cập nhật tổng tiền sau giảm giá
      Swal.fire(
        "Thành công!",
        `Mã giảm giá ${response.discount}% đã được áp dụng`,
        "success"
      )
    } else {
      Swal.fire("Thất bại!", response.message, "error")
    }
  }

  return (
    <div className="w-full bg-gray-50 min-h-screen p-6">
      {isSuccess && <Congrat />}
      <div className="container mx-auto bg-white rounded-lg shadow-lg p-8 grid grid-cols-12 gap-8">
        <div className="col-span-4 flex items-center justify-center">
          <img
            src={payment}
            alt="payment"
            className="w-[80%] h-[500px] object-contain"
          />
        </div>

        <div className="col-span-8 space-y-5">
          <div className="bg-gray-100 rounded-lg p-6 border border-gray-200">
            <h2 className="text-2xl font-semibold mb-5 text-indigo-600 border-b border-indigo-300 pb-3">
              Danh sách sản phẩm
            </h2>

            <table className="table-auto w-full border-collapse">
              <thead>
                <tr className="bg-indigo-50 text-indigo-700">
                  <th className="p-3 text-left">Tên sản phẩm</th>
                  <th className="p-3 text-center">Số lượng</th>
                  <th className="p-3 text-right">Giá</th>
                </tr>
              </thead>
              <tbody>
                {selectedProducts?.map((el, index) => (
                  <tr
                    className="border-b hover:bg-gray-50 transition"
                    key={el._id || index}
                  >
                    <td className="p-3 align-top">{el.title}</td>
                    <td className="p-3 text-center align-top">{el.quantity}</td>
                    <td className="p-3 text-right align-top">
                      <div className="flex flex-col items-end">
                        <span>{formatMoney(el.price)} VNĐ</span>
                        {el.note && (
                          <span className="text-red-500 text-sm mt-1">({el.note})</span>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="mt-6">
              <span className="text-base md:text-lg font-medium text-gray-700">
                Địa chỉ giao hàng:{" "}
                <span className="font-semibold">{current?.address}</span>
              </span>
            </div>
          </div>

          <div className="bg-gray-100 rounded-lg p-6 border border-gray-200">
            <div className="flex justify-between items-center mb-4">
              <input
                type="text"
                value={couponCode}
                onChange={(e) => setCouponCode(e.target.value)}
                placeholder="Nhập mã giảm giá"
                className="border rounded-md px-3 py-2 w-2/3 focus:ring-2 focus:ring-indigo-500"
              />
              <button
                onClick={handleApplyCoupon}
                className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white px-4 py-2 rounded-md hover:opacity-90 transition"
              >
                Áp dụng
              </button>
            </div>
            {discount > 0 && (
              <p className="text-green-600 text-lg mb-2">
                Đã áp dụng giảm giá: {discount}% (Tiết kiệm:{" "}
                {formatMoney(total - finalTotal)} VND)
              </p>
            )}
            <p className="text-xl font-bold text-indigo-700">
              Tổng tiền sau giảm giá:{" "}
              {formatMoney(finalTotal)} VND
            </p>
          </div>

          <div className="bg-gray-100 rounded-lg p-6 border border-gray-200">
            <h3 className="text-xl font-semibold mb-4 text-indigo-600 border-b-2 border-indigo-600 pb-2">
              Chọn phương thức thanh toán
            </h3>
            <select
              onChange={(e) => setPaymentMethod(e.target.value)}
              value={paymentMethod}
              className="w-full border rounded-md px-4 py-2 focus:ring-2 focus:ring-indigo-500"
            >
              <option value="">-- Chọn --</option>
              <option value="COD">Thanh toán khi nhận hàng</option>
              <option value="PAYPAL">Thanh toán Paypal</option>
              <option value="MOMO">Thanh toán Momo</option>
            </select>
            {paymentMethod === "PAYPAL" && (
              <div className="mt-4">
                <Paypal
                  payload={{
                    products: selectedProducts,
                    total: Math.round(
                      selectedProducts?.reduce(
                        (sum, el) => +el?.price * el.quantity + sum,
                        0
                      )
                    ),
                    address: current?.address,
                    paymentMethod,
                  }}
                  setIsSuccess={setIsSuccess}
                  amount={Math.round(
                    selectedProducts?.reduce(
                      (sum, el) => +el?.price * el.quantity + sum,
                      0
                    ) / 25000 
                  )}                  
                />
              </div>
            )}
          </div>
          
          <div className="flex justify-between items-center">
            <Link to="/" className="w-full mr-4">
              <button className="w-full px-8 py-3 text-indigo-600 border-2 border-indigo-600 rounded-lg hover:bg-indigo-600 hover:text-white transition">
                Quay lại
              </button>
            </Link>
            <button 
              onClick={handleSaveOrder}
              className="w-full px-8 py-3 bg-gradient-to-r from-indigo-600 via-purple-500 to-pink-500 text-white rounded-lg hover:opacity-90 transition"
            >
              Thanh toán
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default withBaseComponent(Checkout)
