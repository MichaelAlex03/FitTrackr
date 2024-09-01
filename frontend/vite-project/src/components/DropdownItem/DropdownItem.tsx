import React from 'react'

function DropdownItem({children, onClick}: { children: React.ReactNode; onClick: () => void }) {
  return (
    <div className='p-2 m-0.5 w-full rounded-lg cursor-pointer hover:bg-blue-600' onClick={onClick}>
        {children}
    </div>
  )
}

export default DropdownItem