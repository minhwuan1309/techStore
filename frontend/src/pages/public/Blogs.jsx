import React, { useState, useEffect } from "react"
import {
  useParams,
  createSearchParams,
  useNavigate,
  useSearchParams,
} from "react-router-dom"
import { apiGetBlogs } from "../../apis/blog"
import DOMPurify from "dompurify"
import { Breadcrumb, Pagination } from "components"

const BlogsPage = () => {
  const navigate = useNavigate()
  const [products, setProducts] = useState(null)
  const [blogs, setBlogs] = useState(null) // Trạng thái lưu danh sách blogs
  const [params] = useSearchParams() // Lấy tham số tìm kiếm từ URL
  const [sort, setSort] = useState("") // Trạng thái sắp xếp
  const [loading, setLoading] = useState(false) // Trạng thái tải
  const [error, setError] = useState("") // Trạng thái lỗi
  const { category } = useParams()

  // Hàm gọi API để lấy danh sách blogs
  const fetchBlogs = async (queries) => {
    setLoading(true)
    setError("")
    try {
      const response = await apiGetBlogs(queries)
      if (response.success) {
        setBlogs(response) // Gán dữ liệu blog từ API
      } else {
        setError("Không thể tải dữ liệu blogs.")
      }
    } catch (error) {
      setError("Đã xảy ra lỗi khi tải dữ liệu.")
      console.error("Error fetching blogs:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    const queries = Object.fromEntries([...params])
    const q = { ...queries, sort }
    fetchBlogs(q) // Gọi API với sort
    window.scrollTo(0, 0)
  }, [params, sort])
  useEffect(() => {
    if (sort) {
      navigate({
        pathname: `/${category}`,
        search: createSearchParams({ sort }).toString(),
      })
    }
  }, [sort, category, navigate])

  return (
    <div className="w-full bg-gray-50">
      {/* Bộ lọc và sắp xếp */}
      <div className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 py-8">
        <div className="md:w-main w-screen px-4 md:px-0 m-auto">
          <h3 className="font-bold uppercase text-2xl text-white">{category || "Bài viết"}</h3>
          <div className="mt-2 text-white">
            <Breadcrumb category={category || "Bài viết"} />
          </div>
        </div>
      </div>

      <div className="md:w-main m-auto px-4 md:px-0">
        <div className="mt-6 flex justify-between items-center bg-white p-4 rounded-lg shadow-md">
          <div className="flex items-center gap-2">
            <label htmlFor="sort" className="font-medium text-gray-700">
              Sắp xếp:
            </label>
            <select
              id="sort"
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              className="border border-gray-300 px-3 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="createdAt:desc">Mới nhất</option>
              <option value="createdAt:asc">Cũ nhất</option>
            </select>
          </div>
        </div>

        {/* Nội dung chính */}
        <div className="my-8">
          {loading ? (
            <div className="flex justify-center items-center h-40">
              <p className="text-center text-lg text-gray-500">
                Đang tải dữ liệu...
              </p>
            </div>
          ) : error ? (
            <div className="bg-white rounded-lg shadow-lg p-8 text-center">
              <p className="text-center text-red-500 text-lg">{error}</p>
            </div>
          ) : blogs && blogs.blogs.length > 0 ? (
            <div className="grid lg:grid-cols-3 md:grid-cols-2 grid-cols-1 gap-6">
              {blogs.blogs.map((blog) => (
                <div
                  key={blog._id}
                  className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300"
                >
                  <div className="relative h-[200px] overflow-hidden">
                    <img
                      src={blog.image || "https://via.placeholder.com/300"}
                      alt={blog.title}
                      onClick={() =>
                        navigate(
                          `/blogs/${blog._id}/${encodeURIComponent(blog.title)}`
                        )
                      }
                      className="w-full h-full object-cover cursor-pointer transform hover:scale-110 transition-transform duration-500"
                    />
                  </div>
                  <div className="p-4">
                    <h4
                      className="font-semibold text-lg cursor-pointer text-indigo-600 hover:text-indigo-800 transition-colors duration-300"
                      onClick={() =>
                        navigate(
                          `/blogs/${blog._id}/${encodeURIComponent(blog.title)}`
                        )
                      }
                    >
                      {blog.title}
                    </h4>
                    <div
                      className="text-sm text-gray-600 mt-2 leading-relaxed h-16 overflow-hidden"
                      dangerouslySetInnerHTML={{
                        __html: DOMPurify.sanitize(
                          blog.description?.length > 100
                            ? `${blog.description.substring(0, 100)}...`
                            : blog.description || "Không có nội dung mô tả."
                        ),
                      }}
                    />
                    <button
                      className="mt-4 w-full text-white font-medium bg-gradient-to-r from-indigo-500 to-purple-500 px-4 py-2 rounded-md hover:opacity-90 transition-all duration-300 flex items-center justify-center"
                      onClick={() =>
                        navigate(
                          `/blogs/${blog._id}/${encodeURIComponent(blog.title)}`
                        )
                      }
                    >
                      Xem bài viết
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow-lg p-8 text-center">
              <p className="text-center text-lg text-gray-500">
                Không có bài viết nào.
              </p>
            </div>
          )}
        </div>
        
        <div className="my-8 flex justify-end">
          <Pagination totalCount={blogs?.counts} />
        </div>
      </div>
    </div>
  )
}

export default BlogsPage