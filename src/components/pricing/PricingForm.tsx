
import { Card } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { StepOne } from "./steps/StepOne"
import { StepTwo } from "./steps/StepTwo"
import { StepThree } from "./steps/StepThree"
import { StepFour } from "./steps/StepFour"
import { usePricingForm } from "./hooks/usePricingForm"

export const PricingForm = () => {
  const {
    step,
    formData,
    errors,
    isSubmitting,
    handleChange,
    handleSubmit,
    setEtablissement,
    setTaille
  } = usePricingForm()

  const renderStep = () => {
    switch(step) {
      case 1:
        return <StepOne onSelect={setEtablissement} />
      case 2:
        return <StepTwo onSelect={setTaille} />
      case 3:
        return (
          <StepThree
            formData={formData}
            errors={errors}
            onChange={handleChange}
            onSubmit={handleSubmit}
            isSubmitting={isSubmitting}
          />
        )
      case 4:
        return <StepFour />
      default:
        return null
    }
  }

  return (
    <Card className="max-w-md mx-auto p-6 border-primary/10">
      {step < 4 && (
        <div className="mb-8 space-y-2">
          <Progress value={(step / 3) * 100} className="h-2 bg-primary/10" />
          <p className="text-center text-sm text-muted-foreground">
            Étape {step}/3
          </p>
        </div>
      )}
      {renderStep()}
    </Card>
  )
}

export default PricingForm
