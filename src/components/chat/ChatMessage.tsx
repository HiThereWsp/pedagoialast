
import React from 'react'
import { MarkdownContent } from '../exercise/result/MarkdownContent'
import { ChatMessage as ChatMessageType } from '@/types/chat'
import { FeedbackButtons } from './FeedbackButtons'

interface ChatMessageProps {
  message: ChatMessageType
}

export function ChatMessage({ message }: ChatMessageProps) {
  return (
    <div className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
      <div
        className={`max-w-[80%] rounded-2xl p-4 shadow-lg transition-all duration-300 transform hover:scale-[1.02] ${
          message.role === 'user'
            ? 'bg-gradient-to-r from-indigo-600 to-indigo-700 text-white shadow-indigo-500/20'
            : 'bg-gradient-to-r from-gray-50 to-white text-gray-800 shadow-gray-200/50'
        }`}
      >
        {message.role === 'assistant' ? (
          <div className="space-y-2">
            <MarkdownContent content={message.content} />
            {message.id && <FeedbackButtons messageId={message.id} content={message.content} />}
          </div>
        ) : (
          <p className="text-sm md:text-base leading-relaxed">{message.content}</p>
        )}
      </div>
    </div>
  )
}
