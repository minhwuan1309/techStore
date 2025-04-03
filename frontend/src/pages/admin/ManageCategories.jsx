import React, { useState, useEffect, useCallback } from "react"
import { apiGetCategories, apiDeleteCategory } from "apis"
import { Pagination } from "components"
import { BiEdit } from "react-icons/bi"
import { RiDeleteBin6Line } from "react-icons/ri"
import { useSelector } from "react-redux"
import { useSearchParams } from "react-router-dom"
import { toast } from "react-toastify"
import Swal from "sweetalert2"
import moment from "moment"
import useDebounce from "hooks/useDebounce"
import UpdateCategory from "./UpdateCategory"
import clsx from 'clsx'

const ManageCategory = () => {
  const [params] = useSearchParams()
  const [categories, setCategories] = useState([])
  const [counts, setCounts] = useState(0)
  const { isShowModal } = useSelector((s) => s.app)
  const [update, setUpdate] = useState(false)
  const [editCategory, setEditCategory] = useState(null)
  const [sortColumn, setSortColumn] = useState(null)
  const [sortOrder, setSortOrder] = useState("asc")

  const render = useCallback(() => {
    refreshCategories()
  }, [])

  const [searchTerm, setSearchTerm] = useState("")
  const queryDebounce = useDebounce(searchTerm, 800)

  const fetchCategories = async (param) => {
    const response = await apiGetCategories({
      ...param,
      limit: process.env.REACT_APP_LIMIT,
    })
    if (response.success) {
      setCounts(response.counts)
      setCategories(response.prodCategories)
    }
  }

  useEffect(() => {
    const searchParams = Object.fromEntries([...params])
    if (queryDebounce) searchParams.q = queryDebounce
    if (!isShowModal) fetchCategories(searchParams)
  }, [params, queryDebounce, isShowModal])

  const handleDeleteCategory = async (id) => {
    Swal.fire({
      icon: "warning",
      title: "Xác nhận thao tác",
      text: "Bạn có chắc muốn xóa danh mục này?",
      showCancelButton: true,
      showConfirmButton: true,
      confirmButtonText: "Xóa",
      cancelButtonText: "Quay lại",
    }).then(async (rs) => {
      if (rs.isConfirmed) {
        const response = await apiDeleteCategory(id)
        if (response.success) {
          toast.success(response.mes)
          fetchCategories(Object.fromEntries([...params]))
        } else toast.error(response.mes)
      }
    })
  }

  const handleSort = (column) => {
    const newOrder =
      sortColumn === column && sortOrder === "asc" ? "desc" : "asc"
    setSortColumn(column)
    setSortOrder(newOrder)

    const sortedData = [...categories].sort((a, b) => {
      const valueA =
        typeof a[column] === "string" ? a[column].toLowerCase() : a[column]
      const valueB =
        typeof b[column] === "string" ? b[column].toLowerCase() : b[column]

      if (newOrder === "asc") {
        return valueA > valueB ? 1 : -1
      }
      return valueA < valueB ? 1 : -1
    })

    setCategories(sortedData)
  }

  const renderSortIcon = (column) => {
    if (sortColumn !== column) return null
    return sortOrder === "asc" ? "🔼" : "🔽"
  }

  const handleSearchChange = (event) => {
    const value = event.target.value
    setSearchTerm(value)
  }

  const refreshCategories = async () => {
    try {
      const response = await apiGetCategories()
      if (response.success) {
        setCategories(response.prodCategories)
      } else {
        toast.error("Không thể tải lại danh sách danh mục.")
      }
    } catch (error) {
      console.error("Error fetching categories:", error)
      toast.error("Đã xảy ra lỗi khi tải lại danh sách danh mục.")
    }
  }
  useEffect(() => {
    refreshCategories()
  }, [params, queryDebounce, isShowModal])

  return (
      <div className={clsx("w-full bg-white/30 backdrop-blur-xl rounded-2xl p-6 shadow-2xl", editCategory && "pl-16")}>
        {editCategory && (
          <div className="absolute inset-0 min-h-screen bg-white/30 backdrop-blur-xl z-50">
            <UpdateCategory
              editCategory={editCategory}
              render={render}
              setEditCategory={setEditCategory}
            />
          </div>
        )}
      <h1 className="flex justify-between items-center text-3xl font-bold mb-6 pb-4 border-b-2 border-transparent">
        <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-500 to-pink-500">
          Quản lý loại sản phẩm
        </span>
      </h1>

      <div className="w-full">
        <div className="flex justify-end py-2">
          <input
            type="text"
            placeholder="Tìm kiếm theo tên danh mục..."
            value={searchTerm}
            onChange={handleSearchChange}
            className="h-11 bg-white/50 backdrop-blur-sm border border-purple-200 rounded-xl w-[50%]"
          />
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full border-collapse rounded-2xl overflow-hidden">
            <thead className="bg-gradient-to-r from-purple-600 to-pink-500 text-white">
              <tr>
                <th className="px-6 py-4 text-left">#</th>
                <th className="px-6 py-4 text-left">Ảnh</th>
                <th 
                  className="px-6 py-4 text-left cursor-pointer"
                  onClick={() => handleSort("title")}
                >
                  Tên danh mục {renderSortIcon("title")}
                </th>
                <th 
                  className="px-6 py-4 text-left cursor-pointer"
                  onClick={() => handleSort("brand")}
                >
                  Thương hiệu {renderSortIcon("brand")}
                </th>
                <th 
                  className="px-6 py-4 text-left cursor-pointer"
                  onClick={() => handleSort("createdAt")}
                >
                  Ngày tạo {renderSortIcon("createdAt")}
                </th>
                <th className="px-6 py-4 text-center">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {categories?.length > 0 ? (
                categories.map((category, idx) => (
                  <tr key={category._id} className="border-b hover:bg-purple-50/50 transition-all">
                    <td className="py-4 px-6">{idx + 1}</td>
                    <td className="py-4 px-6">
                      <img
                        src={category.image}
                        alt="thumb"
                        className="w-14 h-14 object-cover border rounded-md"
                      />
                    </td>
                    <td className="py-4 px-6">{category.title}</td>
                    <td className="py-4 px-6">
                      {category.brand?.map((brand) => brand.title).join(", ")}
                    </td>
                    <td className="py-4 px-6">
                      {moment(category.createdAt).format("DD/MM/YYYY")}
                    </td>
                    <td className="py-4 px-6 text-center space-x-2">
                      <button 
                        type="button"
                        onClick={() => setEditCategory(category)}
                        className="text-purple-600 hover:bg-purple-100 p-2 rounded-full transition-all"
                      >
                        Cập nhật
                      </button>
                      <button 
                        type="button"
                        onClick={() => handleDeleteCategory(category._id)}
                        className="text-red-600 hover:bg-red-100 p-2 rounded-full transition-all"
                      >
                        Xoá
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="text-center py-6 text-gray-500">
                    Không tìm thấy danh mục.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="w-full flex justify-end mt-4">
          <Pagination totalCount={counts} />
        </div>
      </div>
    </div>
  )
}

export default ManageCategory