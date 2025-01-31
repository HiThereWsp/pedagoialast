import { cn } from '@/lib/utils'
import { LucideIcon } from 'lucide-react'

interface FeedbackButtonProps {
  icon: LucideIcon
  isActive: boolean
  onClick: () => void
  label: string
}

export const FeedbackButton = ({ icon: Icon, isActive, onClick, label }: FeedbackButtonProps) => {
  return (
    <button
      onClick={onClick}
      className={cn(
        "rounded-full p-2 text-gray-400 hover:bg-[#E5DEFF] hover:text-[#6E59A5] transition-all duration-300 transform hover:scale-110",
        isActive && "text-[#6E59A5] bg-[#E5DEFF]"
      )}
      aria-label={label}
    >
      <Icon className="h-5 w-5" />
    </button>
  )
}