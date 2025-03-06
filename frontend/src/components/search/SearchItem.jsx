import React, { memo, useEffect, useState } from "react";
import icons from "utils/icons";
import { colors } from "utils/contants";
import {
  createSearchParams,
  useNavigate,
  useParams,
  useSearchParams,
} from "react-router-dom";
import { apiGetProducts } from "apis";
import useDebounce from "hooks/useDebounce";
const { AiOutlineDown } = icons;

const SearchItem = ({
  name,
  activeClick,
  changeActiveFitler,
  type = "checkbox",
}) => {
  const navigate = useNavigate();
  const { category } = useParams();
  const [selected, setSelected] = useState([]);
  const [params] = useSearchParams();
  const [price, setPrice] = useState({
    from: "",
    to: "",
  });
  const [bestPrice, setBestPrice] = useState(null);
  const handleSelect = (e) => {
    const alreadyEl = selected.find((el) => el === e.target.value);
    if (alreadyEl)
      setSelected((prev) => prev.filter((el) => el !== e.target.value));
    else setSelected((prev) => [...prev, e.target.value]);
    changeActiveFitler(null);
  };
  const fetchBestPriceProduct = async () => {
    const repsonse = await apiGetProducts({ sort: "-price", limit: 1 });
    if (repsonse.success) setBestPrice(repsonse.products[0]?.price);
  };
  useEffect(() => {
    let param = [];
    for (let i of params.entries()) param.push(i);
    const queries = {};
    for (let i of param) queries[i[0]] = i[1];
    if (selected.length > 0) {
      queries.color = selected.join(",");
      queries.page = 1;
    } else delete queries.color;
    navigate({
      pathname: `/${category}`,
      search: createSearchParams(queries).toString(),
    });
  }, [selected]);
  useEffect(() => {
    if (type === "input") fetchBestPriceProduct();
  }, [type]);

  useEffect(() => {
    if (price.from && price.to && price.from > price.to)
      alert("Giá đầu không được lớn hơn giá sau");
  }, [price]);

  const deboucePriceFrom = useDebounce(price.from, 500);
  const deboucePriceTo = useDebounce(price.to, 500);
  useEffect(() => {
    let param = [];
    for (let i of params.entries()) param.push(i);
    const queries = {};
    for (let i of param) queries[i[0]] = i[1];
    if (Number(price.from) > 0) queries.from = price.from;
    else delete queries.from;
    if (Number(price.to) > 0) queries.to = price.to;
    else delete queries.to;
    queries.page = 1;
    navigate({
      pathname: `/${category}`,
      search: createSearchParams(queries).toString(),
    });
  }, [deboucePriceFrom, deboucePriceTo]);

  return (
    <div
      className="p-[10px] cursor-pointer text-gray-700 text-sm gap-6 relative border border-gray-400 flex justify-between items-center hover:shadow-md transition-all duration-200"
      onClick={() => changeActiveFitler(name)}
    >
      <span className="capitalize font-semibold">
        {name === "price" ? "Giá tiền" : name === "color" ? "Màu sắc" : name}
      </span>
      <AiOutlineDown className="text-gray-500" />
      {activeClick === name && (
        <div className="absolute z-20 top-[calc(100%+1px)] left-0 w-fit p-4 border border-gray-400 bg-white min-w-[150px] rounded-lg shadow-lg">
          {type === "checkbox" && (
            <div className="">
              <div className="pb-2 flex items-center justify-center gap-6 border-b border-gray-400 bg-gray-50 rounded-t-md">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelected([]);
                    changeActiveFitler(null);
                  }}
                  className="cursor-pointer hover:text-main px-3 py-1 rounded-md text-sm font-semibold transition-colors duration-200"
                >
                  Đặt lại
                </button>
              </div>
              <div
                onClick={(e) => e.stopPropagation()}
                className="flex flex-col gap-3 mt-4"
              >
                {colors.map((el, index) => (
                  <div key={index} className="flex items-center gap-3 px-2">
                    <input
                      type="checkbox"
                      value={el}
                      onChange={handleSelect}
                      id={el}
                      checked={selected.some(
                        (selectedItem) => selectedItem === el
                      )}
                      className="form-checkbox h-5 w-5 focus:ring-blue-400"
                    />
                    <label className="capitalize text-gray-700" htmlFor={el}>
                      {el}
                    </label>
                  </div>
                ))}
              </div>
            </div>
          )}
          {type === "input" && (
            <div onClick={(e) => e.stopPropagation()}>
              <div className="p-4 items-center flex justify-between gap-8 border-b">
                <span className="whitespace-nowrap">{`Giá tiền cao nhất là ${Number(
                  bestPrice
                ).toLocaleString()} VND`}</span>
                <span
                  onClick={(e) => {
                    e.stopPropagation();
                    setPrice({ from: "", to: "" });
                    changeActiveFitler(null);
                  }}
                  className="underline cursor-pointer hover:text-main"
                >
                  Đặt lại
                </span>
              </div>
              <div className="flex items-center p-2 gap-2">
                <div className="flex items-center gap-2">
                  <label htmlFor="from">Từ</label>
                  <input
                    className="form-input"
                    type="number"
                    id="from"
                    value={price.from}
                    onChange={(e) =>
                      setPrice((prev) => ({ ...prev, from: e.target.value }))
                    }
                  />
                </div>
                <div className="flex items-center gap-2">
                  <label htmlFor="to">Đến</label>
                  <input
                    className="form-input"
                    type="number"
                    id="to"
                    value={price.to}
                    onChange={(e) =>
                      setPrice((prev) => ({ ...prev, to: e.target.value }))
                    }
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default memo(SearchItem);
