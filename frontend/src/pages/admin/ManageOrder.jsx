import {
  apiDeleteOrderByAdmin,
  apiGetOrders,
  apiUpdateStatus,
} from "apis"
import { Button, InputForm, Pagination } from "components"
import useDebounce from "hooks/useDebounce"
import moment from "moment"
import React, { useCallback, useEffect, useState } from "react"
import { useForm } from "react-hook-form"
import { BiCustomize, BiEdit } from "react-icons/bi"
import { RiCloseFill, RiDeleteBin6Line } from "react-icons/ri"
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
    <div className="w-full flex flex-col gap-4 bg-gray-50 relative">
      <div className="h-[69px] w-full"></div>
      <div className="p-4 border-b w-full bg-gray-50 flex items-center fixed top-0">
        <h1 className="text-3xl font-bold tracking-tight">Quản lý đơn hàng</h1>
        {editOrder && (
          <>
            <Button
              handleOnClick={handleUpdate}
              style="bg-blue-500 text-white px-4 py-2 rounded-md mx-6"
            >
              Cập nhật
            </Button>
            <Button handleOnClick={() => setEditOrder(null)}>Quay lại</Button>
          </>
        )}
      </div>
      <div className="px-4 mt-6 w-full">
        <input
          type="text"
          placeholder="Tìm kiếm theo tên khách hàng"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-[50%] mb-4 border border-gray-500 rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none py-2 px-4 shadow-sm text-sm"
        />
        <table className="table-auto w-full px-4">
          <thead>
            <tr className="font-bold bg-gray-700 text-[13px] text-white">
              <th className="text-center py-2">Mã đơn hàng</th>
              <th className="text-center py-2">Khách hàng</th>
              <th className="text-center py-2">Số lượng sản phẩm</th>
              <th className="text-center py-2">Tổng tiền</th>
              <th className="text-center py-2">Phương thức thanh toán</th>
              <th className="text-center py-2">Trạng thái thanh toán</th>
              <th className="text-center py-2">Ngày mua hàng</th>
              <th className="text-center py-2">Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {filteredOrders?.map((el, idx) => (
              <tr
                className="border border-gray-500 hover:bg-gray-50 transition duration-150"
                key={el._id}
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
