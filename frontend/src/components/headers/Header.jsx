import React, { Fragment, memo, useEffect, useState } from "react";
import logo from "assets/logo.png";
import icons from "utils/icons";
import { Link } from "react-router-dom";
import path from "utils/path";
import { useDispatch, useSelector } from "react-redux";
import { logout } from "store/user/userSlice";
import withBaseComponent from "hocs/withBaseComponent";
import { showCart } from "store/app/appSlice";
import { AiOutlineShoppingCart, AiOutlineMenu } from "react-icons/ai";

const { RiPhoneFill, MdEmail, BsHandbagFill, FaUserCircle } = icons;

const Header = () => {
  const dispatch = useDispatch();
  const { current } = useSelector((state) => state.user);
  const [isShowOption, setIsShowOption] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleClickoutOptions = (e) => {
      const profile = document.getElementById("profile");
      const mobileProfile = document.getElementById("mobile-profile");
      if (!profile?.contains(e.target) && !mobileProfile?.contains(e.target)) {
        setIsShowOption(false);
      }
    };

    document.addEventListener("click", handleClickoutOptions);

    return () => {
      document.removeEventListener("click", handleClickoutOptions);
    };
  }, []);

  return (
    <div className="md:w-main w-full flex flex-col md:flex-row justify-between md:h-[105px] py-6 px-4 md:px-0 bg-white shadow-sm">
      <div className="flex justify-between items-center">
        <Link className="h-fit" to={`/${path.HOME}`}>
          <img
            src={logo}
            alt="logo"
            className="w-auto md:w-[180px] md:pl-24 h-fit object-contain"
          />
        </Link>
        <button 
          className="md:hidden text-indigo-600"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          <AiOutlineMenu size={24} />
        </button>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden mt-4 py-4 border-t">
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-2">
              <RiPhoneFill className="text-indigo-600" size={18} />
              <span className="font-semibold">(+84) 123 456789</span>
            </div>
            <div className="flex items-center gap-2">
              <MdEmail className="text-indigo-600" size={18} />
              <span className="font-semibold">HUTECH@GMAIL.COM</span>
            </div>
            {current && (
              <>
                {![1945, 1980].includes(+current.role) && (
                  <div
                    onClick={() => dispatch(showCart())}
                    className="flex items-center gap-2 py-2 cursor-pointer"
                  >
                    <AiOutlineShoppingCart size={20} className="text-indigo-600" />
                    <span>{`${current?.cart?.length || 0} sản phẩm`}</span>
                  </div>
                )}
                <div 
                  className="relative"
                  id="mobile-profile"
                >
                  <div
                    className="flex items-center gap-2 py-2 cursor-pointer"
                    onClick={() => setIsShowOption((prev) => !prev)}
                  >
                    <FaUserCircle size={22} className="text-indigo-600" />
                    <span>Hồ sơ</span>
                  </div>
                  {isShowOption && (
                    <div className="absolute left-0 top-full w-full bg-white border shadow-lg rounded-lg py-1 z-50">
                      {+current.role === 1979 && (
                        <Link
                          className="block p-3 w-full hover:bg-indigo-50 transition-colors duration-300"
                          to={`/${path.MEMBER}/${path.PERSONAL}`}
                          onClick={() => {
                            setIsShowOption(false);
                            setIsMobileMenuOpen(false);
                          }}
                        >
                          Cá nhân
                        </Link>
                      )}
                      {[1945, 1980].includes(+current.role) && (
                        <Link
                          className="block p-3 w-full hover:bg-indigo-50 transition-colors duration-300"
                          to={`/${path.ADMIN}/${path.DASHBOARD}`}
                          onClick={() => {
                            setIsShowOption(false);
                            setIsMobileMenuOpen(false);
                          }}
                        >
                          Admin
                        </Link>
                      )}
                      <span
                        onClick={() => {
                          dispatch(logout());
                          setIsShowOption(false);
                          setIsMobileMenuOpen(false);
                        }}
                        className="block p-3 w-full hover:bg-indigo-50 transition-colors duration-300 text-rose-600 cursor-pointer"
                      >
                        Đăng xuất
                      </span>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Desktop Menu */}
      <div className="hidden md:flex text-[14px]">
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
                      onClick={() => setIsShowOption(false)}
                    >
                      Cá nhân
                    </Link>
                  )}
                  {[1945, 1980].includes(+current.role) && (
                    <Link
                      className="p-3 w-full hover:bg-indigo-50 transition-colors duration-300"
                      to={`/${path.ADMIN}/${path.DASHBOARD}`}
                      onClick={() => setIsShowOption(false)}
                    >
                      Admin
                    </Link>
                  )}
                  <span
                    onClick={() => {
                      dispatch(logout());
                      setIsShowOption(false);
                    }}
                    className="p-3 w-full hover:bg-indigo-50 transition-colors duration-300 text-rose-600 cursor-pointer"
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