import { apiCreateNewBlog } from "apis/blog"
import { Button, InputFile, InputForm, MdEditor } from "components"
import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form"
import { toast } from "react-toastify"
import { getBase64 } from "utils/helpers";

const CreateBlog = () => {
  const {
    register,
    formState: { errors },
    handleSubmit,
    watch,
    setValue,
  } = useForm()
  const [isLoading, setIsLoading] = useState(false)
  const [preview, setPreview] = useState({ image: null });

  const handlePreviewImage = async (file) => {
    if (!file) return;
    const base64Image = await getBase64(file);
    setPreview({ image: base64Image });
  };

  useEffect(() => {
    const imageFile = watch("image")?.[0];
    if (imageFile) {
      handlePreviewImage(imageFile);
    }
  }, [watch("image")]);

  const handlePublish = async ({ image, ...data }) => {
    const payload = new FormData()
    for (let i of Object.entries(data)) payload.append(i[0], i[1])
    payload.append("image", image[0])
    setIsLoading(true)
    
    const response = await apiCreateNewBlog(payload)
    console.log(response);
    setIsLoading(false)
    if (response.success) {
      setValue("title", "")
      setValue("description", "")
      setValue("hashtags", "")
      setValue("image", "")
      toast.success(response.mes)
    } else toast.error(response.mes)
  }

  return (
    <div className="w-full bg-white/30 backdrop-blur-xl rounded-2xl p-6 shadow-2xl">
      <h1 className="flex justify-between items-center text-3xl font-bold mb-6 pb-4 border-b-2 border-transparent">
        <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-500 to-pink-500">
          Tạo bài viết
        </span>
      </h1>
      <div className="p-4">
        <form onSubmit={handleSubmit(handlePublish)}>
          <InputForm
            label="Tựa đề"
            id="title"
            errors={errors}
            validate={{ required: "Không được để trống" }}
            register={register}
            placeholder="Nhập tựa đề bài viết"
            fullWidth
          />
          <div className="w-full my-6">
            <InputForm
              label="Tags"
              id="hashtags"
              errors={errors}
              validate={{ required: "Không được để trống" }}
              register={register}
              placeholder="Mỗi tag cách nhau dấu phẩy"
              fullWidth
            />
          </div>
          <MdEditor
            id="description"
            errors={errors}
            validate={{ required: "Không được để trống" }}
            register={register}
            label="Nội dung bài viết"
            height={650}
            setValue={setValue}
            value={watch("description")}
          />
          <div className="flex flex-col gap-2 mt-8">
            <label className="font-semibold text-purple-600" htmlFor="image">
              Hình ảnh
            </label>
            <input
              type="file"
              id="image"
              {...register("image", { required: "Không được để trống" })}
              className="file:mr-4 file:rounded-full file:border-0 file:bg-purple-50 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-purple-700 hover:file:bg-purple-100"
            />
            {errors.image && (
              <small className="text-xs text-red-500">
                {errors.image.message}
              </small>
            )}
          </div>
          {preview.image && (
            <div className="my-4 border-2 border-purple-200 rounded-lg p-2 inline-block">
              <img
                src={preview.image}
                alt="Preview"
                className="w-[200px] object-contain rounded-md"
              />
            </div>
          )}
          <div className="my-6">
            <Button 
              type="submit" 
              className="bg-gradient-to-r from-purple-600 to-pink-500 text-white hover:from-purple-700 hover:to-pink-600 transition-all duration-300"
              disabled={isLoading}
            >
              Đăng bài
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default CreateBlog