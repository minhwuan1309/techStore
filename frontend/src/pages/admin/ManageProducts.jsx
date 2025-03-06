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

    setProducts(sortedData); // Cập nhật danh sách sản phẩm
  };
  const renderSortIcon = (column) => {
    if (sortColumn !== column) return null;
    return sortOrder === "asc" ? "🔼" : "🔽";
  };


  const handleSearchChange = (event) => {
    const value = event.target.value;
    setSearchTerm(value);

    if (value.trim() === "") {
      // Nếu input trống, reset query
      navigate({
        pathname: location.pathname,
      });
    } else {
      // Nếu có từ khóa, thêm `q` vào URL
      navigate({
        pathname: location.pathname,
        search: createSearchParams({ q: value }).toString(),
      });
    }
  };



  return (
    <div className="w-full flex flex-col gap-4 relative">
      {editProduct && (
        <div className="absolute inset-0 min-h-screen bg-gray-100 z-50">
          <UpdateProduct
            editProduct={editProduct}
            render={render}
            setEditProduct={setEditProduct}
          />
        </div>
      )}
      {customizeVarriant && (
        <div className="absolute inset-0 min-h-screen bg-gray-100 z-50">
          <CustomizeVarriants
            customizeVarriant={customizeVarriant}
            render={render}
            setCustomizeVarriant={setCustomizeVarriant}
          />
        </div>
      )}
      <div className="h-[69px] w-full"></div>
      <div className="p-4 border-b w-full bg-gray-100 flex justify-between items-center fixed top-0">
        <h1 className="text-3xl font-bold tracking-tight">Quản lý sản phẩm</h1>
      </div>

      <div className="px-4 mt-6 w-full">
        <div className="flex justify-end items-center px-4">
            <input
              type="text"
              placeholder="Tìm kiếm theo tên sản phẩm..."
              value={searchTerm}
              onChange={handleSearchChange}
              className="w-[50%] mb-4 border border-gray-500 rounded-md focus:ring-blue-500 focus:outline-none py-4 px-4 shadow-sm text-base"
            />
        </div>
        <table className="table-auto w-full border-collapse border border-gray-300 text-gray-700 bg-white rounded-md shadow">
          <thead>
            <tr className="font-bold bg-gray-700 text-[15px] text-white">
              <th className="text-center py-3 px-2">STT</th>
              <th className="text-center py-3 px-2">Ảnh</th>
              <th
                className="text-center py-3 px-2 cursor-pointer"
                onClick={() => handleSort("title")}
              >
                Tên sản phẩm {renderSortIcon("title")}
              </th>
              <th
                className="text-center py-3 px-2 cursor-pointer"
                onClick={() => handleSort("brand")}
              >
                Brand {renderSortIcon("brand")}
              </th>
              <th
                className="text-center py-3 px-2 cursor-pointer"
                onClick={() => handleSort("category")}
              >
                Loại {renderSortIcon("category")}
              </th>
              <th
                className="text-center py-3 px-2 cursor-pointer"
                onClick={() => handleSort("price")}
              >
                Giá {renderSortIcon("price")}
              </th>
              <th
                className="text-center py-3 px-2 cursor-pointer"
                onClick={() => handleSort("quantity")}
              >
                Số lượng {renderSortIcon("quantity")}
              </th>
              <th
                className="text-center py-3 px-2 cursor-pointer"
                onClick={() => handleSort("sold")}
              >
                Đã bán {renderSortIcon("sold")}
              </th>
              <th
                className="text-center py-3 px-2 cursor-pointer"
                onClick={() => handleSort("color")}
              >
                Màu {renderSortIcon("color")}
              </th>
              <th
                className="text-center py-3 px-2 cursor-pointer"
                onClick={() => handleSort("rating")}
              >
                Đánh giá {renderSortIcon("rating")}
              </th>
              <th
                className="text-center py-3 px-2 cursor-pointer"
                onClick={() => handleSort("createdAt")}
              >
                Thời gian tạo {renderSortIcon("createdAt")}
              </th>
              <th className="text-center py-3 px-2">Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {products?.length > 0 ? (
              products.map((el, idx) => (
                <tr
                  className="border-b hover:bg-gray-50 transition duration-150"
                  key={el._id}
                >
                  <td className="text-center py-3 px-2">
                    {(+params.get("page") > 1 ? +params.get("page") - 1 : 0) *
                      process.env.REACT_APP_LIMIT +
                      idx +
                      1}
                  </td>
                  <td className="text-center py-3 px-2">
                    <img
                      src={el.thumb}
                      alt="thumb"
                      className="w-14 h-14 object-cover border rounded-md"
                    />
                  </td>
                  <td className="text-center py-3 px-2">{el.title}</td>
                  <td className="text-center py-3 px-2">
                    {el.brand === "lg"
                      ? el.brand.toUpperCase()
                      : el.brand
                          ?.split(" ")
                          .map(
                            (word) =>
                              word.charAt(0).toUpperCase() +
                              word.slice(1).toLowerCase()
                          )
                          .join(" ")}
                  </td>

                  <td className="text-center py-3 px-2">{el.category}</td>
                  <td className="text-center py-3 px-2 text-green-500 font-semibold">
                    {`${formatMoney(fotmatPrice(el.price))} VNĐ`}
                  </td>
                  <td className="text-center py-3 px-2">{el.quantity}</td>
                  <td className="text-center py-3 px-2">{el.sold}</td>
                  <td className="text-center py-3 px-2">{el.color}</td>
                  <td className="text-center py-3 px-2">{el.totalRatings}</td>
                  <td className="text-center py-3 px-2">
                    {moment(el.createdAt).format("DD/MM/YYYY")}
                  </td>
                  <td className="text-center py-7 px-2 flex justify-center gap-4">
                    <span
                      onClick={() => setEditProduct(el)}
                      className="text-blue-500 hover:text-orange-500 cursor-pointer"
                      title="Chỉnh sửa"
                    >
                      <BiEdit size={20} />
                    </span>
                    <span
                      onClick={() => handleDeleteProduct(el._id)}
                      className="text-red-500 hover:text-orange-500 cursor-pointer"
                      title="Xóa"
                    >
                      <RiDeleteBin6Line size={20} />
                    </span>
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
      <div className="w-full flex justify-end my-8">
        <Pagination totalCount={counts} />
      </div>
    </div>
  );
}

export default ManageProducts
