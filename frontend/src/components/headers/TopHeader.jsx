import React, { useEffect } from "react"
import { Link, useNavigate } from "react-router-dom"
import path from "utils/path"
import { getCurrent } from "store/user/asyncActions"
import { useSelector, useDispatch } from "react-redux"
import icons from "utils/icons"
import { logout, clearMessage } from "store/user/userSlice"
import Swal from "sweetalert2"

const { AiOutlineLogout } = icons

const TopHeaders = () => {
  const { isLoggedIn, current, mes } = useSelector((state) => state.user)
  const dispatch = useDispatch()
  const navigate = useNavigate()
  useEffect(() => {
    const setTimeoutId = setTimeout(() => {
      if (isLoggedIn) dispatch(getCurrent())
    }, 300)

    return () => {
      clearTimeout(setTimeoutId)
    }
  }, [dispatch, isLoggedIn])

  useEffect(() => {
    if (mes)
      Swal.fire("Oops!", mes, "info").then(() => {
        dispatch(clearMessage())
        navigate(`/${path.LOGIN}`)
      })
  }, [mes])
  return (
    <div className="h-[38px] w-full bg-gradient-to-r from-indigo-600 via-purple-600 to-purple-700 flex items-center justify-center shadow-md">
      <div className="w-main flex items-center justify-end text-[14px] text-white px-4 md:px-0">
        {isLoggedIn && current ? (
          <div className="flex gap-4 w-full md:w-fit text-[14px] justify-between md:justify-start items-center">
            <span className="pl-2 font-medium">{`Xin chào, ${current?.firstname} ${current?.lastname} `}</span>
          </div>
        ) : (
          <Link className="hover:text-gray-200 transition-colors duration-300 font-medium" to={`/${path.LOGIN}`}>
            Đăng ký/Đăng nhập
          </Link>
        )}
      </div>
    </div>
  );
}

export default TopHeaders