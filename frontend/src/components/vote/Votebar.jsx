import React, { useRef, useEffect, memo } from 'react'
import { AiFillStar } from 'react-icons/ai'

const Votebar = ({ number, ratingCount, ratingTotal }) => {
    const percentRef = useRef()
    
    useEffect(() => {
        const percent = Math.round(ratingCount * 100 / ratingTotal) || 0
        percentRef.current.style.cssText = `right: ${100 - percent}%`
    }, [ratingCount, ratingTotal])
    
    return (
        <div className='flex items-center gap-2 sm:gap-3 text-xs sm:text-sm text-gray-600 bg-gray-50 rounded-lg p-2 hover:bg-gray-100 transition-all'>
            <div className='flex w-[15%] sm:w-[10%] items-center justify-center gap-1'>
                <span className='font-semibold'>{number}</span>
                <AiFillStar color='orange' size={12} className='sm:text-base' />
            </div>
            <div className='w-[65%] sm:w-[75%] bg-gray-200 rounded-full h-1.5 sm:h-2 relative overflow-hidden'>
                <div 
                    ref={percentRef} 
                    className='absolute inset-0 bg-red-500 rounded-full'
                ></div>
            </div>
            <div className='w-[20%] sm:w-[15%] text-right text-xs'>
                {`${ratingCount || 0} đánh giá`}
            </div>
        </div>
    )
}

export default memo(Votebar)