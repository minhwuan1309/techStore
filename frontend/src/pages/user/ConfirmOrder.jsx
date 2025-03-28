import React, { useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import Swal from "sweetalert2"
import { apiConfirmOrder } from "apis/product"

const ConfirmOrder = () => {
  const { orderId } = useParams()
  const navigate = useNavigate()

  useEffect(() => {
    const handleConfirmOrder = async () => {
        console.log("Gửi request xác nhận đơn hàng:", orderId);
        try {
          const response = await apiConfirmOrder(orderId);
          console.log("Phản hồi từ server:", response);
      
          if (response.success) {
            Swal.fire({
              title: "Cảm ơn!",
              text: "Bạn đã xác nhận nhận hàng thành công!",
              icon: "success",
              confirmButtonColor: "#3085d6",
              confirmButtonText: "Về trang chủ",
              background: "#f0f9ff",
            }).then(() => {
              navigate("/");
            });
          } else {
            Swal.fire({
              title: "Lỗi!",
              text: "Không thể xác nhận đơn hàng!",
              icon: "error",
              confirmButtonColor: "#d33",
              background: "#fff0f0",
            });
          }
        } catch (error) {
          console.error("Lỗi khi xác nhận đơn hàng:", error);
          Swal.fire({
            title: "Lỗi!",
            text: "Lỗi server khi xác nhận đơn hàng!",
            icon: "error",
            confirmButtonColor: "#d33",
            background: "#fff0f0",
          });
        }
      };
        handleConfirmOrder();      
  }, [orderId, navigate])

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-indigo-100 via-purple-100 to-pink-100">
      <div className="bg-white p-8 rounded-xl shadow-2xl text-center">
        <svg 
          xmlns="http://www.w3.org/2000/svg" 
          className="h-24 w-24 mx-auto mb-4 text-indigo-600 animate-pulse"
          fill="none" 
          viewBox="0 0 24 24" 
          stroke="currentColor"
        >
          <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth={2} 
            d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
          />
        </svg>
        <h2 className="text-2xl font-bold text-gray-800 mb-4">
          Đang xử lý xác nhận đơn hàng...
        </h2>
        <p className="text-gray-600 mb-6">
          Vui lòng chờ giây lát. Chúng tôi đang xác nhận đơn hàng của bạn.
        </p>
      </div>
    </div>
  )
}

export default ConfirmOrder