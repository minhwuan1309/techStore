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
    <div className="w-full flex flex-col gap-4 bg-gray-50 relative">
      <div className="h-[69px] w-full"></div>
      <div className="p-4 border-b w-full bg-gray-50 justify-between flex items-center fixed top-0">
        <h1 className="text-3xl font-bold tracking-tight">Tạo bài viết</h1>
      </div>
      <div className="px-4 flex flex-col gap-4">
        <InputForm
          id="title"
          errors={errors}
          validate={{ required: "This field cannot empty." }}
          register={register}
          label="Tựa đề"
          placeholder="Nhập tựa đề bài viết"
        />
        <InputForm
          id="hashtags"
          errors={errors}
          validate={{ required: "This field cannot empty." }}
          register={register}
          label="Tags"
          placeholder="Mỗi tag cách nhau dấu phẩy"
        />
        <MdEditor
          id="description"
          errors={errors}
          validate={{ required: "This field cannot empty." }}
          register={register}
          label="Nội dung bài viết"
          height={650}
          setValue={setValue}
          value={watch("description")}
        />
        <div>
          <label className="block text-xl font-medium text-gray-700 mb-2">
            Hình ảnh
          </label>
          <input
            type="file"
            id="image"
            {...register("image", { required: "This field cannot be empty." })}
            className="border p-2 w-full rounded-md"
          />
          {errors.image && (
            <small className="text-xs text-red-500">
              {errors.image.message}
            </small>
          )}
        </div>
        {preview.image && (
          <div className="py-4">
            <img
              src={preview.image}
              alt="Preview"
              className="w-32 h-32 object-cover rounded-md shadow-md"
            />
          </div>
        )}
        <div className="my-6">
          <Button
            disabled={isLoading}
            handleOnClick={handleSubmit(handlePublish)}
          >
            Đăng bài
          </Button>
        </div>
      </div>
    </div>
  );
}

export default CreateBlog
