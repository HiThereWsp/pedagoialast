
import { useState } from "react"
import { useToast } from "./use-toast"
import { supabase } from "@/integrations/supabase/client"
import { getAuthErrorMessage, validateForgotPasswordForm } from "@/utils/auth-error-handler"
import { useNavigate } from "react-router-dom"  // For navigation in React

interface ForgotPasswordFormState {
    email: string,
    isLoading: boolean,
    isSuccess: boolean
}

interface AuthFormProps {
    onSuccess?: () => void
}

export const useForgotPasswordForm = ({ onSuccess }: AuthFormProps = {}) => {
    const [formState, setFormState] = useState<ForgotPasswordFormState>({
        email: "",
        isLoading: false,
        isSuccess: false
    })
    const { toast } = useToast()
    const navigate = useNavigate()

    const setField = (field: keyof ForgotPasswordFormState, value: any) => {
        setFormState(prev => ({ ...prev, [field]: value }))
    }

    const handleValidationErrors = (errors: string[]) => {
        if (errors.length > 0) {
            toast({
                variant: "destructive",
                title: "Erreur de validation",
                description: errors[0],
            })
            return true
        }
        return false
    }

    const HandlePasswordReset = async (e: React.FormEvent) => {
        e.preventDefault()

        // Validate the email
        const errors = validateForgotPasswordForm(formState.email)
        if (handleValidationErrors(errors)) return

        setField("isLoading", true)

        try {
            console.log("Démarrage de la demande de réinitialisation pour:", {
                email: formState.email
            })

            // Construction de l'URL complète de redirection avec le format correct
            // Ne pas ajouter de paramètres ici - Supabase les ajoutera automatiquement
            const redirectUrl = `${window.location.origin}/reset-password`
            console.log("URL de redirection configurée:", redirectUrl)

            // Envoi de la demande de réinitialisation avec redirectTo
            const { data, error } = await supabase.auth.resetPasswordForEmail(
                formState.email,
                {
                    redirectTo: redirectUrl
                }
            )

            if (error) {
                console.error("Erreur lors de la demande de réinitialisation:", error)
                throw error
            }

            console.log("Email de réinitialisation envoyé avec succès:", data)

            // Mise à jour du message pour plus de clarté
            toast({
                title: "Email envoyé",
                description: "Un email de réinitialisation a été envoyé à votre adresse. Veuillez vérifier votre boîte de réception et suivre les instructions. N'oubliez pas de vérifier vos spams si vous ne le trouvez pas.",
                duration: 8000, // Durée plus longue pour que l'utilisateur puisse lire
            })

            // Mise à jour de l'état de succès
            setField("isSuccess", true)
            
            // Appel du callback de succès si fourni
            if (onSuccess) {
                onSuccess()
            }
        } catch (error: any) {
            console.error("Erreur lors de la demande de réinitialisation:", error)
            toast({
                variant: "destructive",
                title: "Erreur",
                description: getAuthErrorMessage(error),
            })
        } finally {
            setField("isLoading", false)
        }
    }

    return {
        formState,
        setField,
        HandlePasswordReset,
        navigate
    }
}
