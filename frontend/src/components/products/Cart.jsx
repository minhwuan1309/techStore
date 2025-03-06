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
import { updateCart, removeFromCart } from "store/user/userSlice";


const Cart = ({ dispatch, navigate }) => {
    const { currentCart } = useSelector(state => state.user)
    const removeCart = async (pid, color) => {
        const response = await apiRemoveCart(pid, color)
        if (response.success) {
            dispatch(getCurrent())
        }
        else toast.error(response.mes)
    }
    const handleIncreaseQuantity = (productId, color, currentQuantity) => {
        dispatch(
          updateCart({ pid: productId, color, quantity: currentQuantity + 1 })
        );
      };
    
      const handleDecreaseQuantity = (productId, color, currentQuantity) => {
        if (currentQuantity > 1) {
          dispatch(
            updateCart({ pid: productId, color, quantity: currentQuantity - 1 })
          );
        } else {
          dispatch(removeFromCart(productId)); // Xóa sản phẩm nếu số lượng <= 1
        }
      };

    // Fix category page
    // Payment method
    return (
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-[420px] h-screen bg-black text-white grid grid-rows-9 p-6"
      >
        {/* Header */}
        <header className="border-b border-gray-700 flex justify-between items-center row-span-1 h-full font-bold text-lg">
          <span>Giỏ hàng của bạn</span>
          <span
            onClick={() => dispatch(showCart())}
            className="p-2 cursor-pointer hover:text-red-500"
          >
            <AiFillCloseCircle size={24} />
          </span>
        </header>

        {/* Danh sách sản phẩm */}
        <section className="row-span-7 flex flex-col gap-4 h-full max-h-full overflow-y-auto py-3">
          {!currentCart?.length ? (
            <span className="text-center text-gray-500 italic">
              Giỏ hàng của bạn đang trống.
            </span>
          ) : (
            currentCart.map((el) => (
              <div
                key={el._id}
                className="flex justify-between items-center bg-gray-800 rounded-lg p-3 hover:shadow-md"
              >
                {/* Thông tin sản phẩm */}
                <div className="flex gap-3">
                  <img
                    src={el.thumbnail}
                    alt="thumb"
                    className="w-16 h-16 object-cover rounded-md"
                  />
                  <div className="flex flex-col justify-between">
                    <span className="text-base font-medium">{el.title}</span>
                    <span className="text-sm text-gray-400">{el.color}</span>
                    <div className="flex items-center mt-2 gap-2">
                      {/* Nút giảm */}
                      <button
                        className="w-8 h-8 bg-gray-700 text-white flex items-center justify-center rounded-md hover:bg-gray-600 transition"
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
                      <span className="text-sm">{el.quantity}</span>

                      {/* Nút tăng */}
                      <button
                        className="w-8 h-8 bg-gray-700 text-white flex items-center justify-center rounded-md hover:bg-gray-600 transition"
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
                  className="h-8 w-8 rounded-full flex items-center justify-center text-red-500 hover:bg-gray-700 cursor-pointer transition"
                >
                  <ImBin size={16} />
                </span>
              </div>
            ))
          )}
        </section>

        {/* Tóm tắt giỏ hàng */}
        <div className="row-span-2 flex flex-col justify-between h-full mt-4">
          <div className="flex items-center justify-between border-t border-gray-700 pt-4">
            <span className="text-sm">Tạm tính:</span>
            <span className="text-base font-semibold text-green-400">
              {formatMoney(
                currentCart?.reduce(
                  (sum, el) => sum + Number(el.price) * el.quantity,
                  0
                )
              ) + " VND"}
            </span>
          </div>
          <span className="text-center text-gray-500 italic text-xs mt-2">
            Phí vận chuyển, thuế và giảm giá sẽ được tính tại thanh toán.
          </span>
          <Button
            handleOnClick={() => {
              dispatch(showCart());
              navigate(`/${path.MEMBER}/${path.DETAIL_CART}`);
            }}
            style="rounded-lg w-full bg-main py-3 mt-4 hover:bg-red-500 transition"
          >
            Đi tới giỏ hàng
          </Button>
        </div>
      </div>
    );

}

export default withBaseComponent(memo(Cart))