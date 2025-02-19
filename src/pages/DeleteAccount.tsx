
import { useState } from "react"
import { SEO } from "@/components/SEO"
import { BackButton } from "@/components/settings/BackButton"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { supabase } from "@/integrations/supabase/client"
import { useNavigate } from "react-router-dom"

export default function DeleteAccount() {
  const [isLoading, setIsLoading] = useState(false)
  const [confirmText, setConfirmText] = useState("")
  const { toast } = useToast()
  const navigate = useNavigate()
  
  const CONFIRMATION_TEXT = "supprimer mon compte définitivement"
  const isConfirmationValid = confirmText.toLowerCase().trim() === CONFIRMATION_TEXT

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault()
    toast({
      title: "Action non autorisée",
      description: "Veuillez recopier le texte manuellement.",
      variant: "destructive"
    })
  }

  const handleDeleteAccount = async () => {
    try {
      if (!isConfirmationValid) {
        toast({
          title: "Erreur de confirmation",
          description: "Veuillez recopier exactement la phrase de confirmation.",
          variant: "destructive"
        })
        return
      }

      setIsLoading(true)
      const { error } = await supabase.auth.signOut()
      
      if (error) throw error
      
      toast({
        title: "Compte supprimé",
        description: "Votre compte et vos données ont été supprimés avec succès."
      })
      
      navigate("/")
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de la suppression de votre compte.",
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="container max-w-4xl mx-auto py-8 px-4">
      <SEO 
        title="Supprimer mon compte | PedagoIA"
        description="Supprimez votre compte et vos données personnelles de PedagoIA"
      />
      
      <BackButton />
      
      <article className="prose prose-slate max-w-none">
        <h1 className="text-3xl font-bold mb-8">Supprimer mon compte</h1>
        
        <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-6 mb-8">
          <h2 className="text-xl font-semibold text-destructive mb-4">⚠️ Cette action est irréversible</h2>
          <p className="text-base mb-4">
            La suppression de votre compte entraînera :
          </p>
          <ul className="list-disc pl-5 mb-6">
            <li>La suppression définitive de votre compte</li>
            <li>La suppression de tous vos contenus créés</li>
            <li>La suppression de vos données personnelles</li>
            <li>La perte d'accès immédiate à tous nos services</li>
          </ul>

          <div className="mb-6">
            <Label htmlFor="confirmation">
              Pour confirmer, veuillez recopier la phrase suivante (sans copier-coller) :
            </Label>
            <p className="font-medium text-destructive my-2">
              {CONFIRMATION_TEXT}
            </p>
            <Input
              id="confirmation"
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value)}
              onPaste={handlePaste}
              onDragStart={(e) => e.preventDefault()}
              onDrop={(e) => e.preventDefault()}
              placeholder="Recopiez la phrase ici..."
              className="w-full max-w-md"
            />
          </div>
          
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button 
                variant="destructive" 
                disabled={isLoading || !isConfirmationValid}
              >
                {isLoading ? "Suppression..." : "Supprimer mon compte"}
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Êtes-vous absolument sûr ?</AlertDialogTitle>
                <AlertDialogDescription>
                  Cette action est irréversible. Toutes vos données seront définitivement effacées.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Annuler</AlertDialogCancel>
                <AlertDialogAction onClick={handleDeleteAccount} className="bg-destructive hover:bg-destructive/90">
                  Supprimer définitivement
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
        
        <div className="text-sm text-muted-foreground">
          <p>
            Pour toute question concernant la suppression de vos données, 
            vous pouvez nous contacter à <a href="mailto:bonjour@pedagoia.fr" className="text-primary hover:underline">bonjour@pedagoia.fr</a>
          </p>
        </div>
      </article>
    </div>
  )
}
