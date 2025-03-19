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
    <div className="w-full bg-gray-50">
      {/* Header banner */}
      <div className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 py-8">
        <div className="md:w-main w-screen px-4 md:px-0 m-auto">
          <h1 className="text-3xl font-bold text-white">{blog?.title}</h1>
          <div className="flex items-center mt-4 text-white text-base space-x-4">
            <span>
              <strong>Tác giả:</strong> {blog?.author || "Ẩn danh"}
            </span>
            <span>
              <strong>Ngày đăng:</strong>{" "}
              {moment(blog?.createdAt).format("DD/MM/YYYY")}
            </span>
          </div>
        </div>
      </div>

      <div className="md:w-main m-auto px-4 md:px-0">
        {/* Nút quay lại */}
        <div className="flex mt-6 mb-4 justify-end">
          <button
            onClick={(e) => {
              e.preventDefault();
              navigate("/blogs");
            }}
            className="text-indigo-600 hover:text-indigo-800 font-semibold flex items-center transition-colors duration-300"
          >
            ← Quay lại danh sách bài viết
          </button>
        </div>

        {/* Nội dung bài viết */}
        <div className="bg-white rounded-lg shadow-lg p-6 md:p-8 mb-8">
          {/* Nội dung chính */}
          <div
            className="prose prose-indigo max-w-none mt-6 leading-7 text-gray-700"
            dangerouslySetInnerHTML={{
              __html: DOMPurify.sanitize(blog?.description),
            }}
          ></div>

          {/* Nút chia sẻ */}
          <div className="mt-12 pt-6 border-t border-gray-200">
            <h4 className="font-semibold text-gray-800 mb-4">Chia sẻ bài viết:</h4>
            <div className="flex flex-wrap gap-3">
              <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-all duration-300 flex items-center justify-center">
                Chia sẻ trên Facebook
              </button>
              <button className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition-all duration-300 flex items-center justify-center">
                Chia sẻ trên Twitter
              </button>
              <button className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-all duration-300 flex items-center justify-center">
                Sao chép liên kết
              </button>
            </div>
          </div>
        </div>

        {/* Bài viết liên quan (giả) */}
        <div className="bg-white rounded-lg shadow-lg p-6 md:p-8 mb-8">
          <h3 className="text-2xl font-semibold text-gray-800 mb-6">Bài Viết Liên Quan</h3>
          <div className="border-b-2 border-indigo-600 mb-6"></div>
          
          <div className="grid md:grid-cols-3 grid-cols-1 gap-6">
            {[1, 2, 3].map((item) => (
              <div key={item} className="border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow duration-300">
                <div className="h-40 bg-gray-200"></div>
                <div className="p-4">
                  <h4 className="font-medium text-gray-800">Bài viết gợi ý {item}</h4>
                  <p className="text-sm text-gray-500 mt-2">Nội dung mô tả ngắn gọn về bài viết liên quan đến chủ đề.</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default DetailBlogs