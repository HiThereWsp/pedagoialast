import { useEffect, useState } from "react"
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog"
import { supabase } from "@/integrations/supabase/client"
import { useToast } from "@/hooks/use-toast"

const POPUP_KEY = "redesign_2024"

export const UpdateNotification = () => {
  const [open, setOpen] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    const checkPopupView = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return

        // Check if user has already seen this popup
        const { data: popupView, error: fetchError } = await supabase
          .from('user_popup_views')
          .select('*')
          .eq('user_id', user.id)
          .eq('popup_key', POPUP_KEY)
          .maybeSingle()

        if (fetchError) throw fetchError

        if (!popupView) {
          setOpen(true)
          // Record that user has seen the popup
          const { error: insertError } = await supabase
            .from('user_popup_views')
            .insert([
              { user_id: user.id, popup_key: POPUP_KEY }
            ])
            .select()
            .single()

          // If insert fails due to race condition (another tab inserted at same time), that's ok
          if (insertError && !insertError.message.includes('duplicate key value')) {
            throw insertError
          }
        }
      } catch (error) {
        console.error('Error checking popup view:', error)
        toast({
          variant: "destructive",
          title: "Erreur",
          description: "Une erreur est survenue lors de la vérification des notifications."
        })
      }
    }

    checkPopupView()
  }, [toast])

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-md animate-fade-in">
        <DialogTitle className="sr-only">Notification de mise à jour</DialogTitle>
        <div className="text-center space-y-4">
          <h2 className="text-2xl font-bold text-gray-900">
            PedagoIA fait peau neuve ! 🎨
          </h2>
          <p className="text-gray-600">
            PedagoIA a pris un coup de jeune... j'espère que vous apprécierez !
          </p>
        </div>
      </DialogContent>
    </Dialog>
  )
}