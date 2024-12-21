import { useNavigate } from "react-router-dom"

export const ToastActionButton = () => {
  const navigate = useNavigate()
  
  return (
    <button
      onClick={() => navigate('/pricing')}
      className="bg-white text-red-600 px-3 py-2 rounded-md text-sm font-medium hover:bg-red-50 transition-colors"
    >
      Voir les forfaits
    </button>
  )
}