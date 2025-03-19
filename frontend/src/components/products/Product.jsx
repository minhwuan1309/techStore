import React, { useState, memo } from "react"
import { formatMoney } from "utils/helpers"
import label from "assets/new.png"
import trending from "assets/trending.png"
import { renderStarFromNumber } from "utils/helpers"
import { SelectOption } from "components"
import icons from "utils/icons"
import withBaseComponent from "hocs/withBaseComponent"
import { showModal } from "store/app/appSlice"
import { DetailProduct } from "pages/public"
import { apiUpdateCart, apiUpdateWishlist } from "apis"
import { toast } from "react-toastify"
import { getCurrent } from "store/user/asyncActions"
import { useSelector } from "react-redux"
import Swal from "sweetalert2"
import path from "utils/path"
import { BsFillCartCheckFill, BsFillCartPlusFill } from "react-icons/bs"
import { createSearchParams } from "react-router-dom"
import clsx from "clsx"

const { AiFillEye, BsFillSuitHeartFill } = icons

const Product = ({
  productData,
  isNew,
  normal,
  navigate,
  dispatch,
  location,
  pid,
  className,
}) => {
  const [isShowOption, setIsShowOption] = useState(false)
  const { current } = useSelector((state) => state.user)

  const handleClickOptions = async (e, flag) => {
    e.stopPropagation()
    if (flag === "CART") {
      if (!current)
        return Swal.fire({
          title: "Almost...",
          text: "Please login first!",
          icon: "info",
          cancelButtonText: "Not now!",
          showCancelButton: true,
          confirmButtonText: "Go login page",
        }).then(async (rs) => {
          if (rs.isConfirmed)
            navigate({
              pathname: `/${path.LOGIN}`,
              search: createSearchParams({
                redirect: location.pathname,
              }).toString(),
            })
        })
      const response = await apiUpdateCart({
        pid: productData?._id,
        color: productData?.color,
        quantity: 1,
        price: productData?.price,
        thumbnail: productData?.thumb,
        title: productData?.title,
      })
      if (response.success) {
        toast.success(response.mes)
        dispatch(getCurrent())
      } else toast.error(response.mes)
    }
    if (flag === "WISHLIST") {
      const response = await apiUpdateWishlist(pid)
      if (response.success) {
        dispatch(getCurrent())
        toast.success(response.mes)
      } else toast.error(response.mes)
    }
    if (flag === "QUICK_VIEW") {
      dispatch(
        showModal({
          isShowModal: true,
          modalChildren: (
            <DetailProduct
              data={{ pid: productData?._id, category: productData?.category }}
              isQuickView
            />
          ),
        })
      )
    }
  }

  return (
    <div
      className="group relative bg-white rounded-xl shadow-lg overflow-hidden transition-all duration-300 hover:shadow-xl"
      onMouseEnter={() => setIsShowOption(true)}
      onMouseLeave={() => setIsShowOption(false)}
      onClick={(e) =>
        navigate(
          `/${productData?.category?.toLowerCase()}/${productData?._id}/${
            productData?.title
          }`
        )
      }
    >
      {/* Product Badge (New/Trending) */}
      {!normal && (
        <div className="absolute top-3 right-3 z-10">
          <img
            src={isNew ? label : trending}
            alt=""
            className="w-12 h-12 object-contain"
          />
        </div>
      )}
      
      {/* Product Image */}
      <div className="relative overflow-hidden aspect-square hover:cursor-pointer">
        <img
          src={productData?.thumb || "https://apollobattery.com.au/wp-content/uploads/2022/08/default-product-image.png"}
          alt={productData?.title || "Product image"}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
        />
        
        {/* Quick Actions Overlay */}
        {isShowOption && (
          <div className="absolute inset-0 bg-black/30 flex items-center justify-center gap-4 animate-fade-in">
            {/* Quick View Button */}
            <button
              onClick={(e) => handleClickOptions(e, "QUICK_VIEW")}
              className="w-10 h-10 rounded-full bg-white text-gray-800 flex items-center justify-center hover:bg-indigo-600 hover:text-white transition-colors duration-300"
              title="Quick View"
            >
              <AiFillEye size={20} />
            </button>
            
            {/* Add to Cart Button */}
            {!["1945", "1980"].includes(current?.role?.toString()) && (
              <button
                onClick={(e) => handleClickOptions(e, "CART")}
                className="w-10 h-10 rounded-full bg-white text-gray-800 flex items-center justify-center hover:bg-indigo-600 hover:text-white transition-colors duration-300"
                title={current?.cart?.some(el => el.product === productData._id.toString()) ? "Added to Cart" : "Add to Cart"}
              >
                {current?.cart?.some(el => el.product === productData._id.toString()) ? (
                  <BsFillCartCheckFill size={18} className="text-green-600" />
                ) : (
                  <BsFillCartPlusFill size={18} />
                )}
              </button>
            )}
            
            {/* Add to Wishlist Button */}
            {!["1945", "1980"].includes(current?.role?.toString()) && (
              <button
                onClick={(e) => handleClickOptions(e, "WISHLIST")}
                className="w-10 h-10 rounded-full bg-white text-gray-800 flex items-center justify-center hover:bg-indigo-600 hover:text-white transition-colors duration-300"
                title="Add to Wishlist"
              >
                <BsFillSuitHeartFill
                  size={18}
                  className={current?.wishlist?.some(i => i._id === pid) ? "text-red-500" : ""}
                />
              </button>
            )}
          </div>
        )}
      </div>
      
      {/* Product Info */}
      <div className="p-4">
        {/* Title */}
        <h3 className="font-medium text-gray-800 mb-2 line-clamp-1 hover:cursor-pointer">
          {productData?.title}
        </h3>
        
        {/* Rating */}
        <div className="flex items-center mb-2">
          {renderStarFromNumber(productData?.totalRatings)?.map(
            (el, index) => (
              <span key={index}>{el}</span>
            )
          )}
        </div>
        
        {/* Price */}
        <div className="font-semibold text-lg text-indigo-600 hover:cursor-pointer">
          {formatMoney(productData?.price)} VNĐ
        </div>
      </div>
    </div>
  )
}

export default withBaseComponent(memo(Product))