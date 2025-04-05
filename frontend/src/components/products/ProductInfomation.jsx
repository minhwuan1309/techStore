import React, { memo, useState, useCallback } from 'react'
import { productInfoTabs } from '../../utils/contants'
import { Votebar, Button, VoteOption, Comment } from '..'
import { renderStarFromNumber } from '../../utils/helpers'
import { apiRatings } from '../../apis'
import { useDispatch, useSelector } from 'react-redux'
import { showModal } from '../../store/app/appSlice'
import Swal from 'sweetalert2'
import path from '../../utils/path'
import { useNavigate } from 'react-router-dom'


const ProductInfomation = ({ totalRatings, ratings, nameProduct, pid, rerender }) => {
    const [activedTab, setActivedTab] = useState(1)
    const dispatch = useDispatch()
    const navigate = useNavigate()
    const { isLoggedIn } = useSelector(state => state.user)

    const handleSubmitVoteOption = async ({ comment, score }) => {
        if (!comment || !pid || !score) {
            alert('Please vote when click submit')
            return
        }
        await apiRatings({ star: score, comment, pid, updatedAt: Date.now() })
        dispatch(showModal({ isShowModal: false, modalChildren: null }))
        rerender()
    }
    const handleVoteNow = () => {
      if (!isLoggedIn) {
        Swal.fire({
          text: "Vui lòng đăng nhập để bình chọn",
          cancelButtonText: "Hủy",
          confirmButtonText: "Đi đến trang đăng nhập",
          title: "Oops!",
          showCancelButton: true,
        }).then((rs) => {
          if (rs.isConfirmed) navigate(`/${path.LOGIN}`);
        });
      } else {
        dispatch(
          showModal({
            isShowModal: true,
            modalChildren: (
              <VoteOption
                nameProduct={nameProduct}
                handleSubmitVoteOption={handleSubmitVoteOption}
              />
            ),
          })
        );
      }
    };
    return (
        <div>
            <div className='flex flex-col py-4 sm:py-8 w-full sm:w-main'>
                {/* Ratings summary section */}
                <div className='flex flex-col sm:flex-row border rounded-lg shadow-lg overflow-hidden bg-white'>
                    <div className='flex-1 sm:flex-4 flex-col flex items-center justify-center py-4 sm:py-6 border-b sm:border-b-0 sm:border-r border-gray-200 bg-gradient-to-r from-indigo-50 to-purple-50'>
                        <span className='font-semibold text-2xl sm:text-4xl text-indigo-600 mb-1 sm:mb-2'>{`${totalRatings}/5`}</span>
                        <span className='flex items-center gap-1 mb-1 sm:mb-2'>{renderStarFromNumber(totalRatings, 14, 16)?.map((el, index) => (
                            <span key={index} className="text-yellow-400">{el}</span>
                        ))}</span>
                        <span className='text-xs sm:text-sm text-gray-600 text-center'>{`${ratings?.length} người đã xem và đánh giá`}</span>
                    </div>
                    <div className='flex-1 sm:flex-6 flex gap-2 flex-col p-3 sm:p-6 bg-white'>
                        {Array.from(Array(5).keys()).reverse().map(el => (
                            <Votebar
                                key={el}
                                number={el + 1}
                                ratingTotal={ratings?.length}
                                ratingCount={ratings?.filter(i => i.star === el + 1)?.length}
                            />
                        ))}
                    </div>
                </div>
                
                {/* Rating button section */}
                <div className='p-4 sm:p-6 mt-4 sm:mt-6 flex items-center justify-center text-xs sm:text-sm flex-col gap-2 sm:gap-3 bg-white rounded-lg shadow-md'>
                    <span className='text-gray-700'>Bạn đã xem qua sản phẩm này chưa?</span>
                    <Button 
                        handleOnClick={handleVoteNow}
                        className="px-4 sm:px-6 py-1.5 sm:py-2 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-full hover:from-indigo-600 hover:to-purple-600 transition-colors duration-300 shadow-md text-xs sm:text-sm"
                    >
                        Đánh giá ngay
                    </Button>
                </div>
                
                {/* Comments section */}
                <div className='flex flex-col gap-3 sm:gap-4 mt-4 sm:mt-6'>
                    <h3 className="text-lg sm:text-xl font-semibold text-gray-800 mb-1 sm:mb-2">Đánh giá từ khách hàng</h3>
                    {ratings?.length > 0 ? (
                        ratings?.map(el => (
                            <Comment
                                key={el._id}
                                star={el.star}
                                updatedAt={el.updatedAt}
                                comment={el.comment}
                                name={` ${el.postedBy?.firstname} ${el.postedBy?.lastname}`}
                                />
                        ))
                    ) : (
                        <div className="bg-white rounded-lg shadow-md p-4 sm:p-6 text-center text-xs sm:text-sm text-gray-500">
                            Chưa có đánh giá nào cho sản phẩm này
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}

export default memo(ProductInfomation)