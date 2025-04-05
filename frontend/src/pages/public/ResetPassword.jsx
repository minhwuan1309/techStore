import React, { useState } from 'react'
import { Button } from '../../components'
import { useNavigate, useParams } from 'react-router-dom'
import { apiResetPassword } from '../../apis/user'
import { toast } from 'react-toastify'

const ResetPassword = () => {
    const [password, setPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')
    const [showPassword, setShowPassword] = useState(false)
    const { token } = useParams()
    const navigate = useNavigate()

    const handleResetPassword = async () => {
        if (password !== confirmPassword) {
            toast.error('Mật khẩu xác nhận không khớp', { theme: 'colored' })
            return
        }else{
            const response = await apiResetPassword({ password, token })
            if (response.success) {
                toast.success(response.mes, { theme: 'colored' })
            } else {
                toast.info(response.mes, { theme: 'colored' })
                setTimeout(() =>{
                    navigate('/login')
                }, 2000)
            }
        }
    }
    
    return (
        <div className='w-screen h-screen absolute top-0 left-0 right-0 flex items-center justify-center bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500'>
          {/* Removed the redundant gradient div that was causing layout issues */}
          <div className='bg-white rounded-lg shadow-lg p-8 max-w-[600px] w-full z-10'>
            <h2 className='text-2xl font-bold text-gray-800 mb-6'>Đặt lại mật khẩu</h2>
            
            <div className='flex flex-col gap-4'>
              <div className='w-full'>
                <label
                  htmlFor="password"
                  className='block text-gray-700 font-medium mb-2'
                >
                  Mật khẩu mới:
                </label>
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  className='w-full p-3 border rounded-md outline-none focus:border-indigo-500 transition-colors'
                  placeholder='Nhập mật khẩu mới'
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                />
              </div>
              
              <div className='w-full'>
                <label
                  htmlFor="confirmPassword"
                  className='block text-gray-700 font-medium mb-2'
                >
                  Xác nhận mật khẩu:
                </label>
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="confirmPassword"
                  className='w-full p-3 border rounded-md outline-none focus:border-indigo-500 transition-colors'
                  placeholder='Nhập lại mật khẩu mới'
                  value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)}
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
              
              <div className='flex items-center justify-end w-full mt-4'>
                <Button
                  name='Xác nhận'
                  handleOnClick={handleResetPassword}
                  style='px-6 py-3 rounded-md text-white bg-indigo-600 hover:bg-indigo-700 font-semibold transition-colors'
                />
              </div>
            </div>
          </div>
        </div>
      )
}

export default ResetPassword