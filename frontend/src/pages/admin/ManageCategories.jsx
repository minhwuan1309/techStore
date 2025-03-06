import React, { useState, useEffect, useCallback } from "react";
import { apiGetCategories, apiDeleteCategory } from "apis";
import {  Pagination } from "components";
import { BiEdit } from "react-icons/bi";
import { RiDeleteBin6Line } from "react-icons/ri";
import { useSelector, useDispatch } from "react-redux";
import {
  useSearchParams,
} from "react-router-dom";
import { toast } from "react-toastify";
import Swal from "sweetalert2";
import moment from "moment";
import useDebounce from "hooks/useDebounce";
import UpdateCategory from "./UpdateCategory";

const ManageCategory = () => {
  const [params] = useSearchParams();
  const [categories, setCategories] = useState([]);
  const [counts, setCounts] = useState(0);
  const { isShowModal } = useSelector((s) => s.app);
  const [update, setUpdate] = useState(false);
  const [editCategory, setEditCategory] = useState(null);
  const render = useCallback(() => {
    setUpdate(!update);
  }, [update]);

  // Debounced search
  const [searchTerm, setSearchTerm] = useState("");
  const queryDebounce = useDebounce(searchTerm, 800);

  // Fetch categories
  const fetchCategories = async (param) => {
    const response = await apiGetCategories({
      ...param,
      limit: process.env.REACT_APP_LIMIT,
    });
    if (response.success) {
      setCounts(response.counts);
      setCategories(response.prodCategories);
    }
  };

  useEffect(() => {
    const searchParams = Object.fromEntries([...params]);
    if (queryDebounce) searchParams.q = queryDebounce;
    if (!isShowModal) fetchCategories(searchParams);
  }, [params, queryDebounce, isShowModal]);

  // Delete category
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
        const response = await apiDeleteCategory(id);
        if (response.success) {
          toast.success(response.mes);
          fetchCategories(Object.fromEntries([...params]));
        } else toast.error(response.mes);
      }
    });
  };
  // Hàm làm mới danh sách danh mục
  const refreshCategories = async () => {
    try {
      const response = await apiGetCategories();
      if (response.success) {
        setCategories(response.prodCategories); // Cập nhật danh sách danh mục
      } else {
        toast.error("Không thể tải lại danh sách danh mục.");
      }
    } catch (error) {
      console.error("Error fetching categories:", error);
      toast.error("Đã xảy ra lỗi khi tải lại danh sách danh mục.");
    }
  };

  return (
    <div className="w-full flex flex-col gap-6 bg-gray-100 p-6 rounded-lg shadow-md relative">
      {editCategory && (
        <div className="absolute inset-0 min-h-screen bg-gray-100 z-50">
          <UpdateCategory
            editCategory={editCategory}
            render={refreshCategories}
            setEditCategory={setEditCategory}
          />
        </div>
      )}
      <div className="flex justify-between items-center border-b pb-4">
        <h1 className="text-3xl font-semibold text-gray-700">
          Quản lý loại sản phẩm
        </h1>
      </div>
      <div className="px-4 mt-20 w-full">
        <table className="table-auto w-full border-collapse border border-gray-300 text-gray-700 bg-white rounded-md shadow">
          <thead>
            <tr className="font-bold bg-gray-700 text-[13px] text-white">
              <th className="text-center py-3 px-2">STT</th>
              <th className="text-center py-3 px-2">Ảnh</th>
              <th className="text-center py-3 px-2">Tên danh mục</th>
              <th className="text-center py-3 px-2">Thương hiệu</th>
              <th className="text-center py-3 px-2">Ngày tạo</th>
              <th className="text-center py-3 px-2">Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {categories?.length > 0 ? (
              categories
                .slice()
                .sort((a, b) => a.title.localeCompare(b.title)) // Sắp xếp theo title A-Z
                .map((category, idx) => (
                  <tr
                    className="border-b hover:bg-gray-50 transition duration-150"
                    key={category._id}
                  >
                    <td className="text-center py-3 px-2">
                      {(+params.get("page") > 1 ? +params.get("page") - 1 : 0) *
                        process.env.REACT_APP_LIMIT +
                        idx +
                        1}
                    </td>

                    <td className="text-center py-3 px-2">
                      <img
                        src={category.image}
                        alt="thumb"
                        className="w-14 h-14 object-cover border rounded-md"
                      />
                    </td>
                    <td className="text-center py-3 px-2">{category.title}</td>
                    <td className="text-center py-3 px-2">
                      {category.brand?.join(", ")}
                    </td>
                    <td className="text-center py-3 px-2">
                      {moment(category.createdAt).format("DD/MM/YYYY")}
                    </td>
                    <td className="text-center py-2">
                      <span
                        onClick={() => setEditCategory(category)}
                        className="text-blue-500 hover:text-orange-500 inline-block hover:underline cursor-pointer px-1"
                      >
                        <BiEdit size={20} />
                      </span>
                      <span
                        onClick={() => handleDeleteCategory(category._id)}
                        className="text-red-500 hover:text-orange-500 inline-block hover:underline cursor-pointer px-1"
                      >
                        <RiDeleteBin6Line size={20} />
                      </span>
                    </td>
                  </tr>
                ))
            ) : (
              <tr>
                <td colSpan="5" className="text-center py-6 text-gray-500">
                  Không tìm thấy danh mục.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ManageCategory;
