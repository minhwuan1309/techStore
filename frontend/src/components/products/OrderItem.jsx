import SelectQuantity from 'components/common/SelectQuantity'
import React, { useEffect, useState } from 'react'
import { formatMoney } from 'utils/helpers'
import { updateCart } from 'store/user/userSlice'
import withBaseComponent from 'hocs/withBaseComponent'

const OrderItem = ({ dispatch, color, dfQuantity = 1, price, title, thumbnail, pid }) => {
    const [quantity, setQuantity] = useState(() => dfQuantity)
    const handleQuantity = (number) => {
        if (+number > 1) setQuantity(number)
    }
    const handleChangeQuantity = (flag) => {
        if (flag === 'minus' && quantity === 1) return
        if (flag === 'minus') setQuantity(prev => +prev - 1)
        if (flag === 'plus') setQuantity(prev => +prev + 1)
    }
    useEffect(() => {
        dispatch(updateCart({ pid, quantity, color }))
    }, [quantity])
    // Set quantity

    return (
        <div className='w-main mx-auto border-b py-4 grid grid-cols-10 bg-white rounded-lg shadow-sm mb-2 hover:shadow-md transition-shadow duration-300'>
            <span className='col-span-6 w-full text-center'>
                <div className='flex gap-4 px-4 py-2'>
                    <img src={thumbnail} alt="thumb" className='w-28 h-28 object-cover rounded-md shadow-sm' />
                    <div className='flex flex-col items-start gap-2 justify-center'>
                        <span className='text-sm font-semibold text-gray-800'>{title}</span>
                        <span className='text-xs px-2 py-1 bg-gray-100 rounded-full text-gray-600'>{color}</span>
                    </div>
                </div>
            </span>
            <span className='col-span-1 w-full text-center'>
                <div className='flex items-center h-full'>
                    <SelectQuantity
                        quantity={quantity}
                        handleQuantity={handleQuantity}
                        handleChangeQuantity={handleChangeQuantity}
                    />
                </div>
            </span>
            <span className='col-span-3 w-full h-full flex items-center justify-center text-center'>
                <span className='text-lg font-semibold text-indigo-600'>{formatMoney(price * quantity) + ' VND'}</span>
            </span>
        </div>
    )
}

export default withBaseComponent(OrderItem)