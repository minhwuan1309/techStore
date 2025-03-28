import React, { useEffect } from "react"
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

  return (
    <div className="w-full bg-gray-50 relative flex flex-col items-center pt-4">
      {/* Hero Section */}
      <div className="w-[65%%] justify-center bg-gradient-to-r from-indigo-600 via-purple-500 to-pink-500 py-6 relative">
        <div className="md:w-main m-auto">
          <Banner />
        </div>
      </div>
      
      <VietnamMap/>


      {/* Main Content */}
      <div className="md:w-main m-auto px-4 md:px-0">
        {/* Featured Products Section */}
        <div className="my-12">
          <h2 className="text-3xl font-bold text-gray-800 mb-4 text-center">Sản Phẩm Nổi Bật</h2>
          <div className="w-24 h-1 bg-indigo-600 mx-auto mb-8"></div>
          <div className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-all duration-300">
            <FeatureProducts />
          </div>
        </div>

        {/* Categories and Deal Section */}
        <div className="flex flex-col lg:flex-row gap-8 my-12">
          {/* Left Column - Categories */}
          <div className="lg:w-1/4">
            <div className="bg-white rounded-lg shadow-lg overflow-hidden mb-8 hover:shadow-xl transition-all duration-300">
              <div className="bg-indigo-600 py-3 px-6">
                <h3 className="text-xl font-semibold text-white flex items-center justify-center">
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
              <div className="flex justify-center items-center bg-rose-600 py-3 px-6">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-yellow-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <h3 className="text-xl font-semibold text-white">✨ Deal Hời ✨</h3>
              </div>
              <DealDaily />
            </div>
          </div>

          {/* Right Column - Best Sellers & New Products */}
          <div className="lg:w-3/4">
            {/* Best Sellers Section */}
            <div className="bg-white rounded-lg shadow-lg p-6 mb-8 hover:shadow-xl transition-all duration-300">
              <h3 className="text-2xl font-semibold text-gray-800 mb-3 flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                </svg>
                Sản Phẩm Bán Chạy
              </h3>
              <div className="w-16 h-1 bg-indigo-600 mb-6"></div>
              <BestSeller />
            </div>

            {/* New Products Section */}
            <div className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-all duration-300">
              <h3 className="text-2xl font-semibold text-gray-800 mb-3 flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Sản Phẩm Mới
              </h3>
              <div className="w-16 h-1 bg-indigo-600 mb-6"></div>

              <div className="mt-4 hidden md:block">
                <CustomSlider products={newProducts} />
              </div>
              <div className="mt-4 grid grid-cols-1 gap-6 md:hidden">
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
        <div className="my-12">
          <h2 className="text-3xl font-bold text-gray-800 mb-4 text-center">Thương Hiệu Hợp Tác</h2>
          <div className="w-24 h-1 bg-indigo-600 mx-auto mb-8"></div>
          
          <div className="lg:grid hidden lg:grid-cols-3 md:grid-cols-2 grid-cols-1 gap-6">
            {categories
              ?.filter((el) => el.brand.length > 0)
              ?.slice(0, 9)
              ?.map((el) => (
                <div key={el._id} className="col-span-1">
                  <div className="bg-white rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden group">
                    <div className="relative h-[190px] overflow-hidden">
                      <img
                        src={el?.image}
                        alt=""
                        className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-500"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent flex items-end">
                        <h4 className="text-white font-bold uppercase p-4">{el.title}</h4>
                      </div>
                    </div>
                    <div className="p-4">
                      <ul className="space-y-2">
                        {el?.brand?.map((item) => (
                          <li 
                            key={item}
                            className="flex cursor-pointer hover:text-indigo-600 transition-colors duration-300 gap-2 items-center text-gray-700"
                            onClick={() =>
                              navigate({
                                pathname: `/${el.title.toLowerCase()}`,
                                search: createSearchParams({
                                  brand: item,
                                }).toString(),
                              })
                            }
                          >
                            <IoIosArrowForward size={14} className="text-indigo-600" />
                            <span className="hover:translate-x-1 transition-transform duration-300">{item.title}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              ))}
          </div>
          <div className="lg:hidden grid grid-cols-1 gap-6">
            {categories
              ?.filter((el) => el.brand.length > 0)
              ?.slice(0, 6)
              ?.map((el) => (
                <div key={el._id} className="col-span-1">
                  <div className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300">
                    <div className="flex flex-col sm:flex-row">
                      <div className="sm:w-1/3 relative overflow-hidden">
                        <img
                          src={el?.image}
                          alt=""
                          className="w-full h-40 sm:h-full object-cover transform hover:scale-110 transition-transform duration-500"
                        />
                      </div>
                      <div className="sm:w-2/3 p-4">
                        <h4 className="font-semibold uppercase text-lg mb-3 text-indigo-700">{el.title}</h4>
                        <ul className="space-y-2">
                          {el?.brand?.map((item) => (
                            <li
                              key={item}
                              className="flex cursor-pointer hover:text-indigo-600 transition-colors duration-300 gap-2 items-center text-gray-700"
                              onClick={() =>
                                navigate({
                                  pathname: `/${el.title.toLowerCase()}`,
                                  search: createSearchParams({
                                    brand: item,
                                  }).toString(),
                                })
                              }
                            >
                              <IoIosArrowForward size={14} className="text-indigo-600" />
                              <span className="hover:translate-x-1 transition-transform duration-300">{item.title}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
          </div>
        </div>

        {/* Blog Section */}
        <div className="my-12">
          <h2 className="text-3xl font-bold text-gray-800 mb-4 text-center">Tin Tức & Bài Viết</h2>
          <div className="w-24 h-1 bg-indigo-600 mx-auto mb-8"></div>
          <div className="border-b-2 border-main"></div>

          <div className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-all duration-300">
            <Blogs />
          </div>
        </div>
      </div>

      {/* <div className="fixed bottom-4 right-4">
        <Chatbot/>
      </div> */}
    </div>
  );
}

export default withBaseComponent(Home)