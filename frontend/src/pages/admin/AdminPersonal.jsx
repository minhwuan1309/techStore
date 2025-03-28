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
      <form
        onSubmit={handleSubmit(handleUpdate)}
        className="max-w-3xl mx-auto py-7 flex flex-col gap-6 
        bg-white/30 backdrop-blur-xl border border-white/20 
        rounded-2xl shadow-2xl p-8"
      >
        <div className="flex flex-col items-center justify-center mb-4 space-y-4">
          <div className="relative">
            <label htmlFor="file" className="cursor-pointer">
              <img
                src={current?.avatar || avatar}
                alt="avatar"
                className="w-40 h-40 object-cover rounded-full 
                border-4 border-transparent 
                bg-gradient-to-r from-purple-500 to-pink-500 p-1
                transition-transform duration-300 hover:scale-105 
                hover:rotate-6"
              />
              <div className="absolute bottom-0 right-0 bg-purple-500 text-white p-2 rounded-full">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M4 5a2 2 0 00-2 2v8a2 2 0 002 2h12a2 2 0 002-2V7a2 2 0 00-2-2h-1.586a1 1 0 01-.707-.293l-1.414-1.414A1 1 0 0011.586 3H8.414a1 1 0 00-.707.293L6.293 4.707A1 1 0 015.586 5H4zm6 9a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
                </svg>
              </div>
            </label>
          </div>
          <span className="text-xl font-semibold text-transparent bg-clip-text bg-gradient-to-r from-purple-500 to-pink-500">
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
          className="mt-2 p-4 border-2 border-dashed 
          border-purple-300 rounded-xl text-sm 
          text-gray-500 file:mr-4 file:rounded-full 
          file:border-0 file:bg-purple-50 
          file:px-4 file:py-2 file:text-sm 
          file:font-semibold file:text-purple-700 
          hover:file:bg-purple-100 
          transition-all duration-300"
        />
        
        <Button
          type="submit"
          className="w-full bg-gradient-to-r from-purple-600 via-pink-500 to-red-500 
          text-white py-4 rounded-xl hover:opacity-90 
          transition-all duration-300 flex items-center 
          justify-center space-x-3 
          transform hover:scale-[1.02] active:scale-[0.98]"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          <span>Cập nhật thông tin</span>
        </Button>
      </form>
    </div>
  )
}

export default withBaseComponent(AdminPersonal)