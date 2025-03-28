import { Button, InputForm } from 'components'
import React, { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { useDispatch, useSelector } from 'react-redux'
import avatar from 'assets/avatarDefault.png'
import { apiUpdateCurrent } from 'apis'
import { getCurrent } from 'store/user/asyncActions'
import { toast } from 'react-toastify'
import { useSearchParams } from 'react-router-dom'
import withBaseComponent from 'hocs/withBaseComponent'

const AdminPersonal = ({ navigate }) => {
  const { register, formState: { errors }, handleSubmit, reset } = useForm()
  const { current } = useSelector(state => state.user)
  const dispatch = useDispatch()
  const [searchParams] = useSearchParams()

  useEffect(() => {
    if (current) {
      reset({
        firstname: current.firstname,
        lastname: current.lastname,
        mobile: current.mobile,
        email: current.email,
        avatar: current.avatar,
        address: current.address,
        role: current.role
      });
    }
  }, [current, reset])

  const handleUpdate = async (data) => {
    const formData = new FormData()
    if (data.avatar?.length > 0) formData.append('avatar', data.avatar[0])
    delete data.avatar
    Object.entries(data).forEach(([key, value]) => {
      formData.append(key, value)
    })

    const res = await apiUpdateCurrent(formData)
    if (res.success) {
      toast.success(res.mes)
      dispatch(getCurrent())
      if (searchParams.get('redirect')) navigate(searchParams.get('redirect'))
    } else {
      toast.error(res.mes)
    }
  }

  if (!current) return <div className="p-6">Đang tải dữ liệu...</div>

  return (
    <div className="w-full px-4">
      <header className="text-3xl font-semibold py-4 border-b-2 border-indigo-600 mb-8 flex items-center">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 mr-3 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
        Thông tin cá nhân (Admin)
      </header>
      <form
        onSubmit={handleSubmit(handleUpdate)}
        className="max-w-3xl mx-auto py-8 flex flex-col gap-6 bg-white rounded-lg shadow-md p-8"
      >
        <div className="flex flex-col items-center justify-center mb-4">
            <label htmlFor="file" className="cursor-pointer">
                <img
                src={current?.avatar || avatar}
                alt="avatar"
                className="w-32 h-32 object-cover rounded-full border-4 border-indigo-500 hover:scale-105 transition-transform duration-300"
                />
            </label>
            <span className="text-lg font-semibold text-indigo-600">
                {current?.role >= 1945 ? "ADMIN" : "User"}
            </span>
        </div>
        <div className="grid grid-cols-2 gap-6">
          <InputForm label="Họ" id="firstname" register={register} errors={errors} />
          <InputForm label="Tên" id="lastname" register={register} errors={errors} />
        </div>
        <InputForm label="Số điện thoại" id="mobile" register={register} errors={errors} fullWidth />
        <InputForm label="Email" id="email" register={register} errors={errors} fullWidth />
        <InputForm label="Địa chỉ" id="address" register={register} errors={errors} fullWidth />
        <input
          type="file"
          id="avatar"
          {...register("avatar")}
          className="mt-2 p-2 border rounded-md w-full text-sm text-gray-500 file:mr-4 file:rounded-full file:border-0 file:bg-indigo-50 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-indigo-700 hover:file:bg-indigo-100"
        />
        
        <Button
          type="submit"
          className="w-full bg-gradient-to-r from-indigo-600 via-purple-500 to-pink-500 text-white py-3 rounded-lg hover:opacity-90 transition-opacity duration-300 flex items-center justify-center"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          Cập nhật thông tin
        </Button>
      </form>
    </div>
  )
}

export default withBaseComponent(AdminPersonal)
