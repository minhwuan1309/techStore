import React, { useState, useEffect, memo } from "react"
import icons from "utils/icons"
import { apiGetProducts } from "apis/product"
import {
  renderStarFromNumber,
  formatMoney,
  secondsToHms,
} from "utils/helpers"
import { Countdown } from "components"
import moment from "moment"
import { useSelector } from "react-redux"
import withBaseComponent from "hocs/withBaseComponent"
import { getDealDaily } from "store/products/productSlice"
import { useNavigate } from "react-router"
import path from "utils/path"

const { AiFillStar, AiOutlineMenu } = icons
let idInterval

const DealDaily = ({ dispatch }) => {
  const [hour, setHour] = useState(0)
  const [minute, setMinute] = useState(0)
  const [second, setSecond] = useState(0)
  const [expireTime, setExpireTime] = useState(false)
  const { dealDaily } = useSelector((s) => s.products)
  const navigate = useNavigate()

  const fetchDealDaily = async () => {
    try {
      const response = await apiGetProducts({
        sort: "-totalRatings",
        limit: 20,
      })

      if (response.success && response.products.length > 0) {
        const randomIndex = Math.floor(
          Math.random() * response.products.length
        )
        const pr = response.products[randomIndex]
        dispatch(
          getDealDaily({
            data: pr,
            time: Date.now() + 24 * 60 * 60 * 1000,
          })
        )
      } else {
        console.error("No products available in API response.")
      }
    } catch (error) {
      console.error("Error fetching deal of the day:", error)
    }
  }

  useEffect(() => {
    if (dealDaily?.time) {
      const deltaTime = dealDaily.time - Date.now()
      const number = secondsToHms(deltaTime)
      setHour(number.h)
      setMinute(number.m)
      setSecond(number.s)
    }
  }, [dealDaily])

  useEffect(() => {
    idInterval && clearInterval(idInterval)

    if (dealDaily?.time && moment(dealDaily.time).isBefore(moment())) {
      fetchDealDaily()
    }

    idInterval = setInterval(() => {
      if (hour <= 0 && minute <= 0 && second <= 0) {
        setExpireTime(true)
        clearInterval(idInterval)
      } else {
        if (second > 0) setSecond((prev) => prev - 1)
        else {
          if (minute > 0) {
            setMinute((prev) => prev - 1)
            setSecond(59)
          } else if (hour > 0) {
            setHour((prev) => prev - 1)
            setMinute(59)
            setSecond(59)
          }
        }
      }
    }, 1000)

    return () => {
      clearInterval(idInterval)
    }
  }, [hour, minute, second])

  useEffect(() => {
    if (expireTime) {
      fetchDealDaily()
      setExpireTime(false)
    }
  }, [expireTime])
  
  const discountPrice = (price) => {
    if (!price) return 0
    return price - (price * 5) / 100
  }

  const handleBuyNow = () => {
    if (!dealDaily?.data) return

    const discountedPrice = dealDaily.data.price - (dealDaily.data.price * 5) / 100

    const dealProduct = {
        _id: dealDaily.data._id,
        title: dealDaily.data.title,
        price: discountedPrice,
        quantity: 1,
        note: "Sản phẩm được mua với ưu đãi",
    }

    localStorage.setItem("selectedProducts", JSON.stringify([dealProduct]))
    navigate(`/${path.CHECKOUT}`)
  }

  return (
    <div className="w-full flex flex-col">
      {/* Product Image */}
      <div className="relative p-4 flex flex-col items-center">
        <div className="bg-gradient-to-r from-pink-100 to-indigo-100 p-3 rounded-lg w-full h-64 flex items-center justify-center">
          <img
            src={dealDaily?.data?.thumb || "https://apollobattery.com.au/wp-content/uploads/2022/08/default-product-image.png"}
            alt={dealDaily?.data?.title || "Product"}
            className="max-h-full max-w-full object-contain mix-blend-multiply"
          />
        </div>
        
        {/* Product Name */}
        <h3 className="mt-4 text-center font-medium text-lg line-clamp-2 h-14">
          {dealDaily?.data?.title || "Đang tải sản phẩm..."}
        </h3>
        
        {/* Ratings */}
        <div className="flex items-center justify-center my-2">
          {renderStarFromNumber(dealDaily?.data?.totalRatings, 16)?.map(
            (el, index) => (
              <span key={index}>{el}</span>
            )
          )}
        </div>
        
        {/* Pricing */}
        <div className="flex flex-col items-center gap-1 mt-2">
          <span className="line-through text-gray-400">
            {dealDaily?.data?.price && `${formatMoney(dealDaily?.data?.price)} VNĐ`}
          </span>
          <span className="font-bold text-xl text-rose-600">
            {dealDaily?.data?.price && `${formatMoney(discountPrice(dealDaily?.data?.price))} VNĐ`}
          </span>
          <div className="inline-block text-xs bg-rose-100 text-rose-600 px-2 py-1 rounded-full font-medium">
            Giảm 5%
          </div>
        </div>
      </div>
      
      {/* Timer */}
      <div className="mt-6 px-4">
        <p className="text-center text-sm font-medium text-gray-500 mb-3">
          Kết thúc sau:
        </p>
        <div className="flex justify-center gap-3 mb-6">
          <div className="flex flex-col items-center">
            <div className="w-14 h-14 bg-indigo-600 text-white rounded-lg flex items-center justify-center text-xl font-bold">
              {hour.toString().padStart(2, '0')}
            </div>
            <span className="text-xs mt-1 text-gray-500">Giờ</span>
          </div>
          <div className="flex flex-col items-center">
            <div className="w-14 h-14 bg-indigo-600 text-white rounded-lg flex items-center justify-center text-xl font-bold">
              {minute.toString().padStart(2, '0')}
            </div>
            <span className="text-xs mt-1 text-gray-500">Phút</span>
          </div>
          <div className="flex flex-col items-center">
            <div className="w-14 h-14 bg-indigo-600 text-white rounded-lg flex items-center justify-center text-xl font-bold">
              {second.toString().padStart(2, '0')}
            </div>
            <span className="text-xs mt-1 text-gray-500">Giây</span>
          </div>
        </div>
        
        {/* Buy Button */}
        <button
          type="button"
          onClick={handleBuyNow}
          className="w-full bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-700 hover:to-pink-700 text-white font-medium py-3 rounded-lg transition flex items-center justify-center gap-2"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path d="M3 1a1 1 0 000 2h1.22l.305 1.222a.997.997 0 00.01.042l1.358 5.43-.893.892C3.74 11.846 4.632 14 6.414 14H15a1 1 0 000-2H6.414l1-1H14a1 1 0 00.894-.553l3-6A1 1 0 0017 3H6.28l-.31-1.243A1 1 0 005 1H3z" />
          </svg>
          Đặt hàng ngay
        </button>
      </div>
    </div>
  )
}

export default withBaseComponent(memo(DealDaily))