import { apiUpdateBlog } from "apis/blog"
import { Button, InputFile, InputForm, MdEditor } from "components"
import React, { useEffect, useState } from "react"
import { useForm } from "react-hook-form"
import { useDispatch } from "react-redux"
import { toast } from "react-toastify"
import { showModal } from "store/app/appSlice"

const UpdateBlog = ({ title, description, image: imageLink, hashtags, id }) => {
  const {
    register,
    formState: { errors },
    handleSubmit,
    watch,
    setValue,
    reset,
    getValues,
  } = useForm()
  const dispatch = useDispatch()
  const [isLoading, setIsLoading] = useState(false)
  
  useEffect(() => {
    reset({
      title,
      description,
      hashtags,
    })
  }, [title])
  
  const handleUpdate = async ({ image, ...data }) => {
    const payload = new FormData()
    for (let i of Object.entries(data)) payload.append(i[0], i[1])
    if (image instanceof FileList && image.length > 0)
      payload.append("image", image[0])
    else delete payload.image

    setIsLoading(true)
    const response = await apiUpdateBlog(payload, id)
    setIsLoading(false)
    if (response.success) {
      dispatch(showModal({ isShowModal: false, modalChildren: null }))
      toast.success(response.mes)
    } else toast.error(response.mes)
  }
  
  return (
    <div
      onClick={(e) => e.stopPropagation()}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm"
    >
      <div className="bg-white w-full max-w-[1000px] h-[90vh] rounded-lg shadow-2xl overflow-hidden flex flex-col">
        <div className="bg-gradient-to-r from-purple-600 to-pink-500 text-white p-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold">
            Update Blog <br />
            <span className="opacity-75">{title}</span>
          </h1>
          <button 
            onClick={() => dispatch(showModal({ isShowModal: false, modalChildren: null }))}
            className="text-white hover:text-red-300 transition-colors text-2xl"
          >
            ✕
          </button>
        </div>
        
        <div className="p-6 overflow-y-auto flex-grow">
          <form className="space-y-6">
            <InputForm
              id="title"
              errors={errors}
              validate={{ required: "Tiêu đề không được để trống" }}
              register={register}
              label="Tiêu đề"
              placeholder="Nhập tiêu đề bài viết"
              className="w-full"
            />
            
            <InputForm
              id="hashtags"
              errors={errors}
              validate={{ required: "Tags không được để trống" }}
              register={register}
              label="Tags"
              placeholder="Các tags cách nhau bằng dấu phẩy"
              className="w-full"
            />
            
            <MdEditor
              id="description"
              errors={errors}
              validate={{ required: "Nội dung không được để trống" }}
              register={register}
              label="Nội dung bài viết"
              height={400}
              setValue={setValue}
              value={getValues("description")}
              className="w-full"
            />
            
            <div className="space-y-4">
              <InputFile
                register={register}
                errors={errors}
                id="image"
                label="Ảnh bìa:"
              />
              {imageLink && !watch("image") && (
                <div className="flex items-center space-x-4">
                  <img 
                    src={imageLink} 
                    alt="Ảnh bìa hiện tại" 
                    className="w-48 h-32 object-cover rounded-lg shadow-md" 
                  />
                  <span className="text-gray-500">Ảnh bìa hiện tại</span>
                </div>
              )}
            </div>
          </form>
        </div>
        
        <div className="bg-gray-100 p-4 flex justify-end space-x-4">
          <Button
            type="button"
            className="bg-gray-200 text-gray-700 hover:bg-gray-300"
            handleOnClick={() => dispatch(showModal({ isShowModal: false, modalChildren: null }))}
          >
            Hủy
          </Button>
          <Button
            disabled={isLoading}
            handleOnClick={handleSubmit(handleUpdate)}
            className="bg-purple-600 text-white hover:bg-purple-700 transition-colors"
          >
            {isLoading ? 'Đang cập nhật...' : 'Cập nhật'}
          </Button>
        </div>
      </div>
    </div>
  )
}

export default UpdateBlog