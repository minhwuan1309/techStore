import { Button, Product } from "components"
import React from "react"
import { useSelector } from "react-redux"

const Wishlist = () => {
  const { current } = useSelector((s) => s.user)
  return (
    <div className="w-full relative px-4">
      <header className="text-xl md:text-3xl font-semibold py-3 md:py-4 border-b-2 border-indigo-600 mb-6 md:mb-8 flex items-center">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 md:h-8 md:w-8 mr-2 md:mr-3 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
        </svg>
        Danh sách yêu thích
      </header>
      {current?.wishlist?.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
          {current?.wishlist?.map((el) => (
            <div
              className="bg-white rounded-lg shadow-md hover:shadow-xl transition-shadow duration-300 overflow-hidden"
              key={el._id}
            >
              <Product pid={el._id} className="bg-white" productData={el} />
            </div>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center bg-gray-50 rounded-lg p-6 md:p-12 text-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 md:h-16 md:w-16 text-gray-400 mb-3 md:mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
          </svg>
          <h2 className="text-lg md:text-xl text-gray-600 mb-2">Danh sách yêu thích của bạn trống</h2>
          <p className="text-sm md:text-base text-gray-500 mb-4">Bạn chưa thêm sản phẩm nào vào danh sách yêu thích</p>
        </div>
      )}
    </div>
  )
}

export default Wishlist