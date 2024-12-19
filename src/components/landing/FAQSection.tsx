import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"

export const FAQSection = () => {
  return (
    <section className="py-20 bg-white">
      <div className="container mx-auto px-4 max-w-3xl">
        <h2 className="text-3xl font-bold text-center mb-12">Questions fréquentes</h2>
        <Accordion type="single" collapsible>
          {/* FAQ items will go here */}
        </Accordion>
      </div>
    </section>
  )
}