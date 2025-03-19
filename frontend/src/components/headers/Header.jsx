import React, { Fragment, memo, useEffect, useState } from "react";
import logo from "assets/logo.png";
import icons from "utils/icons";
import { Link } from "react-router-dom";
import path from "utils/path";
import { useDispatch, useSelector } from "react-redux";
import { logout } from "store/user/userSlice";
import withBaseComponent from "hocs/withBaseComponent";
import { showCart } from "store/app/appSlice";
import { AiOutlineShoppingCart } from "react-icons/ai";

const { RiPhoneFill, MdEmail, BsHandbagFill, FaUserCircle } = icons;

const Header = () => {
  const dispatch = useDispatch();
  const { current } = useSelector((state) => state.user);
  const [isShowOption, setIsShowOption] = useState(false);

  useEffect(() => {
    const handleClickoutOptions = (e) => {
      const profile = document.getElementById("profile");
      if (!profile?.contains(e.target)) setIsShowOption(false);
    };

    document.addEventListener("click", handleClickoutOptions);

    return () => {
      document.removeEventListener("click", handleClickoutOptions);
    };
  }, []);

  return (
    <div className="md:w-main w-full flex justify-between md:h-[105px] py-6 px-4 md:px-0 bg-white shadow-sm">
      <Link className="h-fit" to={`/${path.HOME}`}>
        <img
          src={logo}
          alt="logo"
          className="w-auto md:w-[180px] pl-24 md:h-fit object-contain"
        />
      </Link>
      <div className="flex text-[14px]">
        <div className="md:flex hidden flex-col px-6 border-r items-center">
          <span className="flex gap-4 items-center">
            <RiPhoneFill className="text-indigo-600" size={18} />
            <span className="font-semibold">(+84) 123 456789</span>
          </span>
          <span className="text-gray-600 text-xs mt-1">Thứ 2 - Thứ 7 9:00AM - 8:00PM</span>
        </div>
        <div className="md:flex hidden flex-col items-center px-6 border-r">
          <span className="flex gap-4 items-center">
            <MdEmail className="text-indigo-600" size={18} />
            <span className="font-semibold">HUTECH@GMAIL.COM</span>
          </span>
          <span className="text-gray-600 text-xs mt-1">Hỗ trợ trực tuyến 24/7</span>
        </div>
        {current && (
          <Fragment>
            {![1945, 1980].includes(+current.role) && (
              <div
                onClick={() => dispatch(showCart())}
                className="cursor-pointer flex items-center justify-center gap-2 px-6 border-r hover:bg-gray-50 transition-colors duration-300"
              >
                <span className="relative md:hidden inline-block">
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-indigo-600 flex items-center justify-center text-[10px] text-white rounded-full shadow-sm">
                    {current?.cart?.length || 0}
                  </span>
                  <BsHandbagFill size={22} className="text-indigo-600" />
                </span>
                <span className="flex cursor-pointer items-center justify-center px-2 gap-2 relative">
                  <AiOutlineShoppingCart size={20} className="text-indigo-600" />
                  <span className="hidden md:inline-block">{`${
                    current?.cart?.length || 0
                  } sản phẩm`}</span>
                </span>
              </div>
            )}
            <div
              className="flex cursor-pointer items-center justify-center px-6 gap-2 relative hover:bg-gray-50 transition-colors duration-300"
              onClick={() => setIsShowOption((prev) => !prev)}
              id="profile"
            >
              <FaUserCircle size={22} className="text-indigo-600" />
              <span className="hidden md:inline-block">Hồ sơ</span>
              {isShowOption && (
                <div
                  onClick={(e) => e.stopPropagation()}
                  className="absolute top-full flex-col flex right-4 md:left-[16px] bg-white border shadow-lg rounded-lg md:min-w-[150px] py-1 z-50"
                >
                  {+current.role === 1979 && (
                    <Link
                      className="p-3 w-full hover:bg-indigo-50 transition-colors duration-300"
                      to={`/${path.MEMBER}/${path.PERSONAL}`}
                    >
                      Cá nhân
                    </Link>
                  )}
                  {[1945, 1980].includes(+current.role) && (
                    <Link
                      className="p-3 w-full hover:bg-indigo-50 transition-colors duration-300"
                      to={`/${path.ADMIN}/${path.DASHBOARD}`}
                    >
                      Admin
                    </Link>
                  )}
                  <span
                    onClick={() => dispatch(logout())}
                    className="p-3 w-full hover:bg-indigo-50 transition-colors duration-300 text-rose-600"
                    aria-label="logout"
                  >
                    Đăng xuất
                  </span>
                </div>
              )}
            </div>
          </Fragment>
        )}
      </div>
    </div>
  );
};

export default Header;