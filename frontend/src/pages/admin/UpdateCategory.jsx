import React, { useEffect, useState } from "react"
import { useForm } from "react-hook-form"
import { toast } from "react-toastify"
import { Button, InputForm, Loading } from "components"
import { apiUpdateCategory, apiGetBrands } from "apis"
import { getBase64 } from "utils/helpers"

const UpdateCategory = ({ editCategory, render, setEditCategory }) => {
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm()

  const [availableBrands, setAvailableBrands] = useState([])
  const [selectedBrands, setSelectedBrands] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [preview, setPreview] = useState({ image: null })
  const [currentBrand, setCurrentBrand] = useState("")

  // Fetch available brands
  useEffect(() => {
    const fetchBrands = async () => {
      const response = await apiGetBrands()
      if (response.success) {
        const sortedBrands = response.brands.sort((a, b) =>
          a.title.localeCompare(b.title)
        )
        setAvailableBrands(sortedBrands)
      }
    }
    fetchBrands()
  }, [])

  // Load category data when component renders
  useEffect(() => {
    if (editCategory) {
      setValue("title", editCategory.title)
      setSelectedBrands(editCategory.brand?.map((b) => b._id) || [])
    }
  }, [editCategory, setValue])

  // Handle image preview
  const handlePreviewImage = async (file) => {
    if (!file) return
    const base64Image = await getBase64(file)
    setPreview({ image: base64Image })
  }

  // Display current image if no new image
  useEffect(() => {
    if (editCategory?.image && !watch("image")?.[0]) {
      setPreview({ image: editCategory.image })
    }

    const imageFile = watch("image")?.[0]
    if (imageFile) {
      handlePreviewImage(imageFile)
    }
  }, [watch("image"), editCategory])

  // Add brand to selected brands
  const handleAddBrand = () => {
    if (!currentBrand) {
      toast.error("Vui lòng chọn thương hiệu!")
      return
    }

    if (selectedBrands.includes(currentBrand)) {
      toast.error("Thương hiệu này đã được chọn!")
      return
    }

    setSelectedBrands((prev) => [...prev, currentBrand])
    setCurrentBrand("")
  }

  // Remove brand from selected brands
  const handleRemoveBrand = (brandId) => {
    setSelectedBrands((prev) => prev.filter((id) => id !== brandId))
  }

  // Update category
  const handleUpdateCategory = async (data) => {
    setIsLoading(true)

    try {
      if (selectedBrands.length === 0) {
        toast.error("Vui lòng chọn ít nhất một thương hiệu!")
        setIsLoading(false)
        return
      }

      const formData = new FormData()
      formData.append("title", data.title)

      selectedBrands.forEach((brandId) => {
        formData.append("brand[]", brandId)
      })

      if (data.image?.[0]) {
        formData.append("image", data.image[0])
      }

      const response = await apiUpdateCategory(formData, editCategory._id, {
        headers: { "Content-Type": "multipart/form-data" },
      })

      if (response.success) {
        toast.success("Cập nhật danh mục thành công!")
        render() // Gọi lại hàm làm mới danh sách danh mục
        setEditCategory(null) // Đóng modal chỉnh sửa
      } else {
        toast.error(response.message || "Cập nhật danh mục thất bại.")
      }
    } catch (error) {
      console.error("Error:", error.response?.data || error.message)
      toast.error(
        error.response?.data?.message ||
          "Đã xảy ra lỗi trong quá trình cập nhật."
      )
    }

    setIsLoading(false)
  }

  return (
    <div className="w-full bg-white rounded-2xl p-6 shadow-2xl max-w-3xl mx-auto">
      <div className="flex justify-between items-center border-b pb-4">
        <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-500 to-pink-500">
          Cập nhật danh mục
        </h1>
        <span
          className="text-purple-600 hover:underline cursor-pointer"
          onClick={() => setEditCategory(null)}
        >
          Quay lại
        </span>
      </div>
      {isLoading ? (
        <Loading />
      ) : (
        <form
          onSubmit={handleSubmit(handleUpdateCategory)}
          className="space-y-6 mt-6"
        >
          {/* Category Name */}
          <InputForm
            label="Tên danh mục"
            id="title"
            register={register}
            errors={errors}
            validate={{ required: "Tên danh mục không được bỏ trống." }}
            placeholder="Nhập tên danh mục"
          />

          {/* Brand Selection */}
          <div className="space-y-4">
            <label className="font-semibold">Chọn thương hiệu:</label>

            <div className="flex gap-4">
              <select
                value={currentBrand}
                onChange={(e) => setCurrentBrand(e.target.value)}
                className="flex-grow h-11 bg-white/50 backdrop-blur-sm border border-purple-200 rounded-xl"
              >
                <option value="">Chọn thương hiệu</option>
                {availableBrands.map((brand) => (
                  <option key={brand._id} value={brand._id}>
                    {brand.title}
                  </option>
                ))}
              </select>

              <button
                type="button"
                onClick={handleAddBrand}
                className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-4 py-2 rounded-xl hover:opacity-90"
              >
                Thêm thương hiệu
              </button>
            </div>

            {/* Selected Brands Display */}
            {selectedBrands.length > 0 && (
              <div className="mt-4">
                <h3 className="text-lg font-medium mb-2">
                  Các thương hiệu đã chọn:
                </h3>
                <div className="grid grid-cols-3 gap-4">
                  {selectedBrands.map((brandId) => {
                    const brand = availableBrands.find(
                      (b) => b._id === brandId
                    )
                    return (
                      <div
                        key={brandId}
                        className="flex justify-between items-center bg-purple-100 p-2 rounded-xl"
                      >
                        <span>{brand?.title}</span>
                        <button
                          type="button"
                          onClick={() => handleRemoveBrand(brandId)}
                          className="text-red-500 hover:text-red-700"
                        >
                          Xóa
                        </button>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Image Upload */}
          <div>
            <label className="block text-gray-700 mb-2">Hình ảnh</label>
            <input
              type="file"
              id="image"
              {...register("image")}
              className="h-11 bg-white/50 backdrop-blur-sm border border-purple-200 rounded-xl w-full p-2"
            />
            {errors.image && (
              <small className="text-xs text-red-500">
                {errors.image.message}
              </small>
            )}
          </div>

          {/* Preview Thumbnail */}
          {preview.image && (
            <div className="py-4">
              <label className="block text-gray-700 mb-2">Preview</label>
              <img
                src={preview.image}
                alt="Preview"
                className="w-32 h-32 object-cover rounded-xl shadow-md"
              />
            </div>
          )}

          {/* Submit Button */}
          <div className="flex justify-end">
            <button
              type="submit"
              className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-6 py-2 rounded-xl hover:opacity-90"
            >
              Cập nhật danh mục
            </button>
          </div>
        </form>
      )}
    </div>
  )
}

export default UpdateCategory
