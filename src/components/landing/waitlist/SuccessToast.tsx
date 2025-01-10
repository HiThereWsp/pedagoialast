import { CheckCircle } from "lucide-react"

export const SuccessToast = () => {
  return (
    <div className="flex flex-col items-center gap-2 p-2 sm:p-4">
      <div className="flex items-center gap-2">
        <img src="/favicon.svg" alt="PedagoIA Logo" className="w-6 h-6 sm:w-8 sm:h-8" />
        <CheckCircle className="h-5 w-5 sm:h-6 sm:w-6 text-green-500" />
      </div>
      <p className="font-semibold text-base sm:text-lg text-center">Inscription réussie !</p>
      <p className="text-sm sm:text-base text-center text-muted-foreground">
        Nous avons hâte de pouvoir vous aider avec vos classes. Nous vous contacterons dès que la plateforme sera disponible.
      </p>
    </div>
  )
}