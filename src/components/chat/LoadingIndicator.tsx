export const LoadingIndicator = () => {
  return (
    <div className="flex items-center justify-center p-4">
      <div className="flex space-x-2 relative">
        {/* Mask overlay */}
        <div className="absolute inset-0 bg-gradient-radial from-white/20 to-transparent pointer-events-none" />
        
        <div className="w-4 h-4 rounded-full bg-[#FFE066] animate-[float_1s_ease-in-out_infinite] relative" />
        <div className="w-4 h-4 rounded-full bg-[#FF9999] animate-[float_1s_ease-in-out_0.33s_infinite] relative" />
        <div className="w-4 h-4 rounded-full bg-[#FFE066] animate-[float_1s_ease-in-out_0.66s_infinite] relative" />
      </div>
      <span className="ml-3 text-sm text-gray-600">Génération en cours...</span>
    </div>
  )
}