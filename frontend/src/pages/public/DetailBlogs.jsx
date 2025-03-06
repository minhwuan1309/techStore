import { apiGetBlogById } from "apis/blog"
import DOMPurify from "dompurify"
import moment from "moment"
import React, { useEffect, useState } from "react"
import { useNavigate, useParams } from "react-router-dom"

const DetailBlogs = () => {
  const { id } = useParams()
  const [blog, setBlog] = useState()
  const navigate = useNavigate();
  const fetchBlog = async () => {
    const response = await apiGetBlogById(id)
    if (response.success) setBlog(response.rs)
  }
  useEffect(() => {
    if (id) fetchBlog()
  }, [id])
  return (
    <div className="w-main mx-auto my-8 p-4 bg-white shadow-md rounded-lg">
      {/* Quay lại */}
      <div className="flex mb-4 justify-end">
        <button
          href="#"
          onClick={(e) => {
            e.preventDefault(); // Ngăn chặn tải lại trang
            navigate("/blogs"); // Điều hướng về trang blogs
          }}
          className="text-gray-700 hover:underline text-base font-semibold flex items-center hover:text-main"
        >
          ← Quay lại danh sách bài viết
        </button>
      </div>

      {/* Tiêu đề bài viết */}
      <h1 className="text-3xl font-bold text-gray-800">{blog?.title}</h1>

      {/* Thông tin bổ sung */}
      <div className="flex items-center mt-4 text-gray-600 text-base space-x-4">
        <span>
          <strong>Được đăng bởi:</strong> {blog?.author || "Ẩn danh"}
        </span>
        <span>
          <strong>Ngày đăng:</strong>{" "}
          {moment(blog?.createdAt).format("DD/MM/YYYY")}
        </span>
      </div>

      {/* Nội dung bài viết */}
      <div
        className="mt-4 leading-7 text-gray-700 text-justify"
        dangerouslySetInnerHTML={{
          __html: DOMPurify.sanitize(blog?.description),
        }}
      ></div>

      {/* Nút chia sẻ */}
      <div className="mt-8 flex justify-start space-x-4">
        <button className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-all">
          Chia sẻ trên Facebook
        </button>
        <button className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition-all">
          Chia sẻ trên Twitter
        </button>
        <button className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 transition-all">
          Sao chép liên kết
        </button>
      </div>

      {/* Khoảng cách cuối trang */}
      <div className="w-full h-[100px]"></div>
    </div>
  );
}

export default DetailBlogs
