import React, { useRef, useEffect, memo } from 'react'
import { AiFillStar } from 'react-icons/ai'

const Votebar = ({ number, ratingCount, ratingTotal }) => {
    const percentRef = useRef()
    
    useEffect(() => {
        const percent = Math.round(ratingCount * 100 / ratingTotal) || 0
        percentRef.current.style.cssText = `right: ${100 - percent}%`
    }, [ratingCount, ratingTotal])
    
    return (
        <div className='flex items-center gap-3 text-sm text-gray-600 bg-gray-50 rounded-lg p-2 hover:bg-gray-100 transition-all'>
            <div className='flex w-[10%] items-center justify-center gap-1'>
                <span className='font-semibold'>{number}</span>
                <AiFillStar color='orange' />
            </div>
            <div className='w-[75%] bg-gray-200 rounded-full h-2 relative overflow-hidden'>
                <div 
                    ref={percentRef} 
                    className='absolute inset-0 bg-red-500 rounded-full'
                ></div>
            </div>
            <div className='w-[15%] text-right text-xs'>
                {`${ratingCount || 0} đánh giá`}
            </div>
        </div>
    )
}

export default memo(Votebar)