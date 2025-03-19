import React, { memo } from "react"
import { NavLink } from "react-router-dom"
import { createSlug } from "utils/helpers"
import { useSelector } from "react-redux"

const Sidebar = () => {
  const { categories } = useSelector((state) => state.app)
  return (
    <div className="flex flex-col w-full">
      {categories?.map((el) => (
        <NavLink
          key={el.title}
          to={`/${el.title}`}
          className={({ isActive }) =>
            isActive
              ? "bg-indigo-600 text-white px-5 py-4 text-sm font-semibold hover:bg-indigo-500 transition-all flex items-center"
              : "px-5 py-4 text-sm font-medium hover:text-indigo-600 transition-all border-b border-gray-100 flex items-center"
          }
        >
          {el.title}
        </NavLink>
      ))}
    </div>
  )
}

export default memo(Sidebar)