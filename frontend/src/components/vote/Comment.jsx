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
        <div className='flex gap-4 bg-white rounded-lg p-4 shadow-sm hover:shadow-md transition-all'>
            <div className='flex-none'>
                <img 
                    src={image} 
                    alt="avatar" 
                    className='w-[50px] h-[50px] object-cover rounded-full border-2 border-gray-200' 
                />
            </div>
            <div className='flex flex-col flex-auto'>
                <div className='flex justify-between items-center mb-2'>
                    <div>
                        <h3 className='font-bold text-gray-800'>{name}</h3>
                        <div className='flex items-center gap-1'>
                            {starRender?.map((el, index) => (
                                <AiFillStar 
                                    key={index} 
                                    color='orange' 
                                    size={16} 
                                />
                            ))}
                        </div>
                    </div>
                    <span className='text-xs text-gray-500 italic'>
                        {moment(updatedAt)?.fromNow()}
                    </span>
                </div>
                <div className='bg-gray-50 rounded-lg p-3 border border-gray-200'>
                    <p className='text-sm text-gray-700'>{comment}</p>
                </div>
            </div>
        </div>
    )
}

export default memo(Comment)