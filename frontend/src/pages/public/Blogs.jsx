import React, { useState, useEffect } from "react";
import {
  useParams,
  createSearchParams,
  useNavigate,
  useSearchParams,
} from "react-router-dom";
import { apiGetBlogs } from "../../apis/blog";
import DOMPurify from "dompurify";
import { Breadcrumb, Pagination } from "components";


const BlogsPage = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState(null)
  const [blogs, setBlogs] = useState(null); // Trạng thái lưu danh sách blogs
  const [params] = useSearchParams(); // Lấy tham số tìm kiếm từ URL
  const [sort, setSort] = useState(""); // Trạng thái sắp xếp
  const [loading, setLoading] = useState(false); // Trạng thái tải
  const [error, setError] = useState(""); // Trạng thái lỗi
  const { category } = useParams();

  // Hàm gọi API để lấy danh sách blogs
  const fetchBlogs = async (queries) => {
    setLoading(true);
    setError("");
    try {
      const response = await apiGetBlogs(queries);
      if (response.success) {
        setBlogs(response); // Gán dữ liệu blog từ API
      } else {
        setError("Không thể tải dữ liệu blogs.");
      }
    } catch (error) {
      setError("Đã xảy ra lỗi khi tải dữ liệu.");
      console.error("Error fetching blogs:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const queries = Object.fromEntries([...params]);
    const q = { ...queries, sort };
    fetchBlogs(q); // Gọi API với sort
    window.scrollTo(0, 0);
  }, [params, sort]);
  useEffect(() => {
    if (sort) {
      navigate({
        pathname: `/${category}`,
        search: createSearchParams({ sort }).toString(),
      });
    }
  }, [sort, category, navigate]);

  return (
    <div className="w-full">
      {/* Bộ lọc và sắp xếp */}
      <div className="h-[81px] flex justify-center items-center bg-gray-100">
        <div className="lg:w-main w-screen px-4 lg:px-0">
          <h3 className="font-semibold uppercase">{category || "Bài viết"}</h3>
          <Breadcrumb category={category || "Bài viết"} />
        </div>
      </div>
      <div className="w-main m-auto mt-4 flex justify-between items-center bg-gray-50 p-4 rounded-md shadow-sm">
        <div className="flex items-center gap-2">
          <label htmlFor="sort" className="font-medium">
            Sắp xếp:
          </label>
          <select
            id="sort"
            value={sort}
            onChange={(e) => setSort(e.target.value)}
            className="border border-gray-300 px-3 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="createdAt:desc">Mới</option>
            <option value="createdAt:asc">Cũ</option>
          </select>
        </div>
      </div>

      {/* Nội dung chính */}
      <div className="mt-8 w-main m-auto">
        {loading ? (
          <p className="text-center text-lg text-gray-500">
            Đang tải dữ liệu...
          </p>
        ) : error ? (
          <p className="text-center text-red-500 text-lg">{error}</p>
        ) : blogs && blogs.blogs.length > 0 ? (
          <div className="grid lg:grid-cols-3 md:grid-cols-2 grid-cols-1 gap-6">
            {blogs.blogs.map((blog) => (
              <div
                key={blog._id}
                className="border p-4 rounded-md shadow-md hover:shadow-lg transition-all duration-300 bg-white"
              >
                <img
                  src={blog.image || "https://via.placeholder.com/300"}
                  alt={blog.title}
                  onClick={() =>
                    navigate(
                      `/blogs/${blog._id}/${encodeURIComponent(blog.title)}`
                    )
                  }
                  className="w-full h-[200px] object-cover rounded-md mb-4 cursor-pointer hover:opacity-90 transition-opacity duration-300"
                />
                <h4
                  className="font-semibold text-lg cursor-pointer text-main hover:underline"
                  onClick={() =>
                    navigate(
                      `/blogs/${blog._id}/${encodeURIComponent(blog.title)}`
                    )
                  }
                >
                  {blog.title}
                </h4>
                <p
                  className="text-sm text-gray-600 mt-2 leading-relaxed"
                  dangerouslySetInnerHTML={{
                    __html: DOMPurify.sanitize(
                      blog.description?.length > 100
                        ? `${blog.description.substring(0, 100)}...`
                        : blog.description || "Không có nội dung mô tả."
                    ),
                  }}
                />
                <button
                  className="text-white bg-red-500 px-4 py-2 mt-4 rounded-md hover:bg-red-600 transition-all"
                  onClick={() =>
                    navigate(
                      `/blogs/${blog._id}/${encodeURIComponent(blog.title)}`
                    )
                  }
                >
                  Xem bài viết
                </button>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-center text-lg text-gray-500">
            Không có bài viết nào.
          </p>
        )}
      </div>
      <div className="w-main m-auto my-4 flex justify-end">
        <Pagination totalCount={blogs?.counts} />
      </div>
      <div className="w-full h-[300px]"></div>
    </div>
  );
};

export default BlogsPage;
