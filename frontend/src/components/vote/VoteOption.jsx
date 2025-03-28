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
            className='bg-white w-[700px] p-8 rounded-xl shadow-lg flex-col gap-6 flex items-center justify-center'
        >
            <img src={logo} alt="logo" className='w-[250px] my-4 object-contain' />
            <h2 className='text-center text-xl font-bold text-gray-800'>{`Đánh giá sản phẩm: ${nameProduct}`}</h2>
            
            <textarea
                className='w-full p-4 border-2 border-gray-200 rounded-lg focus:border-red-500 focus:ring-2 focus:ring-red-100 transition-all 
                    placeholder:italic placeholder:text-gray-500 text-sm min-h-[120px]'
                placeholder='Nhập đánh giá của bạn về sản phẩm...'
                value={comment}
                onChange={e => setComment(e.target.value)}
            ></textarea>
            
            <div className='w-full'>
                <p className='font-semibold text-gray-700 mb-4'>Bạn đánh giá sản phẩm này như thế nào?</p>
                <div className='flex justify-center gap-6 items-center'>
                    {voteOptions.map(el => (
                        <div
                            key={el.id}
                            className={`
                                w-[120px] cursor-pointer rounded-lg p-4 h-[120px] flex items-center justify-center flex-col gap-2 
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
                                size={32} 
                                color={chosenScore >= el.id ? 'orange' : 'gray'} 
                                className='transition-all'
                            />
                            <span className={`
                                font-semibold 
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
                    w-full py-3 mt-4 bg-red-500 text-white rounded-lg 
                    hover:bg-red-600 transition-all uppercase tracking-wider
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