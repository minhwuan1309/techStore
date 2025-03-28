import {
  apiCreateCoupon,
  apiDeleteCoupon,
  apiGetCoupons,
  apiUpdateCoupon,
} from "apis"
import clsx from "clsx"
import { Button, InputField, InputForm } from "components"
import moment from "moment"
import React, { useEffect, useState } from "react"
import { act } from "react"
import { useForm } from "react-hook-form"
import { useSearchParams } from "react-router-dom"
import { toast } from "react-toastify"
import { useDebounce } from "react-use"
import Swal from "sweetalert2"
import { useOutletContext } from "react-router-dom"

const ManageCoupon = () => {
  const { darkMode } = useOutletContext()
  const {
    handleSubmit,
    register,
    reset,
    formState: { errors },
  } = useForm()
  const [coupons, setCoupons] = useState([])
  const [editCoupon, setEditCoupon] = useState(null)
  const [queries, setQueries] = useState({ q: "" })
  const [params] = useSearchParams()

  const fetchCoupons = async () => {
    const res = await apiGetCoupons()
    if (res.success) {
      const now = new Date()
      const activeCoupons = res.coupons.filter(
        (coupon) => new Date(coupon.expiry) >= now
      )
      const expiredCoupons = res.coupons.filter(
        (coupon) => new Date(coupon.expiry) < now
      )

      //Sort
      activeCoupons.sort((a, b) => a.name.localeCompare(b.name))
      expiredCoupons.sort((a, b) => a.name.localeCompare(b.name))
      setCoupons([...activeCoupons, ...expiredCoupons])
    }
  }
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchCoupons()
    }, 800)
    return () => clearTimeout(timer)
  }, [queries.q, params])

  useEffect(() => {
    if (editCoupon) {
      reset({
        name: editCoupon.name,
        discount: editCoupon.discount,
        expiry: Math.ceil(
          (new Date(editCoupon.expiry).getTime() - new Date().getTime()) /
            (1000 * 60 * 60 * 24)
        ),
      })
    } else {
      reset({
        name: "",
        discount: "",
        expiry: "",
      })
    }
  }, [editCoupon, reset])

  const handleCreateOrUpdate = async (data) => {
    if (editCoupon) {
      const res = await apiUpdateCoupon(editCoupon._id, data)
      if (res.success) toast.success("Cập nhật mã giảm giá thành công!")
      else toast.error("Cập nhật thất bại!")
    } else {
      const res = await apiCreateCoupon(data)
      if (res.success) toast.success("Tạo mã giảm giá thành công!")
      else toast.error("Tạo mã giảm giá thất bại!")
    }
    setEditCoupon(null)
    reset()
    fetchCoupons()
  }

  const handleDeleteCoupon = async (cid) => {
    Swal.fire({
      title: "Xoá mã giảm giá?",
      showCancelButton: true,
    }).then(async (rs) => {
      if (rs.isConfirmed) {
        const res = await apiDeleteCoupon(cid)
        if (res.success) toast.success("Xoá má giảm giá thần cong!")
        else toast.error("Xoá má giảm giá thất bại!")
        fetchCoupons()
      }
    })
  }

  return (
    <div
      className={`
            w-full rounded-2xl backdrop-blur-xl shadow-2xl 
            ${
              darkMode
                ? "bg-gray-800/60 border-gray-700/50 text-gray-200"
                : "bg-white/60 border-gray-200/50 text-gray-900"
            }
            border p-4
        `}
    >
      <h1 className="flex justify-between items-center text-3xl font-bold mb-6 pb-4 border-b-2 border-transparent">
        <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-500 to-pink-500">
          Quản lý mã khuyến mãi
        </span>
      </h1>
      <div className="p-4">
        <div className="flex justify-end py-2">
          <InputField
            nameKey={"q"}
            value={queries.q}
            setValue={setQueries}
            placeholder="Tìm kiếm tài khoản..."
            className="h-11 bg-white/50 backdrop-blur-sm border border-purple-200 rounded-xl"
            isHideLabel
          />
        </div>
        <form onSubmit={handleSubmit(handleCreateOrUpdate)}>
          <div className="flex gap-4 mb-4">
            <InputForm
              label="Tên mã"
              id="name"
              register={register}
              validate={{ required: "Bắt buộc" }}
              errors={errors}
              className={`
                                ${
                                  darkMode
                                    ? "bg-gray-700/50 text-gray-200 border-gray-600/50"
                                    : "bg-white/50 border-gray-200/50"
                                }
                            `}
            />
            <InputForm
              label="Giảm giá (%)"
              type="number"
              id="discount"
              register={register}
              validate={{ required: "Bắt buộc" }}
              errors={errors}
              className={`
                                ${
                                  darkMode
                                    ? "bg-gray-700/50 text-gray-200 border-gray-600/50"
                                    : "bg-white/50 border-gray-200/50"
                                }
                            `}
            />
            <InputForm
              label="Hạn sử dụng (ngày)"
              type="number"
              id="expiry"
              register={register}
              validate={{ required: "Bắt buộc" }}
              errors={errors}
              className={`
                                ${
                                  darkMode
                                    ? "bg-gray-700/50 text-gray-200 border-gray-600/50"
                                    : "bg-white/50 border-gray-200/50"
                                }
                            `}
            />
            <Button
              type="submit"
              className={`
                                ${
                                  darkMode
                                    ? "bg-blue-900/50 text-blue-200 border-blue-700/50"
                                    : "bg-blue-500/20 text-blue-700 border-blue-500/50"
                                }
                                rounded-xl
                            `}
            >
              {editCoupon ? "Cập nhật" : "Tạo mới"}
            </Button>
          </div>
        </form>
        <table className="table-auto w-full text-left">
          <thead
            className={`
                        ${
                          darkMode
                            ? "bg-gray-700 text-gray-200"
                            : "bg-gray-100 text-gray-800"
                        }
                    `}
          >
            <tr>
              <th className="px-4 py-2">#</th>
              <th className="px-4 py-2">Tên mã</th>
              <th className="px-4 py-2">Giảm giá (%)</th>
              <th className="px-4 py-2">Hạn sử dụng</th>
              <th className="px-4 py-2">Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {coupons.map((coupon, index) => {
              const isExpired = new Date(coupon.expiry) < new Date()
              return (
                <tr
                  key={coupon._id}
                  className={`
                                        border-b 
                                        ${
                                          darkMode
                                            ? "border-gray-700/50 hover:bg-gray-700/30"
                                            : "border-gray-200/50 hover:bg-gray-100/50"
                                        }
                                    `}
                >
                  <td className="px-4 py-2">{index + 1}</td>
                  <td
                    className={clsx(
                      "px-4 py-2",
                      isExpired && "line-through text-gray-400"
                    )}
                  >
                    {coupon.name}
                  </td>
                  <td
                    className={clsx(
                      "px-4 py-2",
                      isExpired && "line-through text-gray-400"
                    )}
                  >
                    {coupon.discount}%
                  </td>
                  <td
                    className={clsx(
                      "px-4 py-2",
                      isExpired && "line-through text-gray-400"
                    )}
                  >
                    {moment(coupon.expiry).format("DD/MM/YYYY")}
                  </td>
                  <td className="px-4 py-2">
                    {!isExpired && (
                      <>
                        <span
                          className={`
                                                        cursor-pointer mr-3 
                                                        ${
                                                          darkMode
                                                            ? "text-blue-400 hover:text-blue-300"
                                                            : "text-blue-600 hover:text-blue-500"
                                                        }
                                                    `}
                          onClick={() => setEditCoupon(coupon)}
                        >
                          Sửa
                        </span>
                        <span
                          className={`
                                                        cursor-pointer 
                                                        ${
                                                          darkMode
                                                            ? "text-red-400 hover:text-red-300"
                                                            : "text-red-600 hover:text-red-500"
                                                        }
                                                    `}
                          onClick={() => handleDeleteCoupon(coupon._id)}
                        >
                          Xóa
                        </span>
                      </>
                    )}
                    {isExpired && (
                      <span
                        className={`
                                                    cursor-pointer 
                                                    ${
                                                      darkMode
                                                        ? "text-red-400 hover:text-red-300"
                                                        : "text-red-600 hover:text-red-500"
                                                    }
                                                `}
                        onClick={() => handleDeleteCoupon(coupon._id)}
                      >
                        Xóa
                      </span>
                    )}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default ManageCoupon
