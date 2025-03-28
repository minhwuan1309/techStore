import { apiDeleteBlog, apiGetBlogs } from "apis/blog"
import { InputForm, Pagination } from "components"
import withBaseComponent from "hocs/withBaseComponent"
import useDebounce from "hooks/useDebounce"
import moment from "moment"
import React, { useEffect, useState } from "react"
import { useForm } from "react-hook-form"
import { BiEdit } from "react-icons/bi"
import { RiDeleteBin6Line } from "react-icons/ri"
import { useLocation, useNavigate, useSearchParams } from "react-router-dom"
import { showModal } from "store/app/appSlice"
import UpdateBlog from "./UpdateBlog"
import { toast } from "react-toastify"
import { useSelector } from "react-redux"
import Swal from "sweetalert2"

const ManageBlog = ({ dispatch }) => {
  const [params] = useSearchParams()
  const [update, setUpdate] = useState(false)
  const [counts, setCounts] = useState(0)
  const [blogs, setBlogs] = useState()
  const { isShowModal } = useSelector((s) => s.app)
  const {
    register,
    formState: { errors },
    watch,
  } = useForm()
  const fetchBlogs = async (param) => {
    const response = await apiGetBlogs({
      ...param,
      limit: process.env.REACT_APP_LIMIT,
    })
    if (response.success) {
      setCounts(response.counts)
      setBlogs(response.blogs)
    }
  }

  const queryDebounce = useDebounce(watch("q"), 800)
  useEffect(() => {
    const searchParams = Object.fromEntries([...params])
    if (queryDebounce) searchParams.q = queryDebounce
    if (!isShowModal) fetchBlogs(searchParams)
  }, [params, update, queryDebounce, isShowModal])
  const handleDeleteBolg = async (id) => {
    Swal.fire({
      icon: "warning",
      title: "Xác nhận thao tác",
      text: "Bạn có chắc muốn xóa bài viết này?",
      showCancelButton: true,
      showConfirmButton: true,
      confirmButtonText: "Xóa",
      cancelButtonText: "Quay lại",
    }).then(async (rs) => {
      if (rs.isConfirmed) {
        const response = await apiDeleteBlog(id)
        if (response.success) {
          setUpdate(!update)
          toast.success(response.mes)
        } else toast.error(response.mes)
      }
    })
  }
  return (
    <div className="w-full bg-white/30 backdrop-blur-xl rounded-2xl p-6 shadow-2xl min-h-screen">
      <h1 className="flex justify-between items-center text-3xl font-bold mb-6 pb-4 border-b-2 border-transparent">
        <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-500 to-pink-500">
          Quản lý bài viết
        </span>
      </h1>
      <div className="flex justify-end items-center px-4 mb-6">
        <form className="w-[45%]">
          <InputForm
            id="q"
            register={register}
            errors={errors}
            fullWidth
            placeholder="Tìm kiếm blogs theo tiêu đề, mô tả,..."
            className="bg-white/50 backdrop-blur-sm border border-purple-200 rounded-xl"
          />
        </form>
      </div>
      <div className="px-4 w-full">
        <table className="table-auto w-full border-collapse border border-purple-200 text-gray-700 bg-white/70 rounded-xl shadow-md">
          <thead>
            <tr className="font-bold bg-gradient-to-r from-purple-500 to-pink-500 text-white text-sm">
              <th className="text-center py-3 px-2">STT</th>
              <th className="text-center py-3 px-2">Tiêu đề</th>
              <th className="text-center py-3 px-2">Hashtags</th>
              <th className="text-center py-3 px-2">Lượt xem</th>
              <th className="text-center py-3 px-2">Đã thích</th>
              <th className="text-center py-3 px-2">Không thích</th>
              <th className="text-center py-3 px-2">Ngày tạo</th>
              <th className="text-center py-3 px-2">Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {blogs?.length > 0 ? (
              blogs.map((el, idx) => (
                <tr
                  className="border-b hover:bg-purple-50 transition duration-150"
                  key={el._id}
                >
                  <td className="text-center py-3 px-2">
                    {(+params.get("page") > 1 ? +params.get("page") - 1 : 0) *
                      process.env.REACT_APP_LIMIT +
                      idx +
                      1}
                  </td>
                  <td className="text-center py-3 px-2">{el.title}</td>
                  <td className="text-center py-3 px-2">{el.hashtags}</td>
                  <td className="text-center py-3 px-2">{el.numberViews}</td>
                  <td className="text-center py-3 px-2">{el.likes?.length}</td>
                  <td className="text-center py-3 px-2">
                    {el.dislikes?.length}
                  </td>
                  <td className="text-center py-3 px-2">
                    {moment(el.createdAt).format("DD/MM/YYYY")}
                  </td>
                  <td className="text-center py-3 px-2 flex justify-center gap-4">
                    <span
                      onClick={() =>
                        dispatch(
                          showModal({
                            isShowModal: true,
                            modalChildren: <UpdateBlog {...el} />,
                          })
                        )
                      }
                      className="text-purple-500 hover:text-purple-700 cursor-pointer"
                      title="Chỉnh sửa"
                    >
                      <BiEdit size={20} />
                    </span>
                    <span
                      onClick={() => handleDeleteBolg(el.id)}
                      className="text-red-500 hover:text-red-700 cursor-pointer"
                      title="Xóa"
                    >
                      <RiDeleteBin6Line size={20} />
                    </span>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="8" className="text-center py-6 text-gray-500">
                  Không tìm thấy blogs.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="w-full px-4 flex justify-end my-8">
        <Pagination totalCount={counts} />
      </div>
    </div>
  );
}

export default withBaseComponent(ManageBlog)