
export const LoadingIndicator = () => {
  return (
    <div className="flex items-center justify-center space-x-2">
      <div className="w-2 h-2 bg-[#FEF7CD] rounded-full animate-bounce [animation-delay:-0.3s]"></div>
      <div className="w-2 h-2 bg-[#FFDEE2] rounded-full animate-bounce [animation-delay:-0.15s]"></div>
      <div className="w-2 h-2 bg-[#FEC6A1] rounded-full animate-bounce"></div>
    </div>
  )
}
