import { useForm } from "react-hook-form"
import { WaitlistFormFields } from "./waitlist/WaitlistFormFields"
import { useWaitlistSubmission } from "@/hooks/useWaitlistSubmission"
import { useRateLimit } from "@/hooks/useRateLimit"
import { useToast } from "@/hooks/use-toast"

interface WaitlistFormData {
  email: string
  firstName: string
  teachingLevel: string
}

export const WaitlistForm = () => {
  const { register, handleSubmit, reset, formState: { errors } } = useForm<WaitlistFormData>()
  const { isLoading, submitWaitlistForm } = useWaitlistSubmission()
  const { checkRateLimit, isLimited } = useRateLimit({ maxRequests: 3, timeWindow: 300000 }) // 5 minutes
  const { toast } = useToast()

  const onSubmit = async (data: WaitlistFormData) => {
    if (!checkRateLimit()) {
      toast({
        variant: "destructive",
        title: "Trop de tentatives",
        description: "Veuillez patienter quelques minutes avant de réessayer.",
      })
      return
    }

    await submitWaitlistForm(data)
    reset()
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="w-full max-w-md mx-auto px-4 sm:px-6">
      <WaitlistFormFields 
        register={register}
        errors={errors}
        isLoading={isLoading || isLimited}
      />
    </form>
  )
}