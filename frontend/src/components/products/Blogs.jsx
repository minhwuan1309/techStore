import { apiGetBlogs } from "apis/blog"
import React, { useEffect, useState } from "react"
import { Link } from "react-router-dom"
import path from "utils/path"

const Blogs = () => {
  const [blogs, setBlogs] = useState()
  const fetchBlogs = async () => {
    const response = await apiGetBlogs({ limit: 4 })
    if (response.success) setBlogs(response.blogs)
  }
  useEffect(() => {
    fetchBlogs()
  }, [])
  return (
    <>
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-2xl font-semibold text-gray-800">
        </h3>
        <Link to={`/${path.BLOGS}`} className="text-indigo-600 hover:text-indigo-800 font-medium">
          Xem tất cả
        </Link>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {blogs?.map((el) => (
          <div key={el.id} className="rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 overflow-hidden bg-white">
            <div className="relative overflow-hidden">
              <img
                src={el.image}
                alt={el.title}
                className="w-full h-48 object-cover transform hover:scale-105 hover:cursor-pointer transition-transform duration-500"
              />
              <div className="absolute bottom-0 left-0 bg-indigo-600 text-white text-xs font-medium px-2 py-1">
                {new Date(el.createdAt).toLocaleDateString()}
              </div>
            </div>
            <div className="p-4">
              <Link
                to={`/${path.BLOGS}/${el.id}/${el.title}`}
                className="text-gray-800 hover:text-indigo-600 font-medium text-lg line-clamp-2 mb-2"
              >
                {el.title}
              </Link>
              <Link
                to={`/${path.BLOGS}/${el.id}/${el.title}`}
                className="text-indigo-600 hover:text-indigo-800 text-sm font-medium flex items-center mt-3"
              >
                Đọc bài viết
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </div>
          </div>
        ))}
      </div>
    </>
  )
}

export default Blogs