import React, { useEffect, useState } from "react"
import payment from "assets/payment.svg"
import { useSelector } from "react-redux"
import { formatMoney, calculateTotal } from "utils/helpers"
import { Congrat, Paypal } from "components"
import withBaseComponent from "hocs/withBaseComponent"
import { getCurrent } from "store/user/asyncActions"
import Swal from "sweetalert2"
import { apiCreateOrder } from "apis"
import { Link, useLocation } from "react-router-dom"
import { apiCheckCoupon } from "apis"


const Checkout = ({ dispatch, navigate }) => {
  const location = useLocation()
  const { current } = useSelector((state) => state.user);
  const [isSuccess, setIsSuccess] = useState(false)
  const [paymentMethod, setPaymentMethod] = useState("")
  const [couponCode, setCouponCode] = useState("")
  const [discount, setDiscount] = useState(0)
  const selectedProducts = JSON.parse(localStorage.getItem("selectedProducts")) || [];
  console.log("Selected Products in Checkout:", selectedProducts); // Debugging
  
  const total = selectedProducts?.reduce(
    (sum, el) => sum + el.price * el.quantity,
    0
  );
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
      Swal.fire("Lỗi!", "Không tìm thấy thông tin người dùng!", "error");
      return;
    }
  
    const payload = {
      products: selectedProducts.map((el) => ({
        product: el._id, // Đảm bảo là ObjectId
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
      orderBy: current._id, // Gửi _id của user
    };
  
    console.log("🚀 Payload gửi đi:", payload); // Debug để kiểm tra dữ liệu gửi lên
  
    try {
      const response = await apiCreateOrder({ ...payload, status: "Pending" });
      if (response.success) {
        localStorage.removeItem("selectedProducts");
        setIsSuccess(true);
        Swal.fire("Thành công!", "Đơn hàng đã được đặt!", "success").then(() =>
          navigate("/")
        );
      } else {
        Swal.fire("Lỗi!", response.message || "Không thể tạo đơn hàng!", "error");
      }
    } catch (error) {
      console.error("Lỗi khi tạo đơn hàng:", error);
      Swal.fire("Lỗi!", "Lỗi server khi tạo đơn hàng!", "error");
    }
  };
  
  


  const handleApplyCoupon = async () => {
    const response = await apiCheckCoupon({ coupon: couponCode });

    if (response.success) {
      const discountAmount = (response.discount / 100) * total; // Tính giảm giá
      setDiscount(response.discount);
      setFinalTotal(total - discountAmount); // Cập nhật tổng tiền sau giảm giá
      Swal.fire(
        "Thành công!",
        `Mã giảm giá ${response.discount}% đã được áp dụng`,
        "success"
      );
    } else {
      Swal.fire("Thất bại!", response.message, "error");
    }
  };

  return (
    <div className="container mx-auto p-6">
      {isSuccess && <Congrat />}
      <div className="grid grid-cols-12 gap-6">
        <div className="col-span-4 flex items-center justify-center h-[600px]">
          <img
            src={payment}
            alt="payment"
            className="w-[80%] h-[90%] object-contain"
          />
        </div>

        <div className="col-span-8 space-y-6">
          <div className="bg-white shadow-md rounded p-4">
            <h2 className="text-2xl font-semibold mb-4">Danh sách sản phẩm</h2>
            <table className="table-auto w-full border-collapse border border-gray-300">
              <thead>
                <tr className="bg-gray-100 border-b border-gray-300">
                  <th className="p-3 text-left">Tên sản phẩm</th>
                  <th className="p-3 text-center">Số lượng</th>
                  <th className="p-3 text-right">Giá</th>
                </tr>
              </thead>
              <tbody>
                {selectedProducts?.map((el, index) => (
                  <tr
                    className="border-b border-gray-300 hover:bg-gray-50"
                    key={el._id || index}
                  >
                    <td className="p-3">{el.title}</td>
                    <td className="p-3 text-center">{el.quantity}</td>
                    <td className="p-3 text-right flex flex-col">
                      {formatMoney(el.price) + " VNĐ"} {el.note && <span className="text-red-500 text-sm ml-2">({el.note})</span>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="bg-white border border-gray-300 shadow-md rounded p-4">
            <div className="flex justify-between items-center text-lg mb-2">
              <input
                type="text"
                value={couponCode}
                onChange={(e) => setCouponCode(e.target.value)}
                placeholder="Nhập mã giảm giá"
                className="border rounded px-2 py-1 w-[60%]"
              />
              <button
                onClick={handleApplyCoupon}
                className="bg-blue-500 text-white px-4 py-1 rounded hover:bg-blue-600"
              >
                Áp dụng
              </button>
            </div>
            {discount > 0 && (
              <p className="text-green-500 text-lg mt-2">
                Đã áp dụng giảm giá: {discount}% (Tiết kiệm:{" "}
                {formatMoney(total - finalTotal)} VND)
              </p>
            )}
            <p className="text-lg font-bold">
              Tổng tiền sau giảm giá:{" "}
              <span className="text-main">{formatMoney(finalTotal)} VND</span>
            </p>
          </div>

          <div className="bg-white shadow-md rounded p-4 mt-4">
            <div className="flex justify-between text-lg mb-2">
              <span className="font-medium">Tổng tiền:</span>
              <span className="text-main font-bold">
                {formatMoney(discount > 0 ? finalTotal : total)} VND
              </span>
            </div>
            <div className="flex justify-between text-lg">
              <span className="font-medium">Địa chỉ:</span>
              <span className="text-main font-bold">{current?.address}</span>
            </div>
          </div>
          

          <div className="bg-white p-4 rounded shadow-md border border-gray-300">
            <h3 className="text-lg font-semibold mb-3">
              Chọn phương thức thanh toán
            </h3>
            <select
              onChange={(e) => setPaymentMethod(e.target.value)}
              value={paymentMethod}
              className="w-full border rounded-md px-4 py-2"
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
                      +selectedProducts?.reduce(
                        (sum, el) => +el?.price * el.quantity + sum,
                        0
                      ) / 25000
                    ),
                    address: current?.address,
                    paymentMethod,
                  }}
                  setIsSuccess={setIsSuccess}
                  amount={Math.round(
                    +selectedProducts?.reduce(
                      (sum, el) => +el?.price * el.quantity + sum,
                      0
                    ) / 25000
                  )}
                />
              </div>
            )}
          </div>
          <div className="text-center mt-4">
            <Link to="/">
              <button className="w-full px-8 py-3 text-red-500 border border-gray-300 rounded-md bg-white hover:bg-red-500 hover:text-white hover:shadow-lg transition-all duration-200">
                Quay lại
              </button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default withBaseComponent(Checkout)
