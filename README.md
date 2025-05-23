# techStore
# Already deploy on:
https://tech-store-self-two.vercel.app/
# Decripsion
# 🛒 E-commerce Website - Fullstack MERN Project

Đây là dự án website thương mại điện tử xây dựng bằng **MERN Stack** tích hợp đầy đủ các tính năng như: xác thực người dùng, quản lý sản phẩm, giỏ hàng, đặt hàng, blog, chat realtime, quản trị viên, v.v.

---

## ⚙️ Công nghệ sử dụng

### 💻 Frontend (ReactJS)
- **React 18** + **React Router v6**
- **TailwindCSS**: styling UI hiện đại, responsive
- **Redux Toolkit** + `redux-persist`
- **React Hook Form**: quản lý form hiệu quả
- **Axios**: gọi API
- **React Slick**: slider sản phẩm
- **TinyMCE / React-Quill**: viết blog
- **Chart.js**: biểu đồ trong dashboard
- **React Toastify**: hiển thị thông báo toast
- **Socket.IO Client**: hỗ trợ chat realtime

### 🌐 Backend (Node.js + Express)
- **Express.js**: server & RESTful API
- **MongoDB** với **Mongoose**
- **Multer + Cloudinary**: upload và lưu trữ ảnh sản phẩm
- **JWT (jsonwebtoken)**: xác thực người dùng
- **Nodemailer**: gửi email xác nhận, khôi phục mật khẩu
- **Socket.IO**: tích hợp chat realtime giữa người dùng

### ☁️ Cloud Services
- **Cloudinary**: lưu trữ ảnh sản phẩm & avatar
- **MongoDB Atlas**: lưu trữ database online
- **TinyMCE API**: tích hợp trình soạn thảo blog

---

## 🔐 Bảo mật & xác thực
- Sử dụng **JWT access/refresh token**
- Middleware xác thực admin và user
- Giới hạn quyền dựa trên role (`admin`, `member`...)

---

## 💬 Chat realtime
- Tích hợp **Socket.IO** giữa client & server
- Gửi tin nhắn trực tiếp giữa user
- Có thể nâng cấp để thêm nhóm chat / admin support

---

## 🛠 Dev Tools & Tiện ích
- `nodemon`, `dotenv`, `cookie-parser`, `cors`
- `moment.js` cho xử lý thời gian
- `slugify`, `mongoose-paginate` cho SEO và phân trang

---

## 📁 Biến môi trường (sample `.env`)
## Frontend (`public/.env`)
```env
REACT_APP_API_URI=http://localhost:5000/api
REACT_APP_LIMIT=7
REACT_APP_URL=http://localhost:3000
```

### Backend
```env
PORT=5000
MONGODB_URI=<MongoDB Atlas URI>
JWT_SECRET=<JWT Secret>
CLOUDINARY_NAME=<Tên Cloudinary>
CLOUDINARY_KEY=<API Key>
CLOUDINARY_SECRET=<API Secret>
CLIENT_URL=http://localhost:3000
```
# Home
![alt text](frontend/public/image.png)

![alt text](frontend/public/image-1.png)

![alt text](frontend/public/image-2.png)

# Client

![alt text](frontend/public/image-5.png)

![alt text](frontend/public/image-6.png)

![alt text](frontend/public/image-7.png)

![alt text](frontend/public/image-8.png)

![alt text](frontend/public/image-9.png)

# Admin

![alt text](frontend/public/image-10.png)

![alt text](frontend/public/image-11.png)

![alt text](frontend/public/image-12.png)

![alt text](frontend/public/image-13.png)

![alt text](frontend/public/image-14.png)

![alt text](frontend/public/image-15.png)

![alt text](frontend/public/image-16.png)

![alt text](frontend/public/image-17.png)

![alt text](frontend/public/image-18.png)

![alt text](frontend/public/image-19.png)

![alt text](frontend/public/image-20.png)