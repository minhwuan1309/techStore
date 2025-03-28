import React, { memo } from "react"
import { NavLink } from "react-router-dom"
import { createSlug } from "utils/helpers"
import { useSelector } from "react-redux"

const Sidebar = () => {
  const { categories } = useSelector((state) => state.app)
  return (
    <div className="flex flex-col w-full bg-white/30 backdrop-blur-xl rounded-2xl shadow-lg overflow-hidden">
      {categories?.map((el) => (
        <NavLink
          key={el.title}
          to={`/${el.title}`}
          className={({ isActive }) =>
            `
            relative px-6 py-4 text-sm font-medium transition-all duration-300 
            group flex items-center
            ${isActive 
              ? "bg-gradient-to-r from-purple-600 to-pink-500 text-white" 
              : "text-gray-700 hover:bg-purple-50"}
            `
          }
        >
          {({ isActive }) => (
            <>
              {/* Animated Gradient Indicator */}
              {isActive && (
                <span 
                  className="absolute left-0 top-0 bottom-0 w-1.5 
                  bg-gradient-to-b from-purple-500 to-pink-500 
                  transform scale-y-0 group-hover:scale-y-100 
                  transition-transform duration-300"
                />
              )}
              <span className="flex-grow">{el.title}</span>
              {/* Hover/Active Arrow */}
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                className={`
                  w-5 h-5 opacity-0 group-hover:opacity-100 
                  transition-all duration-300
                  ${isActive ? "opacity-100" : ""}
                `}
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M9 5l7 7-7 7" 
                />
              </svg>
            </>
          )}
        </NavLink>
      ))}
    </div>
  )
}

export default memo(Sidebar)