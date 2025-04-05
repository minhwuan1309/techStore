import React, { useState, useEffect, useCallback } from "react"
import {
  createSearchParams,
  useNavigate,
  useSearchParams,
} from "react-router-dom"
import { apiGetBlogs } from "../../apis/blog"
import DOMPurify from "dompurify"
import { Breadcrumb, Pagination, InputSelect } from "../../components"

const sorts = [
  { value: "createdAt", text: "Mới nhất" },
  { value: "-createdAt", text: "Cũ nhất" },
]

const BlogsPage = () => {
  const navigate = useNavigate()
  const [blogs, setBlogs] = useState(null)
  const [params] = useSearchParams()
  const [sort, setSort] = useState("createdAt")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const fetchBlogs = async (queries) => {
    setLoading(true)
    setError("")
    try {
      const response = await apiGetBlogs(queries)
      if (response.success) {
        setBlogs(response)
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
    fetchBlogs(q)
    window.scrollTo(0, 0)
  }, [params, sort])

  const changeValue = useCallback(
    (value) => {
      setSort(value)
      const currentParams = Object.fromEntries([...params])
      const newParams = { ...currentParams, sort: value }
      
      navigate({
        pathname: "/blogs",
        search: createSearchParams(newParams).toString()
      })
    },
    [params, navigate]
  )

  const handlePageChange = (pageNumber) => {
    const currentParams = Object.fromEntries([...params])
    navigate({
      pathname: "/blogs",
      search: createSearchParams({ 
        ...currentParams,
        page: pageNumber 
      }).toString()
    })
  }

  return (
    <div className="w-full bg-gray-50">
      <div className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 py-6 md:py-8">
        <div className="md:w-main w-screen px-4 md:px-0 m-auto">
          <h3 className="font-bold uppercase text-xl md:text-2xl text-white">Bài viết</h3>
          <div className="mt-2 text-white">
            <Breadcrumb category="blogs" />
          </div>
        </div>
      </div>

      <div className="md:w-main m-auto px-4 md:px-0">
        <div className="mt-4 md:mt-6 flex flex-col md:flex-row justify-between items-start md:items-center bg-white p-3 md:p-4 rounded-lg shadow-md">
          <div className="flex items-center gap-2 mb-3 md:mb-0">
            <label htmlFor="sort" className="font-medium text-gray-700 text-sm md:text-base">
              Sắp xếp:
            </label>
            <div className="w-[150px] md:w-[200px]">
              <InputSelect
                value={sort}
                options={sorts}
                changeValue={changeValue}
                wrapperStyles="w-full"
                inputStyles="py-2 rounded-lg border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm md:text-base"
              />
            </div>
          </div>
        </div>

        <div className="my-6 md:my-8">
          {loading ? (
            <div className="flex justify-center items-center h-40">
              <p className="text-center text-base md:text-lg text-gray-500">
                Đang tải dữ liệu...
              </p>
            </div>
          ) : error ? (
            <div className="bg-white rounded-lg shadow-lg p-6 md:p-8 text-center">
              <p className="text-center text-red-500 text-base md:text-lg">{error}</p>
            </div>
          ) : blogs && blogs.blogs.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
              {blogs.blogs.map((blog) => (
                <div
                  key={blog._id}
                  className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300"
                >
                  <div className="relative h-[180px] md:h-[200px] overflow-hidden">
                    <img
                      src={blog.image || "https://via.placeholder.com/300"}
                      alt={blog.title}
                      onClick={() => navigate(`/blogs/${blog._id}/${blog.title}`)}
                      className="w-full h-full object-cover cursor-pointer transform hover:scale-110 transition-transform duration-500"
                    />
                  </div>
                  <div className="p-3 md:p-4">
                    <h4
                      className="font-semibold text-base md:text-lg cursor-pointer text-indigo-600 hover:text-indigo-800 transition-colors duration-300 line-clamp-2"
                      onClick={() => navigate(`/blogs/${blog._id}/${blog.title}`)}
                    >
                      {blog.title}
                    </h4>
                    <div
                      className="text-xs md:text-sm text-gray-600 mt-2 leading-relaxed h-12 md:h-16 overflow-hidden"
                      dangerouslySetInnerHTML={{
                        __html: DOMPurify.sanitize(
                          blog.description?.length > 100
                            ? `${blog.description.substring(0, 100)}...`
                            : blog.description || "Không có nội dung mô tả."
                        ),
                      }}
                    />
                    <div className="mt-2 text-xs md:text-sm text-gray-500">
                      {new Date(blog.createdAt).toLocaleDateString('vi-VN')}
                    </div>
                    <button
                      className="mt-3 md:mt-4 w-full text-white font-medium bg-gradient-to-r from-indigo-500 to-purple-500 px-3 md:px-4 py-2 rounded-md hover:opacity-90 transition-all duration-300 flex items-center justify-center text-sm md:text-base"
                      onClick={() => navigate(`/blogs/${blog._id}/${blog.title}`)}
                    >
                      Xem bài viết
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow-lg p-6 md:p-8 text-center">
              <p className="text-center text-base md:text-lg text-gray-500">
                Không có bài viết nào.
              </p>
            </div>
          )}
        </div>
        
        <div className="my-6 md:my-8 flex justify-center md:justify-end">
          <Pagination
            totalCount={blogs?.counts}
            pageSize={blogs?.blogs?.length || 0}
            siblingCount={1}
            currentPage={blogs?.currentPage}
            onPageChange={handlePageChange}
            className="flex items-center gap-2"
          />
        </div>
      </div>
    </div>
  )
}

export default BlogsPage