import React, { useCallback, useEffect, useState } from 'react'
import { apiGetUsers, apiUpdateUser, apiDeleteUser } from 'apis/user'
import { roles, blockStatus } from 'utils/contants'
import moment from 'moment'
import { InputField, Pagination, InputForm, Select, Button } from 'components'
import useDebounce from 'hooks/useDebounce'
import { useSearchParams } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { toast } from 'react-toastify'
import Swal from 'sweetalert2'
import clsx from 'clsx'

const ManageUser = () => {
    const { handleSubmit, register, formState: { errors }, reset, setValue } = useForm({
        defaultValues: {
            email: '',
            firstname: '',
            lastname: '',
            role: '',
            phone: '',
            isBlocked: ''
        }
    })
    const [users, setUsers] = useState(null)
    const [queries, setQueries] = useState({
        q: ""
    })
    const [update, setUpdate] = useState(false)
    const [editElm, setEditElm] = useState(null)
    const [params] = useSearchParams()
    const [selectedUser, setSelectedUser] = useState(null)

    const fetchUsers = async (params) => {
        const response = await apiGetUsers({ ...params, limit: process.env.REACT_APP_LIMIT })
        if (response.success) setUsers(response)
    }

    const render = useCallback(() => {
        setUpdate(!update)
    }, [update])
    const queriesDebounce = useDebounce(queries.q, 800)

    useEffect(() => {
        const queries = Object.fromEntries([...params])
        if (queriesDebounce) queries.q = queriesDebounce
        fetchUsers(queries)
    }, [queriesDebounce, params, update])

    const handleEditClick = (el) => {
        setEditElm(el)
        // Populate form with current user data
        setValue('email', el.email)
        setValue('firstname', el.firstname)
        setValue('lastname', el.lastname)
        setValue('role', el.role)
        setValue('phone', el.mobile)
        setValue('isBlocked', el.isBlocked)
    }

    const handleUpdate = async (data) => {
        // Check if any data has actually changed
        const hasChanges = 
            data.firstname !== editElm.firstname ||
            data.lastname !== editElm.lastname ||
            +data.role !== +editElm.role ||
            data.phone !== editElm.mobile ||
            data.isBlocked !== editElm.isBlocked

        if (!hasChanges) {
            toast.info('No changes made')
            setEditElm(null)
            return
        }

        const response = await apiUpdateUser(data, editElm._id)
        if (response.success) {
            setEditElm(null)
            render()
            toast.success(response.mes)
        } else {
            toast.error(response.mes)
        }
    }

    const handleDeleteUser = (user) => {
        setSelectedUser(user)
    }

    const confirmDelete = async () => {
        if (selectedUser) {
            const response = await apiDeleteUser(selectedUser._id)
            if (response.success) {
                render()
                toast.success(response.mes)
                setSelectedUser(null)
            } else toast.error(response.mes)
        }
    }

    return (
      <div className={clsx("w-full bg-white/30 backdrop-blur-xl rounded-2xl p-6 shadow-2xl", editElm && "pl-16")}>
        <h1 className="flex justify-between items-center text-3xl font-bold mb-6 pb-4 border-b-2 border-transparent">
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-500 to-pink-500">
            Quản lý tài khoản
          </span>
        </h1>
        <div className="w-full">
          <div className="flex justify-end py-2">
            <InputField
              nameKey={"q"}
              value={queries.q}
              setValue={setQueries}
              placeholder="Tìm kiếm tài khoản..."
              className="h-11 bg-white/50 backdrop-blur-sm border border-purple-200 rounded-xl"
              isHideLabel
            />
          </div>
          <form onSubmit={handleSubmit(handleUpdate)}>
            {editElm && (
              <div className="flex space-x-2 mb-4">
                <Button 
                  type="submit" 
                  className="bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl hover:opacity-90"
                >
                  Update
                </Button>
                <Button 
                  type="button"
                  onClick={() => setEditElm(null)}
                  className="bg-gray-200 text-gray-800 rounded-xl hover:bg-gray-300"
                >
                  Cancel
                </Button>
              </div>
            )}
            <div className="overflow-x-auto">
              <table className="w-full border-collapse rounded-2xl overflow-hidden">
                <thead className="bg-gradient-to-r from-purple-600 to-pink-500 text-white">
                  <tr>
                    <th className="px-6 py-4 text-left">#</th>
                    <th className="px-6 py-4 text-left">Email</th>
                    <th className="px-6 py-4 text-left">Họ</th>
                    <th className="px-6 py-4 text-left">Tên</th>
                    <th className="px-6 py-4 text-left">Vai trò</th>
                    <th className="px-6 py-4 text-left">Số điện thoại</th>
                    <th className="px-6 py-4 text-center">Trạng thái</th>
                    <th className="px-6 py-4 text-center">Ngày tạo</th>
                    <th className="px-6 py-4 text-center">Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  {users?.users?.map((el, idx) => (
                    <tr key={el._id} className="border-b hover:bg-purple-50/50 transition-all">
                      <td className="py-4 px-6">{idx + 1}</td>
                      <td className="py-4 px-6">{el.email}</td>
                      <td className="py-4 px-6">{el.firstname}</td>
                      <td className="py-4 px-6">{el.lastname}</td>
                      <td className="py-4 px-6">
                        {editElm?._id === el._id ? (
                          <Select
                            register={register}
                            fullWidth
                            errors={errors}
                            defaultValue={+el.role}
                            id={"role"}
                            validate={{ required: "Require fill." }}
                            options={roles}
                            className="bg-purple-100 rounded-xl"
                          />
                        ) : (
                          <span className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-sm">
                            {roles.find((role) => +role.code === +el.role)?.value}
                          </span>
                        )}
                      </td>

                      <td className="py-4 px-6">{el.mobile}</td>

                      <td className="py-4 px-6 text-center">
                        {editElm?._id === el._id ? (
                          <Select
                            register={register}
                            fullWidth
                            errors={errors}
                            defaultValue={el.isBlocked}
                            id={"isBlocked"}
                            validate={{ required: "Require fill." }}
                            options={blockStatus}
                            className="bg-purple-100 rounded-xl"
                          />
                        ) : (
                          <span className={`
                            px-3 py-1 rounded-full text-sm
                            ${el.isBlocked 
                              ? "bg-red-100 text-red-800" 
                              : "bg-green-100 text-green-800"
                            }`
                          }>
                            {el.isBlocked ? "Chặn" : "Kích hoạt"}
                          </span>
                        )}
                      </td>

                      <td className="py-4 px-6 text-center">
                        <div className="flex flex-col items-center">
                          <span>{moment(el.createdAt).format("DD/MM/YYYY")}</span>
                          <span className="text-sm text-gray-500">
                            {moment(el.createdAt).format("HH:mm:ss")}
                          </span>
                        </div>
                      </td>
                      <td className="py-4 px-6 text-center space-x-2">
                        <button 
                          type="button"
                          onClick={() => handleEditClick(el)}
                          className="text-purple-600 hover:bg-purple-100 p-2 rounded-full transition-all"
                        >
                          Cập nhật
                        </button>
                        <button 
                          type="button"
                          onClick={() => handleDeleteUser(el._id)}
                          className="text-red-600 hover:bg-red-100 p-2 rounded-full transition-all"
                        >
                          Xoá
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </form>
          <div className="w-full flex justify-end mt-4">
            <Pagination totalCount={users?.counts} />
          </div>
        </div>

        {selectedUser && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
                    <h2 className="text-2xl font-bold mb-4 text-gray-800">Xác nhận xóa tài khoản</h2>
                    
                    <div className="space-y-3 mb-6">
                        <p className="flex justify-between">
                            <span className="font-semibold">Email:</span>
                            <span>{selectedUser.email}</span>
                        </p>
                        <p className="flex justify-between">
                            <span className="font-semibold">Họ và tên:</span>
                            <span>{selectedUser.firstname} {selectedUser.lastname}</span>
                        </p>
                        <p className="flex justify-between">
                            <span className="font-semibold">Số điện thoại:</span>
                            <span>{selectedUser.mobile}</span>
                        </p>
                        <p className="flex justify-between">
                            <span className="font-semibold">Vai trò:</span>
                            <span>{roles.find(role => +role.code === +selectedUser.role)?.value}</span>
                        </p>
                        <p className="flex justify-between">
                            <span className="font-semibold">Trạng thái:</span>
                            <span className={`px-2 py-1 rounded ${selectedUser.isBlocked ? "bg-red-100 text-red-800" : "bg-green-100 text-green-800"}`}>
                                {selectedUser.isBlocked ? "Đã chặn" : "Đang hoạt động"}
                            </span>
                        </p>
                    </div>

                    <div className="flex justify-end gap-4">
                        <button
                            onClick={confirmDelete}
                            className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-all"
                        >
                            Xác nhận xóa
                        </button>
                        <button
                            onClick={() => setSelectedUser(null)}
                            className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-all"
                        >
                            Hủy
                        </button>
                    </div>
                </div>
            </div>
        )}
      </div>
    );
}

export default ManageUser