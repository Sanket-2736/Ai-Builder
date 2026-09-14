import { BotIcon, BotMessageSquare, BotMessageSquareIcon, UserIcon } from 'lucide-react';
import React, { useEffect, useRef } from 'react'
import PromptInput from './PromptInput';

export const ChatPanel = ({messages, onSend, loading}) => {

    const buttomRef = useRef(null);

    useEffect(() => {
        buttomRef.current?.scrollIntoView({behavior : 'auto'});
    }, [messages, loading]);

  return (
    <div className='flex flex-col h-full bg-white'>
        <div className="flex-1 overflow-y-auto p-3 space-y-3 hide-scrollbar">
            {messages.length === 0 && (
                <div className="flex items-center justify-center h-full">
                    <p className="text-zinc-400 text-sm text-center">Ask AI to modify your website</p>
                </div>
            )}

            {messages.map((msg, i) => {
                return (
                    <div key={i} className="flex gap-2.5 items-start">
                        <div className="shrink-0 w-6 h-6 rounded-md items-center justify-center mt-0.5 bg-zinc-50">
                            {msg.role === 'user' ? (
                                <UserIcon size={14} className='text-zinc-500'/>
                            ) : (
                                <BotMessageSquareIcon size={14} className='text-zinc-700' />
                            )}
                        </div>

                        <div className="flex-1 min-w-0">
                            <p className="text-[13px] text-zinc-700 leading- tracking-wider whitespace-pre-wrap wrap-break-word">
                                {msg.content.split('- `/').map((text, i) => {
                                    return (
                                        <span key={i} className="block mt-3">
                                            <span className={i === 0 ? 'hidden' : ''}>
                                                - `/
                                            </span>
                                            {text}
                                        </span>
                                    )
                                })}
                            </p>
                        </div>
                    </div>
                )
            })}

            {loading && (
                <div className="flex gap-2.5 items-start">
                    <div className="shrink-0 w-6 h-6 rounded-md flex items-center justify-center mt-0.5 bg-zinc-900">
                        <BotIcon size={13} className='text-zinc-900/5'/>
                    </div>

                    <div className="flex-1">
                        <p className="text-[11px] font-medium text-zinc-400 mb-2 uppercase tracking-wider">
                            AI
                        </p>
                        <div className="dot-loader">
                            <span></span>
                            <span></span>
                            <span></span>
                        </div>
                    </div>
                </div>
            )}

            <div ref={buttomRef}>

            </div>
        </div>

        <div className="p-3 border-t border-zinc-900">
            <PromptInput onSubmit={onSend} loading={loading}
            placeholder='Ask AI to modify...'
            autoFocus
            />
        </div>
    </div>
  )
}
