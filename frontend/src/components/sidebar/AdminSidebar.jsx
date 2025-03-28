import React, { useState, Fragment } from "react"
import { Link, NavLink, useNavigate } from "react-router-dom"
import { HiOutlineSun, HiOutlineMoon, HiOutlineX, HiOutlineMenuAlt1 } from "react-icons/hi"
import { RiShareForwardLine } from "react-icons/ri"
import { AiOutlineCaretDown, AiOutlineCaretRight } from "react-icons/ai"
import clsx from "clsx"
import logo from "assets/logo.png"
import { useSelector } from "react-redux"
import { adminSidebar } from "utils/contants"

const AdminSidebar = ({ 
  isSidebarOpen, 
  setIsSidebarOpen, 
  darkMode, 
  setDarkMode 
}) => {
  const navigate = useNavigate()
  const { current } = useSelector((state) => state.user)
  const [actived, setActived] = useState([])

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen)
  }

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
      return adminSidebar
    } else if (role === 1980) {
      return adminSidebar.filter((item) =>
        ["Sản phẩm", "Quản lý đơn hàng", "Khuyến mãi", "Bài viết", "Chat"].includes(item.text)
      )
    }
    return []
  }
  

  return (
    <div className={clsx(
      "h-full flex flex-col transition-all duration-300 overflow-hidden relative",
      "bg-white/30 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/20",
      isSidebarOpen ? "w-72" : "w-20"
    )}>
      {/* Sidebar Toggle Button */}
      <button 
        onClick={toggleSidebar}
        className="absolute top-4 right-4 z-10 p-2 rounded-full 
        bg-purple-100 hover:bg-purple-200 
        transition-all duration-300"
      >
        {isSidebarOpen ? <HiOutlineX size={24} /> : <HiOutlineMenuAlt1 size={24} />}
      </button>

      {/* Logo Section */}
      <Link 
        to={"/"} 
        className="flex items-center justify-center mt-6 mb-4 px-4 transition-all"
      >
        <img 
          src={logo} 
          alt="logo" 
          className={clsx(
            "transition-all duration-300 transform",
            isSidebarOpen ? "w-36 scale-100" : "w-10 scale-75"
          )} 
        />
      </Link>

      {/* Sidebar Navigation */}
      <div className="flex-grow overflow-y-auto px-2 space-y-2">
        {renderSidebarItems().map((el) => (
          <Fragment key={el.id}>
            {el.type === "SINGLE" && (
              <NavLink
                to={el.path}
                className={({ isActive }) => clsx(
                  "flex items-center group p-3 rounded-xl transition-all duration-300",
                  isActive 
                    ? "bg-gradient-to-r from-purple-600 to-pink-500 text-white" 
                    : "hover:bg-purple-100 text-gray-700"
                )}
              >
                <span className="text-xl mr-3 opacity-70 group-hover:opacity-100 transition-opacity">
                  {el.icon}
                </span>
                {isSidebarOpen && (
                  <span className="flex-grow text-sm font-medium">
                    {el.text}
                  </span>
                )}
                {isSidebarOpen && (
                  <svg 
                    xmlns="http://www.w3.org/2000/svg" 
                    className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" 
                    fill="none" 
                    viewBox="0 0 24 24" 
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                )}
              </NavLink>
            )}
            
            {el.type === "PARENT" && (
              <div className="space-y-2">
                <div 
                  onClick={() => handleShowTabs(el.id)}
                  className={clsx(
                    "flex items-center justify-between p-3 rounded-xl cursor-pointer transition-all duration-300",
                    "hover:bg-purple-100 text-gray-700",
                    actived.includes(el.id) ? "bg-purple-100" : ""
                  )}
                >
                  <div className="flex items-center">
                    <span className="text-xl mr-3 opacity-70 group-hover:opacity-100 transition-opacity">
                      {el.icon}
                    </span>
                    {isSidebarOpen && (
                      <span className="text-sm font-medium">
                        {el.text}
                      </span>
                    )}
                  </div>
                  {isSidebarOpen && (
                    actived.includes(el.id) ? <AiOutlineCaretDown /> : <AiOutlineCaretRight />
                  )}
                </div>
                
                {actived.includes(el.id) && isSidebarOpen && (
                  <div className="flex flex-col pl-6 space-y-2">
                    {el.submenu.map((item, idx) => (
                      <NavLink 
                        key={idx} 
                        to={item.path}
                        className={({ isActive }) => clsx(
                          "px-4 py-2 rounded-xl text-sm transition-all duration-300",
                          isActive 
                            ? "bg-gradient-to-r from-purple-600 to-pink-500 text-white" 
                            : "hover:bg-purple-100 text-gray-700"
                        )}
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
      <div className="w-52 h-[2px] bg-gray-200 mx-auto mb-3"></div>
      {/* Bottom Section: Dark Mode Toggle and Back to Main */}
      <div className="mt-auto border-t border-white/20 p-2 space-y-2">
        {/* Dark Mode Toggle */}
        <button 
          onClick={handleToggleMode}
          className="w-full flex items-center p-3 rounded-xl 
          hover:bg-purple-100 transition-all duration-300 text-gray-700"
        >
          {darkMode ? <HiOutlineSun size={22} /> : <HiOutlineMoon size={22} />}
          {isSidebarOpen && (
            <span className="ml-3 text-sm">
              {darkMode ? "Light Mode" : "Dark Mode"}
            </span>
          )}
        </button>

        {/* Back to Main Page */}
        <button
          onClick={() => navigate(`/`)}
          className="w-full flex items-center p-3 rounded-xl 
          hover:bg-red-100 transition-all duration-300 text-red-700"
        >
          <RiShareForwardLine size={22} />
          {isSidebarOpen && (
            <span className="ml-3 text-sm">
              Về trang chính
            </span>
          )}
        </button>
      </div>
    </div>
  )
}


export default AdminSidebar
