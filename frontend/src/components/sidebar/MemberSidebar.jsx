import React, { memo, Fragment, useState } from "react"
import avatar from "assets/avatarDefault.png"
import { memberSidebar } from "utils/contants"
import { NavLink, Link } from "react-router-dom"
import clsx from "clsx"
import { AiOutlineCaretDown, AiOutlineCaretRight } from "react-icons/ai"
import { useSelector } from "react-redux"
import { TbArrowForwardUp } from "react-icons/tb"

const activedStyle =
  "px-4 py-2 flex items-center gap-2 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-lg transition-all duration-300"
const notActivedStyle = "px-4 py-2 flex items-center gap-2 hover:bg-indigo-50 hover:text-indigo-600 rounded-lg transition-all duration-300"

const MemberSidebar = () => {
  const [actived, setActived] = useState([])
  const { current } = useSelector((state) => state.user)
  const handleShowTabs = (tabID) => {
    if (actived.some((el) => el === tabID))
      setActived((prev) => prev.filter((el) => el !== tabID))
    else setActived((prev) => [...prev, tabID])
  }

  return (
    <div className="bg-white h-screen py-4 w-[250px] flex-none rounded-lg shadow-lg m-4 mr-0 flex flex-col justify-between text-lg">
      <div className="w-full flex flex-col items-center justify-center py-6 border-b border-gray-200">
        <img
          src={current?.avatar || avatar}
          alt="avatar"
          className="w-24 h-24 object-cover rounded-full border-4 border-indigo-500 mb-4 hover:scale-105 transition-transform duration-300"
        />
        <h3 className="text-xl font-semibold text-gray-800">{`${current?.firstname} ${current?.lastname}`}</h3>
        <p className="text-sm text-gray-500">Thành viên</p>
      </div>
      <div className="mt-4 space-y-2 px-2 flex-grow">
        {memberSidebar.map((el, idx) => (
          <Fragment key={idx}>
            {el.type === "SINGLE" && (
              <NavLink
                to={el.path}
                className={({ isActive }) =>
                  clsx(isActive && activedStyle, !isActive && notActivedStyle)
                }
              >
                <span>{el.icon}</span>
                <span>{el.text}</span>
              </NavLink>
            )}
            {el.type === "PARENT" && (
              <div className="flex flex-col">
                <div 
                  onClick={() => handleShowTabs(+el.id)}
                  className="flex items-center justify-between px-4 py-2 hover:bg-indigo-50 cursor-pointer rounded-lg group"
                >
                  <div className="flex items-center gap-2 group-hover:text-indigo-600">
                    <span>{el.icon}</span>
                    <span>{el.text}</span>
                  </div>
                  {actived.some((id) => id === el.id) ? (
                    <AiOutlineCaretRight className="text-indigo-600" />
                  ) : (
                    <AiOutlineCaretDown className="group-hover:text-indigo-600" />
                  )}
                </div>
                {actived.some((id) => +id === +el.id) && (
                  <div className="flex flex-col space-y-1 pl-8">
                    {el.submenu.map((item) => (
                      <NavLink
                        key={item.text}
                        to={item.path}
                        onClick={(e) => e.stopPropagation()}
                        className={({ isActive }) =>
                          clsx(
                            isActive && activedStyle,
                            !isActive && notActivedStyle,
                            "pl-8"
                          )
                        }
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
      <NavLink 
        to={"/"} 
        className={clsx(notActivedStyle, "mb-8 border-t border-gray-200 pt-4 mx-2")}
      >
        <TbArrowForwardUp size={18} />
        Về trang chính
      </NavLink>
    </div>
  )
}

export default memo(MemberSidebar)