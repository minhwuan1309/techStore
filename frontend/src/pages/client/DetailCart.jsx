import { Breadcrumb, Button } from "components"
import OrderItem from "components/products/OrderItem"
import withBaseComponent from "hocs/withBaseComponent"
import { useSelector, useDispatch } from "react-redux"
import { Link, createSearchParams } from "react-router-dom"
import Swal from "sweetalert2"
import { formatMoney } from "utils/helpers"
import path from "utils/path"
import { updateCart, removeFromCart } from "store/user/userSlice"
import { useState, useCallback } from "react"
import { apiRemoveCart } from "apis"
import { getCurrent } from "store/user/asyncActions"
import { toast } from "react-hot-toast"

const DetailCart = ({ location, navigate }) => {
  const dispatch = useDispatch()
  const { currentCart, current } = useSelector((state) => state.user)
  const [selectedProducts, setSelectedProducts] = useState([])

  const handleSubmit = () => {
    if (!selectedProducts.length) {
      return Swal.fire({
        icon: "info",
        title: "Chưa chọn sản phẩm",
        text: "Vui lòng chọn ít nhất một sản phẩm để thanh toán.",
        confirmButtonText: "Đã hiểu",
      })
    }

    if (!current?.address) {
      return Swal.fire({
        icon: "info",
        title: "Chưa hoàn tất!",
        text: "Vui lòng cập nhật địa chỉ của bạn trước khi thanh toán.",
        confirmButtonText: "Cập nhật",
        showCancelButton: true,
        cancelButtonText: "Hủy",
      }).then((result) => {
        if (result.isConfirmed) {
          navigate({
            pathname: `/${path.MEMBER}/${path.PERSONAL}`,
            search: createSearchParams({
              redirect: location.pathname,
            }).toString(),
          })
        }
      })
    }
    localStorage.setItem(
      "selectedProducts",
      JSON.stringify(selectedProducts)
    )
      navigate({
        pathname: `/${path.CHECKOUT}`,
    })
  }

  const removeCart = async (pid, color) => {
    try {
        // Tìm cart item để xóa khỏi Redux store trước
        const cartItem = currentCart.find(
            item => item.product?._id === pid && item.color === color
        );
        
        if (cartItem) {
            // Xóa từ Redux store trước để UI cập nhật ngay lập tức
            dispatch(removeFromCart(cartItem._id));
            
            // Sau đó xóa từ server
            const response = await apiRemoveCart(pid, color);
            if (response.success) {
                // Nếu xóa từ server thành công, cập nhật lại state
                dispatch(getCurrent());
            } else {
                // Nếu xóa từ server thất bại, fetch lại data mới
                dispatch(getCurrent());
                toast.error(response.mes);
            }
        }
    } catch (error) {
        // Nếu có lỗi, fetch lại data mới
        dispatch(getCurrent());
        toast.error("Có lỗi xảy ra");
    }
  }

  const handleIncreaseQuantity = (productId, color, currentQuantity) => {
    const product = currentCart.find(item => item.product?._id === productId && item.color === color);
    
    if (product && (product.product?.quantity < (currentQuantity + 1) || (currentQuantity + 1) > product.product?.quantity)) {
        return Swal.fire({
            title: "Oops...",
            text: "Sản phẩm không đủ số lượng!",
            icon: "info",
            confirmButtonText: "Đã hiểu",
        });
    }
    
    dispatch(
      updateCart({ pid: productId, color, quantity: currentQuantity + 1 })
    )
  }

  const handleDecreaseQuantity = (productId, color, currentQuantity) => {
    if (currentQuantity > 1) {
      dispatch(
        updateCart({ pid: productId, color, quantity: currentQuantity - 1 })
      )
    } else {
      removeCart(productId, color)
    }
  }
  const toggleProductSelection = (product) => {
    const isSelected = selectedProducts.find(
      (p) => p._id === product._id && p.color === product.color
    )
  
    if (isSelected) {
      setSelectedProducts(
        selectedProducts.filter(
          (p) => !(p._id === product._id && p.color === product.color)
        )
      )
    } else {
      // Bổ sung đầy đủ trường cần thiết
      setSelectedProducts([
        ...selectedProducts,
        {
          _id: product._id,
          product: product.product?._id || product._id,
          title: product.title,
          price: product.price,
          quantity: product.quantity,
          thumbnail: product.thumbnail,
          color: product.color, // quan trọng
          note: product.note,
        },
      ])
    }
  }
  

  return (
    <div className="w-full bg-gray-50 min-h-screen p-6">
      <div className="container mx-auto">
        <header className="text-3xl font-semibold py-4 mb-6 flex items-center border-b-2 border-indigo-600">
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            className="h-10 w-10 mr-4 text-indigo-600" 
            fill="none" 
            viewBox="0 0 24 24" 
            stroke="currentColor"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" 
            />
          </svg>
          Giỏ Hàng
        </header>

        {currentCart?.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg shadow-md">
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              className="h-24 w-24 mx-auto mb-4 text-gray-400" 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" 
              />
            </svg>
            <p className="text-xl text-gray-600">Giỏ hàng của bạn đang trống</p>
            <Link 
              to="/" 
              className="mt-4 inline-block px-6 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition"
            >
              Tiếp tục mua sắm
            </Link>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="grid grid-cols-11 gap-4 bg-gray-100 py-3 rounded-t-lg font-bold text-center">
              <div className="col-span-1"></div>
              <div className="col-span-5">Sản phẩm</div>
              <div className="col-span-2">Số lượng</div>
              <div className="col-span-2">Giá</div>
              <div className="col-span-1">Action</div>
            </div>

            {currentCart?.map((el) => (
              <div 
                key={el._id} 
                className="grid grid-cols-11 gap-4 items-center py-4 border-b hover:bg-gray-50 transition"
              >
                <div className="col-span-1 flex justify-center">
                  <input
                    type="checkbox"
                    className="form-checkbox w-5 h-5 text-indigo-600 rounded"
                    checked={!!selectedProducts.find((p) => p._id === el._id)}
                    onChange={() => toggleProductSelection(el)}
                  />
                </div>
                <div className="col-span-5 flex items-center">
                  <img
                    src={el.thumbnail}
                    alt={el.title}
                    className="w-20 h-20 object-cover rounded-md mr-4"
                  />
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800">{el.title}</h3>
                    <p className="text-gray-500">{el.color}</p>
                  </div>
                </div>
                <div className="col-span-2 flex justify-center items-center">
                  <div className="flex items-center space-x-3">
                    <button 
                      className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center hover:bg-indigo-200"
                      onClick={() => handleDecreaseQuantity(el.product?._id, el.color, el.quantity)}
                    >
                      -
                    </button>
                    <span className="text-lg font-medium">{el.quantity}</span>
                    <button 
                      className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center hover:bg-indigo-200"
                      onClick={() => handleIncreaseQuantity(el.product?._id, el.color, el.quantity)}
                    >
                      +
                    </button>
                  </div>
                </div>
                <div className="col-span-2 flex justify-center items-center">
                  <span className="text-lg font-bold text-indigo-600">
                    {formatMoney(el.price)} VNĐ
                  </span>
                  {el.note && <span className="text-red-500 text-sm ml-2">({el.note})</span>}
                </div>
                <div className="col-span-1 flex justify-center items-center">
                  <button className="text-red-500 text-sm ml-2" onClick={() => removeCart(el.product?._id, el.color)}>Xóa</button>
                </div>
              </div>
            ))}

            <div className="mt-6 flex justify-between items-center">
              <div className="text-xl font-bold text-gray-700">
                Tổng tiền: 
                <span className="ml-2 text-indigo-600">
                  {`${formatMoney(
                    selectedProducts?.reduce(
                      (sum, el) => +el?.price * el.quantity + sum,
                      0
                    )
                  )} VND`}
                </span>
              </div>
              <Button 
                handleOnClick={handleSubmit}
                className="px-8 py-3 bg-gradient-to-r from-indigo-600 via-purple-500 to-pink-500 text-white rounded-lg hover:opacity-90 transition"
              >
                Thanh Toán
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default withBaseComponent(DetailCart)