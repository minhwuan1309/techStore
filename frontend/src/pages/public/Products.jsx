import React, { useState, useEffect, useCallback } from "react"
import {
  useParams,
  useSearchParams,
  createSearchParams,
  useNavigate,
} from "react-router-dom"
import {
  Breadcrumb,
  Product,
  SearchItem,
  InputSelect,
  Pagination,
  InputField,
} from "../../components"
import { apiGetProducts } from "../../apis"
import { sorts } from "../../utils/contants"
import useDebounce from "../../hooks/useDebounce"
import { set } from "lodash"
import { formatTitle } from "utils/helpers"

const Products = () => {
  const navigate = useNavigate()
  const [products, setProducts] = useState(null)
  const [activeClick, setActiveClick] = useState(null)
  const [params, setParams] = useSearchParams()
  const [sort, setSort] = useState("")
  const [queries, setQueries] = useState({ q: "" })
  const [searchQuery, setSearchQuery] = useState("")
  const [filterPrice, setFilterPrice] = useState({ from: "", to: "" })
  const { category } = useParams()
  const [selectedColor, setSelectedColor] = useState(null)
  const categoryTitle = products?.[0]?.category?.title || formatTitle(category || "Sản phẩm");

  const queriesDebounce = useDebounce(queries.q, 800)


  const fetchProductsByCategory = async (queries) => {
    if (category && category !== "products") {
      const decodedCategory = decodeURIComponent(category);
      queries.category = decodedCategory;
    }    
    queries.limit = 8
    const response = await apiGetProducts(queries)
    if (response.success) setProducts(response)
  }

  useEffect(() => {
    fetchProductsByCategory({})
    window.scrollTo(0, 0)
  }, [category])

  useEffect(() => {
    const qParam = params.get("q");
    if (qParam) {
      setSearchQuery(qParam);
    }
  }, [params])

  
  useEffect(() => {
    if (sort) {
      navigate(`/${category}`)
    }
  }, [sort])

  useEffect(() => {
    const queryObj = Object.fromEntries([...params])
    const finalQuery = {}
  
    // Remove empty query parameters
    Object.keys(queryObj).forEach(key => {
      if (queryObj[key] !== '') {
        finalQuery[key] = queryObj[key]
      }
    })

    // Tìm theo khoảng giá
    if (queryObj.to && queryObj.from) {
      finalQuery.$and = [
        { price: { gte: queryObj.from } },
        { price: { lte: queryObj.to } },
      ]
    } else {
      if (queryObj.from) finalQuery.price = { gte: queryObj.from }
      if (queryObj.to) finalQuery.price = { lte: queryObj.to }
    }
  
    // Merge các query còn lại
    const merged = {
      ...finalQuery,
    }
  
    delete merged.to
    delete merged.from
  
    fetchProductsByCategory(merged)
    window.scrollTo(0, 0)
  }, [params])
  
  
  useEffect(() => {
    if (queriesDebounce !== undefined) {
      const currentParams = Object.fromEntries([...params])
      const newParams = {}
      
      // Copy existing params except 'q'
      Object.keys(currentParams).forEach(key => {
        if (key !== 'q' && currentParams[key] !== '') {
          newParams[key] = currentParams[key]
        }
      })
      
      // Add search query if it exists
      if (queriesDebounce?.trim()) {
        newParams.q = queriesDebounce
      }
  
      navigate({
        pathname: `/${category || "products"}`,
        search: createSearchParams(newParams).toString(),
      })
  
      fetchProductsByCategory(newParams)
    }
  }, [queriesDebounce, category])
  
  // Reset search when changing category
  useEffect(() => {
    setQueries({ q: "" })
  }, [category])

  const changeActiveFilter = useCallback(
    (name) => {
      if (activeClick === name) setActiveClick(null)
      else setActiveClick(name)
    },
    [activeClick]
  )

  const changeValue = useCallback(
    (value) => {
      setSort(value)
      navigate(`/${category}`)
    },
    [sort]
  )

  const handleApplyPriceFilter = () => {
    if (filterPrice.from || filterPrice.to) {
      fetchProductsByCategory({
        from: filterPrice.from,
        to: filterPrice.to
      })
    }
  }

  const handleColorFilter = (color) => {
    setSelectedColor(color)
    fetchProductsByCategory({ color })
  }

  const handleSearchChange = (event) => {
    const value = event.target.value
    setQueries(prev => ({ ...prev, q: value }))
  }

  return (
    <div className="w-full bg-gray-50">
      <div className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 py-8">
        <div className="md:w-main w-screen px-4 md:px-0 m-auto">
          <h3 className="font-bold uppercase text-2xl text-white">Sản phẩm</h3>
          <div className="mt-2 text-white">
            <Breadcrumb category="products" />
          </div>
        </div>
      </div>

      {/* Filters & Controls */}
      <div className="lg:w-main w-full px-4 m-auto mt-8">
        <div className="bg-white rounded-xl shadow-lg p-4 md:p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
            {/* Search by Name */}
            <div className="flex flex-col gap-2">
              <label className="font-medium text-gray-700">
                Tìm theo tên sản phẩm
              </label>
              <div className="relative">
                <InputField
                  nameKey="q"
                  value={queries.q}
                  setValue={setQueries}
                  placeholder="Nhập tên sản phẩm..."
                  fullWidth
                  isHideLabel
                />
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 text-gray-400 absolute left-3 top-3.5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
              </div>
            </div>

            {/* Filter by Price & Color */}
            <div className="flex flex-col gap-2">
              <label className="font-medium text-gray-700">Lọc theo</label>
              <div className="flex flex-wrap gap-2 md:gap-3">
                <button
                  onClick={() => changeActiveFilter("price")}
                  className={`px-3 md:px-4 py-2 rounded-lg border transition-all ${
                    activeClick === "price"
                      ? "bg-indigo-600 text-white border-indigo-600"
                      : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-4 w-4 md:h-5 md:w-5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    <span className="text-sm md:text-base">Giá</span>
                  </div>
                </button>
                <button
                  onClick={() => changeActiveFilter("color")}
                  className={`px-3 md:px-4 py-2 rounded-lg border transition-all ${
                    activeClick === "color"
                      ? "bg-indigo-600 text-white border-indigo-600"
                      : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-4 w-4 md:h-5 md:w-5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01"
                      />
                    </svg>
                    <span className="text-sm md:text-base">Màu sắc</span>
                  </div>
                </button>
              </div>
            </div>

            {/* Sort Options */}
            <div className="flex flex-col gap-2">
              <label className="font-medium text-gray-700">Sắp xếp theo</label>
              <InputSelect
                value={sort}
                options={sorts}
                changeValue={changeValue}
                wrapperStyles="w-full"
                inputStyles="py-2 md:py-3 rounded-lg border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
          </div>

          {/* Active Filter Panels */}
          {activeClick === "price" && (
            <div className="mt-4 md:mt-6 p-4 md:p-5 bg-gray-50 rounded-lg border border-gray-200">
              <h3 className="text-lg font-medium text-gray-800 mb-4">
                Lọc theo giá
              </h3>
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex flex-col gap-2 flex-1">
                  <label className="text-sm text-gray-600">Từ</label>
                  <input
                    type="number"
                    value={filterPrice.from}
                    onChange={(e) =>
                      setFilterPrice({ ...filterPrice, from: e.target.value })
                    }
                    placeholder="0 VNĐ"
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all outline-none"
                  />
                </div>
                <div className="flex flex-col gap-2 flex-1">
                  <label className="text-sm text-gray-600">Đến</label>
                  <input
                    type="number"
                    value={filterPrice.to}
                    onChange={(e) =>
                      setFilterPrice({ ...filterPrice, to: e.target.value })
                    }
                    placeholder="1.000.000 VNĐ"
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all outline-none"
                  />
                </div>
                <div className="flex items-end mt-2 md:mt-0">
                  <button
                    onClick={handleApplyPriceFilter}
                    className="w-full md:w-auto bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 transition-all"
                  >
                    Áp dụng
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Bộ lọc màu */}
          {activeClick === "color" && (
            <div className="mt-4 md:mt-6 p-4 md:p-5 bg-gray-50 rounded-lg border border-gray-200">
              <h3 className="text-lg font-medium text-gray-800 mb-4">
                Lọc theo màu sắc
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 md:gap-3">
                {[
                  "Đỏ",
                  "Xanh",
                  "Vàng",
                  "Đen",
                  "Trắng",
                  "Nâu",
                  "Hồng",
                  "Tím",
                ].map((color, index) => (
                  <button
                    key={index}
                    onClick={() => handleColorFilter(color)}
                    className={`px-3 md:px-4 py-2 border rounded-lg transition-all ${
                      selectedColor === color
                        ? "bg-indigo-600 text-white border-indigo-600"
                        : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
                    }`}
                  >
                    {color}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Product Listing */}
      <div className="lg:w-main w-full px-4 m-auto mt-8">
        <div className="bg-white rounded-xl shadow-lg p-4 md:p-6">

          {/* Product Grid */}
          {products?.products?.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
              {products?.products?.map((product) => (
                <Product key={product._id} productData={product} />
              ))}
            </div>
          ) : (
            <div className="text-center py-8 md:py-12">
              <div className="flex justify-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-12 w-12 md:h-16 md:w-16 text-gray-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <h3 className="mt-4 text-lg md:text-xl font-medium text-gray-700">
                Không tìm thấy sản phẩm
              </h3>
              <p className="mt-2 text-sm md:text-base text-gray-500">
                Vui lòng thử lại với các bộ lọc khác
              </p>
              <button
                onClick={() => {
                  navigate(`/${category || "products"}`)
                  setSearchQuery("")
                  setActiveClick(null)
                }}
                className="mt-4 px-4 md:px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-all text-sm md:text-base"
              >
                Xóa bộ lọc
              </button>
            </div>
          )}

          {/* Pagination */}
          {products?.products?.length > 0 && (
            <div className="mt-6 md:mt-8 flex justify-center">
              <Pagination
                totalCount={products?.counts}
                pageSize={products?.products?.length || 0}
                siblingCount={1}
                currentPage={products?.currentPage}
                className="flex items-center gap-2"
              />
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default Products
