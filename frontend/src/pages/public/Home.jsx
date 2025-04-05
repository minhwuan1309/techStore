import React, { useEffect, useState } from "react"
import {
  Sidebar,
  Banner,
  BestSeller,
  DealDaily,
  FeatureProducts,
  CustomSlider,
  Blogs,
  Product,
  VietnamMap,
} from "../../components"
import { useSelector } from "react-redux"
import icons from "../../utils/icons"
import withBaseComponent from "hocs/withBaseComponent"
import { createSearchParams } from "react-router-dom"
// import Chatbot from "components/chatbot/Chatbot"

const { IoIosArrowForward } = icons
const Home = ({ navigate }) => {
  const { newProducts } = useSelector((state) => state.products)
  const { categories } = useSelector((state) => state.app)

  const [showVietnamMap, setShowVietnamMap] = useState(true)

  useEffect(() => {
    const handleScroll = () => {
      const mapElement = document.getElementById("vietnam-map");
      if (mapElement) {
        mapElement.style.top = `${window.scrollY + window.innerHeight / 2}px`;
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [])
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowVietnamMap(false);
    }, 5000);

    return () => clearTimeout(timer);
  }, [])

  
  return (
    <div className="w-full bg-gray-50 relative flex flex-col items-center pt-4">
      {/* Hero Section */}
      <div className="w-full sm:w-[85%] md:w-[65%] justify-center bg-gradient-to-r from-indigo-600 via-purple-500 to-pink-500 py-6 relative">
        <div className="w-full px-4 sm:px-0">
          <Banner />
        </div>
      </div>
      
      {showVietnamMap && (
        <div className="w-full px-4 sm:w-[90%] md:w-[65%] mt-4">
          <VietnamMap />
        </div>
      )}
  
      {/* Main Content */}
      <div className="w-full sm:w-[90%] md:w-[65%] px-4 sm:px-6">
        {/* Featured Products Section */}
        <div className="my-8 sm:my-12">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-3 sm:mb-4 text-center">Sản Phẩm Nổi Bật</h2>
          <div className="w-16 sm:w-24 h-1 bg-indigo-600 mx-auto mb-6 sm:mb-8"></div>
          <div className="bg-white rounded-lg shadow-lg p-4 sm:p-6 hover:shadow-xl transition-all duration-300">
            <FeatureProducts />
          </div>
        </div>
  
        {/* Categories and Deal Section */}
        <div className="flex flex-col lg:flex-row gap-6 sm:gap-8 my-8 sm:my-12">
          {/* Left Column - Categories */}
          <div className="w-full lg:w-1/4 flex flex-col gap-6">
            <div className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300">
              <div className="bg-indigo-600 py-3 px-4 sm:px-6">
                <h3 className="text-lg sm:text-xl font-semibold text-white flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                  Danh Mục
                </h3>
              </div>
              <Sidebar />
            </div>
            
            {/* Deal Daily Card */}
            <div className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300">
              <div className="flex justify-center items-center bg-rose-600 py-3 px-4 sm:px-6">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-yellow-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <h3 className="text-lg sm:text-xl font-semibold text-white">✨ Deal Hời ✨</h3>
              </div>
              <DealDaily />
            </div>
          </div>
  
          {/* Right Column - Best Sellers & New Products */}
          <div className="w-full lg:w-3/4">
            {/* Best Sellers Section */}
            <div className="bg-white rounded-lg shadow-lg p-4 sm:p-6 mb-6 hover:shadow-xl transition-all duration-300">
              <h3 className="text-xl sm:text-2xl font-semibold text-gray-800 mb-3 flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 sm:h-6 w-5 sm:w-6 mr-2 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                </svg>
                Sản Phẩm Bán Chạy
              </h3>
              <div className="w-12 sm:w-16 h-1 bg-indigo-600 mb-4 sm:mb-6"></div>
              <BestSeller />
            </div>
  
            {/* New Products Section */}
            <div className="bg-white rounded-lg shadow-lg p-4 sm:p-6 hover:shadow-xl transition-all duration-300">
              <h3 className="text-xl sm:text-2xl font-semibold text-gray-800 mb-3 flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 sm:h-6 w-5 sm:w-6 mr-2 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Sản Phẩm Mới
              </h3>
              <div className="w-12 sm:w-16 h-1 bg-indigo-600 mb-4 sm:mb-6"></div>
  
              <div className="mt-4 hidden md:block">
                <CustomSlider products={newProducts} />
              </div>
              <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 md:hidden">
                {newProducts?.map((el, index) => (
                  <div className="col-span-1" key={index}>
                    <Product
                      pid={el._id}
                      productData={el}
                      isNew={true}
                      normal={true}
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
  
        {/* Products by Brand Section */}
        <div className="my-8 sm:my-12">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-3 sm:mb-4 text-center">Thương Hiệu Hợp Tác</h2>
          <div className="w-16 sm:w-24 h-1 bg-indigo-600 mx-auto mb-6 sm:mb-8"></div>
          
          {/* Desktop/Tablet Layout */}
          <div className="hidden sm:grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {categories
              ?.filter((el) => el.brand.length > 0)
              ?.slice(0, 9)
              ?.map((el) => (
                <div key={el._id} className="col-span-1">
                  <div className="bg-white rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden group h-[360px]">
                    <div className="relative h-[180px] overflow-hidden">
                      <img
                        src={el?.image}
                        alt=""
                        className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-500"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent flex items-end">
                        <h4 className="text-white font-bold uppercase p-4">{el.title}</h4>
                      </div>
                    </div>
                    <div className="p-4 overflow-y-auto">
                      <div className="grid grid-cols-2 gap-0">
                        {el?.brand?.map((item) => (
                          <li 
                            key={item._id}
                            className="flex flex-row cursor-pointer hover:text-indigo-600 transition-colors duration-300 gap-2 items-center text-gray-700 list-none h-8"
                            onClick={() =>
                              navigate({
                                pathname: `/${el.slug}`,
                                search: createSearchParams({
                                  brand: item.title,
                                }).toString(),
                              })
                            }
                          >
                            <IoIosArrowForward size={14} className="text-indigo-600 flex-shrink-0" />
                            <span className="hover:translate-x-1 transition-transform duration-300 text-sm truncate">{item.title}</span>
                          </li>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
          </div>
          
          {/* Mobile Layout */}
          <div className="grid grid-cols-1 gap-4 sm:hidden">
            {categories
              ?.filter((el) => el.brand.length > 0)
              ?.slice(0, 6)
              ?.map((el) => (
                <div key={el._id} className="col-span-1">
                  <div className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 h-[160px]">
                    <div className="flex flex-row h-full">
                      <div className="w-1/3 relative overflow-hidden">
                        <img
                          src={el?.image}
                          alt=""
                          className="w-full h-full object-cover transform hover:scale-110 transition-transform duration-500"
                        />
                      </div>
                      <div className="w-2/3 p-3 overflow-hidden">
                        <h4 className="font-semibold uppercase text-base mb-2 text-indigo-700">{el.title}</h4>
                        <div className="grid grid-cols-2 gap-x-2 gap-y-1 overflow-y-auto h-[110px]">
                          {el?.brand?.map((item) => (
                            <li
                              key={item._id}
                              className="flex cursor-pointer hover:text-indigo-600 transition-colors duration-300 gap-1 items-center text-gray-700 text-sm list-none h-6"
                              onClick={() =>
                                navigate({
                                  pathname: `/${el.slug}`,
                                  search: createSearchParams({
                                    brand: item.title,
                                  }).toString(),
                                })
                              }
                            >
                              <IoIosArrowForward size={12} className="text-indigo-600 flex-shrink-0" />
                              <span className="hover:translate-x-1 transition-transform duration-300 truncate">{item.title}</span>
                            </li>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
          </div>
        </div>
  
        {/* Blog Section */}
        <div className="my-8 sm:my-12">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-3 sm:mb-4 text-center">Tin Tức & Bài Viết</h2>
          <div className="w-16 sm:w-24 h-1 bg-indigo-600 mx-auto mb-6 sm:mb-8"></div>
          <div className="border-b-2 border-main"></div>
  
          <div className="bg-white rounded-lg shadow-lg p-4 sm:p-6 hover:shadow-xl transition-all duration-300">
            <Blogs />
          </div>
        </div>
      </div>
  
      {/* <div className="fixed bottom-4 right-4">
        <Chatbot/>
      </div> */}
    </div>
  )
}
export default withBaseComponent(Home)