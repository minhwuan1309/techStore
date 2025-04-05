import React, { memo, useRef, useEffect, useState } from 'react'
import logo from 'assets/logo.png'
import { voteOptions } from 'utils/contants'
import { AiFillStar } from 'react-icons/ai'
import { Button } from 'components'

const VoteOption = ({ nameProduct, handleSubmitVoteOption }) => {
    const modalRef = useRef()
    const [chosenScore, setChosenScore] = useState(null)
    const [comment, setComment] = useState('')
    const [score, setScore] = useState(null)

    useEffect(() => {
        modalRef.current.scrollIntoView({ block: 'center', behavior: 'smooth' })
    }, [])

    return (
        <div 
            onClick={e => e.stopPropagation()} 
            ref={modalRef} 
            className='bg-white w-full sm:w-[700px] p-4 sm:p-8 rounded-xl shadow-lg flex-col gap-4 sm:gap-6 flex items-center justify-center'
        >
            <img src={logo} alt="logo" className='w-[180px] sm:w-[250px] my-2 sm:my-4 object-contain' />
            <h2 className='text-center text-lg sm:text-xl font-bold text-gray-800'>{`Đánh giá sản phẩm: ${nameProduct}`}</h2>
            
            <textarea
                className='w-full p-3 sm:p-4 border-2 border-gray-200 rounded-lg focus:border-red-500 focus:ring-2 focus:ring-red-100 transition-all 
                    placeholder:italic placeholder:text-gray-500 text-xs sm:text-sm min-h-[100px] sm:min-h-[120px]'
                placeholder='Nhập đánh giá của bạn về sản phẩm...'
                value={comment}
                onChange={e => setComment(e.target.value)}
            ></textarea>
            
            <div className='w-full'>
                <p className='font-semibold text-gray-700 text-sm sm:text-base mb-3 sm:mb-4'>Bạn đánh giá sản phẩm này như thế nào?</p>
                <div className='flex flex-wrap justify-center gap-3 sm:gap-6 items-center'>
                    {voteOptions.map(el => (
                        <div
                            key={el.id}
                            className={`
                                w-[100px] sm:w-[120px] cursor-pointer rounded-lg p-3 sm:p-4 h-[100px] sm:h-[120px] flex items-center justify-center flex-col gap-2 
                                transition-all hover:shadow-md
                                ${chosenScore >= el.id 
                                    ? 'bg-red-50 border-2 border-red-500' 
                                    : 'bg-gray-100 border-2 border-transparent'}
                            `}
                            onClick={() => {
                                setChosenScore(el.id)
                                setScore(el.id)
                            }}
                        >
                            <AiFillStar 
                                size={24}
                                color={chosenScore >= el.id ? 'orange' : 'gray'} 
                                className='transition-all sm:text-3xl'
                            />
                            <span className={`
                                text-xs sm:text-sm font-semibold text-center
                                ${chosenScore >= el.id ? 'text-red-600' : 'text-gray-600'}
                            `}>
                                {el.text}
                            </span>
                        </div>
                    ))}
                </div>
            </div>
            
            <Button
                handleOnClick={() => handleSubmitVoteOption({ comment, score })}
                className='
                    w-full py-2 sm:py-3 mt-3 sm:mt-4 bg-red-500 text-white rounded-lg 
                    hover:bg-red-600 transition-all uppercase tracking-wider text-xs sm:text-sm
                    disabled:opacity-50 disabled:cursor-not-allowed
                '
                disabled={!score}
            >
                Gửi đánh giá
            </Button>
        </div>
    )
}

export default memo(VoteOption)