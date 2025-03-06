import React, { useState, useEffect, memo } from "react";
import icons from "utils/icons";
import { apiGetProducts } from "apis/product";
import {
  renderStarFromNumber,
  formatMoney,
  secondsToHms,
} from "utils/helpers";
import { Countdown } from "components";
import moment from "moment";
import { useSelector } from "react-redux";
import withBaseComponent from "hocs/withBaseComponent";
import { getDealDaily } from "store/products/productSlice";

const { AiFillStar, AiOutlineMenu } = icons;
let idInterval;

const DealDaily = ({ dispatch }) => {
  const [hour, setHour] = useState(0);
  const [minute, setMinute] = useState(0);
  const [second, setSecond] = useState(0);
  const [expireTime, setExpireTime] = useState(false);
  const { dealDaily } = useSelector((s) => s.products);

  const fetchDealDaily = async () => {
    try {
      const response = await apiGetProducts({
        sort: "-totalRatings",
        limit: 20,
      });

      if (response.success && response.products.length > 0) {
        const randomIndex = Math.floor(
          Math.random() * response.products.length
        );
        const pr = response.products[randomIndex]; // Lấy sản phẩm ngẫu nhiên trong phạm vi đúng
        dispatch(
          getDealDaily({
            data: pr,
            time: Date.now() + 24 * 60 * 60 * 1000, // Thời gian hết hạn là 24 giờ
          })
        );
      } else {
        console.error("No products available in API response.");
      }
    } catch (error) {
      console.error("Error fetching deal of the day:", error);
    }
  };

  useEffect(() => {
    if (dealDaily?.time) {
      const deltaTime = dealDaily.time - Date.now();
      const number = secondsToHms(deltaTime);
      setHour(number.h);
      setMinute(number.m);
      setSecond(number.s);
    }
  }, [dealDaily]);

  useEffect(() => {
    idInterval && clearInterval(idInterval);

    if (dealDaily?.time && moment(dealDaily.time).isBefore(moment())) {
      fetchDealDaily(); // Fetch sản phẩm mới nếu hết hạn
    }

    idInterval = setInterval(() => {
      if (hour <= 0 && minute <= 0 && second <= 0) {
        setExpireTime(true);
        clearInterval(idInterval);
      } else {
        if (second > 0) setSecond((prev) => prev - 1);
        else {
          if (minute > 0) {
            setMinute((prev) => prev - 1);
            setSecond(59);
          } else if (hour > 0) {
            setHour((prev) => prev - 1);
            setMinute(59);
            setSecond(59);
          }
        }
      }
    }, 1000);

    return () => {
      clearInterval(idInterval);
    };
  }, [hour, minute, second]);

  useEffect(() => {
    if (expireTime) {
      fetchDealDaily();
      setExpireTime(false);
    }
  }, [expireTime]);
  const discountPrice = (price) => {
    if (!price) return 0;
    return price - (price * 5) / 100; // Áp dụng giảm giá 5%
  };


  return (
    <div className="border hidden lg:block w-full flex-auto">
      <div className="flex items-center justify-between p-4 w-full">
        <span className="flex-1 flex justify-center">
          <AiFillStar size={20} color="#DD1111" />
        </span>
        <span className="flex-8 font-semibold text-[20px] flex justify-center text-gray-700">
          DEAL DAILY
        </span>
        <span className="flex-1"></span>
      </div>
      <div className="w-full flex flex-col items-center pt-8 px-4 gap-2">
        <img
          src={
            dealDaily?.data?.thumb ||
            "https://apollobattery.com.au/wp-content/uploads/2022/08/default-product-image.png"
          }
          alt={dealDaily?.data?.title || "Product"}
          className="w-full object-contain"
        />
        <span className="line-clamp-1 text-center">
          {dealDaily?.data?.title || "No product title"}
        </span>
        <span className="flex h-4">
          {renderStarFromNumber(dealDaily?.data?.totalRatings, 20)?.map(
            (el, index) => (
              <span key={index}>{el}</span>
            )
          )}
        </span>
        <div className="flex flex-col items-center">
          {/* Giá gốc */}
          <span className="line-through text-gray-400 text-[18px]">
            {dealDaily?.data?.price &&
              `${formatMoney(dealDaily?.data?.price)} VNĐ`}
          </span>
          {/* Giá sau khi giảm */}
          <span className="font-semibold text-red-600 text-[19px]">
            {dealDaily?.data?.price &&
              `${formatMoney(discountPrice(dealDaily?.data?.price))} VNĐ`}
          </span>
        </div>
      </div>

      <div className="px-4 mt-8">
        <div className="flex justify-center gap-2 items-center mb-4">
          <Countdown unit={"Giờ"} number={hour} />
          <Countdown unit={"Phút"} number={minute} />
          <Countdown unit={"Giây"} number={second} />
        </div>
        <button
          type="button"
          className="flex gap-2 items-center justify-center w-full bg-main hover:bg-gray-800 text-white font-medium py-2"
        >
          <AiOutlineMenu />
        </button>
      </div>
    </div>
  );
};

export default withBaseComponent(memo(DealDaily));
