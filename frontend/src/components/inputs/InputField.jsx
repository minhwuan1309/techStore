import React, { memo } from 'react'
import clsx from 'clsx'

const InputField = ({ value, setValue, nameKey, type, invalidFields, setInvalidFieds, style, fullWidth, placeholder, isHideLabel, pattern, title, ...rest }) => {
    return (
        <div className={clsx('flex flex-col relative mb-2', fullWidth && 'w-full')}>
          {!isHideLabel && value?.trim() !== '' && (
            <label
              className='text-[10px] animate-slide-top-sm absolute top-0 left-[12px] block bg-white px-1'
              htmlFor={nameKey}
            >
              {nameKey?.slice(0, 1).toUpperCase() + nameKey?.slice(1)}
            </label>
          )}
          <input
            id={nameKey}
            type={type}
            className={clsx(
              'px-4 py-2 rounded-sm border border-gray-400 w-full mt-2 placeholder:text-sm placeholder:italic outline-none',
              style
            )}
            placeholder={placeholder || nameKey?.slice(0, 1).toUpperCase() + nameKey?.slice(1)}
            value={value}
            onChange={e =>
              setValue(prev => ({ ...prev, [nameKey]: e.target.value }))
            }
            onFocus={() => setInvalidFieds && setInvalidFieds([])}
            pattern={pattern}
            title={title}
            {...rest}
          />
          {invalidFields?.some(el => el.name === nameKey) && (
            <small className='text-main italic'>
              {invalidFields.find(el => el.name === nameKey)?.mes}
            </small>
          )}
        </div>
      )
}

export default memo(InputField)