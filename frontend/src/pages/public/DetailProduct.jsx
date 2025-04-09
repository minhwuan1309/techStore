import React, { useCallback, useEffect, useRef, useState } from "react"
import { createSearchParams, useParams } from "react-router-dom"
import { apiGetProduct, apiGetProducts, apiUpdateCart, apiUpdateWishlist } from "apis"
import {
  Breadcrumb,
  Button,
  SelectQuantity,
  ProductExtraInfoItem,
  ProductInfomation,
  CustomSlider,
} from "components"
import Slider from "react-slick"
import { useZoomImageHover } from '@zoom-image/react'
import { formatMoney, fotmatPrice, renderStarFromNumber } from "utils/helpers"
import { productExtraInfomation } from "utils/contants"
import DOMPurify from "dompurify"
import clsx from "clsx"
import { useSelector } from "react-redux"
import withBaseComponent from "hocs/withBaseComponent"
import { getCurrent } from "store/user/asyncActions"
import { toast } from "react-toastify"
import path from "utils/path"
import Swal from "sweetalert2"
import { BsFillSuitHeartFill } from "react-icons/bs"

const settings = {
  dots: false,
  infinite: false,
  speed: 500,
  slidesToShow: 3,
  slidesToScroll: 1,
}

const DetailProduct = ({ isQuickView, data, location, dispatch, navigate }) => {
  const titleRef = useRef()
  const params = useParams()
  const { current } = useSelector((state) => state.user)
  const [product, setProduct] = useState(null)
  const [currentImage, setCurrentImage] = useState(null)
  const [quantity, setQuantity] = useState(1)
  const [relatedProducts, setRelatedProducts] = useState(null)
  const [update, setUpdate] = useState(false)
  const [varriant, setVarriant] = useState(null)
  const [pid, setPid] = useState(null)
  const [category, setCategory] = useState(null)
  const [currentProduct, setCurrentProduct] = useState({
    title: "",
    thumb: "",
    images: [],
    price: "",
    color: "",
  })

  const zoomTarget = useRef(null)
  const { createZoomImage } = useZoomImageHover()

  useEffect(() => {
    if (data) {
      setPid(data.pid)
      setCategory(data.category)
    } else if (params && params.pid) {
      setPid(params.pid)
      setCategory(params.category)
    }
  }, [data, params])
  const fetchProductData = async () => {
    const response = await apiGetProduct(pid)
    if (response.success) {
      setProduct(response.productData)
      setCurrentImage(response.productData?.thumb)
    }
  }
  useEffect(() => {
    if (varriant) {
      const selectedVarriant = product?.varriants?.find(
        (el) => el.sku === varriant
      )
      setCurrentProduct({
        title: selectedVarriant?.title,
        color: selectedVarriant?.color,
        images: selectedVarriant?.images,
        price: selectedVarriant?.price,
        thumb: selectedVarriant?.thumb,
      })
      setCurrentImage(selectedVarriant?.thumb) 
    } else {
      setCurrentProduct({
        title: product?.title,
        color: product?.color,
        images: product?.images || [],
        price: product?.price,
        thumb: product?.thumb,
      })
      setCurrentImage(product?.thumb) 
    }
  }, [varriant, product])
  
  const fetchProducts = async () => {
    const response = await apiGetProducts({ category })
    if (response.success) setRelatedProducts(response.products)
  }
  useEffect(() => {
    if (pid) {
      fetchProductData()
      fetchProducts()
    }
    titleRef.current.scrollIntoView({ block: "center" })
  }, [pid])
  useEffect(() => {
    if (pid) fetchProductData()
  }, [update])
  const rerender = useCallback(() => {
    setUpdate(!update)
  }, [update])

  const handleQuantity = useCallback(
    (number) => {
      if (!Number(number) || Number(number) < 1) {
        return
      } else {
        setQuantity(number)
      }
    },
    [quantity]
  )
  const handleChangeQuantity = useCallback(
    (flag) => {
      if (flag === "minus" && quantity === 1) return
      if (flag === "minus") setQuantity((prev) => +prev - 1)
      if (flag === "plus") setQuantity((prev) => +prev + 1)
    },
    [quantity]
  )

const handleClickImage = (el) => {
  setCurrentImage(el) 
}

  const handleAddToCart = async () => {
    if (!current)
      return Swal.fire({
        title: "Oops...",
        text: "Đăng nhập để mua hàng nhé!",
        icon: "info",
        cancelButtonText: "Để sau!",
        showCancelButton: true,
        confirmButtonText: "Đi đăng nhập hoy",
      }).then(async (rs) => {
        if (rs.isConfirmed)
          navigate({
            pathname: `/${path.LOGIN}`,
            search: createSearchParams({
              redirect: location.pathname,
            }).toString(),
          })
      })
      if(product?.quantity < quantity || quantity > product?.quantity) {
        return Swal.fire({
          title: "Oops...",
          text: "Sản phẩm không đủ số lượng!",
          icon: "info",
          confirmButtonText: "Đã hiểu",
        })
      }

    const response = await apiUpdateCart({
      pid,
      color: currentProduct.color || product?.color,
      quantity,
      price: currentProduct.price || product.price,
      thumbnail: currentProduct.thumb || product.thumb,
      title: currentProduct.title || product.title,
    })
    if (response.success) {
      toast.success(response.mes)
      dispatch(getCurrent())
    } else toast.error(response.mes)
  }

  const handleAddToWishlist = async () => {
    if (!current)
      return Swal.fire({
        title: "Oops...",
        text: "Đăng nhập để thêm sản phẩm vào danh sách yêu thích!",
        icon: "info",
        cancelButtonText: "Để sau!",
        showCancelButton: true,
        confirmButtonText: "Đi đăng nhập hoy",
      }).then(async (rs) => {
        if (rs.isConfirmed)
          navigate({
            pathname: `/${path.LOGIN}`,
            search: createSearchParams({
              redirect: location.pathname,
            }).toString(),
          })
      })

    const response = await apiUpdateWishlist(pid)
    if (response.success) {
      toast.success(response.mes)
      dispatch(getCurrent())
    } else toast.error(response.mes)
  }

  useEffect(() => {
    if (zoomTarget.current) {
      createZoomImage(zoomTarget.current, {
        zoomImageSource: currentImage || currentProduct.thumb,
        width: 600,
        height: 600,
        zoomWidth: 600,
      })
    }
  }, [createZoomImage, currentImage, currentProduct.thumb])

  return (
    <div className={clsx("w-full bg-gray-50")}>
      {!isQuickView && (
        <div className="h-[60px] sm:h-[81px] flex justify-center items-center bg-white shadow-sm">
          <div ref={titleRef} className="w-full sm:w-main px-4 sm:px-0">
            <h3 className="font-bold text-lg sm:text-xl text-gray-800 line-clamp-1">
              {currentProduct.title || product?.title}
            </h3>
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <span 
                className="hover:text-gray-800 cursor-pointer"
                onClick={(e) => {
                  e.stopPropagation();
                  navigate('/');
                }}
              >
                Trang chủ
              </span>
              <span>•</span>
              <span 
                className="hover:text-gray-800 cursor-pointer capitalize"
                onClick={(e) => {
                  e.stopPropagation();
                  navigate(`/${params.category?.toLowerCase()}`);
                }}
              >
                {params.category || product?.category}
              </span>
              <span>•</span>
              <span className="text-gray-800 line-clamp-1">
                {currentProduct.title || product?.title}
              </span>
            </div>
          </div>
        </div>
      )}
      <div
        onClick={(e) => e.stopPropagation()}
        className={clsx(
          "bg-white rounded-lg shadow-md m-auto mt-4 sm:mt-6 flex flex-col sm:flex-row p-4 sm:p-6",
          isQuickView
            ? "max-w-[1000px] gap-8 sm:gap-16 max-h-[80vh] overflow-y-auto"
            : "w-full sm:w-main"
        )}
      >
        <div
          className={clsx(
            "flex flex-col gap-4 sm:gap-6 w-full sm:w-2/5",
            isQuickView && "w-full sm:w-1/2"
          )}
        >
          <div className="w-full aspect-square border border-gray-200 rounded-lg flex items-center justify-center overflow-hidden bg-white relative">
            <div ref={zoomTarget} className="w-full h-full">
              <img
                src={currentImage || currentProduct.thumb}
                alt={currentProduct.title || product?.title}
                className="w-full h-full object-cover"
              />
            </div>
          </div>
          <div className="w-full">
            <Slider className="image-slider" {...settings}>
              {currentProduct.images?.map((el, index) => (
                <div className="flex-1 p-1" key={index}>
                  <img
                    onClick={() => handleClickImage(el)}
                    src={el}
                    alt={`${currentProduct.title || product?.title} - Image ${index + 1}`}
                    className={clsx(
                      "w-full aspect-square cursor-pointer border rounded-lg object-cover hover:shadow-lg transition-all",
                      currentImage === el ? "border-red-500" : "border-gray-200"
                    )}
                  />
                </div>
              ))}
            </Slider>
          </div>
        </div>
        <div
          className={clsx(
            "w-full sm:w-2/5 lg:w-1/2 pl-0 sm:pl-8 flex flex-col gap-4 sm:gap-6 mt-4 sm:mt-0",
            isQuickView && "lg:w-1/5"
          )}
        >
          <div className="flex flex-col gap-2">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">
              {`${formatMoney(
                fotmatPrice(currentProduct.price || product?.price)
              )} VNĐ`}
            </h2>
            <div className="flex items-center gap-2">
              <span className="text-xs sm:text-sm text-green-600 bg-green-50 px-2 py-1 rounded-full">
                {`Còn hàng: ${product?.quantity}`}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center">
              {renderStarFromNumber(product?.totalRatings, 14, 16)?.map((el, index) => (
                <span key={index} className="text-yellow-500">{el}</span>
              ))}
            </div>
            <span className="text-xs sm:text-sm text-gray-500 ml-2">
              {`(Đã bán: ${product?.sold})`}
            </span>
          </div>

          <div className="max-h-[150px] sm:max-h-[200px] overflow-y-auto text-gray-700 leading-relaxed text-sm sm:text-base">
            {product?.description?.length > 1 ? (
              <ul className="list-disc pl-5 space-y-1 sm:space-y-2">
                {product?.description?.map((el) => (
                  <li key={el}>{el}</li>
                ))}
              </ul>
            ) : (
              <div
                className="text-sm sm:text-base"
                dangerouslySetInnerHTML={{
                  __html: DOMPurify.sanitize(product?.description[0]),
                }}
              ></div>
            )}
          </div>

          <div className="my-2 sm:my-4 flex flex-col gap-2 sm:gap-3">
            <span className="font-semibold text-gray-800 text-sm sm:text-base">Chọn màu sắc:</span>
            <div className="flex flex-wrap gap-2 sm:gap-4 items-center">
              <div
                onClick={() => setVarriant(null)}
                className={clsx(
                  "flex items-center gap-2 sm:gap-3 p-2 sm:p-3 border-2 rounded-lg cursor-pointer hover:shadow-md transition-all",
                  !varriant ? "border-red-500 bg-red-50" : "border-gray-200 "
                )}
              >
                <img
                  src={product?.thumb}
                  alt="thumb"
                  className="w-10 h-10 sm:w-12 sm:h-12 rounded-md object-cover"
                />
                <span className="flex flex-col">
                  <span className="text-gray-900 font-medium text-sm sm:text-base">{product?.color}</span>
                  <span className="text-xs sm:text-sm text-gray-600">
                    {formatMoney(fotmatPrice(product?.price))} VNĐ
                  </span>
                </span>
              </div>
              {product?.varriants?.map((el) => (
                <div
                  key={el.sku}
                  onClick={() => setVarriant(el.sku)}
                  className={clsx(
                    "flex items-center gap-2 sm:gap-3 p-2 sm:p-3 border-2 rounded-lg cursor-pointer hover:shadow-md transition-all",
                    varriant === el.sku ? "border-red-500 bg-red-50" : "border-gray-200"
                  )}
                >
                  <img
                    src={el.thumb}
                    alt="thumb"
                    className="w-10 h-10 sm:w-12 sm:h-12 rounded-md object-cover"
                  />
                  <span className="flex flex-col">
                    <span className="text-gray-900 font-medium text-sm sm:text-base">{el.color}</span>
                    <span className="text-xs sm:text-sm text-gray-600">{el.price} VNĐ</span>
                  </span>
                </div>
              ))}
            </div>
          </div>

          {+current?.role !== 1945 && (
            <div className="flex flex-col gap-4 sm:gap-6">
              <div className="flex items-center gap-2 sm:gap-4">
                <span className="font-semibold text-gray-800 text-sm sm:text-base">Số lượng:</span>
                <SelectQuantity
                  quantity={quantity}
                  handleQuantity={handleQuantity}
                  handleChangeQuantity={handleChangeQuantity}
                />
              </div>
              <div className="flex gap-3">
                <Button
                  handleOnClick={handleAddToCart}
                  fw
                  className="bg-gradient-to-r from-indigo-600 via-purple-600 to-purple-700 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-lg hover:bg-red-700 transition-all uppercase tracking-wider font-semibold shadow-md text-sm sm:text-base"
                >
                  Thêm vào giỏ hàng
                </Button>
                <Button
                  handleOnClick={handleAddToWishlist}
                  className="bg-gradient-to-r from-indigo-600 via-purple-600 to-purple-700 text-red-600 border border-red-600 px-4 sm:px-6 py-2 sm:py-3 rounded-lg hover:bg-red-50 transition-all uppercase tracking-wider font-semibold shadow-md text-sm sm:text-base flex items-center justify-center gap-2"
                >
                  <BsFillSuitHeartFill size={18} className={current?.wishlist?.some(i => i._id === pid) ? "text-red-500" : ""} />
                  Yêu thích
                </Button>
              </div>
            </div>
          )}
        </div>

        {!isQuickView && (
          <div className="hidden sm:block w-1/5">
            {productExtraInfomation.map((el) => (
              <ProductExtraInfoItem
                key={el.id}
                title={el.title}
                icon={el.icon}
                sub={el.sub}
              />
            ))}
          </div>
        )}
      </div>
      {!isQuickView && (
        <div className="w-full sm:w-main m-auto mt-4 sm:mt-8 px-4 sm:px-0">
          <ProductInfomation
            totalRatings={product?.totalRatings}
            ratings={product?.ratings}
            nameProduct={product?.title}
            pid={product?._id}
            rerender={rerender}
          />
        </div>
      )}
      {!isQuickView && (
        <>
          <div className="w-full sm:w-main m-auto mt-4 sm:mt-8 px-4 sm:px-0">
            <h3 className="text-lg sm:text-[20px] font-semibold py-3 sm:py-[15px] border-b-2 border-main">
              CÓ THỂ BẠN QUAN TÂM
            </h3>
            <CustomSlider normal={true} products={relatedProducts} />
          </div>
          <div className="h-[50px] sm:h-[100px] w-full"></div>
        </>
      )}
    </div>
  )
}

export default withBaseComponent(DetailProduct)
