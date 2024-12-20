import { ChatMessage } from "@/types/chat"
import { ChatMessage as ChatMessageComponent } from "./chat/ChatMessage"
import { LoadingIndicator } from "./chat/LoadingIndicator"

interface ChatHistoryProps {
  messages: ChatMessage[]
  isLoading: boolean
}

export const ChatHistory = ({ messages, isLoading }: ChatHistoryProps) => {
  return (
    <div className="w-full space-y-6">
      {messages.map((msg, index) => (
        <ChatMessageComponent
          key={index}
          role={msg.role}
          content={msg.content}
          index={index}
        />
      ))}
      {isLoading && <LoadingIndicator />}
    </div>
  )
}