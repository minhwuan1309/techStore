import React, { memo, useEffect, useState} from "react"
import { navigation } from "utils/contants" // Sử dụng danh sách navigation từ constants
import { NavLink, createSearchParams, useNavigate, useLocation } from "react-router-dom"
import InputForm from "components/inputs/InputForm"
import { useForm } from "react-hook-form"
import path from "utils/path"
import { IoMenuSharp } from "react-icons/io5"

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
    <div className=" md:w-main w-full h-[48px] flex items-center px-4 md:px-0 justify-between border-y bg-white shadow-sm">
      {showMenu && (
        <div
          onClick={() => setShowMenu(false)}
          className="absolute inset-0 z-[999] bg-black bg-opacity-50 flex justify-start"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-4/5 bg-white p-4 h-full flex flex-col shadow-md transform transition-transform duration-300 ease-in-out"
          >
            {navigation.map((el) => (
              <NavLink
                to={el.path}
                key={el.id}
                onClick={() => setShowMenu(false)}
                className={({ isActive }) =>
                  isActive
                    ? "py-3 border-b text-sm text-main hover:text-main font-semibold"
                    : "py-3 border-b text-sm text-gray-600 hover:text-main"
                }
              >
                {el.value}
              </NavLink>
            ))}
          </div>
        </div>
      )}
      <span
        onClick={() => setShowMenu(true)}
        className="text-gray-600 md:pr-12 pr-6 text-sm md:hidden hover:text-main cursor-pointer"
      >
        <IoMenuSharp size={20} />
      </span>
      <div className="py-2 flex-auto text-sm hidden md:flex items-center">
        {navigation.map((el) => (
          <NavLink
            to={el.path}
            key={el.id}
            className={({ isActive }) =>
              isActive
                ? "md:pr-12 pr-6 text-sm text-main font-semibold hover:text-main transition-all"
                : "md:pr-12 pr-6 text-sm text-gray-600 hover:text-main transition-all"
            }
          >
            {el.value}
          </NavLink>
        ))}
      </div>
      {location.pathname !== "/products" && (
        <InputForm
          id="q"
          register={register}
          errors={errors}
          placeholder="Tìm kiểm sản phẩm......."
          style="flex-none outline-none px-4 focus:border-main focus:ring-1 focus:ring-main transition-all"
        />
      )}
    </div>
  );
}

export default memo(Navigation)
