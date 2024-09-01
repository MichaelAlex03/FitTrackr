import React from 'react'
import { FaChevronDown, FaChevronUp } from 'react-icons/fa'

function DropdownButton({ children, open, toggle }: { children: React.ReactNode; open: boolean; toggle: () => void  }) {
  return (
    <div className='flex items-center w-fit p-4 bg-white rounded-lg shadow-md cursor-pointer' onClick={toggle}>
        {children}
        <span className='flex items-center justify-center ml-4'>{ open ? <FaChevronUp/> : <FaChevronDown/>} </span>
    </div>
  )
}

export default DropdownButton