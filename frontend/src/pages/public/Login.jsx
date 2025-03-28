import React, { useState, useCallback, useEffect } from "react"
import { InputField, Button, Loading } from "components"
import {
  apiRegister,
  apiLogin,
  apiForgotPassword,
  apiFinalRegister,
  apiResetPassword,
} from "apis/user"
import Swal from "sweetalert2"
import { useNavigate, Link, useSearchParams } from "react-router-dom"
import path from "utils/path"
import { login } from "store/user/userSlice"
import { showModal } from "store/app/appSlice"
import { useDispatch } from "react-redux"
import { toast } from "react-toastify"
import { validate } from "utils/helpers"

const Login = () => {
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const [payload, setPayload] = useState({
    email: "",
    password: "",
    firstname: "",
    lastname: "",
    mobile: "",
  })
  const [isVerifiedEmail, setIsVerifiedEmail] = useState(false)
  const [invalidFields, setInvalidFields] = useState([])
  const [isRegister, setIsRegister] = useState(false)
  const [isForgotPassword, setIsForgotPassword] = useState(false)
  const [searchParams] = useSearchParams()
  const [showPassword, setShowPassword] = useState(false)
  const resetPayload = () => {
    setPayload({
      email: "",
      password: "",
      firstname: "",
      lastname: "",
      mobile: "",
    })
  }
  const [token, setToken] = useState("")
  const [email, setEmail] = useState("")
  const [resetToken, setResetToken] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmNewPassword, setConfirmNewPassword] = useState("")
  const [isResetPassword, setIsResetPassword] = useState(false)
  
  const handleForgotPassword = async () => {
    const response = await apiForgotPassword({ email })
    if (response.success) {
      toast.success(response.mes, { theme: "colored" })
      setIsResetPassword(true)
    } else toast.info(response.mes, { theme: "colored" })
  }
  
  const handleResetPassword = async () => {
    if (newPassword !== confirmNewPassword) {
      toast.error('Mật khẩu xác nhận không khớp', { theme: 'colored' })
      return
    }
    
    const response = await apiResetPassword({ password: newPassword, token: resetToken })
    if (response.success) {
      toast.success(response.mes, { theme: 'colored' })
      setIsResetPassword(false)
      setIsForgotPassword(false)
      setNewPassword("")
      setConfirmNewPassword("")
      setResetToken("")
      setEmail("")
    } else toast.info(response.mes, { theme: 'colored' })
  }
  
  useEffect(() => {
    resetPayload()
  }, [isRegister])
  
  const handleSubmit = useCallback(async () => {
    const { firstname, lastname, mobile, ...data } = payload
    const { password, confirmPassword } = payload

    const invalids = isRegister
      ? validate(payload, setInvalidFields)
      : validate(data, setInvalidFields)
    if (invalids === 0) {
      if (isRegister) {
        dispatch(showModal({ isShowModal: true, modalChildren: <Loading /> }))
        if (password !== confirmPassword) {
          setInvalidFields((prev) => [
            ...prev,
            { name: "confirmPassword", message: "Mật khẩu không khớp" },
          ])
          return
        }
        const response = await apiRegister(payload)
        dispatch(showModal({ isShowModal: false, modalChildren: null }))
        if (response.success) {
          setIsVerifiedEmail(true)
        } else Swal.fire("Oops!", response.mes, "error")
      } else {
        const rs = await apiLogin(data)
        if (rs.success) {
          dispatch(
            login({
              isLoggedIn: true,
              token: rs.accessToken,
              userData: rs.userData,
            })
          )
          searchParams.get("redirect")
            ? navigate(searchParams.get("redirect"))
            : navigate(`/${path.HOME}`)
        } else {
          Swal.fire("Oops!", rs.mes, "error")
        }
      }
    }
  }, [payload, isRegister])

  const finalRegister = async () => {
    const response = await apiFinalRegister(token)
    if (response.success) {
      Swal.fire("Đăng ký thành công", response.mes, "success").then(() => {
        setIsRegister(false)
        resetPayload()
      })
    } else Swal.fire("Oops!", response.mes, "error")
    setIsVerifiedEmail(false)
    setToken("")
  }

  return (
    <div className="w-screen h-screen relative bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500">
      {isVerifiedEmail && (
        <div className="absolute top-0 left-0 right-0 bottom-0 bg-overlay z-50 flex flex-col justify-center items-center">
          <div className="bg-white w-[90%] max-w-[500px] rounded-lg shadow-lg p-8">
            <h4 className="text-lg font-semibold text-gray-800 mb-4">
              Chúng tôi đã gửi mã đến email của bạn. Vui lòng kiểm tra email và
              nhập mã của bạn:
            </h4>
            <input
              type="text"
              value={token}
              onChange={(e) => setToken(e.target.value)}
              className="p-3 border rounded-md outline-none w-full focus:border-indigo-500 transition-colors"
            />
            <button
              type="button"
              className="px-6 py-3 mt-6 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-md transition-colors w-full"
              onClick={finalRegister}
            >
              Xác nhận đăng ký
            </button>
          </div>
        </div>
      )}
      
      {isForgotPassword && (
        <div className="absolute top-0 left-0 bottom-0 right-0 bg-overlay z-50 flex flex-col items-center justify-center px-4 py-8">
          <div className="bg-white rounded-lg shadow-lg p-8 max-w-[800px] w-full">
            <h2 className="text-2xl font-semibold text-gray-800 mb-6">Quên mật khẩu</h2>
            <div className="flex w-full flex-col gap-4">
              <label htmlFor="email" className="text-gray-700 font-medium">Nhập email của bạn:</label>
              <input
                type="text"
                id="email"
                className="w-full p-3 border rounded-md outline-none focus:border-indigo-500 transition-colors"
                placeholder="email@gmail.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <div className="flex items-center justify-end w-full gap-4 mt-4">
                <Button
                  name="Submit"
                  handleOnClick={handleForgotPassword}
                  style="px-6 py-3 rounded-md text-white bg-indigo-600 hover:bg-indigo-700 font-semibold transition-colors"
                >
                  Gửi mã
                </Button>
                <Button
                  name="Back"
                  handleOnClick={() => setIsForgotPassword(false)}
                  style="px-6 py-3 rounded-md text-gray-700 bg-gray-200 hover:bg-gray-300 font-semibold transition-colors"
                >
                  Quay về
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {isResetPassword && (
        <div className="absolute top-0 left-0 bottom-0 right-0 bg-black bg-opacity-30 z-50 flex flex-col items-center justify-center">
          <div className="bg-white bg-opacity-95 rounded-lg shadow-lg p-8 w-1/2 h-1/2 flex flex-col">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Đặt lại mật khẩu</h2>
            
            <div className="flex flex-col gap-4 flex-1">
              <div className="w-full">
                <label 
                  htmlFor="resetToken" 
                  className="block text-gray-700 font-medium mb-2"
                >
                  Mã xác nhận:
                </label>
                <input
                  type="text"
                  id="resetToken"
                  className="w-full p-3 border rounded-md outline-none focus:border-indigo-500 transition-colors"
                  placeholder="Nhập mã xác nhận từ email"
                  value={resetToken}
                  onChange={e => setResetToken(e.target.value)}
                />
              </div>
              
              <div className="w-full">
                <label 
                  htmlFor="newPassword" 
                  className="block text-gray-700 font-medium mb-2"
                >
                  Mật khẩu mới:
                </label>
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="newPassword"
                  className="w-full p-3 border rounded-md outline-none focus:border-indigo-500 transition-colors"
                  placeholder="Nhập mật khẩu mới"
                  value={newPassword}
                  onChange={e => setNewPassword(e.target.value)}
                />
              </div>
              
              <div className="w-full">
                <label 
                  htmlFor="confirmNewPassword" 
                  className="block text-gray-700 font-medium mb-2"
                >
                  Xác nhận mật khẩu:
                </label>
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="confirmNewPassword"
                  className="w-full p-3 border rounded-md outline-none focus:border-indigo-500 transition-colors"
                  placeholder="Nhập lại mật khẩu mới"
                  value={confirmNewPassword}
                  onChange={e => setConfirmNewPassword(e.target.value)}
                />
              </div>
              
              <div className="flex items-center mt-2">
                <input
                  type="checkbox"
                  id="showPassword"
                  checked={showPassword}
                  onChange={() => setShowPassword((prev) => !prev)}
                  className="form-checkbox mr-2 w-5 h-5 text-indigo-600"
                />
                <label htmlFor="showPassword" className="text-gray-700">Hiển thị mật khẩu</label>
              </div>
              
              <div className="flex items-center justify-end w-full mt-auto gap-4">
                <Button
                  name="Quay lại"
                  handleOnClick={() => setIsResetPassword(false)}
                  style="px-6 py-3 rounded-md text-gray-700 bg-gray-200 hover:bg-gray-300 font-semibold transition-colors"
                />
                <Button
                  name="Xác nhận"
                  handleOnClick={handleResetPassword}
                  style="px-6 py-3 rounded-md text-white bg-indigo-600 hover:bg-indigo-700 font-semibold transition-colors"
                />
              </div>
            </div>
          </div>
        </div>
      )}
      
      <div className="absolute top-0 left-0 right-0 h-64 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500"></div>
      <div className="absolute top-0 bottom-0 left-0 right-0 items-center justify-center flex">
        <div className="p-8 bg-white flex flex-col items-center rounded-lg shadow-lg md:min-w-[500px] max-w-[90%]">
          <h1 className="text-3xl font-bold text-gray-800 mb-8">
            {isRegister ? "Đăng ký tài khoản" : "Đăng nhập"}
          </h1>
          {isRegister && (
            <div className="flex items-center gap-4 w-full mb-4">
              <InputField
                value={payload.firstname}
                setValue={setPayload}
                nameKey="firstname"
                placeholder="Họ"
                invalidFields={invalidFields}
                setInvalidFieds={setInvalidFields}
                isHideLabel={true}
                style="p-3 border rounded-md focus:border-indigo-500 transition-colors"
              />
              <InputField
                value={payload.lastname}
                setValue={setPayload}
                nameKey="lastname"
                placeholder="Tên"
                invalidFields={invalidFields}
                setInvalidFieds={setInvalidFields}
                isHideLabel={true}
                style="p-3 border rounded-md focus:border-indigo-500 transition-colors"
              />
            </div>
          )}
          <div className="w-full mb-4">
            <InputField
              value={payload.email}
              setValue={setPayload}
              nameKey="email"
              placeholder="Email"
              invalidFields={invalidFields}
              setInvalidFieds={setInvalidFields}
              isHideLabel={true}
              fullWidth
              style="p-3 border rounded-md focus:border-indigo-500 transition-colors"
              pattern="^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$"
              title="Vui lòng nhập email hợp lệ (ví dụ: example@email.com)"
              type="email"
            />
          </div>
          {isRegister && (
            <div className="w-full mb-4">
              <InputField
                value={payload.mobile}
                setValue={setPayload}
                nameKey="mobile"
                placeholder="Số điện thoại"
                invalidFields={invalidFields}
                setInvalidFieds={setInvalidFields}
                isHideLabel={true}
                fullWidth
                style="p-3 border rounded-md focus:border-indigo-500 transition-colors"
                pattern="^[0-9]+$"
                title="Chỉ được nhập số điện thoại hợp lệ (chỉ chứa số)"
                type="tel"
              />
            </div>
          )}
          <div className="w-full relative flex flex-col gap-4 mb-6">
            <InputField
              value={payload.password}
              setValue={setPayload}
              nameKey="password"
              type={showPassword ? "text" : "password"}
              invalidFields={invalidFields}
              setInvalidFieds={setInvalidFields}
              isHideLabel={true}
              fullWidth
              placeholder="Mật khẩu"
              style="p-3 border rounded-md focus:border-indigo-500 transition-colors"
            />
            {isRegister && (
              <InputField
                value={payload.confirmPassword}
                setValue={setPayload}
                nameKey="confirmPassword"
                type={showPassword ? "text" : "password"}
                invalidFields={invalidFields}
                setInvalidFieds={setInvalidFields}
                isHideLabel={true}
                fullWidth
                placeholder="Xác nhận mật khẩu"
                style="p-3 border rounded-md focus:border-indigo-500 transition-colors"
              />
            )}
            <div className="flex items-center mt-2">
              <input
                type="checkbox"
                id="showPassword"
                checked={showPassword}
                onChange={() => setShowPassword((prev) => !prev)}
                className="form-checkbox mr-2 w-5 h-5 text-indigo-600"
              />
              <label htmlFor="showPassword" className="text-gray-700">Hiển thị mật khẩu</label>
            </div>
          </div>
  
          <Button 
            handleOnClick={handleSubmit} 
            fw
            style="px-6 py-3 rounded-md text-white bg-indigo-600 hover:bg-indigo-700 font-semibold w-full transition-colors"
          >
            {isRegister ? "Đăng ký" : "Đăng nhập"}
          </Button>
          <div className="flex items-center justify-between my-4 w-full">
            {!isRegister && (
              <span
                onClick={() => setIsForgotPassword(true)}
                className="text-indigo-600 hover:text-indigo-800 hover:underline cursor-pointer text-sm font-medium"
              >
                Quên mật khẩu?
              </span>
            )}
            {!isRegister && (
              <span
                className="text-indigo-600 hover:text-indigo-800 hover:underline cursor-pointer text-sm font-medium"
                onClick={() => setIsRegister(true)}
              >
                Chưa có tài khoản?
              </span>
            )}
            {isRegister && (
              <span
                className="text-indigo-600 hover:text-indigo-800 hover:underline cursor-pointer w-full text-center text-sm font-medium"
                onClick={() => setIsRegister(false)}
              >
                Đã có tài khoản? Đăng nhập
              </span>
            )}
          </div>
          <Link
            className="text-indigo-600 hover:text-indigo-800 text-sm font-medium hover:underline cursor-pointer mt-2"
            to={`/${path.HOME}`}
          >
            Quay về trang chủ
          </Link>
        </div>
      </div>
    </div>
  )
}

export default Login