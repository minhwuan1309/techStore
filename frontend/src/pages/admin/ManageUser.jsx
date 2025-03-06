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
    const { handleSubmit, register, formState: { errors }, reset } = useForm({
        emai: '',
        firstname: '',
        lastname: '',
        role: '',
        phone: '',
        isBlocked: ''
    })
    const [users, setUsers] = useState(null)
    const [queries, setQueries] = useState({
        q: ""
    })
    const [update, setUpdate] = useState(false)
    const [editElm, setEditElm] = useState(null)
    const [params] = useSearchParams()
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
    const handleUpdate = async (data) => {
        const response = await apiUpdateUser(data, editElm._id)
        if (response.success) {
            setEditElm(null)
            render()
            toast.success(response.mes)
        } else toast.error(response.mes)
    }
    const handleDeleteUser = (uid) => {
        Swal.fire({
            title: 'Are you sure...',
            text: 'Are you ready remove this user?',
            showCancelButton: true
        }).then(async (result) => {
            if (result.isConfirmed) {
                const response = await apiDeleteUser(uid)
                if (response.success) {
                    render()
                    toast.success(response.mes)
                } else toast.error(response.mes)
            }
        })
    }
    return (
      <div className={clsx("w-full", editElm && "pl-16")}>
        <h1 className="h-[75px] flex justify-between items-center text-3xl font-bold px-4 border-b">
          <span>Quản lý tài khoản</span>
        </h1>
        <div className="w-full p-4">
          <div className="flex justify-end py-4 border-gray-300">
            <InputField
              nameKey={"q"}
              value={queries.q}
              setValue={setQueries}
              style={"w500"}
              placeholder="Tìm kiếm tài khoản..."
              isHideLabel
            />
          </div>
          <form onSubmit={handleSubmit(handleUpdate)}>
            {editElm && <Button type="submit">Update</Button>}
            <table className="table-auto mb-6 text-left w-full">
              <thead className="font-bold bg-gray-700 text-[13px] text-white">
                <tr className="border border-gray-500">
                  <th className="px-6 py-3">#</th>
                  <th className="px-6 py-3">Email</th>
                  <th className="px-6 py-3">Họ</th>
                  <th className="px-6 py-3">Tên</th>
                  <th className="px-6 py-3">Vai trò</th>
                  <th className="px-6 py-3">Số điện thoại</th>
                  <th className="px-6 py-3 text-center">Trạng thái</th>
                  <th className="px-6 py-3 text-center">Ngày tạo</th>
                  <th className="px-6 py-3 text-center">Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {users?.users?.map((el, idx) => (
                  <tr key={el._id} className="border border-gray-500">
                    <td className="py-3 px-6">{idx + 1}</td>
                    <td className="py-3 px-6">{el.email}</td>
                    <td className="py-3 px-6">{el.firstname}</td>
                    <td className="py-3 px-6">{el.lastname}</td>
                    <td className="py-3 px-6">
                      {editElm?._id === el._id ? (
                        <Select
                          register={register}
                          fullWidth
                          errors={errors}
                          defaultValue={+el.role}
                          id={"role"}
                          validate={{ required: "Require fill." }}
                          options={roles}
                        />
                      ) : (
                        <span>
                          {roles.find((role) => +role.code === +el.role)?.value}
                        </span>
                      )}
                    </td>

                    <td className="py-3 px-6">{el.mobile}</td>

                    <td className="py-3 px-6">
                      {editElm?._id === el._id ? (
                        <Select
                          register={register}
                          fullWidth
                          errors={errors}
                          defaultValue={el.isBlocked}
                          id={"isBlocked"}
                          validate={{ required: "Require fill." }}
                          options={blockStatus}
                        />
                      ) : (
                        <span>{el.isBlocked ? "Chặn" : "Kích hoạt"}</span>
                      )}
                    </td>

                    <td className="py-3 px-6 text-center">
                      <div className="flex flex-col items-center">
                        <span>{moment(el.createdAt).format("DD/MM/YYYY")}</span>
                        <span>{moment(el.createdAt).format("HH:mm:ss")}</span>
                      </div>
                    </td>
                    <td className="py-3 px-6 text-center">
                      <span
                        onClick={() => setEditElm(el)}
                        className="px-2 text-orange-600 hover:underline cursor-pointer"
                      >
                        Cập nhật
                      </span>
                      <span
                        onClick={() => handleDeleteUser(el._id)}
                        className="px-2 text-orange-600 hover:underline cursor-pointer"
                      >
                        Xoá
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </form>
          <div className="w-full flex justify-end">
            <Pagination totalCount={users?.counts} />
          </div>
        </div>
      </div>
    );
}

export default ManageUser