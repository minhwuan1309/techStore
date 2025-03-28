import React, { useState, useEffect } from "react"
import { Outlet, Navigate } from "react-router-dom"
import { useSelector } from "react-redux"
import { AdminSidebar } from "components"
import { HiOutlineMenuAlt2 } from "react-icons/hi"

const AdminLayout = () => {
  const { isLoggedIn, current } = useSelector((state) => state.user)
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)
  const [darkMode, setDarkMode] = useState(localStorage.getItem("theme") === "dark")

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
    <div className={`
      flex w-full min-h-screen transition-all duration-300
      ${darkMode 
        ? "bg-gradient-to-br from-[#1a202c] via-[#2d3748] to-[#4a5568] text-gray-200" 
        : "bg-gradient-to-br from-[#f7fafc] via-[#edf2f7] to-[#e2e8f0] text-gray-900"}
      p-4 space-x-4 backdrop-blur-sm
    `}>
      {/* Sidebar with Glassmorphism */}
      <div className={`
        fixed top-0 left-0 h-full z-50 transition-all duration-300
        ${isSidebarOpen ? "w-72" : "w-20"}
      `}>
        <div className={`
          h-[99%] rounded-2xl backdrop-blur-xl 
          ${darkMode 
            ? "bg-gray-800/60 border-gray-700/50" 
            : "bg-white/60 border-gray-200/50"}
          border shadow-2xl
        `}>
          <AdminSidebar 
            isSidebarOpen={isSidebarOpen} 
            setIsSidebarOpen={setIsSidebarOpen}
            darkMode={darkMode} 
            setDarkMode={setDarkMode} 
          />
        </div>
      </div>

      {/* Main Content with Glassmorphism */}
      <div className={`
        fixed top-0 right-0 bottom-0 transition-all duration-300
        ${isSidebarOpen ? "left-72" : "left-20"}
        p-2
      `}>
        {/* Navbar */}
        <div className={`
          flex items-center justify-between px-6 py-4 
          rounded-2xl backdrop-blur-xl shadow-2xl mb-4
          ${darkMode 
            ? "bg-gray-800/60 border-gray-700/50 text-white" 
            : "bg-white/60 border-gray-200/50 text-gray-900"}
          border
        `}>
          <button 
            onClick={() => setIsSidebarOpen(!isSidebarOpen)} 
            className="text-xl hover:bg-gray-200/30 p-2 rounded-full transition-all"
          >
            <HiOutlineMenuAlt2 />
          </button>
          <h1 className="text-xl font-bold">Admin Dashboard</h1>
        </div>
        
        {/* Content Area with Glassmorphism */}
        <div className={`
          h-[calc(100%-80px)] overflow-auto p-4 rounded-2xl backdrop-blur-xl shadow-2xl
          ${darkMode 
            ? "bg-gray-800/60 border-gray-700/50" 
            : "bg-white/60 border-gray-200/50"}
          border
        `}>
          <Outlet context={{darkMode}}/>
        </div>
      </div>
    </div>
  )
}

export default AdminLayout