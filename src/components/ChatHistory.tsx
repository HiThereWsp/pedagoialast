import { ChatMessage } from "@/types/chat"

interface ChatHistoryProps {
  messages: ChatMessage[]
  isLoading: boolean
}

export const ChatHistory = ({ messages, isLoading }: ChatHistoryProps) => {
  return (
    <div className="mb-8 space-y-4">
      {messages.map((msg, index) => (
        <div
          key={index}
          className={`rounded-lg p-4 ${
            msg.role === 'user' 
              ? 'bg-emerald-50/50 ml-auto max-w-[80%]' 
              : 'bg-gray-50/50 mr-auto max-w-[80%]'
          }`}
        >
          <p className="text-gray-800 whitespace-pre-wrap">{msg.content}</p>
        </div>
      ))}
      {isLoading && (
        <div className="bg-gray-50/50 rounded-lg p-4 mr-auto max-w-[80%]">
          <p className="text-gray-500">En train d'écrire...</p>
        </div>
      )}
    </div>
  )
}