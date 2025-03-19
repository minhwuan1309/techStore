import React, { useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import path from '../../utils/path'
import Swal from 'sweetalert2'

const FinalRegister = () => {
    const { status } = useParams()
    const navigate = useNavigate()
    
    useEffect(() => {
        if (status === 'failed') {
            Swal.fire({
                title: 'Oops!',
                text: 'Đăng ký không thành công',
                icon: 'error',
                confirmButtonText: 'Thử lại',
                confirmButtonColor: '#4f46e5'
            }).then(() => {
                navigate(`/${path.LOGIN}`)
            })
        }
        
        if (status === 'success') {
            Swal.fire({
                title: 'Chúc mừng!',
                text: 'Đăng ký thành công. Hãy đăng nhập để tiếp tục.',
                icon: 'success',
                confirmButtonText: 'Đăng nhập ngay',
                confirmButtonColor: '#4f46e5'
            }).then(() => {
                navigate(`/${path.LOGIN}`)
            })
        }
    }, [])
    
    return (
        <div className='h-screen w-screen bg-gray-50 flex items-center justify-center'>
            <div className='absolute top-0 left-0 right-0 h-64 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500'></div>
            
            <div className='bg-white rounded-lg shadow-lg p-8 max-w-[500px] w-full z-10 text-center'>
                <div className='animate-spin w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full mx-auto mb-6'></div>
                <h2 className='text-2xl font-bold text-gray-800 mb-4'>Đang xử lý...</h2>
                <p className='text-gray-600'>Vui lòng đợi trong giây lát.</p>
            </div>
        </div>
    )
}

export default FinalRegister