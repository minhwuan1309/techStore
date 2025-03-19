import React, { useCallback, useEffect, useRef, useState } from "react"
import { createSearchParams, useParams } from "react-router-dom"
import { apiGetProduct, apiGetProducts, apiUpdateCart } from "apis"
import {
  Breadcrumb,
  Button,
  SelectQuantity,
  ProductExtraInfoItem,
  ProductInfomation,
  CustomSlider,
} from "components"
import Slider from "react-slick"
import ReactImageMagnify from "react-image-magnify"
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

  return (
    <div className={clsx("w-full")}>
      {!isQuickView && (
        <div className="h-[81px] flex justify-center items-center bg-gray-100">
          <div ref={titleRef} className="w-main">
            <h3 className="font-semibold">
              {currentProduct.title || product?.title}
            </h3>
            <Breadcrumb
              title={currentProduct.title || product?.title} // Truyền tiêu đề sản phẩm
              category={params.category || product?.category} // Truyền danh mục sản phẩm
            />
          </div>
        </div>
      )}
      <div
        onClick={(e) => e.stopPropagation()}
        className={clsx(
          "bg-white m-auto mt-4 flex",
          isQuickView
            ? "max-w-[900px] gap-16 p-8 max-h-[80vh] overflow-y-auto"
            : "w-main"
        )}
      >
        <div
          className={clsx("flex flex-col gap-4 w-2/5", isQuickView && "w-1/2")}
        >
          <div className="w-[458px] h-[458px] border flex items-center overflow-hidden">
            <ReactImageMagnify
              {...{
                smallImage: {
                  alt: "",
                  isFluidWidth: true,
                  src: currentImage || currentProduct.thumb,
                },
                largeImage: {
                  src: currentImage || currentProduct.thumb,
                  width: 1800,
                  height: 1500,
                },
              }}
            />
          </div>
          <div className="w-[458px]">
            <Slider
              className="image-slider flex gap-2 justify-between"
              {...settings}
            >
              {currentProduct.images?.length > 0 &&
                currentProduct.images.map((el, index) => (
                  <div className="flex-1" key={index}>
                    <img
                      onClick={() => handleClickImage(el)}
                      src={el}
                      alt="sub-product"
                      className={clsx(
                        "w-[143px] h-[143px] cursor-pointer border rounded-md object-cover hover:shadow-lg transition-all",
                        currentImage === el && "border-red-500"
                      )}
                    />
                  </div>
                ))}
            </Slider>
          </div>
        </div>
        <div
          className={clsx(
            "w-full md:w-2/5 lg:w-1/2 pr-[24px] flex flex-col gap-6",
            isQuickView && "lg:w-1/5"
          )}
        >
          <div className="flex items-center justify-between">
            <h2 className="text-2xl lg:text-3xl font-semibold text-gray-800">
              {`${formatMoney(
                fotmatPrice(currentProduct.price || product?.price)
              )} VNĐ`}
            </h2>
            <span className="text-m text-main">{`Có sẵn: ${product?.quantity}`}</span>
          </div>

          <div className="flex items-center gap-1">
            {renderStarFromNumber(product?.totalRatings)?.map((el, index) => (
              <span key={index}>{el}</span>
            ))}
            <span className="text-sm text-gray-500 italic">{`(Đã bán: ${product?.sold})`}</span>
          </div>

          <ul className="list-disc text-sm text-gray-600 pl-4 max-h-[300px] overflow-y-auto">
            {product?.description?.length > 1 &&
              product?.description?.map((el) => (
                <li className="leading-6" key={el}>
                  {el}
                </li>
              ))}
            {product?.description?.length === 1 && (
              <div
                className="text-sm leading-6 line-clamp-[10] mb-5"
                dangerouslySetInnerHTML={{
                  __html: DOMPurify.sanitize(product?.description[0]),
                }}
              ></div>
            )}
          </ul>

          <div className="my-4 flex flex-col gap-2">
            <span className="font-bold text-gray-700">Màu sắc:</span>
            <div className="flex flex-wrap gap-4 items-center w-full">
              <div
                onClick={() => setVarriant(null)}
                className={clsx(
                  "flex items-center gap-2 p-2 border rounded-md cursor-pointer hover:shadow-lg transition-all",
                  !varriant && "border-red-500"
                )}
              >
                <img
                  src={product?.thumb}
                  alt="thumb"
                  className="w-10 h-10 rounded-md object-cover"
                />
                <span className="flex flex-col">
                  <span className="text-gray-800">{product?.color}</span>
                  <span className="text-sm text-gray-600">
                    {formatMoney(fotmatPrice(product?.price))}
                  </span>
                </span>
              </div>
              {product?.varriants?.map((el) => (
                <div
                  key={el.sku}
                  onClick={() => setVarriant(el.sku)}
                  className={clsx(
                    "flex items-center gap-2 p-2 border rounded-md cursor-pointer hover:shadow-lg transition-all",
                    varriant === el.sku && "border-red-500"
                  )}
                >
                  <img
                    src={el.thumb}
                    alt="thumb"
                    className="w-10 h-10 rounded-md object-cover"
                  />
                  <span className="flex flex-col">
                    <span className="text-gray-800">{el.color}</span>
                    <span className="text-sm text-gray-600">{el.price}</span>
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Số lượng và thêm vào giỏ hàng */}
          {+current?.role !== 1945 && (
            <div className="flex flex-col gap-8">
              <div className="flex items-center gap-4">
                <span className="font-semibold text-gray-700">Số lượng:</span>
                <SelectQuantity
                  quantity={quantity}
                  handleQuantity={handleQuantity}
                  handleChangeQuantity={handleChangeQuantity}
                />
              </div>
              <Button
                handleOnClick={handleAddToCart}
                fw
                className="bg-red-500 text-white px-6 py-3 rounded-md hover:bg-red-600 transition-all"
              >
                Thêm vào giỏ hàng
              </Button>
            </div>
          )}
        </div>

        {!isQuickView && (
          <div className="w-1/5">
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
        <div className="w-main m-auto mt-8">
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
          <div className="w-main m-auto mt-8">
            <h3 className="text-[20px] font-semibold py-[15px] border-b-2 border-main">
              CÓ THỂ BẠN QUAN TÂM
            </h3>
            <CustomSlider normal={true} products={relatedProducts} />
          </div>
          <div className="h-[100px] w-full"></div>
        </>
      )}
    </div>
  )
}

export default withBaseComponent(DetailProduct)
