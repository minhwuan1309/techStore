import React, { useState, useEffect } from "react"
import { Outlet, Navigate } from "react-router-dom"
import { useSelector } from "react-redux"
import { AdminSidebar } from "components"
import { HiOutlineMenuAlt2 } from "react-icons/hi"

const AdminLayout = () => {
  const { isLoggedIn, current } = useSelector((state) => state.user)
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)
  const [darkMode, setDarkMode] = useState(localStorage.getItem("theme") === "dark")

  // Áp dụng Dark Mode toàn trang
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add("dark")
      localStorage.setItem("theme", "dark")
    } else {
      document.documentElement.classList.remove("dark")
      localStorage.setItem("theme", "light")
    }
  }, [darkMode])

  if (!isLoggedIn || !current || ![1945, 1980].includes(+current.role)) {
    return <Navigate to="/login" replace={true} />
  }

  return (
    <div className={`flex w-full min-h-screen transition-all duration-300 ${darkMode ? "bg-gray-900 text-gray-200" : "bg-gray-50 text-gray-900"}`}>
      {/* Sidebar */}
      <div className={`fixed top-0 left-0 h-full z-50 transition-all duration-300 ${isSidebarOpen ? "w-64" : "w-20"}`}>
        <AdminSidebar isSidebarOpen={isSidebarOpen} darkMode={darkMode} setDarkMode={setDarkMode} />
      </div>

      {/* Main Content */}
      <div className={`flex-1 transition-all ${isSidebarOpen ? "ml-64" : "ml-20"}`}>
        {/* Navbar */}
        <div className={`flex items-center justify-between px-6 py-4 shadow-md ${darkMode ? "bg-gray-800" : "bg-white"}`}>
          <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="text-xl">
            <HiOutlineMenuAlt2 />
          </button>
          <h1 className="text-xl font-bold">Admin Dashboard</h1>
        </div>
        <div className="flex-auto">
          <Outlet context={{darkMode}}/>
        </div>
      </div>
    </div>
  )
}

export default AdminLayout
