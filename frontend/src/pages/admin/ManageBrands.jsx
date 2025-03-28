import React, { useEffect, useState } from "react"
import { apiCreateBrand, apiDeleteBrand, apiGetBrands, apiUpdateBrand } from "apis"
import { Button, InputForm } from "components"
import { toast } from "react-toastify"
import Swal from "sweetalert2"
import moment from "moment"
import { RiEditLine, RiDeleteBinLine } from "react-icons/ri"

const ManageBrands = () => {
  const [brands, setBrands] = useState([])
  const [editBrand, setEditBrand] = useState(null)

  // Fetch brands
  const fetchBrands = async () => {
    const res = await apiGetBrands()
    if (res.success) {
      // Sort brands alphabetically
      const sortedBrands = res.brands.sort((a, b) => a.title.localeCompare(b.title))
      setBrands(sortedBrands)
    }
  }

  // Initial fetch and effect for brands
  useEffect(() => {
    fetchBrands()
  }, [])

  // Handle form submission for creating or updating brand
  const handleCreateOrUpdateBrand = async (data) => {
    try {
      let res
      if (editBrand) {
        // Update existing brand
        res = await apiUpdateBrand(editBrand._id, { title: data.title })
        if (res.success) {
          toast.success("Cập nhật thương hiệu thành công!")
        } else {
          toast.error("Cập nhật thương hiệu thất bại!")
        }
      } else {
        // Create new brand
        res = await apiCreateBrand({ title: data.title })
        if (res.success) {
          toast.success("Tạo thương hiệu thành công!")
        } else {
          toast.error("Tạo thương hiệu thất bại!")
        }
      }
      
      // Reset and refresh
      setEditBrand(null)
      fetchBrands()
    } catch (error) {
      toast.error("Đã xảy ra lỗi!")
    }
  }

  // Handle brand deletion
  const handleDeleteBrand = async (brandId) => {
    Swal.fire({
      title: "Xóa thương hiệu?",
      text: "Bạn có chắc muốn xóa thương hiệu này?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Xóa",
      cancelButtonText: "Hủy"
    }).then(async (result) => {
      if (result.isConfirmed) {
        const res = await apiDeleteBrand(brandId)
        if (res.success) {
          toast.success("Xóa thương hiệu thành công!")
          fetchBrands()
        } else {
          toast.error("Xóa thương hiệu thất bại!")
        }
      }
    })
  }

  return (
    <div className="w-full bg-white/10 backdrop-blur-xl rounded-3xl p-8 shadow-2xl transition-all duration-300">
      <div className="flex justify-between items-center mb-6 pb-4 border-b-2 border-gray-200/20">
        <h1 className="text-4xl font-extrabold">
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600">
            Quản lý thương hiệu
          </span>
        </h1>
      </div>

      {/* Brand Creation/Update Form */}
      <form 
        onSubmit={(e) => {
          e.preventDefault()
          handleCreateOrUpdateBrand({ title: e.target.title.value })
        }} 
        className="flex gap-4 mb-6"
      >
        <div className="relative flex-grow">
          <input 
            type="text" 
            name="title"
            defaultValue={editBrand ? editBrand.title : ""}
            placeholder="Nhập tên thương hiệu" 
            className="w-full pl-4 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:outline-none text-sm transition-all duration-300 shadow-sm hover:border-purple-300"
            required 
          />
        </div>
        <Button 
          type="submit" 
          className="bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl px-6 py-3 shadow-lg hover:opacity-90 transition-all duration-300 hover:scale-105"
        >
          {editBrand ? "Cập nhật" : "Tạo mới"}
        </Button>
        {editBrand && (
          <Button 
            type="button" 
            onClick={() => setEditBrand(null)} 
            className="bg-gray-200 text-gray-800 rounded-xl px-6 py-3 shadow-md hover:bg-gray-300 transition-all duration-300 hover:scale-105"
          >
            Hủy
          </Button>
        )}
      </form>

      {/* Brands Table */}
      <div className="overflow-x-auto rounded-xl shadow-md">
        <table className="w-full">
          <thead className="bg-gradient-to-r from-purple-600 to-pink-600 text-white">
            <tr>
              {['STT', 'Tên thương hiệu', 'Ngày tạo', 'Thao tác'].map((header) => (
                <th key={header} className="text-center py-4 px-2 text-sm font-semibold">{header}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {brands.map((brand, index) => (
              <tr 
                key={brand._id} 
                className="border-b border-gray-200 hover:bg-purple-50/50 transition duration-150"
              >
                <td className="text-center py-3 px-2">{index + 1}</td>
                <td className="text-center py-3 px-2">{brand.title}</td>
                <td className="text-center py-3 px-2">
                  {moment(brand.createdAt).format("DD/MM/YYYY")}
                </td>
                <td className="text-center py-3 px-2">
                <button 
                    onClick={() => handleDeleteBrand(brand._id)}
                    className="text-red-600 hover:text-red-800 inline-flex items-center hover:underline cursor-pointer px-2 py-1 rounded-md hover:bg-red-100 transition-all duration-300"
                  >
                    <RiDeleteBinLine className="mr-1" /> Xóa
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default ManageBrands