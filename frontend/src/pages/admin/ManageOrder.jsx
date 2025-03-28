
import {
  apiDeleteOrderByAdmin,
  apiGetOrders,
  apiUpdateStatus,
} from "apis"
import clsx from "clsx"
import { Button, InputForm, Pagination } from "components"
import useDebounce from "hooks/useDebounce"
import moment from "moment"
import React, { useCallback, useEffect, useState } from "react"
import { useForm } from "react-hook-form"
import { BiCustomize, BiEdit } from "react-icons/bi"
import { RiCloseFill, RiDeleteBin6Line, RiSearchLine } from "react-icons/ri"
import {
  createSearchParams,
  useLocation,
  useNavigate,
  useSearchParams,
} from "react-router-dom"

import { toast } from "react-toastify"
import Swal from "sweetalert2"
import { formatMoney } from "utils/helpers"

const ManageOrder = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const [params] = useSearchParams()
  const {
    register,
    formState: { errors },
    watch,
    setValue,
  } = useForm()
  const [orders, setOrders] = useState()
  const [counts, setCounts] = useState(0)
  const [update, setUpdate] = useState(false)
  const [editOrder, setEditOrder] = useState()
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedOrder, setSelectedOrder] = useState(null)
  const [selectedCustomer, setSelectedCustomer] = useState(null)

  const fetchOrders = async (params) => {
    const response = await apiGetOrders({
      ...params,
      limit: process.env.REACT_APP_LIMIT,
    })
    if (response.success) {
      setCounts(response.counts)
      setOrders(response.orders)
    }
  }

  const render = useCallback(() => {
    setUpdate(!update)
  })

  const queryDecounce = useDebounce(watch("q"), 800)
  useEffect(() => {
    if (queryDecounce) {
      navigate({
        pathname: location.pathname,
        search: createSearchParams({ q: queryDecounce }).toString(),
      })
    } else
      navigate({
        pathname: location.pathname,
      })
  }, [queryDecounce])

  useEffect(() => {
    const searchParams = Object.fromEntries([...params])
    fetchOrders(searchParams)
  }, [params, update])

  const handleDeleteProduct = (id) => {
    Swal.fire({
      title: "Bạn có chắc không?",
      text: "Bạn có muốn xoá đơn hàng này không?",
      icon: "warning",
      showCancelButton: true,
    }).then(async (rs) => {
      if (rs.isConfirmed) {
        const response = await apiDeleteOrderByAdmin(id)
        if (response.success) toast.success(response.mes)
        else toast.error(response.mes)
        render()
      }
    })
  }

  const handleUpdate = async () => {
    const response = await apiUpdateStatus(editOrder._id, {
      status: watch("status"),
    })
    if (response.success) {
      toast.success(response.mes)
      setUpdate(!update)
      setEditOrder(null)
    } else toast.error(response.mes)
  }

  const filteredOrders = orders?.filter((el) =>
    `${el.orderBy?.firstname} ${el.orderBy?.lastname}`
      .toLowerCase()
      .includes(searchTerm.toLowerCase())
  )
  const closePopup = () => setSelectedOrder(null)
  
  const closeCustomerPopup = () => setSelectedCustomer(null)

  return (
    <div className={clsx("w-full bg-white/10 backdrop-blur-xl rounded-3xl p-8 shadow-2xl transition-all duration-300", editOrder && "pl-20")}>
      <div className="flex justify-between items-center mb-6 pb-4 border-b-2 border-gray-200/20">
        <h1 className="text-4xl font-extrabold">
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600">
            Quản lý đơn hàng
          </span>
        </h1>
        {editOrder && (
          <div className="flex space-x-4">
            <Button
              handleOnClick={handleUpdate}
              style="bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl hover:opacity-90 px-6 py-2 shadow-lg transition-all duration-300 hover:scale-105"
            >
              Cập nhật
            </Button>
            <Button 
              handleOnClick={() => setEditOrder(null)}
              style="bg-gray-200 text-gray-800 rounded-xl hover:bg-gray-300 px-6 py-2 shadow-md transition-all duration-300 hover:scale-105"
            >
              Quay lại
            </Button>
          </div>
        )}
      </div>

      <div className="relative mb-6">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <RiSearchLine className="text-gray-400" />
        </div>
        <input
          type="text"
          placeholder="Tìm kiếm theo tên khách hàng"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:outline-none text-sm transition-all duration-300 shadow-sm hover:border-purple-300"
        />
      </div>

      <div className="overflow-x-auto rounded-xl shadow-md">
        <table className="w-full">
          <thead className="bg-gradient-to-r from-purple-600 to-pink-600 text-white">
            <tr>
              {['Mã đơn hàng', 'Khách hàng', 'Số lượng sản phẩm', 'Tổng tiền', 'Phương thức thanh toán', 'Trạng thái thanh toán', 'Ngày mua hàng', 'Thao tác'].map((header) => (
                <th key={header} className="text-center py-4 px-2 text-sm font-semibold">{header}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filteredOrders?.map((el, idx) => (
              <tr
                key={el._id}
                className="border-b border-gray-200 hover:bg-purple-50/50 transition duration-150"
              >
                <td className="text-center py-2 px-2">
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
                <td className="text-center py-2 px-2">
                  <div className="flex flex-col ">
                    <span className="font-medium">
                      {el.orderBy?.firstname + " " + el.orderBy?.lastname}
                    </span>

                    <button
                      onClick={() => setSelectedCustomer(el.orderBy)}
                      className="underline hover:text-main hover:cursor-pointer mt-2"
                    >
                      Xem thông tin khách hàng
                    </button>
                  </div>
                </td>
                <td className="text-center py-2 px-2">
                  <div className="flex flex-col gap-2">
                    {el.products?.reduce(
                      (total, product) => total + product.quantity,
                      0
                    )}
                    {" sản phẩm"}
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
                        {formatMoney(el.finalTotal)} VNĐ
                      </span>
                      <br />
                      <span className="text-gray-500 text-sm">
                        Có áp dụng mã giảm giá: {el.discount}%
                      </span>
                    </>
                  ) : (
                    <span className="text-green-500">
                      {formatMoney(el.total)} VNĐ
                    </span>
                  )}
                </td>

                <td className="py-3 px-1 text-center">{el.paymentMethod}</td>
                <td className="text-center py-2">
                  {editOrder?._id === el._id ? (
                    <select {...register("status")} className="form-select">
                      <option value="Cancelled">Đơn hàng bị huỷ</option>
                      <option value="Succeed">Đã thanh toán</option>
                      <option value="Pending">Chưa thanh toán</option>
                    </select>
                  ) : el.status === "Cancelled" ? (
                    "Đơn hàng bị huỷ"
                  ) : el.status === "Succeed" ? (
                    "Đã thanh toán"
                  ) : el.status === "Pending" ? (
                    "Chưa thanh toán"
                  ) : (
                    el.status
                  )}
                </td>
                <td className="flex flex-col items-center text-center py-11">
                  <span>{moment(el.createdAt).format("DD/MM/YYYY")}</span>
                  <span>{moment(el.updatedAt).format("HH:mm:ss")}</span>
                </td>
                <td className="text-center py-2">
                  <span
                    onClick={() => {
                      setEditOrder(el);
                      setValue("status", el.status);
                    }}
                    className="text-blue-500 hover:text-orange-500 inline-block hover:underline cursor-pointer px-1"
                  >
                    <BiEdit size={20} />
                  </span>
                  <span
                    onClick={() => handleDeleteProduct(el._id)}
                    className="text-blue-500 hover:text-orange-500 inline-block hover:underline cursor-pointer px-1"
                  >
                    <RiDeleteBin6Line size={20} />
                  </span>
                </td>
              </tr>
            ))}

            {/* Popup Thông Tin Khách Hàng */}
            {selectedCustomer && (
              <div className="fixed inset-0 bg-opacity-80 flex items-center justify-center z-50">
                <div className="bg-gray-100 rounded-lg border border-gray-400 shadow-md max-w-3xl w-full max-h-[90vh] overflow-auto p-6 relative">
                  <button
                    onClick={() => setSelectedCustomer(null)}
                    className="absolute top-4 right-4 text-2xl text-gray-500 hover:text-red-500"
                  >
                    ×
                  </button>
                  <h2 className="text-xl font-bold mb-4">
                    Thông tin khách hàng
                  </h2>
                  <p>
                    <strong>Họ tên:</strong> {selectedCustomer.firstname}{" "}
                    {selectedCustomer.lastname}
                  </p>
                  <p>
                    <strong>Email:</strong> {selectedCustomer.email}
                  </p>
                  <p>
                    <strong>Số điện thoại:</strong> {selectedCustomer.mobile}
                  </p>
                  <p>
                    <strong>Địa chỉ giao hàng:</strong>{" "}
                    {selectedCustomer.address}
                  </p>
                </div>
              </div>
            )}

            {/* Popup Chi Tiết Đơn Hàng */}
            {selectedOrder && (
              <div className="fixed inset-0 bg-opacity-80 flex items-center justify-center z-50">
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
                              {formatMoney(product.price * product.quantity)}
                              {" VNĐ"}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}
          </tbody>
        </table>
      </div>
      <div className="w-full flex px-4 justify-end my-8">
        <Pagination totalCount={counts} />
      </div>
    </div>
  );
}

export default ManageOrder
