import withBaseComponent from "hocs/withBaseComponent"
import React, { memo } from "react"
import { renderStarFromNumber, formatMoney } from "utils/helpers"

const ProductCard = ({
  price,
  totalRatings,
  title,
  image,
  pid,
  navigate,
  category,
}) => {
  return (
    <div
      onClick={(e) => navigate(`/${category?.title?.toLowerCase?.()}/${pid}/${title}`)}
      className="col-span-1 cursor-pointer group"
    >
      <div className="flex flex-col sm:flex-row w-full bg-white rounded-lg shadow-md overflow-hidden transition-all duration-300 hover:shadow-lg border border-gray-100">
        <div className="w-full sm:w-[120px] h-[120px] overflow-hidden">
          <img
            src={image || "https://apollobattery.com.au/wp-content/uploads/2022/08/default-product-image.png"}
            alt={title || "Product image"}
            className="w-full h-full object-contain p-2 sm:p-3 group-hover:scale-105 transition-transform duration-300 cursor-pointer"
          />
        </div>
        <div className="flex flex-col p-3 sm:p-4 justify-center gap-1 sm:gap-2 w-full">
          <span className="line-clamp-2 sm:line-clamp-1 capitalize text-gray-800 text-sm sm:text-base font-medium cursor-pointer group-hover:text-indigo-600 transition-colors duration-300">
            {title?.toLowerCase()}
          </span>
          <div className="flex h-3 sm:h-4 mb-0 sm:mb-1 cursor-pointer">
            {renderStarFromNumber(totalRatings, 12, 14)?.map((el, index) => (
              <span key={index} className="text-amber-400">{el}</span>
            ))}
          </div>
          <span className="font-semibold text-indigo-600 text-sm sm:text-base">{`${formatMoney(price)} VNĐ`}</span>
        </div>
      </div>
    </div>
  )
}

export default withBaseComponent(memo(ProductCard))