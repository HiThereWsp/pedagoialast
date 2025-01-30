import { UTMGenerator } from "@/components/marketing/UTMGenerator"

export default function MarketingPage() {
  return (
    <div className="container mx-auto p-4 max-w-2xl">
      <h1 className="text-2xl font-bold mb-6">Générateur de liens UTM</h1>
      <UTMGenerator />
    </div>
  )
}