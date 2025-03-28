import React, { useCallback, useEffect, useState } from "react"
import { CustomizeVarriants, InputForm, Pagination } from "components"
import { useForm } from "react-hook-form"
import { apiGetProducts, apiDeleteProduct } from "apis/product"
import moment from "moment"
import {
  useSearchParams,
  createSearchParams,
  useNavigate,
  useLocation,
} from "react-router-dom"
import useDebounce from "hooks/useDebounce"
import UpdateProduct from "./UpdateProduct"
import Swal from "sweetalert2"
import { toast } from "react-toastify"
import { BiEdit, BiCustomize } from "react-icons/bi"
import { RiDeleteBin6Line } from "react-icons/ri"
import { formatMoney, fotmatPrice} from "utils/helpers";
import clsx from 'clsx'

const ManageProducts = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const [params] = useSearchParams()
  const {
    register,
    formState: { errors },
    watch,
  } = useForm()
  const [products, setProducts] = useState(null)
  const [counts, setCounts] = useState(0)
  const [editProduct, setEditProduct] = useState(null)
  const [update, setUpdate] = useState(false)
  const [customizeVarriant, setCustomizeVarriant] = useState(null)
  const [sortColumn, setSortColumn] = useState(null);
  const [sortOrder, setSortOrder] = useState("asc");
  const [searchTerm, setSearchTerm] = useState("");

  const render = useCallback(() => {
    setUpdate(!update)
  })
  const filteredProducts = searchTerm
    ? products?.filter((item) =>
        item.title.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : products;

  const fetchProducts = async (params) => {
    const response = await apiGetProducts({
      ...params,
      limit: 8,
    })
    if (response.success) {
      setCounts(response.counts)
      setProducts(response.products)
    }
  }
  const queryDecounce = useDebounce(watch("q"), 800)
  useEffect(() => {
    if (queryDecounce) {
      navigate({
        pathname: location.pathname,
        search: createSearchParams({ q: queryDecounce }).toString(),
      })
    } else
      navigate({
        pathname: location.pathname,
      })
  }, [queryDecounce])

  useEffect(() => {
    const searchParams = Object.fromEntries([...params])
    fetchProducts(searchParams)
  }, [params, update])

  const handleDeleteProduct = (pid) => {
    Swal.fire({
      title: "Cảnh báo!",
      text: "Bạn có muốn xoá sản phẩm này không?",
      icon: "warning",
      showCancelButton: true,
    }).then(async (rs) => {
      if (rs.isConfirmed) {
        const response = await apiDeleteProduct(pid)
        if (response.success) toast.success(response.mes)
        else toast.error(response.mes)
        render()
      }
    })
  }

  const handleSort = (column) => {
    const newOrder =
      sortColumn === column && sortOrder === "asc" ? "desc" : "asc";
    setSortColumn(column);
    setSortOrder(newOrder);

    const sortedData = [...products].sort((a, b) => {
      const valueA =
        typeof a[column] === "string" ? a[column].toLowerCase() : a[column];
      const valueB =
        typeof b[column] === "string" ? b[column].toLowerCase() : b[column];

      if (newOrder === "asc") {
        return valueA > valueB ? 1 : -1;
      }
      return valueA < valueB ? 1 : -1;
    });

    setProducts(sortedData);
  };
  const renderSortIcon = (column) => {
    if (sortColumn !== column) return null;
    return sortOrder === "asc" ? "🔼" : "🔽";
  };

  const handleSearchChange = (event) => {
    const value = event.target.value;
    setSearchTerm(value);

    if (value.trim() === "") {
      navigate({
        pathname: location.pathname,
      });
    } else {
      navigate({
        pathname: location.pathname,
        search: createSearchParams({ q: value }).toString(),
      });
    }
  };

  return (
    <div className={clsx("w-full bg-white/30 backdrop-blur-xl rounded-2xl p-6 shadow-2xl", editProduct && "pl-16")}>
      {editProduct && (
        <div className="absolute inset-0 min-h-screen bg-white/30 backdrop-blur-xl z-50">
          <UpdateProduct
            editProduct={editProduct}
            render={render}
            setEditProduct={setEditProduct}
          />
        </div>
      )}
      {customizeVarriant && (
        <div className="absolute inset-0 min-h-screen bg-white/30 backdrop-blur-xl z-50">
          <CustomizeVarriants
            customizeVarriant={customizeVarriant}
            render={render}
            setCustomizeVarriant={setCustomizeVarriant}
          />
        </div>
      )}
      
      <h1 className="flex justify-between items-center text-3xl font-bold mb-6 pb-4 border-b-2 border-transparent">
        <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-500 to-pink-500">
          Quản lý sản phẩm
        </span>
      </h1>

      <div className="w-full">
        <div className="flex justify-end py-2">
          <input
            type="text"
            placeholder="Tìm kiếm theo tên sản phẩm..."
            value={searchTerm}
            onChange={handleSearchChange}
            className="h-11 bg-white/50 backdrop-blur-sm border border-purple-200 rounded-xl w-[50%]"
          />
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full border-collapse rounded-2xl overflow-hidden">
            <thead className="bg-gradient-to-r from-purple-600 to-pink-500 text-white">
              <tr>
                <th className="px-6 py-4 text-left">#</th>
                <th className="px-6 py-4 text-left">Ảnh</th>
                <th 
                  className="px-6 py-4 text-left cursor-pointer"
                  onClick={() => handleSort("title")}
                >
                  Tên sản phẩm {renderSortIcon("title")}
                </th>
                <th 
                  className="px-6 py-4 text-left cursor-pointer"
                  onClick={() => handleSort("brand")}
                >
                  Brand {renderSortIcon("brand")}
                </th>
                <th 
                  className="px-6 py-4 text-left cursor-pointer"
                  onClick={() => handleSort("category")}
                >
                  Loại {renderSortIcon("category")}
                </th>
                <th 
                  className="px-6 py-4 text-left cursor-pointer"
                  onClick={() => handleSort("price")}
                >
                  Giá {renderSortIcon("price")}
                </th>
                <th 
                  className="px-6 py-4 text-left cursor-pointer"
                  onClick={() => handleSort("quantity")}
                >
                  Số lượng {renderSortIcon("quantity")}
                </th>
                <th 
                  className="px-6 py-4 text-left cursor-pointer"
                  onClick={() => handleSort("sold")}
                >
                  Đã bán {renderSortIcon("sold")}
                </th>
                <th 
                  className="px-6 py-4 text-left cursor-pointer"
                  onClick={() => handleSort("color")}
                >
                  Màu {renderSortIcon("color")}
                </th>
                <th 
                  className="px-6 py-4 text-left cursor-pointer"
                  onClick={() => handleSort("rating")}
                >
                  Đánh giá {renderSortIcon("rating")}
                </th>
                <th 
                  className="px-6 py-4 text-left cursor-pointer"
                  onClick={() => handleSort("createdAt")}
                >
                  Thời gian tạo {renderSortIcon("createdAt")}
                </th>
                <th className="px-6 py-4 text-center">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {products?.length > 0 ? (
                products.map((el, idx) => (
                  <tr key={el._id} className="border-b hover:bg-purple-50/50 transition-all">
                    <td className="py-4 px-6">{idx + 1}</td>
                    <td className="py-4 px-6">
                      <img
                        src={el.thumb}
                        alt="thumb"
                        className="w-14 h-14 object-cover border rounded-md"
                      />
                    </td>
                    <td className="py-4 px-6">{el.title}</td>
                    <td className="py-4 px-6">{el.brand?.title || "Không có thương hiệu"}</td>

                    <td className="py-4 px-6">{el.category?.title}</td>
                    <td className="py-4 px-6 text-green-500 font-semibold">
                      {`${formatMoney(fotmatPrice(el.price))} VNĐ`}
                    </td>
                    <td className="py-4 px-6">{el.quantity}</td>
                    <td className="py-4 px-6">{el.sold}</td>
                    <td className="py-4 px-6">{el.color}</td>
                    <td className="py-4 px-6">{el.totalRatings}⭐</td>
                    <td className="py-4 px-6">
                      {moment(el.createdAt).format("DD/MM/YYYY")}
                    </td>
                    <td className="py-4 px-6 text-center space-x-2">
                      <button 
                        type="button"
                        onClick={() => setEditProduct(el)}
                        className="text-purple-600 hover:bg-purple-100 p-2 rounded-full transition-all"
                      >
                        Cập nhật
                      </button>
                      <button 
                        type="button"
                        onClick={() => handleDeleteProduct(el._id)}
                        className="text-red-600 hover:bg-red-100 p-2 rounded-full transition-all"
                      >
                        Xoá
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="12" className="text-center py-6 text-gray-500">
                    Không tìm thấy sản phẩm.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="w-full flex justify-end mt-4">
          <Pagination totalCount={counts} />
        </div>
      </div>
    </div>
  );
}

export default ManageProducts