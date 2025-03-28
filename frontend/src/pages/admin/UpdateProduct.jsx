import { InputForm, MarkdownEditor, Select, Button, Loading } from 'components'
import React, { memo, useState, useEffect, useCallback } from 'react'
import { useForm } from 'react-hook-form'
import { validate, getBase64 } from 'utils/helpers'
import { toast } from 'react-toastify'
import { apiUpdateProduct } from 'apis'
import { showModal } from 'store/app/appSlice'
import { useSelector, useDispatch } from 'react-redux'

const UpdateProduct = ({ editProduct, render, setEditProduct }) => {
    const { categories } = useSelector(state => state.app)
    const dispatch = useDispatch()
    const { register, handleSubmit, formState: { errors }, reset, watch } = useForm()
    const [payload, setPayload] = useState({
        description: ''
    })
    const [preview, setPreview] = useState({
        thumb: null,
        images: []
    })

    useEffect(() => {
        reset({
            title: editProduct?.title || '',
            price: editProduct?.price || '',
            quantity: editProduct?.quantity || '',
            color: editProduct?.color || '',
            category: editProduct?.category || '',
            brand: editProduct?.brand?._id || '',
        })
        setPayload({ description: typeof editProduct?.description === 'object' ? editProduct?.description?.join(', ') : editProduct?.description })
        setPreview({
            thumb: editProduct?.thumb || '',
            images: editProduct?.images || []
        })
    }, [editProduct])

    const [invalidFields, setInvalidFields] = useState([])
    const changeValue = useCallback((e) => {
        setPayload(e)
    }, [payload])
    const handlePreviewThumb = async (file) => {
        const base64Thumb = await getBase64(file)
        setPreview(prev => ({ ...prev, thumb: base64Thumb }))
    }
    const handlePreviewImages = async (files) => {
        const imagesPreview = []
        for (let file of files) {
            if (file.type !== 'image/png' && file.type !== 'image/jpeg') {
                toast.warning('File not supported!')
                return
            }
            const base64 = await getBase64(file)
            imagesPreview.push(base64)
        }
        setPreview(prev => ({ ...prev, images: imagesPreview }))
    }
    useEffect(() => {
        if (watch('thumb') instanceof FileList && watch('thumb').length > 0)
            handlePreviewThumb(watch('thumb')[0])
    }, [watch('thumb')])
    useEffect(() => {
        if (watch('images') instanceof FileList && watch('images').length > 0)
            handlePreviewImages(watch('images'))
    }, [watch('images')])

    const handleUpdateProduct = async (data) => {
      const invalids = validate(payload, setInvalidFields)
      if (invalids === 0) {
        if (data.category) {
          const selectedCategory = categories?.find(
            (el) => el.title === data.category || el._id === data.category
          )
          if (selectedCategory) {
            data.category = selectedCategory._id // ✅ Gán đúng ObjectId
          } else {
            toast.error("Không tìm thấy danh mục phù hợp!")
            return
          }
        }
        

        const finalPayload = { ...data, ...payload }
        finalPayload.thumb =
          data?.thumb?.length === 0 ? preview.thumb : data.thumb[0]

        const validImages =
          data.images?.length === 0
            ? preview.images
            : data.images.filter((image) => image.size > 0)

        finalPayload.images = validImages

        const formData = new FormData()
        for (let [key, value] of Object.entries(finalPayload)) {
          if (key === "images") {
            for (let image of value) {
              formData.append("images", image)
            }
          } else {
            formData.append(key, value)
          }
        }

        dispatch(showModal({ isShowModal: true, modalChildren: <Loading /> }))

        const response = await apiUpdateProduct(formData, editProduct._id)

        dispatch(showModal({ isShowModal: false, modalChildren: null }))

        if (response.success) {
          toast.success(response.mes)
          render()
          setEditProduct(null)
        } else {
          toast.error(response.mes)
        }
      }
    }

    const handleRemoveImage = (index) => {
      setPreview((prev) => ({
        ...prev,
        images: prev.images.filter((_, i) => i !== index),
      }))
    }

    return (
      <div className="w-full min-h-screen bg-gradient-to-br from-purple-100 to-pink-100 p-8">
        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
          <div className="bg-gradient-to-r from-purple-500 to-pink-500 text-white p-6 flex justify-between items-center">
            <h1 className="text-3xl font-bold tracking-tight">
              Cập nhật sản phẩm
            </h1>
            <span
              className="cursor-pointer hover:underline"
              onClick={() => setEditProduct(null)}
            >
              Quay lại
            </span>
          </div>
          
          <form onSubmit={handleSubmit(handleUpdateProduct)} className="p-8 space-y-6">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">Tên sản phẩm</label>
              <input
                {...register("title", { required: "Không được để trống" })}
                className="w-full px-4 py-2 border border-purple-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 bg-purple-50/50"
                placeholder="Nhập tên sản phẩm"
              />
              {errors.title && <p className="text-red-500 text-xs mt-1">{errors.title.message}</p>}
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">Giá tiền</label>
                <input
                  type="number"
                  {...register("price", { required: "Không được để trống" })}
                  className="w-full px-4 py-2 border border-purple-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 bg-purple-50/50"
                  placeholder="Giá..."
                />
                {errors.price && <p className="text-red-500 text-xs mt-1">{errors.price.message}</p>}
              </div>
              
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">Số lượng</label>
                <input
                  type="number"
                  {...register("quantity", { required: "Không được để trống" })}
                  className="w-full px-4 py-2 border border-purple-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 bg-purple-50/50"
                  placeholder="..."
                />
                {errors.quantity && <p className="text-red-500 text-xs mt-1">{errors.quantity.message}</p>}
              </div>
              
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">Màu sắc</label>
                <input
                  {...register("color", { required: "Không được để trống" })}
                  className="w-full px-4 py-2 border border-purple-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 bg-purple-50/50"
                  placeholder="Đen,..."
                />
                {errors.color && <p className="text-red-500 text-xs mt-1">{errors.color.message}</p>}
              </div>
            </div>

          <div className="w-full my-6 flex gap-4">
            <Select
              label="Loại sản phẩm"
              options={categories
                ?.slice()
                ?.sort((a, b) => {
                  const aValue = typeof a === 'string' ? a : a?.title
                  const bValue = typeof b === 'string' ? b : b?.title
                  return aValue?.localeCompare(bValue)
                })                
                ?.map((el) => ({
                  code: el._id,
                  value: el.title,
                }))}
              register={register}
              id="category"
              validate={{ required: "Không được để trống" }}
              style="flex-auto"
              errors={errors}
              fullWidth
            />

              <Select
                label="Thương hiệu"
                options={categories
                  ?.find((el) => el._id === watch("category"))
                  ?.brand?.slice()
                  ?.sort((a, b) => {
                    const aVal = typeof a === 'string' ? a : a?.title
                    const bVal = typeof b === 'string' ? b : b?.title
                    return aVal?.localeCompare(bVal)
                  })
                  ?.map((el) => ({
                    code: typeof el === 'string' ? el : el._id,
                    value: typeof el === 'string' ? el : el.title,
                  }))}
                register={register}
                id="brand"
                style="flex-auto"
                errors={errors}
                fullWidth
              />
          </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">Mô tả</label>
              <MarkdownEditor
                name="description"
                changeValue={changeValue}
                value={payload.description}
                label=""
                invalidFields={invalidFields}
                setInvalidFields={setInvalidFields}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">Ảnh đại diện</label>
                <input 
                  type="file" 
                  {...register("thumb")}
                  className="w-full px-4 py-2 border border-purple-200 rounded-lg file:mr-4 file:rounded-full file:border-0 file:bg-purple-50 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-purple-700 hover:file:bg-purple-100"
                />
                {preview.thumb && (
                  <img 
                    src={preview.thumb} 
                    alt="Thumbnail" 
                    className="mt-2 w-32 h-32 object-cover rounded-lg border-2 border-purple-200" 
                  />
                )}
              </div>
              
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">Hình ảnh sản phẩm</label>
                <input 
                  type="file" 
                  multiple 
                  {...register("images")}
                  className="w-full px-4 py-2 border border-purple-200 rounded-lg file:mr-4 file:rounded-full file:border-0 file:bg-purple-50 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-purple-700 hover:file:bg-purple-100"
                />
                {preview.images.length > 0 && (
                  <div className="mt-2 flex gap-2 flex-wrap">
                    {preview.images.map((img, idx) => (
                      <div key={idx} className="relative w-32 h-32">
                        <img 
                          src={img} 
                          alt={`Product ${idx + 1}`} 
                          className="w-full h-full object-cover rounded-lg border-2 border-purple-200" 
                        />
                        <button
                          type="button"
                          onClick={() => handleRemoveImage(idx)}
                          className="absolute top-1 right-1 bg-white rounded-full p-1 shadow-md hover:bg-red-100"
                        >
                          <span className="text-red-500 font-bold">×</span>
                        </button>
                      </div>
                    ))}
                  </div>
                )}

              </div>
            </div>

            <div className="mt-8">
              <button 
                type="submit" 
                className="w-full bg-gradient-to-r from-purple-600 to-pink-500 text-white py-3 rounded-lg hover:from-purple-700 hover:to-pink-600 transition-all duration-300"
              >
                Cập nhật sản phẩm
              </button>
            </div>
          </form>
        </div>
      </div>
    )
}

export default memo(UpdateProduct)