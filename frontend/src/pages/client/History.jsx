import { apiGetUserOrders } from "apis"
import { CustomSelect, InputForm, Pagination } from "components"
import withBaseComponent from "hocs/withBaseComponent"
import moment from "moment"
import React, { useEffect, useState } from "react"
import { useForm } from "react-hook-form"
import { createSearchParams, useSearchParams } from "react-router-dom"
import { statusOrders } from "utils/contants"
import { formatMoney } from "utils/helpers"

const History = ({ navigate, location }) => {
  const [orders, setOrders] = useState(null)
  const [counts, setCounts] = useState(0)
  const [selectedOrder, setSelectedOrder] = useState(null)
  const [params] = useSearchParams()
  const {
    register,
    formState: { errors },
    watch,
  } = useForm()
  const q = watch("q")
  const status = watch("status")

  const fetchPOrders = async (params) => {
    const response = await apiGetUserOrders({
      ...params,
      limit: process.env.REACT_APP_LIMIT,
    })
    if (response.success) {
      setOrders(response.orders)
      setCounts(response.counts)
    }
  }

  useEffect(() => {
    const pr = Object.fromEntries([...params])
    fetchPOrders(pr)
  }, [params])

  const handleSearchStatus = ({ value }) => {
    navigate({
      pathname: location.pathname,
      search: createSearchParams({ status: value }).toString(),
    })
  }

  const closePopup = () => setSelectedOrder(null)

  return (
    <div className="w-full relative px-4">
      <header className="text-3xl font-semibold py-4 border-b-2 border-indigo-600 mb-8 flex items-center">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 mr-3 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
        </svg>
        Lịch sử mua hàng
      </header>
      <div className="flex justify-end items-center px-4 mb-6">
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
      <div className="bg-white shadow-lg rounded-lg overflow-hidden">
        <table className="w-full">
          <thead className="bg-indigo-600 text-white">
            <tr>
              <th className="text-center py-3">Mã đơn hàng</th>
              <th className="text-center py-3">Sản phẩm</th>
              <th className="text-center py-3">Tổng tiền</th>
              <th className="text-center py-3">Trạng thái thanh toán</th>
              <th className="text-center py-3">Thời gian</th>
            </tr>
          </thead>
          <tbody>
            {orders?.map((el, idx) => (
              <tr className="border-b hover:bg-gray-50 transition" key={el._id}>
                <td className="text-center py-4">
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
                <td className="text-center py-4 px-4">
                  <div className="flex flex-col gap-2">
                    {el.products?.reduce(
                      (total, product) => total + product.quantity,
                      0
                    )}{" "}
                    sản phẩm
                  </div>
                  <button
                    className="text-indigo-600 hover:underline mt-2"
                    onClick={() => setSelectedOrder(el)}
                  >
                    Xem chi tiết
                  </button>
                </td>
                <td className="text-center py-4 font-semibold">
                  {el.discount > 0 ? (
                    <>
                      <span className="text-green-600">
                        {formatMoney(el.finalTotal)} VNĐ
                      </span>
                      <br />
                      <span className="text-gray-500 text-sm">
                        Có áp dụng mã giảm giá: {el.discount}%
                      </span>
                    </>
                  ) : (
                    <span className="text-green-600">
                      {formatMoney(el.total)} VNĐ
                    </span>
                  )}
                </td>
                <td className="text-center py-4">
                  <span className={`px-3 py-1 rounded-full text-sm ${
                    el.status === 'Cancelled' 
                      ? 'bg-red-100 text-red-600' 
                      : el.status === 'Succeed' 
                      ? 'bg-green-100 text-green-600' 
                      : 'bg-yellow-100 text-yellow-600'
                  }`}>
                    {el.status === "Cancelled"
                      ? "Đơn hàng bị huỷ"
                      : el.status === "Succeed"
                      ? "Đã thanh toán"
                      : el.status === "Pending"
                      ? "Chưa thanh toán"
                      : el.status}
                  </span>
                </td>
                <td className="text-center py-4">
                  <div className="flex flex-col">
                    <span>{moment(el.createdAt).format("DD/MM/YYYY")}</span>
                    <span className="text-gray-500 text-sm">
                      {moment(el.updatedAt).format("HH:mm:ss")}
                    </span>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="w-full flex justify-end my-8">
        <Pagination totalCount={counts} />
      </div>

      {selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-auto relative">
            <div className="bg-indigo-600 text-white px-6 py-4 flex justify-between items-center rounded-t-lg">
              <h2 className="text-xl font-bold">Chi tiết đơn hàng</h2>
              <button
                className="text-white hover:text-red-200 text-2xl"
                onClick={closePopup}
              >
                ×
              </button>
            </div>
            <div className="p-6">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="border p-3 text-left">Tên sản phẩm</th>
                    <th className="border p-3 text-left">Màu sắc</th>
                    <th className="border p-3 text-center">Số lượng</th>
                    <th className="border p-3 text-right">Giá</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedOrder.products.map((product) => (
                    <tr key={product._id} className="hover:bg-gray-50">
                      <td className="border p-3">{product.title}</td>
                      <td className="border p-3">{product.color}</td>
                      <td className="border p-3 text-center">{product.quantity}</td>
                      <td className="border p-3 text-right">
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
  )
}

export default withBaseComponent(History)