import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";
import { Button, InputForm, Loading } from "components";
import { apiUpdateCategory } from "apis";
import { getBase64 } from "utils/helpers";

const UpdateCategory = ({ editCategory, render, setEditCategory }) => {
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm();
  const [brands, setBrands] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [preview, setPreview] = useState({ image: null });

  // Load dữ liệu danh mục khi component được render
  useEffect(() => {
    if (editCategory) {
      setValue("title", editCategory.title); // Set title từ editCategory
      setBrands(editCategory.brand || []); // Set brands từ editCategory
    }
  }, [editCategory, setValue]);

  const handlePreviewImage = async (file) => {
    if (!file) return;
    const base64Image = await getBase64(file);
    setPreview({ image: base64Image });
  };

  // Hiển thị hình ảnh hiện tại nếu không có ảnh mới
  useEffect(() => {
    if (editCategory?.image && !watch("image")?.[0]) {
      setPreview({ image: editCategory.image });
    }

    const imageFile = watch("image")?.[0];
    if (imageFile) {
      handlePreviewImage(imageFile);
    }
  }, [watch("image"), editCategory]);

  // Submit form

  // Thêm và xóa brand input
  const addBrandField = () => setBrands([...brands, ""]);
  const removeBrandField = (index) =>
    setBrands(brands.filter((_, i) => i !== index));
  const handleBrandChange = (index, value) => {
    const updatedBrands = [...brands];
    updatedBrands[index] = value;
    setBrands(updatedBrands);
  };

  
  const handleUpdateCategory = async (data) => {
    setIsLoading(true);

    try {
      const formData = new FormData();
      formData.append("title", data.title);
      brands
        .filter((brand) => brand.trim() !== "")
        .forEach((brand, index) => {
          formData.append(`brand[${index}]`, brand);
        });
      formData.append("image", data.image?.[0]);

      const response = await apiUpdateCategory(formData, editCategory._id, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      if (response.success) {
        toast.success("Cập nhật danh mục thành công!");

        // Gọi lại hàm làm mới danh sách từ ManageCategory
        render(); // render được truyền từ ManageCategory
        setEditCategory(null); // Đóng form
      } else {
        toast.error(response.message || "Cập nhật danh mục thất bại.");
      }
    } catch (error) {
      console.error("Error:", error.response?.data || error.message);
      toast.error(
        error.response?.data?.message ||
          "Đã xảy ra lỗi trong quá trình cập nhật."
      );
    }

    setIsLoading(false);
  };


  return (
    <div className="w-full flex flex-col gap-6 bg-gray-100 p-6 rounded-lg shadow-md relative">
      <div className="flex justify-between items-center border-b pb-4">
        <h1 className="text-3xl font-bold text-gray-700">Cập nhật danh mục</h1>
        <span
          className="text-main hover:underline cursor-pointer"
          onClick={() => setEditCategory(null)}
        >
          Cancel
        </span>
      </div>
      {isLoading ? (
        <Loading />
      ) : (
        <form
          onSubmit={handleSubmit(handleUpdateCategory)}
          className="flex flex-col gap-4"
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

          {/* Brands */}
          <div className="space-y-2 py-4">
            <label className="font-semibold text-xl">Thương hiệu</label>
            {brands.map((brand, index) => (
              <div
                key={index}
                className="flex items-center gap-4 border rounded-md p-2 bg-white"
              >
                <input
                  type="text"
                  value={brand}
                  onChange={(e) => handleBrandChange(index, e.target.value)}
                  placeholder={`Thương hiệu ${index + 1}`}
                  className="border p-2 w-full rounded-md"
                />
                <Button
                  handleOnClick={() => removeBrandField(index)}
                  className="text-red-500"
                >
                  Xóa
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
              {...register("image")}
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
              <label className="block text-lg font-medium text-gray-700 mb-2">
                Preview
              </label>
              <img
                src={preview.image}
                alt="Preview"
                className="w-32 h-32 object-cover rounded-md shadow-md"
              />
            </div>
          )}

          {/* Submit Button */}
          <Button
            type="submit"
            className="justify-end bg-blue-500 text-white px-4 py-2 rounded-md "
          >
            Cập nhật danh mục
          </Button>
        </form>
      )}
    </div>
  );
};

export default UpdateCategory;
