import React, { memo } from 'react'
import avatar from 'assets/avatarDefault.png'
import moment from 'moment'
import "moment/locale/vi";
import { renderStarFromNumber } from 'utils/helpers'
import { AiFillStar } from 'react-icons/ai'

const Comment = ({ image = avatar, name = 'Anonymous', updatedAt, comment, star }) => {
    moment.locale("vi");
    const starRender = renderStarFromNumber(star);

    return (
        <div className='flex flex-col sm:flex-row gap-3 sm:gap-4 bg-white rounded-lg p-3 sm:p-4 shadow-sm hover:shadow-md transition-all'>
            <div className='flex-none'>
                <img 
                    src={image} 
                    alt="avatar" 
                    className='w-[40px] h-[40px] sm:w-[50px] sm:h-[50px] object-cover rounded-full border-2 border-gray-200' 
                />
            </div>
            <div className='flex flex-col flex-auto gap-2 sm:gap-3'>
                <div className='flex flex-col sm:flex-row sm:justify-between sm:items-center gap-1 sm:gap-0'>
                    <div className='flex flex-col gap-1'>
                        <h3 className='font-bold text-gray-800 text-sm sm:text-base'>{name}</h3>
                        <div className='flex items-center gap-1'>
                            {starRender?.map((el, index) => (
                                <AiFillStar 
                                    key={index} 
                                    color='orange' 
                                    size={14}
                                    className='sm:text-base'
                                />
                            ))}
                        </div>
                    </div>
                    <span className='text-xs text-gray-500 italic'>
                        {moment(updatedAt)?.fromNow()}
                    </span>
                </div>
                <div className='bg-gray-50 rounded-lg p-2 sm:p-3 border border-gray-200'>
                    <p className='text-xs sm:text-sm text-gray-700'>{comment}</p>
                </div>
            </div>
        </div>
    )
}

export default memo(Comment)