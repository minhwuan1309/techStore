import React, { memo } from 'react'

const ProductExtraInfoItem = ({ icon, title, sub }) => {
    return (
        <div className='flex items-center p-4 gap-4 mb-3 border rounded-lg shadow-sm hover:shadow-md transition-shadow duration-300 bg-white'>
            <span className='p-3 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full flex items-center justify-center text-white shadow-md'>{icon}</span>
            <div className='flex flex-col text-sm'>
                <span className='font-medium text-gray-800'>{title}</span>
                <span className='text-xs text-gray-500 mt-1'>{sub}</span>
            </div>
        </div>
    )
}

export default memo(ProductExtraInfoItem)