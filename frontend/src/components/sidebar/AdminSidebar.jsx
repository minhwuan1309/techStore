import React, { useState, Fragment } from "react"
import { Link, NavLink, useNavigate } from "react-router-dom"
import { HiOutlineSun, HiOutlineMoon } from "react-icons/hi"
import { RiShareForwardLine } from "react-icons/ri"
import { AiOutlineCaretDown, AiOutlineCaretRight } from "react-icons/ai"
import clsx from "clsx"
import logo from "assets/logo.png"
import { useSelector } from "react-redux"
import { adminSidebar } from "utils/contants"

const AdminSidebar = ({ isSidebarOpen, darkMode, setDarkMode }) => {
  const navigate = useNavigate()
  const { current } = useSelector((state) => state.user)
  const [actived, setActived] = useState([])

  const handleToggleMode = () => {
    setDarkMode(!darkMode)
  }

  const handleShowTabs = (tabID) => {
    setActived((prev) =>
      prev.includes(tabID) ? prev.filter((el) => el !== tabID) : [...prev, tabID]
    )
  }

  const renderSidebarItems = () => {
    if (!current || !current.role) return []

    const role = +current.role
    if (role === 1945) {
      return adminSidebar.filter((item) =>
        ["Tổng quát", "Thông tin cá nhân","Quản lý tài khoản", "Sản phẩm", "Quản lý đơn hàng", "Loại sản phẩm","Khuyến mãi", "Bài viết", "Chat"].includes(item.text)
      )
    } else if (role === 1980) {
      return adminSidebar.filter((item) =>
        ["Sản phẩm", "Quản lý đơn hàng","Khuyến mãi", "Bài viết", "Chat"].includes(item.text)
      )
    }
    return []
  }

  return (
    <div className={clsx("h-screen flex flex-col transition-all duration-300",
      darkMode ? "bg-gray-900 text-gray-200 border-gray-800" : "bg-gray-100 text-gray-800 border-gray-300",
      isSidebarOpen ? "w-64 px-4" : "w-20 px-2"
    )}>

      {/* Logo */}
      <Link to={"/"} className="flex items-center justify-center mt-6">
        <img src={logo} alt="logo" className={clsx("transition-all", isSidebarOpen ? "w-36" : "w-10")} />
      </Link>

      {/* Sidebar Items */}
      <div className="mt-8">
        {renderSidebarItems().map((el) => (
          <Fragment key={el.id}>
            {el.type === "SINGLE" && (
              <NavLink
                to={el.path}
                className={({ isActive }) =>
                  clsx("flex items-center gap-3 py-3 px-4 rounded-md transition-all",
                    isActive ? "bg-blue-600 text-white shadow-md" : darkMode ? "hover:bg-gray-800" : "hover:bg-gray-300")
                }
              >
                <span className="text-lg">{el.icon}</span>
                {isSidebarOpen && <span className="transition-all">{el.text}</span>}
              </NavLink>
            )}
            {el.type === "PARENT" && (
              <div className="mt-3">
                <div onClick={() => handleShowTabs(el.id)}
                  className="flex items-center justify-between py-3 px-4 cursor-pointer rounded-md transition-all">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{el.icon}</span>
                    {isSidebarOpen && <span>{el.text}</span>}
                  </div>
                  {actived.includes(el.id) ? <AiOutlineCaretDown /> : <AiOutlineCaretRight />}
                </div>
                {actived.includes(el.id) && (
                  <div className="flex flex-col pl-6">
                    {el.submenu.map((item, idx) => (
                      <NavLink key={idx} to={item.path}
                        className={({ isActive }) =>
                          clsx("flex items-center py-2 px-4 rounded-md transition-all",
                            isActive ? "bg-blue-500 text-white shadow-md" : darkMode ? "hover:bg-gray-800" : "hover:bg-gray-300")}
                      >
                        {item.text}
                      </NavLink>
                    ))}
                  </div>
                )}
              </div>
            )}
          </Fragment>
        ))}
      </div>

      {/* Dark/Light Mode Toggle */}
      <div className="mt-auto border-t border-gray-600 py-4">
        <button className="flex items-center gap-3 px-4 py-3 w-full rounded-md transition-all duration-300 hover:bg-gray-600"
          onClick={handleToggleMode}>
          {darkMode ? <HiOutlineSun size={22} /> : <HiOutlineMoon size={22} />}
          {isSidebarOpen && <span>{darkMode ? "Light Mode" : "Dark Mode"}</span>}
        </button>
      </div>

      {/* Back to Main Page */}
      <div>
        <div
          onClick={() => navigate(`/`)}
          className={clsx(
            "flex items-center gap-3 py-3 px-4 cursor-pointer rounded-md transition-all",
            darkMode ? "hover:bg-red-600" : "hover:bg-red-400"
          )}
        >
          <span className="text-lg">
            <RiShareForwardLine />
          </span>
          {isSidebarOpen && <span>Về trang chính</span>}
        </div>
      </div>
    </div>
  )
}

export default AdminSidebar
