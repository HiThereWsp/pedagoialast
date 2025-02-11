
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import PricingForm from "./PricingForm"

interface PricingFormDialogProps {
  triggerText: string
}

export const PricingFormDialog = ({ triggerText }: PricingFormDialogProps) => {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button className="w-full bg-gradient-to-r from-primary to-primary/90 hover:opacity-90 transition-opacity">
          {triggerText}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-center">Demande de devis</DialogTitle>
        </DialogHeader>
        <PricingForm />
      </DialogContent>
    </Dialog>
  )
}

export default PricingFormDialog
