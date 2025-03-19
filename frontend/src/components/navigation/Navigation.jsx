import React, { memo, useEffect, useState} from "react"
import { navigation } from "utils/contants" // Sử dụng danh sách navigation từ constants
import { NavLink, createSearchParams, useNavigate, useLocation } from "react-router-dom"
import InputForm from "components/inputs/InputForm"
import { useForm } from "react-hook-form"
import path from "utils/path"
import { IoMenuSharp } from "react-icons/io5"
import { IoSearchOutline } from "react-icons/io5"

const Navigation = () => {
  const {
    register,
    formState: { errors, isDirty },
    watch,
  } = useForm()
  const q = watch("q")
  const navigate = useNavigate()
  const location = useLocation()
  const [showMenu, setShowMenu] = useState(false)

  useEffect(() => {
    const handleEnter = (e) => {
      if (e.keyCode === 13) {
        navigate({
          pathname: `/${path.PRODUCTS}`,
          search: createSearchParams({ q }).toString(),
        })
      }
    }
    if (isDirty) window.addEventListener("keyup", handleEnter)
    else window.removeEventListener("keyup", handleEnter)

    return () => {
      window.removeEventListener("keyup", handleEnter)
    }
  }, [isDirty, q])

  return (
    <div className="bg-white shadow-md border-b border-gray-200">
      <div className="md:w-main w-full mx-auto px-4 py-2 md:px-0">
        <div className="h-[60px] flex items-center justify-between">
          {/* Mobile Menu Button */}
          <span
            onClick={() => setShowMenu(true)}
            className="text-gray-700 md:hidden hover:text-indigo-600 cursor-pointer transition-colors duration-300"
          >
            <IoMenuSharp size={24} />
          </span>

          {/* Desktop Navigation */}
          <div className="py-2 flex-auto hidden md:flex items-center">
            {navigation.map((el) => (
              <NavLink
                to={el.path}
                key={el.id}
                className={({ isActive }) =>
                  isActive
                    ? "px-5 py-2 text-indigo-600 font-semibold hover:text-indigo-800 transition-all border-b-2 border-indigo-600"
                    : "px-5 py-2 text-gray-700 hover:text-indigo-600 transition-all border-b-2 border-transparent hover:border-indigo-300"
                }
              >
                {el.value}
              </NavLink>
            ))}
          </div>

          {/* Search Bar */}
          {location.pathname !== "/products" && (
            <div className="relative flex-none">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <IoSearchOutline className="text-gray-400" size={20} />
              </div>
              <InputForm
                id="q"
                register={register}
                errors={errors}
                placeholder="Tìm kiểm sản phẩm..."
                style="pl-9 pr-4 py-3 w-full rounded-full border border-gray-400 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
              />
            </div>
          )}
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      {showMenu && (
        <div
          onClick={() => setShowMenu(false)}
          className="fixed inset-0 z-[999] bg-black bg-opacity-50 flex justify-start"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-4/5 bg-white h-full flex flex-col shadow-lg transform transition-transform duration-300 ease-in-out"
          >
            <div className="p-4 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500">
              <h3 className="text-white font-bold text-xl">Menu</h3>
            </div>
            <div className="flex flex-col p-2">
              {navigation.map((el) => (
                <NavLink
                  to={el.path}
                  key={el.id}
                  onClick={() => setShowMenu(false)}
                  className={({ isActive }) =>
                    isActive
                      ? "py-3 px-4 mb-1 rounded-md bg-indigo-50 text-indigo-600 font-semibold"
                      : "py-3 px-4 mb-1 rounded-md text-gray-700 hover:bg-gray-50 hover:text-indigo-600"
                  }
                >
                  {el.value}
                </NavLink>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default memo(Navigation)