import Button from 'components/buttons/Button'
import withBaseComponent from 'hocs/withBaseComponent'
import React, { memo } from 'react'
import { AiFillCloseCircle } from 'react-icons/ai'
import { useSelector } from 'react-redux'
import { showCart } from 'store/app/appSlice'
import { formatMoney } from 'utils/helpers'
import { ImBin } from 'react-icons/im'
import { apiRemoveCart } from 'apis'
import { getCurrent } from 'store/user/asyncActions'
import { toast } from 'react-toastify'
import path from 'utils/path'
import { updateCart, removeFromCart } from "store/user/userSlice"
import Swal from 'sweetalert2'


const Cart = ({ dispatch, navigate }) => {
    const { currentCart } = useSelector(state => state.user)
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
                if (!response.success) {
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
        );
    }
    
    const handleDecreaseQuantity = (productId, color, currentQuantity) => {
        if (currentQuantity > 1) {
          dispatch(
            updateCart({ pid: productId, color, quantity: currentQuantity - 1 })
          )
          console.log(productId, color, currentQuantity)
        } else {
          // Find the cart item by product ID and color
          const cartItem = currentCart.find(
            item => item.product?._id === productId && item.color === color
          );
          
          if (cartItem) {
            // First remove from Redux store
            dispatch(removeFromCart(cartItem._id));
            // Then remove from backend
            removeCart(productId, color);
          }
        }
      }

    return (
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-[420px] h-screen bg-gradient-to-b from-gray-900 to-gray-800 text-white grid grid-rows-9 p-6 shadow-xl"
      >
        {/* Header */}
        <header className="border-b border-gray-700 flex justify-between items-center row-span-1 h-full">
          <span className="text-xl font-bold bg-gradient-to-r from-indigo-500 to-purple-500 bg-clip-text text-transparent">Giỏ hàng của bạn</span>
          <span
            onClick={() => dispatch(showCart())}
            className="p-2 cursor-pointer hover:text-rose-500 transition-colors duration-300"
          >
            <AiFillCloseCircle size={24} />
          </span>
        </header>

        {/* Danh sách sản phẩm */}
        <section className="row-span-7 flex flex-col gap-4 h-full max-h-full overflow-y-auto py-3 scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-gray-900 pr-2">
          {!currentCart?.length ? (
            <div className="flex flex-col items-center justify-center h-full">

              <span className="text-center text-gray-400 italic">
                Giỏ hàng của bạn đang trống.
              </span>
              <Button
                handleOnClick={() => {
                  dispatch(showCart())
                  navigate('/')
                }}
                style="rounded-lg bg-indigo-600 hover:bg-indigo-700 text-sm px-4 py-2 mt-4 transition duration-300"
              >
                Tiếp tục mua sắm
              </Button>
            </div>
          ) : (
            currentCart.map((el) => (
              <div
                key={el._id}
                className="flex justify-between items-center bg-gray-800/50 backdrop-blur-sm rounded-lg p-3 hover:shadow-lg transition duration-300 border border-gray-700/50"
              >
                {/* Thông tin sản phẩm */}
                <div className="flex gap-3">
                  <img
                    src={el.thumbnail}
                    alt="thumb"
                    className="w-16 h-16 object-cover rounded-md shadow-md"
                  />
                  <div className="flex flex-col justify-between">
                    <span className="text-base font-medium line-clamp-1">{el.title}</span>
                    <div className="flex items-center">
                      <span className="text-xs px-2 py-1 bg-gray-700 rounded-full text-gray-300">{el.color}</span>
                    </div>
                    <div className="flex items-center mt-2 gap-2">
                      {/* Nút giảm */}
                      <button
                        className="w-8 h-8 bg-gray-700 text-white flex items-center justify-center rounded-md hover:bg-gray-600 active:bg-gray-500 transition"
                        onClick={() =>
                          handleDecreaseQuantity(
                            el.product?._id,
                            el.color,
                            el.quantity
                          )
                        }
                      >
                        -
                      </button>

                      {/* Số lượng */}
                      <span className="w-8 text-center text-sm font-medium">{el.quantity}</span>

                      {/* Nút tăng */}
                      <button
                        className="w-8 h-8 bg-gray-700 text-white flex items-center justify-center rounded-md hover:bg-gray-600 active:bg-gray-500 transition"
                        onClick={() =>
                          handleIncreaseQuantity(
                            el.product?._id,
                            el.color,
                            el.quantity
                          )
                        }
                      >
                        +
                      </button>
                    </div>
                    <span className="text-sm mt-2 font-semibold text-green-400">
                      {formatMoney(el.price * el.quantity) + " VND"}
                    </span>
                  </div>
                </div>

                {/* Nút xóa */}
                <span
                  onClick={() => removeCart(el.product?._id, el.color)}
                  className="h-8 w-8 rounded-full flex items-center justify-center text-rose-500 hover:bg-gray-700 hover:text-rose-400 cursor-pointer transition"
                >
                  <ImBin size={16} />
                </span>
              </div>
            ))
          )}
        </section>

        {/* Tóm tắt giỏ hàng */}
        <div className="row-span-2 flex flex-col justify-between h-full mt-4">
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between border-t border-gray-700 pt-4">
              <span className="text-sm text-gray-300">Tạm tính:</span>
              <span className="text-lg font-bold bg-gradient-to-r from-green-400 to-emerald-500 bg-clip-text text-transparent">
                {formatMoney(
                  currentCart?.reduce(
                    (sum, el) => sum + Number(el.price) * el.quantity,
                    0
                  )
                ) + " VND"}
              </span>
            </div>
            <span className="text-center text-gray-400 italic text-xs mt-1">
              Phí vận chuyển, thuế và giảm giá sẽ được tính tại thanh toán.
            </span>
          </div>
          <div className="grid grid-cols-2 gap-3 mt-3">
            <Button
              handleOnClick={() => {
                dispatch(showCart())
              }}
              style="rounded-lg w-full bg-gray-700 py-3 text-sm hover:bg-gray-600 transition duration-300"
            >
              Tiếp tục mua sắm
            </Button>
            <Button
              handleOnClick={() => {
                dispatch(showCart())
                navigate(`/${path.MEMBER}/${path.DETAIL_CART}`)
              }}
              style="rounded-lg w-full bg-gradient-to-r from-indigo-600 to-purple-600 py-3 text-sm hover:from-indigo-700 hover:to-purple-700 transition duration-300"
            >
              Thanh toán
            </Button>
          </div>
        </div>
      </div>
    )
}

export default withBaseComponent(memo(Cart))