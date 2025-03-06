import React, { memo } from "react"
import { NavLink } from "react-router-dom"
import { createSlug } from "utils/helpers"
import { useSelector } from "react-redux"

const Sidebar = () => {
  const { categories } = useSelector((state) => state.app)
  return (
    <div className="hidden md:flex flex-col border shadow-lg">
      {categories?.map((el) => (
        <NavLink
          key={el.title}
          to={`/${el.title}`} // Sử dụng trực tiếp tiêu đề
          className={({ isActive }) =>
            isActive
              ? "bg-main text-white px-5 py-4 text-sm font-semibold hover:bg-main-light transition-all"
              : "px-5 py-4 text-sm font-medium hover:text-main"
          }
        >
          {el.title}
        </NavLink>
      ))}
    </div>
  );
}

export default memo(Sidebar)
