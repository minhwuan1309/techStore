import React, { useState } from 'react'
import { Outlet, Navigate } from 'react-router-dom'
import path from 'utils/path'
import { useSelector } from 'react-redux'
import { MemberSidebar } from 'components'
import { IoMenuSharp, IoClose } from "react-icons/io5"

const MemberLayout = () => {
    const { isLoggedIn, current } = useSelector(state => state.user)
    const [showSidebar, setShowSidebar] = useState(false)
    
    if (!isLoggedIn || !current) return <Navigate to={`/${path.LOGIN}`} replace={true} />

    return (
        <div className='flex flex-col md:flex-row bg-gray-50 min-h-screen'>
            {/* Mobile Menu Toggle */}
            <div className="md:hidden flex items-center justify-between p-4 bg-white shadow-md">
                <h1 className="text-lg font-semibold text-gray-800">Tài khoản</h1>
                <button 
                    onClick={() => setShowSidebar(!showSidebar)}
                    className="p-2 rounded-full hover:bg-gray-100"
                >
                    {showSidebar ? <IoClose size={24} /> : <IoMenuSharp size={24} />}
                </button>
            </div>
            
            {/* Mobile Sidebar */}
            {showSidebar && (
                <div className="md:hidden fixed inset-0 z-50 bg-black bg-opacity-50 flex">
                    <div className="w-full bg-white h-full overflow-y-auto">
                        <div className="flex justify-between items-center p-4 border-b">
                            <h2 className="text-lg font-semibold">Menu</h2>
                            <button 
                                onClick={() => setShowSidebar(false)}
                                className="p-2 rounded-full hover:bg-gray-100"
                            >
                                <IoClose size={24} />
                            </button>
                        </div>
                        <div className="p-4">
                            <MemberSidebar isMobile={true} onClose={() => setShowSidebar(false)} />
                        </div>
                    </div>
                </div>
            )}
            
            {/* Desktop Sidebar */}
            <div className="hidden md:block">
                <MemberSidebar />
            </div>
            
            {/* Main Content */}
            <div className='flex-auto bg-white rounded-lg shadow-lg m-2 md:m-4 p-4 md:p-6 min-h-[calc(100vh-1rem)] md:min-h-[calc(100vh-2rem)]'>
                <Outlet />
            </div>
        </div>
    )
}

export default MemberLayout