import { Button, InputForm } from 'components'
import moment from 'moment'
import React, { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { useDispatch, useSelector } from 'react-redux'
import avatar from 'assets/avatarDefault.png'
import { apiUpdateCurrent } from 'apis'
import { getCurrent } from 'store/user/asyncActions'
import { toast } from 'react-toastify'
import { getBase64 } from 'utils/helpers'
import { useSearchParams } from 'react-router-dom'
import withBaseComponent from 'hocs/withBaseComponent'

const Personal = ({ navigate }) => {
    const { register, formState: { errors, isDirty }, handleSubmit, reset, watch } = useForm()
    const { current } = useSelector(state => state.user)
    const dispatch = useDispatch()
    const [searchParams] = useSearchParams()

    useEffect(() => {
        reset({
            firstname: current?.firstname,
            lastname: current?.lastname,
            mobile: current?.mobile,
            email: current?.email,
            avatar: current?.avatar,
            address: current?.address,
        })
    }, [current])

    const handleUpdateInfor = async (data) => {
        const formData = new FormData()
        if (data.avatar.length > 0) formData.append('avatar', data.avatar[0])
        delete data.avatar
        for (let i of Object.entries(data)) formData.append(i[0], i[1])

        const response = await apiUpdateCurrent(formData)
        if (response.success) {
            dispatch(getCurrent())
            toast.success(response.mes)
            if (searchParams.get('redirect')) navigate(searchParams.get('redirect'))
        } else toast.error(response.mes)
    }

    return (
      <div className="w-full relative px-4">
        <header className="text-xl md:text-3xl font-semibold py-3 md:py-4 border-b-2 border-indigo-600 mb-6 md:mb-8 flex items-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 md:h-8 md:w-8 mr-2 md:mr-3 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
          Thông tin cá nhân
        </header>
        <form
          onSubmit={handleSubmit(handleUpdateInfor)}
          className="w-full md:w-3/5 mx-auto py-6 md:py-8 flex flex-col gap-4 md:gap-6 bg-white rounded-lg shadow-lg p-4 md:p-8"
        >
          <div className="flex justify-center mb-4">
            <label htmlFor="file" className="cursor-pointer">
              <img
                src={current?.avatar || avatar}
                alt="avatar"
                className="w-24 h-24 md:w-32 md:h-32 object-cover rounded-full border-4 border-indigo-500 hover:scale-105 transition-transform duration-300"
              />
            </label>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
            <InputForm
              label="Họ"
              id="firstname"
              register={register}
              errors={errors}
              className="col-span-1"
            />
            <InputForm
              label="Tên"
              id="lastname"
              register={register}
              errors={errors}
              className="col-span-1"
            />
          </div>
          <InputForm
            label="Số điện thoại"
            id="mobile"
            register={register}
            errors={errors}
            fullWidth
          />
          <InputForm
            label="Email"
            id="email"
            register={register}
            errors={errors}
            fullWidth
          />
          <InputForm
            label="Địa chỉ"
            id="address"
            register={register}
            errors={errors}
            fullWidth
          />
          <input
            type="file"
            id="avatar"
            {...register("avatar")}
            className="mt-2 p-2 border rounded-md w-full text-sm text-gray-500 file:mr-4 file:rounded-full file:border-0 file:bg-indigo-50 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-indigo-700 hover:file:bg-indigo-100"
          />
          <Button
            type="submit"
            className="w-full bg-gradient-to-r from-indigo-600 via-purple-500 to-pink-500 text-white py-2 md:py-3 rounded-lg hover:opacity-90 transition-opacity duration-300 flex items-center justify-center text-sm md:text-base"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 md:h-5 md:w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Cập nhật thông tin
          </Button>
        </form>
      </div>
    );
}

export default withBaseComponent(Personal)