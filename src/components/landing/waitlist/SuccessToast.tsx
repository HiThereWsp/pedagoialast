import { CheckCircle } from "lucide-react"

export const SuccessToast = () => {
  return (
    <div className="flex flex-col items-center gap-2">
      <div className="flex items-center gap-2">
        <img src="/favicon.svg" alt="PedagoIA Logo" className="w-8 h-8" />
        <CheckCircle className="h-6 w-6 text-green-500" />
      </div>
      <p className="font-semibold text-lg">Inscription réussie !</p>
      <p className="text-center text-muted-foreground">
        Nous avons hâte de pouvoir vous aider avec vos classes. Nous vous contacterons dès que la plateforme sera disponible.
      </p>
    </div>
  )
}