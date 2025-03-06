import { apiCreateCategory } from "apis";
import { Button, InputForm } from "components";
import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";
import { getBase64 } from "utils/helpers";

const CreateCategory = () => {
  const {
    register,
    formState: { errors },
    handleSubmit,
    setValue,
    reset,
    watch,
  } = useForm();
  const [isLoading, setIsLoading] = useState(false);
  const [brands, setBrands] = useState([""]);
  const [preview, setPreview] = useState({ image: null });

  // Thêm trường nhập mới cho nhãn hiệu
  const addBrandField = () => setBrands((prev) => [...prev, ""]);

  // Xóa trường nhập nhãn hiệu theo chỉ số
  const removeBrandField = (index) =>
    setBrands((prev) => prev.filter((_, i) => i !== index));

  // Xử lý thay đổi trong trường nhập nhãn hiệu
  const handleBrandChange = (index, value) => {
    const updatedBrands = [...brands];
    updatedBrands[index] = value;
    setBrands(updatedBrands);
  };

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

  // Xử lý khi người dùng gửi form
  const handlePublish = async (data) => {
    const formData = new FormData();
    formData.append("title", data.title);
    brands
      .filter((brand) => brand.trim() !== "")
      .forEach((brand) => formData.append("brands[]", brand));
    if (preview.image) {
      formData.append("image", preview.image);
    }

    setIsLoading(true);
    try {
      const response = await apiCreateCategory(formData);
      if (response?.success) {
        toast.success("Danh mục đã được tạo thành công!");
        reset();
      } else {
        toast.error("Có lỗi xảy ra. Vui lòng thử lại!");
      }
    } catch (error) {
      toast.error("Có lỗi xảy ra khi tạo danh mục!");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full flex flex-col gap-6 bg-gray-100 p-6 rounded-lg shadow-md">
      {/* Header */}
      <div className="flex justify-between items-center border-b pb-4">
        <h1 className="text-3xl font-semibold text-gray-700">
          Tạo loại sản phẩm
        </h1>
      </div>

      {/* Form */}
      <form
        onSubmit={handleSubmit(handlePublish)}
        className="space-y-6 flex flex-col"
      >

        <div>
          <label className="block text-xl font-medium text-gray-700 mb-2">
            Tên loại:
          </label>
          <InputForm
            id="title"
            register={register}
            errors={errors}
            validate={{
              required: "Category name is required.",
            }}
            placeholder="Enter category name"
          />
        </div>

        <div className="space-y-2 py-4">
          <label className="font-semibold text-xl">Thương hiệu (có thể thêm nhiều):</label>
          {brands.map((brand, index) => (
            <div
              key={index}
              className="flex items-center gap-4 border rounded-md p-2 bg-white"
            >
              <input
                type="text"
                value={brand}
                onChange={(e) => handleBrandChange(index, e.target.value)}
                placeholder={`Brand ${index + 1}`}
                className="border p-2 w-full rounded-md"
              />
              <Button
                handleOnClick={() => removeBrandField(index)}
                className="text-red-500"
              >
                Xoá
              </Button>
            </div>
          ))}
          <Button handleOnClick={addBrandField}>Thêm thương hiệu</Button>
        </div>
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
        {/* Preview Thumbnail */}
        {preview.image && (
          <div className="py-4">
            <img
              src={preview.image}
              alt="Preview"
              className="w-32 h-32 object-cover rounded-md shadow-md"
            />
          </div>
        )}
        {/* Submit Button */}
        <div className="flex justify-end">
          <button
            type="submit"
            className={`px-6 py-2 rounded-md text-white ${
              isLoading
                ? "bg-blue-300 cursor-not-allowed"
                : "bg-blue-500 hover:bg-blue-600"
            }`}
            disabled={isLoading}
          >
            {isLoading ? "Đang tạo mới..." : "Tạo mới"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateCategory;
