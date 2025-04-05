const DealDaily = () => {
  // ... existing state and functions ...

  return (
    <div className="w-full bg-gray-50">
      <div className="h-[60px] sm:h-[81px] flex justify-center items-center bg-white shadow-sm">
        <div className="w-full sm:w-main px-4 sm:px-0">
          <h3 className="font-bold text-lg sm:text-xl text-gray-800">
            Ưu đãi hôm nay
          </h3>
          <Breadcrumb title="Ưu đãi hôm nay" />
        </div>
      </div>
      <div className="w-full sm:w-main m-auto mt-4 sm:mt-6 px-4 sm:px-0">
        <div className="bg-white rounded-lg shadow-md p-4 sm:p-6">
          <div className="flex flex-col gap-4 sm:gap-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900">
                Sản phẩm ưu đãi
              </h2>
              <div className="flex items-center gap-2">
                <span className="text-xs sm:text-sm text-gray-500">Còn lại:</span>
                <span className="text-sm sm:text-base font-semibold text-red-600">
                  {formatTimeLeft(endTime)}
                </span>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {products.map((product) => (
                <div
                  key={product._id}
                  className="flex flex-col gap-2 sm:gap-4 p-3 sm:p-4 border border-gray-200 rounded-lg hover:shadow-md transition-all"
                >
                  <div className="w-full aspect-square rounded-lg overflow-hidden">
                    <img
                      src={product.thumb}
                      alt={product.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex flex-col gap-1 sm:gap-2">
                    <h3 className="text-sm sm:text-base font-medium text-gray-900 line-clamp-2">
                      {product.title}
                    </h3>
                    <div className="flex items-center gap-2">
                      <span className="text-sm sm:text-base font-bold text-red-600">
                        {formatMoney(product.price)} VNĐ
                      </span>
                      <span className="text-xs sm:text-sm text-gray-500 line-through">
                        {formatMoney(product.originalPrice)} VNĐ
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      <div className="flex items-center">
                        {renderStarFromNumber(product.totalRatings, 12, 14)?.map(
                          (el, index) => (
                            <span key={index} className="text-yellow-500">
                              {el}
                            </span>
                          )
                        )}
                      </div>
                      <span className="text-xs text-gray-500">
                        ({product.totalRatings})
                      </span>
                    </div>
                  </div>
                  <Button
                    handleOnClick={() => handleAddToCart(product)}
                    fw
                    className="bg-red-600 text-white px-3 sm:px-4 py-2 rounded-lg hover:bg-red-700 transition-all uppercase tracking-wider font-semibold shadow-md text-xs sm:text-sm"
                  >
                    Thêm vào giỏ hàng
                  </Button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      <div className="h-[50px] sm:h-[100px] w-full"></div>
    </div>
  )
}

export default withBaseComponent(DealDaily) 