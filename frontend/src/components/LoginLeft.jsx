import React from 'react'

export const LoginLeft = () => {
  return (
    <div className="hidden lg:flex lg:w-2/5 min-h-screen bg-[url('/bg-img.png')] bg-cover bg-center bg-no-repeat flex-col justify-center p-12 shrink-0 select-none">
        <div>
            <img src='/logo.svg' alt="logo" className='size-9.5'/>
            <span className='text-4xl font-medium text-white'>Builder AI</span>
        </div>
        <div>
            <h2 className='text-3xl text-white font-medium leading-snug mb-3 tracking-light'>Build your presence on web</h2>
            <p className='text-zinc-300'>
                Lorem, ipsum dolor sit amet consectetur adipisicing elit. Rerum cupiditate perspiciatis architecto libero, consequatur, saepe enim quos excepturi quidem odio perferendis ex suscipit non assumenda maiores. Incidunt ipsum perspiciatis fuga.
                Beatae, earum mollitia? Pariatur earum deserunt perspiciatis odio voluptatibus ipsum enim, eveniet dolorem commodi voluptates aliquid vitae explicabo accusantium dolorum optio qui exercitationem molestiae laborum corporis magnam corrupti, consequuntur ex.
                Repellendus neque doloremque mollitia, porro totam officiis id dolor eos eius sapiente, nihil quam alias fuga assumenda nam magnam laudantium exercitationem earum non soluta in suscipit? Sed deleniti ipsam quam?
            </p>
            <p className='text-zinc-300 text-sm mt-12'>Copyright {new Date().getFullYear()} Builder AI</p>
        </div>
    </div>
  )
}