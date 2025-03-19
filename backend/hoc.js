/*


Server đang chạy trên cổng: 5000
📩 Dữ liệu nhận được: {
  products: [
    {
      product: '6763a7f7c53ee493f244b96c',
      quantity: 1,
      price: 4275000,
      title: 'Màn hình LG UltraWide 29WQ600 29 inch',
      thumbnail: ''
    }
  ],
  total: 4275000,
  finalTotal: 4275000,
  discount: 0,
  address: 'Chưa có địa chỉ',
  paymentMethod: 'COD',
  orderBy: '67d7d9f3ae515ba355d7a167',
  status: 'Pending'
}
❌ Lỗi khi tạo đơn hàng: MongooseError: Operation `orders.insertOne()` buffering timed out after 10000ms
    at Timeout.<anonymous> (D:\DACN\backend\node_modules\mongoose\lib\drivers\node-mongodb-native\collection.js:188:23)
    at listOnTimeout (node:internal/timers:594:17)
    at process.processTimers (node:internal/timers:529:7)
*/