import { Loader2Icon } from 'lucide-react'
import React from 'react'

export const Loading = () => {
  return (
    <div className='h-screen flex items-center justify-center bg-white'>
        <Loader2Icon size={26} className='animate-spin text-zinc-950' />
    </div>
  )
}
