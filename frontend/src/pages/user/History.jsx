import { apiGetUserOrders } from "apis";
import { CustomSelect, InputForm, Pagination } from "components";
import withBaseComponent from "hocs/withBaseComponent";
import moment from "moment";
import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { createSearchParams, useSearchParams } from "react-router-dom";
import { statusOrders } from "utils/contants";
import { formatMoney } from "utils/helpers";

const History = ({ navigate, location }) => {
  const [orders, setOrders] = useState(null);
  const [counts, setCounts] = useState(0);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [params] = useSearchParams();
  const {
    register,
    formState: { errors },
    watch,
  } = useForm();
  const q = watch("q");
  const status = watch("status");

  const fetchPOrders = async (params) => {
    const response = await apiGetUserOrders({
      ...params,
      limit: process.env.REACT_APP_LIMIT,
    });
    if (response.success) {
      setOrders(response.orders);
      setCounts(response.counts);
    }
  };

  useEffect(() => {
    const pr = Object.fromEntries([...params]);
    fetchPOrders(pr);
  }, [params]);

  const handleSearchStatus = ({ value }) => {
    navigate({
      pathname: location.pathname,
      search: createSearchParams({ status: value }).toString(),
    });
  };

  const closePopup = () => setSelectedOrder(null);

  return (
    <div className="w-full relative px-4">
      <header className="text-3xl font-semibold py-4 border-b border-b-blue-200">
        Lịch sử mua hàng
      </header>
      <div className="flex justify-end items-center px-4">
        <form className="w-[45%] grid grid-cols-2 gap-4">
          <div className="col-span-1">
            <InputForm
              id="q"
              register={register}
              errors={errors}
              fullWidth
              placeholder="Tìm kiếm đơn hàng..."
            />
          </div>
          <div className="col-span-1 flex items-center">
            <CustomSelect
              options={statusOrders}
              value={status}
              onChange={(val) => handleSearchStatus(val)}
              wrapClassname="w-full"
            />
          </div>
        </form>
      </div>
      <table className="table-auto w-full">
        <thead>
          <tr className="border bg-sky-900 text-white border-white">
            <th className="text-center py-2">Mã đơn hàng</th>
            <th className="text-center py-2">Sản phẩm</th>
            <th className="text-center py-2">Tổng tiền</th>
            <th className="text-center py-2">Trạng thái thanh toán</th>
            <th className="text-center py-2">Thời gian</th>
          </tr>
        </thead>
        <tbody>
          {orders?.map((el, idx) => (
            <tr className="border-b" key={el._id}>
              <td className="text-center py-2">
                <div>
                  <span className="block font-semibold">
                    {(+params.get("page") > 1 ? +params.get("page") - 1 : 0) *
                      process.env.REACT_APP_LIMIT +
                      idx +
                      1}
                  </span>
                  <span className="block text-gray-500 text-sm">
                    #{el._id.slice(-10).toUpperCase()}
                  </span>
                </div>
              </td>
              <td className="text-center py-2 px-4">
                <div className="flex flex-col gap-2">
                  {el.products?.reduce(
                    (total, product) => total + product.quantity,
                    0
                  )}{" "}
                  sản phẩm
                </div>
                <button
                  className="underline hover:text-main hover:cursor-pointer mt-2"
                  onClick={() => setSelectedOrder(el)}
                >
                  Xem chi tiết
                </button>
              </td>
              <td className="text-center py-2 font-semibold">
                {el.discount > 0 ? (
                  <>
                    <span className="text-green-500">
                      {formatMoney(el.finalTotal * 25000)} VNĐ
                    </span>
                    <br />
                    <span className="text-gray-500 text-sm">
                      Có áp dụng mã giảm giá: {el.discount}%
                    </span>
                  </>
                ) : (
                  <span className="text-green-500">
                    {formatMoney(el.total * 25000)} VNĐ
                  </span>
                )}
              </td>
              <td className="text-center py-2">
                {el.status === "Cancelled"
                  ? "Đơn hàng bị huỷ"
                  : el.status === "Succeed"
                  ? "Đã thanh toán"
                  : el.status === "Pending"
                  ? "Chưa thanh toán"
                  : el.status}
              </td>
              <td className="flex flex-col items-center text-center py-11">
                <span>{moment(el.createdAt).format("DD/MM/YYYY")}</span>
                <span>{moment(el.updatedAt).format("HH:mm:ss")}</span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="w-full flex justify-end my-8">
        <Pagination totalCount={counts} />
      </div>

      {selectedOrder && (
        <div className="fixed inset-0 bg-gray-900 bg-opacity-80 flex items-center justify-center z-50">
          <div className="bg-gray-100 rounded-lg border border-gray-400 shadow-md max-w-5xl w-full max-h-[90vh] overflow-auto p-6 relative">
            <button
              className="absolute top-4 right-4 text-gray-700 text-2xl font-bold hover:text-red-500"
              onClick={closePopup}
            >
              ×
            </button>
            <h2 className="text-xl font-bold mb-4">Chi tiết đơn hàng</h2>
            <div className="mt-6">
              <table className="w-full border-collapse border border-gray-300">
                <thead>
                  <tr className="bg-gray-300">
                    <th className="border py-2 px-4">Tên sản phẩm</th>
                    <th className="border py-2 px-4">Màu sắc</th>
                    <th className="border py-2 px-4">Số lượng</th>
                    <th className="border py-2 px-4">Giá</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedOrder.products.map((product) => (
                    <tr key={product._id}>
                      <td className="border border-gray-300 py-2 px-4">
                        {product.title}
                      </td>
                      <td className="border border-gray-300 py-2 px-4">
                        {product.color}
                      </td>
                      <td className="border border-gray-300 py-2 px-4">
                        {product.quantity}
                      </td>
                      <td className="border border-gray-300 py-2 px-4 text-right">
                        {formatMoney(product.price * product.quantity)} VNĐ
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default withBaseComponent(History);
