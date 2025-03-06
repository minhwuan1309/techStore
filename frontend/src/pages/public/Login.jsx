import React, { useState, useCallback, useEffect } from "react"
import { InputField, Button, Loading } from "components"
import {
  apiRegister,
  apiLogin,
  apiForgotPassword,
  apiFinalRegister,
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
  const handleForgotPassword = async () => {
    const response = await apiForgotPassword({ email })
    if (response.success) {
      toast.success(response.mes, { theme: "colored" })
    } else toast.info(response.mes, { theme: "colored" })
  }
  useEffect(() => {
    resetPayload()
  }, [isRegister])
  const handleSubmit = useCallback(async () => {
    const { firstname, lastname, mobile, ...data } = payload
    const { password, confirmPassword} = payload

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
          ]);
          return;
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
        } else{
        // Kiểm tra nếu tài khoản bị block (error code 403)
          if (rs.mes === "Tài khoản của bạn đã bị chặn!") {
            Swal.fire({
              title: "Tài khoản bị chặn",
              text: rs.mes,
              icon: "error",
              confirmButtonText: "OK",
            }).then(() => {
              navigate(`/${path.HOME}`);  // Quay về trang chủ sau khi nhấn OK
            });
          } else {
            Swal.fire("Oops!", rs.mes, "error");
          }
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
    <div className="w-screen h-screen relative">
      {isVerifiedEmail && (
        <div className="absolute top-0 left-0 right-0 bottom-0 bg-overlay z-50 flex flex-col justify-center items-center">
          <div className="bg-white w-[90%] max-w-[500px] rounded-md p-8">
            <h4 className="mb-4">
              Chúng tôi đã gửi mã đến email của bạn. Vui lòng kiểm tra email và
              nhập mã của bạn:
            </h4>
            <input
              type="text"
              value={token}
              onChange={(e) => setToken(e.target.value)}
              className="p-2 border rounded-md outline-none"
            />
            <button
              type="button"
              className="px-4 py-2 mt-4 mx-auto bg-blue-500 font-semibold text-white rounded-md ml-4"
              onClick={finalRegister}
            >
              Đăng ký
            </button>
          </div>
        </div>
      )}
      {isForgotPassword && (
        <div className="absolute animate-slide-right top-0 left-0 bottom-0 right-0 bg-white flex flex-col items-center px-4 py-8 z-50">
          <div className="flex w-full flex-col gap-4">
            <label htmlFor="email">Nhập email của bạn:</label>
            <input
              type="text"
              id="email"
              className="md:w-[800px] w-full pb-2 border-b outline-none placeholder:text-sm"
              placeholder="email@gmail.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <div className="flex items-center justify-end w-full gap-4">
              <Button
                name="Submit"
                handleOnClick={handleForgotPassword}
                style="px-4 py-2 rounded-md text-white bg-blue-500 text-semibold my-2"
              >
                Gửi mã
              </Button>
              <Button
                name="Back"
                handleOnClick={() => setIsForgotPassword(false)}
              >
                Quay về
              </Button>
            </div>
          </div>
        </div>
      )}
      <img
        src="https://img.freepik.com/premium-vector/blue-light-wave-abstract-background_230977-4201.jpg?semt=ais_hybrid"
        alt=""
        className="w-full h-full object-cover"
      />
      <div className="absolute top-0 bottom-0 left-0 right-0 items-center justify-center flex">
        <div className="p-8 bg-white flex flex-col items-center rounded-md md:min-w-[500px]">
          <h1 className="text-[28px] font-semibold text-main mb-8">
            {isRegister ? "Đăng ký" : "Đăng nhập"}
          </h1>
          {isRegister && (
            <div className="flex items-center gap-2">
              <InputField
                value={payload.firstname}
                setValue={setPayload}
                nameKey="firstname"
                placeholder="Họ"
                invalidFields={invalidFields}
                setInvalidFieds={setInvalidFields}
                isHideLabel={true}
              />
              <InputField
                value={payload.lastname}
                setValue={setPayload}
                nameKey="lastname"
                placeholder="Tên"
                invalidFields={invalidFields}
                setInvalidFieds={setInvalidFields}
                isHideLabel={true}
              />
            </div>
          )}
          <InputField
            value={payload.email}
            setValue={setPayload}
            nameKey="email"
            placeholder="Email"
            invalidFields={invalidFields}
            setInvalidFieds={setInvalidFields}
            isHideLabel={true}
            fullWidth
          />
          {isRegister && (
            <InputField
              value={payload.mobile}
              setValue={setPayload}
              nameKey="mobile"
              placeholder="Số điện thoại"
              invalidFields={invalidFields}
              setInvalidFieds={setInvalidFields}
              isHideLabel={true}
              fullWidth
            />
          )}
          <div className="w-full relative flex flex-col gap-2">
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
            />
            {isRegister && (
              <InputField
                value={payload.confirmPassword}
                setValue={setPayload}
                nameKey="confirmPassword"
                type="password"
                invalidFields={invalidFields}
                setInvalidFieds={setInvalidFields}
                isHideLabel={true}
                fullWidth
                placeholder="Xác nhận mật khẩu"
              />
            )}
            <div className="flex items-center mt-2 ml-1">
              <input
                type="checkbox"
                id="showPassword"
                checked={showPassword}
                onChange={() => setShowPassword((prev) => !prev)}
                className="form-checkbox mr-2 w-5 h-5"
              />
              <label htmlFor="showPassword">Hiển thị mật khẩu</label>
            </div>
          </div>

          <Button handleOnClick={handleSubmit} fw>
            {isRegister ? "Đăng ký" : "Đăng nhập"}
          </Button>
          <div className="flex items-center justify-between my-2 w-full text-sm">
            {!isRegister && (
              <span
                onClick={() => setIsForgotPassword(true)}
                className="text-blue-500 hover:underline cursor-pointer"
              >
                Quên mật khẩu?
              </span>
            )}
            {!isRegister && (
              <span
                className="text-blue-500 hover:underline cursor-pointer"
                onClick={() => setIsRegister(true)}
              >
                Chưa có tài khoản?
              </span>
            )}
            {isRegister && (
              <span
                className="text-blue-500 hover:underline cursor-pointer w-full text-center"
                onClick={() => setIsRegister(false)}
              >
                Đăng nhập
              </span>
            )}
          </div>
          <Link
            className="text-blue-500 text-sm hover:underline cursor-pointer"
            to={`/${path.HOME}`}
          >
            Trang chủ
          </Link>
        </div>
      </div>
    </div>
  );
}

export default Login
