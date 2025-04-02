import React, { useState, useEffect } from "react"
import { apiCreateCategory, apiGetBrands } from "apis"
import { Button, InputForm } from "components"
import { useForm } from "react-hook-form"
import { toast } from "react-toastify"
import { getBase64 } from "utils/helpers"
import clsx from 'clsx'

const CreateCategory = () => {
  const {
    register,
    formState: { errors },
    handleSubmit,
    setValue,
    reset,
    watch,
  } = useForm()

  const [isLoading, setIsLoading] = useState(false)
  const [availableBrands, setAvailableBrands] = useState([])
  const [selectedBrands, setSelectedBrands] = useState([])
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

  // Handle image preview
  const handlePreviewImage = async (file) => {
    if (!file) return
    const base64Image = await getBase64(file)
    setPreview({ image: base64Image })
  }

  // Watch image file changes
  useEffect(() => {
    const imageFile = watch("image")?.[0]
    if (imageFile) {
      handlePreviewImage(imageFile)
    }
  }, [watch("image")])

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

    setSelectedBrands(prev => [...prev, currentBrand])
    setCurrentBrand("")
  }

  // Remove brand from selected brands
  const handleRemoveBrand = (brandId) => {
    setSelectedBrands(prev => prev.filter(id => id !== brandId))
  }

  // Handle form submission
  const handlePublish = async (data) => {
    if (selectedBrands.length === 0) {
      toast.error("Vui lòng chọn ít nhất một thương hiệu!")
      return
    }
  
    const formData = new FormData()
    formData.append("title", data.title)
    selectedBrands.forEach(brandId => {
      formData.append("brand[]", brandId)
    })
  
    const imageFile = watch("image")?.[0]
    if (!imageFile) {
      toast.error("Vui lòng tải hình ảnh!")
      return
    }
  
    formData.append("image", imageFile) 
  
    setIsLoading(true)
    try {
      const response = await apiCreateCategory(formData)
      if (response?.success) {
        toast.success("Danh mục đã được tạo thành công!")
        reset()
        setSelectedBrands([])
        setPreview({ image: null })
      } else {
        toast.error(response?.message || "Có lỗi xảy ra. Vui lòng thử lại!")
      }
    } catch (error) {
      toast.error("Có lỗi xảy ra khi tạo danh mục!")
    } finally {
      setIsLoading(false)
    }
  }
  

  return (
    <div className="w-full bg-white/30 backdrop-blur-xl rounded-2xl p-6 shadow-2xl">
      <h1 className="flex justify-between items-center text-3xl font-bold mb-6 pb-4 border-b-2 border-transparent">
        <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-500 to-pink-500">
          Tạo loại sản phẩm
        </span>
      </h1>

      <form onSubmit={handleSubmit(handlePublish)} className="space-y-6">
        {/* Category Name */}
        <div>
          <label className="block text-gray-700 mb-2">Tên loại:</label>
          <InputForm
            id="title"
            register={register}
            errors={errors}
            validate={{ required: "Tên danh mục không được để trống." }}
            placeholder="Nhập tên danh mục"
          />
        </div>

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
              <h3 className="text-lg font-medium mb-2">Các thương hiệu đã chọn:</h3>
              <div className="grid grid-cols-3 gap-4">
                {selectedBrands.map((brandId) => {
                  const brand = availableBrands.find(b => b._id === brandId)
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
            {...register("image", { required: "Hình ảnh không được để trống." })}
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
            className={`px-6 py-2 rounded-xl text-white ${
              isLoading
                ? "bg-purple-300 cursor-not-allowed"
                : "bg-gradient-to-r from-purple-500 to-pink-500 hover:opacity-90"
            }`}
            disabled={isLoading}
          >
            {isLoading ? "Đang tạo mới..." : "Tạo mới"}
          </button>
        </div>
      </form>
    </div>
  )
}

export default CreateCategory