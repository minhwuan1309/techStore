import React, { useState, useEffect, useCallback } from "react";
import {
  useParams,
  useSearchParams,
  createSearchParams,
  useNavigate,
} from "react-router-dom";
import {
  Breadcrumb,
  Product,
  SearchItem,
  InputSelect,
  Pagination,
} from "../../components";
import { apiGetProducts } from "../../apis";
import { sorts } from "../../utils/contants";
import useDebounce from "../../hooks/useDebounce"; // Import debounce hook


const Products = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState(null);
  const [activeClick, setActiveClick] = useState(null);
  const [params] = useSearchParams();
  const [sort, setSort] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const { category } = useParams();

  const debouncedSearchQuery = useDebounce(searchQuery, 800);

  const fetchProductsByCategory = async (queries) => {
    if (category && category !== "products") queries.category = category;
    queries.limit = 8; // Giới hạn 8 sản phẩm
    const response = await apiGetProducts(queries);
    if (response.success) setProducts(response);
  };

  useEffect(() => {
    const queries = Object.fromEntries([...params]);
    let priceQuery = {};
    if (queries.to && queries.from) {
      priceQuery = {
        $and: [
          { price: { gte: queries.from } },
          { price: { lte: queries.to } },
        ],
      };
      delete queries.price;
    } else {
      if (queries.from) queries.price = { gte: queries.from };
      if (queries.to) queries.price = { lte: queries.to };
    }

    delete queries.to;
    delete queries.from;
    const q = { ...priceQuery, ...queries };
    fetchProductsByCategory(q);
    window.scrollTo(0, 0);
  }, [params, debouncedSearchQuery]);

  const changeActiveFitler = useCallback(
    (name) => {
      if (activeClick === name) setActiveClick(null);
      else setActiveClick(name);
    },
    [activeClick]
  );

  const changeValue = useCallback(
    (value) => {
      setSort(value);
    },
    [sort]
  );

  useEffect(() => {
    if (sort) {
      navigate({
        pathname: `/${category}`,
        search: createSearchParams({ sort }).toString(),
      });
    }
  }, [sort]);

  const handleSearchChange = (event) => {
    const value = event.target.value
    setSearchQuery(value)
    if (value.trim() === "") {
      // Nếu input trống, reset sản phẩm
      navigate({
        pathname: `/${category || "products"}`,
      });
      fetchProductsByCategory({}); // Gọi lại API mà không có tham số tìm kiếm
    } else {
      navigate({
        pathname: `/${category || "products"}`,
        search: createSearchParams({ q: value }).toString(),
      });
    }
  };

  return (
    <div className="w-full">
      <div className="h-[80px] flex pt-8 justify-center items-center bg-gray-100 shadow-sm">
        <div className="lg:w-main w-screen px-4 lg:px-0 ">
          <h3 className="font-semibold uppercase">{"Sản phẩm" || category}</h3>
          <Breadcrumb category={category || "Sản phẩm"} />
        </div>
      </div>
      <div className="lg:w-main border p-4 flex flex-col md:flex-row gap-6 justify-between mt-8 m-auto shadow-lg">
        <div className="w-main md:w-1/3 flex flex-col gap-4 items-center">
          <span className="font-semibold text-base text-gray-700">
            Tìm theo tên sản phẩm
          </span>
          <input
            type="text"
            placeholder="Nhập tên sản phẩm..."
            value={searchQuery}
            onChange={handleSearchChange}
            className="w-full border border-gray-300 pl-3 pr-4 py-2 transition-all"
          />
        </div>
        <div className="w-full md:w-1/3 flex flex-col gap-4">
          <span className="font-semibold text-base text-gray-700">
            Lọc theo giá tiền
          </span>
          <div className="flex items-center gap-4">
            <SearchItem
              name="price"
              label="Giá tiền"
              activeClick={activeClick}
              changeActiveFitler={changeActiveFitler}
              type="input"
            />
            <SearchItem
              name="color"
              label="Màu sắc"
              activeClick={activeClick}
              changeActiveFitler={changeActiveFitler}
            />
          </div>
        </div>

        <div className="w-1/6 flex flex-col gap-3">
          <span className="font-semibold text-base">Sắp xếp</span>
          <div className="w-full ">
            <InputSelect
              changeValue={changeValue}
              value={sort}
              options={sorts}
            />
          </div>
        </div>
      </div>
      <div className="mt-8 w-main m-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {products?.products?.length > 0 ? (
          products.products.map((el) => (
            <Product key={el._id} pid={el._id} productData={el} normal={true} />
          ))
        ) : (
          <p className="text-center col-span-4 text-gray-500">
            Không tìm thấy sản phẩm phù hợp.
          </p>
        )}
      </div>
      <div className="w-main m-auto my-4 flex justify-end">
        <Pagination totalCount={products?.counts} />
      </div>
    </div>
  );
};

export default Products;
