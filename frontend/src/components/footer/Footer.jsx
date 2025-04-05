import React, { memo } from "react";
import icons from "utils/icons";
import MapComponent from "./MapComponent";

const { MdEmail } = icons;
const Footer = () => {
  return (
    <div className="w-full">
      {/* Newsletter Section */}
      <div className="py-8 w-full bg-gradient-to-r from-indigo-600 via-purple-600 to-purple-700 flex items-center justify-center shadow-inner">
        <div className="w-main flex items-center flex-col lg:flex-row justify-center lg:justify-between px-4 md:px-0 gap-4">
          <div className="flex flex-col flex-1 text-center lg:text-left">
            <span className="text-[20px] font-bold text-white">
              ĐĂNG KÝ NHẬN BẢN TIN
            </span>
            <span className="text-[14px] text-gray-100 mt-1">
              Đăng ký ngay để nhận bản tin hàng tuần
            </span>
          </div>
          <div className="flex-1 flex items-center w-full lg:w-auto">
            <input
              className="p-4 pr-0 rounded-l-full w-full bg-white/10 backdrop-blur-sm outline-none text-white placeholder:text-sm placeholder:text-gray-200 placeholder:opacity-70 border border-white/30 focus:border-white/50 transition-colors duration-300"
              type="text"
              placeholder="Địa chỉ email"
            />
            <div className="h-[56px] w-[56px] bg-white/20 rounded-r-full flex items-center justify-center text-white hover:bg-white/30 transition-colors duration-300 cursor-pointer">
              <MdEmail size={22} />
            </div>
          </div>
        </div>
      </div>
      
      {/* Main Footer */}
      <div className="w-full bg-gray-900 flex items-center justify-center text-white text-[15px] py-8">
        <div className="w-main flex flex-col md:flex-row gap-8 px-4 md:px-0">
          <div className="md:flex-2 flex flex-col gap-3">
            <h3 className="mb-4 text-[18px] font-medium border-l-4 border-indigo-500 pl-3">
              VỀ CHÚNG TÔI
            </h3>
            <div className="flex flex-col md:flex-row items-start gap-2 text-gray-300 hover:text-gray-100 transition-colors duration-300">
              <span className="font-medium min-w-[80px]">Địa chỉ:</span>
              <span className="opacity-80">
                Khu Công nghệ cao XL Hà Nội, Hiệp Phú, Quận 9, Hồ Chí Minh, Vietnam
              </span>
            </div>
            <div className="flex flex-col md:flex-row items-start gap-2 text-gray-300 hover:text-gray-100 transition-colors duration-300">
              <span className="font-medium min-w-[80px]">Điện thoại:</span>
              <span className="opacity-80">(+84) 2854452222</span>
            </div>
            <div className="flex flex-col md:flex-row items-start gap-2 text-gray-300 hover:text-gray-100 transition-colors duration-300">
              <span className="font-medium min-w-[80px]">Email:</span>
              <span className="opacity-80">hutech@edu.vn</span>
            </div>
            <div className="map-container mt-4 rounded-lg overflow-hidden shadow-lg w-full">
              <MapComponent />
            </div>
          </div>
          
          <div className="md:flex-1 flex flex-col gap-2">
            <h3 className="mb-4 text-[18px] font-medium border-l-4 border-indigo-500 pl-3">
              THÔNG TIN
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-1 gap-2">
              <span className="text-gray-300 hover:text-white transition-colors duration-300 cursor-pointer py-1">Hình ảnh</span>
              <span className="text-gray-300 hover:text-white transition-colors duration-300 cursor-pointer py-1">Địa điểm cửa hàng</span>
              <span className="text-gray-300 hover:text-white transition-colors duration-300 cursor-pointer py-1">Ưu đãi hôm nay</span>
              <span className="text-gray-300 hover:text-white transition-colors duration-300 cursor-pointer py-1">Liên hệ</span>
            </div>
          </div>
          
          <div className="md:flex-1 flex flex-col gap-2">
            <h3 className="mb-4 text-[18px] font-medium border-l-4 border-indigo-500 pl-3">
              HỖ TRỢ
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-1 gap-2">
              <span className="text-gray-300 hover:text-white transition-colors duration-300 cursor-pointer py-1">Vận chuyển miễn phí</span>
              <span className="text-gray-300 hover:text-white transition-colors duration-300 cursor-pointer py-1">Câu hỏi thường gặp</span>
              <span className="text-gray-300 hover:text-white transition-colors duration-300 cursor-pointer py-1">Đổi trả hàng</span>
              <span className="text-gray-300 hover:text-white transition-colors duration-300 cursor-pointer py-1">Lời chứng thực</span>
            </div>
          </div>
        </div>
      </div>
      
      {/* Copyright */}
      <div className="w-full bg-gray-950 py-4 text-center text-gray-400 text-sm px-4">
        © 2025 HUTECH Shop. Tất cả quyền được bảo lưu.
      </div>
    </div>
  );
};

export default memo(Footer);