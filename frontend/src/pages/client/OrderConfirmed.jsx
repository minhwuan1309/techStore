import React, { useEffect } from "react"
import { useLocation, useNavigate } from "react-router-dom"
import { FaRegThumbsUp, FaRegThumbsDown} from "react-icons/fa" // Assuming you have this asset

const OrderConfirmed = () => {
  const location = useLocation()
  const navigate = useNavigate()
  const searchParams = new URLSearchParams(location.search)
  const success = searchParams.get("success") === "true"
  const message = searchParams.get("message") || ""

  useEffect(() => {
    // Redirect to home after 5 seconds
    const timer = setTimeout(() => {
      navigate("/")
    }, 5000)
    
    return () => clearTimeout(timer)
  }, [navigate])

  return (
    <div className="w-full min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="bg-white rounded-lg shadow-xl p-8 max-w-md w-full text-center">
        <img 
          src={success ? <FaRegThumbsUp /> : <FaRegThumbsDown />} 
          alt={success ? "Success" : "Error"} 
          className="w-24 h-24 mx-auto mb-4"
        />
        
        <h1 className={`text-2xl font-bold mb-4 ${success ? 'text-green-600' : 'text-red-600'}`}>
          {success ? "Xác nhận đơn hàng thành công!" : "Có lỗi xảy ra!"}
        </h1>
        
        {success ? (
          <p className="text-gray-700 mb-6">
            Cảm ơn bạn đã xác nhận đã nhận được đơn hàng. Đơn hàng của bạn đã được cập nhật trạng thái thành công.
          </p>
        ) : (
          <p className="text-gray-700 mb-6">
            {message || "Không thể xác nhận đơn hàng. Vui lòng thử lại sau hoặc liên hệ với chúng tôi để được hỗ trợ."}
          </p>
        )}
        
        <p className="text-sm text-gray-500">
          Bạn sẽ được chuyển về trang chủ sau 5 giây...
        </p>
        
        <button 
          onClick={() => navigate("/")}
          className="mt-6 px-6 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition"
        >
          Quay lại trang chủ
        </button>
      </div>
    </div>
  )
}

export default OrderConfirmed