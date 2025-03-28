import React from 'react'
import { Outlet, Navigate } from 'react-router-dom'
import path from 'utils/path'
import { useSelector } from 'react-redux'
import { MemberSidebar } from 'components'

const MemberLayout = () => {
    const { isLoggedIn, current } = useSelector(state => state.user)
    if (!isLoggedIn || !current) return <Navigate to={`/${path.LOGIN}`} replace={true} />

    return (
        <div className='flex bg-gray-50 min-h-screen'>
            <MemberSidebar />
            <div className='flex-auto bg-white rounded-lg shadow-lg m-4 p-6 min-h-[calc(100vh-2rem)]'>
                <Outlet />
            </div>
        </div>
    )
}

export default MemberLayout