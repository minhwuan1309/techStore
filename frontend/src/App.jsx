import React, { useEffect } from "react"
import { Route, Routes } from "react-router-dom"
import {
  Login,
  Home,
  Public,
  FAQ,
  Services,
  DetailProduct,
  DetailBlogs,
  Products,
  FinalRegister,
  ResetPassword,
} from "pages/public"
import {
  AdminLayout,
  ManageOrder,
  ManageProducts,
  ManageUser,
  CreateProducts,
  Dashboard,
  CreateBlog,
  ManageBlog,
} from "pages/admin"
import {
  MemberLayout,
  Personal,
  History,
  Wishlist,
  Checkout,
  DetailCart,
} from "pages/client";
import path from "utils/path"
import { getCategories } from "store/app/asyncActions"
import { useDispatch, useSelector } from "react-redux"
import { ToastContainer } from "react-toastify"
import "react-toastify/dist/ReactToastify.css"
import { Cart, Modal } from "components"
import { showCart } from "store/app/appSlice"
import BlogsPage from "pages/public/Blogs"
import CreateCategory from "pages/admin/CreateCategory"
import ManageCategories from "pages/admin/ManageCategories"
import ManageCoupon from "pages/admin/ManageCoupon"
import ConfirmOrder from "pages/client/OrderConfirmed";
import Chat from "pages/admin/Chat"
import AdminPersonal from "pages/admin/AdminPersonal";
import ManageBrands from "pages/admin/ManageBrands";
import socket from 'socket/socketClient'


function App() {
  const dispatch = useDispatch()
  const { isShowModal, modalChildren, isShowCart } = useSelector(
    (state) => state.app
  )
  const { current } = useSelector((state) => state.user)

  useEffect(() => {
    dispatch(getCategories())
  }, [])

  // Kết nối socket khi người dùng đã đăng nhập
  useEffect(() => {
    if (current?._id) {
      // Kết nối socket
      socket.connect()
      
      // Tham gia phòng cá nhân
      socket.emit('join', current._id)
      
      // Xử lý sự kiện kết nối
      socket.on('connect', () => {
        console.log('Socket connected')
      })
      
      // Xử lý lỗi kết nối
      socket.on('connect_error', (error) => {
        console.error('Socket connection error:', error)
      })
      
      // Cleanup khi component unmount
      return () => {
        socket.off('connect')
        socket.off('connect_error')
        // Không ngắt kết nối socket ở đây để duy trì kết nối khi chuyển trang
      }
    }
  }, [current?._id])

  return (
    <div className="font-jp">
      {isShowCart && (
        <div
          onClick={() => dispatch(showCart())}
          className="absolute inset-0 bg-overlay z-50 flex justify-end"
        >
          <Cart />
        </div>
      )}
      {isShowModal && <Modal>{modalChildren}</Modal>}
      <Routes>
        <Route path={path.CHECKOUT} element={<Checkout />} />
        <Route path={path.PUBLIC} element={<Public />}>
          <Route path={path.HOME} element={<Home />} />
          <Route path={path.BLOGS__ID__TITLE} element={<DetailBlogs />} />
          <Route path={path.BLOGS} element={<BlogsPage />} />
          <Route
            path={path.DETAIL_PRODUCT__CATEGORY__PID__TITLE}
            element={<DetailProduct />}
          />
          <Route path={path.FAQ} element={<FAQ />} />
          <Route path={path.OUR_SERVICES} element={<Services />} />
          <Route path={path.PRODUCTS__CATEGORY} element={<Products />} />
          <Route path={path.ALL} element={<Home />} />
        </Route>
        <Route path={path.ADMIN} element={<AdminLayout />}>
          <Route path={path.DASHBOARD} element={<Dashboard />} />
          <Route path={path.ADMIN_PERSONAL} element={<AdminPersonal />} />
          <Route path={path.MANAGE_ORDER} element={<ManageOrder />} />
          <Route path={path.MANAGE_PRODUCTS} element={<ManageProducts />} />
          <Route path={path.MANAGE_USER} element={<ManageUser />} />
          <Route path={path.CREATE_PRODUCTS} element={<CreateProducts />} />
          <Route path={path.CREATE_BLOG} element={<CreateBlog />} />
          <Route path={path.MANAGE_BLOGS} element={<ManageBlog />} />
          <Route path={path.CREATE_CATEGORY} element={<CreateCategory />} />
          <Route path={path.MANAGE_CATEGORIES} element={<ManageCategories />} />
          <Route path={path.MANAGE_BRANDS} element={<ManageBrands/>}/>
          <Route path={path.MANAGE_COUPON} element={<ManageCoupon/>}/>
          <Route path={path.CHAT} element = {<Chat/>}/>
        </Route>
        <Route path={path.MEMBER} element={<MemberLayout />}>
          <Route path={path.PERSONAL} element={<Personal />} />
          <Route path={path.MY_CART} element={<DetailCart />} />
          <Route path={path.WISHLIST} element={<Wishlist />} />
          <Route path={path.HISTORY} element={<History />} />
        </Route>
        <Route path={path.FINAL_REGISTER} element={<FinalRegister />} />
        <Route path={path.LOGIN} element={<Login />} />
        <Route path={path.CONFIRM_ORDER__OID} element={<ConfirmOrder />} />
        <Route path={path.RESET_PASSWORD} element={<ResetPassword />} />

      </Routes>
      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={true}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />
      {/* Same as */}
      <ToastContainer />
    </div>
  );
}

export default App
