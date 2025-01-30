export const LoadingIndicator = () => {
  return (
    <div className="flex items-center justify-center p-4">
      <div className="flex space-x-2">
        <div className="w-3 h-3 rounded-full bg-[#FFE066] animate-[float_1s_ease-in-out_infinite]" />
        <div className="w-3 h-3 rounded-full bg-[#FF9999] animate-[float_1s_ease-in-out_0.33s_infinite]" />
        <div className="w-3 h-3 rounded-full bg-[#FFE066] animate-[float_1s_ease-in-out_0.66s_infinite]" />
      </div>
    </div>
  )
}