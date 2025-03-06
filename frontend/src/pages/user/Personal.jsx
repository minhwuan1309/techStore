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
        <header className="text-3xl font-semibold py-4 border-b border-b-blue-200">
          Thông tin cá nhân
        </header>
        <form
          onSubmit={handleSubmit(handleUpdateInfor)}
          className="w-3/5 mx-auto py-8 flex flex-col gap-4"
        >
          <InputForm
            label="Họ"
            id="firstname"
            register={register}
            errors={errors}
            fullWidth
          />
          <InputForm
            label="Tên"
            id="lastname"
            register={register}
            errors={errors}
            fullWidth
          />
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
          <label
            htmlFor="avatar"
            className="block text-lg font-medium text-gray-700"
          >
            Ảnh đại diện
          </label>
          <label htmlFor="file">
            <img
              src={current?.avatar || avatar}
              alt="avatar"
              className="w-20 h-20 ml-8 object-cover rounded-full"
            />
          </label>
          <input
            type="file"
            id="avatar"
            {...register("avatar")}
            className="mt-2 p-2 border rounded-md w-full"
          />
          <Button
            type="submit"
            className="w-full bg-blue-500 text-white py-2 rounded-lg"
          >
            Cập nhật thông tin
          </Button>
        </form>
      </div>
    );
}

export default withBaseComponent(Personal)
