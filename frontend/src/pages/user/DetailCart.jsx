import { Breadcrumb, Button } from "components";
import OrderItem from "components/products/OrderItem";
import withBaseComponent from "hocs/withBaseComponent";
import { useSelector, useDispatch } from "react-redux";
import { Link, createSearchParams } from "react-router-dom";
import Swal from "sweetalert2";
import { formatMoney } from "utils/helpers";
import path from "utils/path";
import { updateCart, removeFromCart } from "store/user/userSlice";
import { useState, useCallback } from "react";
import { apiRemoveCart } from "apis";
import { getCurrent } from "store/user/asyncActions";

const DetailCart = ({ location, navigate }) => {
  const dispatch = useDispatch();
  const { currentCart, current } = useSelector((state) => state.user);
  const [selectedProducts, setSelectedProducts] = useState([]);

  const handleSubmit = () => {
    if (!selectedProducts.length) {
      return Swal.fire({
        icon: "info",
        title: "Chưa chọn sản phẩm",
        text: "Vui lòng chọn ít nhất một sản phẩm để thanh toán.",
        confirmButtonText: "Đã hiểu",
      });
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
          });
        }
      });
    }
    localStorage.setItem("selectedProducts", JSON.stringify(selectedProducts));
    navigate({
      pathname: `/${path.CHECKOUT}`,
    });
  };

  const removeCart = async (pid, color) => {
          const response = await apiRemoveCart(pid, color)
          if (response.success) {
              dispatch(getCurrent())
          }
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
  const toggleProductSelection = (product) => {
    if (selectedProducts.find((p) => p._id === product._id)) {
      setSelectedProducts(
        selectedProducts.filter((p) => p._id !== product._id)
      );
    } else {
      setSelectedProducts([...selectedProducts, product]);
    }
  };

  return (
    <div className="w-full">
      {/* Tiêu đề của trang */}
      <div className="h-[81px] flex justify-center items-center bg-gray-100">
        <div className="w-main">
          <h3 className="font-semibold text-2xl uppercase">Giỏ Hàng</h3>
        </div>
      </div>

      {/* Thông tin giỏ hàng */}
      <div className="flex flex-col border w-main mx-auto my-8 rounded-lg shadow-lg">
        <div className="w-main mx-auto bg-gray-200 font-bold py-3 grid grid-cols-10 gap-2 rounded-t-lg">
          <span className="col-span-6 w-full text-center">Sản phẩm</span>
          <span className="col-span-2 w-full text-center">Số lượng</span>
          <span className="col-span-2 w-full text-center">Giá Tiền</span>
        </div>
        {currentCart?.map((el) => (
          <div
            key={el._id}
            className="flex items-center border-b p-4 bg-white rounded-lg shadow-sm my-2"
          >
            <input
              type="checkbox"
              className="form-checkbox w-5 h-5 text-blue-600 "
              checked={!!selectedProducts.find((p) => p._id === el._id)}
              onChange={() => toggleProductSelection(el)}
            />
            {/* Hình ảnh sản phẩm */}
            <img
              src={el.thumbnail}
              alt={el.title}
              className="w-20 h-20 object-cover rounded-md mr-4"
            />

            {/* Thông tin sản phẩm */}
            <div className="flex-1">
              <h3 className="text-xl font-semibold text-gray-800">
                {el.title}
              </h3>
              <p className="text-gray-500">{el.color}</p>
            </div>

            {/* Số lượng và nút tăng/giảm */}
            <div className="flex items-center justify-between w-[28.8%]">
              <div className="flex items-center">
                {/* Nút giảm */}
                <button
                  className="w-7 h-7 bg-gray-300 flex items-center justify-center rounded-md hover:bg-blue-400 transition"
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
                <span className="mx-4 text-gray-700 text-xl">{el.quantity}</span>

                {/* Nút tăng */}
                <button
                  className="w-7 h-7 bg-gray-300 flex items-center justify-center rounded-md hover:bg-blue-400 transition"
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

              {/* Giá tiền */}
              <span className="text-lg font-bold text-main">
                {formatMoney(el.price * el.quantity)} VNĐ
              </span>
            </div>
            <Button
              className="m-2 text-red-500 hover:text-red-700 transition"
              onClick={() => removeCart(el.product?._id, el.color)}
            >
              Xóa
            </Button>
          </div>
        ))}
      </div>

      <div className="w-main mx-auto flex flex-col mb-12 justify-center items-end gap-3">
        <span className="flex items-center gap-8 text-lg font-bold text-gray-700">
          <span>Tạm tính:</span>
          <span className="text-lg font-bold text-main ">
            {`${formatMoney(
              selectedProducts?.reduce(
                (sum, el) => +el?.price * el.quantity + sum,
                0
              )
            )} VND`}
          </span>
        </span>
        <Button handleOnClick={handleSubmit}>Mua Hàng</Button>
      </div>
    </div>
  );
};

export default withBaseComponent(DetailCart);
