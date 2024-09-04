import React from 'react'

function DropdownContent({ children, open }: { children: React.ReactNode; open: boolean }) {
  if (!open) return null;
  return (
    <div className={`absolute min-w-full flex flex-col items-center p-4 mt-2 bg-white rounded-lg shadow-md max-h-min overflow-y-scroll 
                [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] `}>
        {children}
    </div>
  )
}

export default DropdownContent