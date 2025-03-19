import React, { useState, useEffect, memo } from "react"
import { apiGetProducts } from "apis/product"
import { CustomSlider } from "components"
import { getNewProducts } from "store/products/asynsActions"
import { useDispatch, useSelector } from "react-redux"
import clsx from "clsx"

const tabs = [
  { id: 1, name: "Bán chạy" },
  { id: 2, name: "Sản phẩm mới" },
]

const BestSeller = () => {
  const [bestSellers, setBestSellers] = useState(null)
  const [activedTab, setActivedTab] = useState(1)
  const [products, setProducts] = useState(null)
  const dispatch = useDispatch()
  const { newProducts } = useSelector((state) => state.products)
  const { isShowModal } = useSelector((state) => state.app)

  const fetchProducts = async () => {
    const response = await apiGetProducts({ sort: "-sold" })
    if (response.success) {
      setBestSellers(response.products)
      setProducts(response.products)
    }
  }
  useEffect(() => {
    fetchProducts()
    dispatch(getNewProducts())
  }, [])
  useEffect(() => {
    if (activedTab === 1) setProducts(bestSellers)
    if (activedTab === 2) setProducts(newProducts)
  }, [activedTab])
  
  return (
    <div className={clsx(isShowModal ? "hidden" : "")}>
      <div className="border-b-2 border-main"></div>
      
      {/* Product Slider for Desktop */}
      <div className="mt-6 hidden md:block">
        <CustomSlider products={products} activedTab={activedTab} />
      </div>
      
      {/* Product Slider for Mobile */}
      <div className="mt-6 md:hidden block">
        <CustomSlider
          products={products}
          slidesToShow={1}
          activedTab={activedTab}
        />
      </div>
      
      {/* Promotional Banners */}
      <div className="w-full flex flex-col md:flex-row gap-6 mt-8">
        <div className="flex-1 overflow-hidden rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300">
          <img
            src="https://cdn.shopify.com/s/files/1/1903/4853/files/banner2-home2_2000x_crop_center.png?v=1613166657"
            alt="Promotion banner 1"
            className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
          />
        </div>
        <div className="flex-1 overflow-hidden rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300">
          <img
            src="https://cdn.shopify.com/s/files/1/1903/4853/files/banner1-home2_2000x_crop_center.png?v=1613166657"
            alt="Promotion banner 2"
            className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
          />
        </div>
      </div>
    </div>
  )
}

export default memo(BestSeller)