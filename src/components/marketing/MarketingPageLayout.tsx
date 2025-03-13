
import { ReactNode } from "react"

interface MarketingPageLayoutProps {
  children: ReactNode
}

export function MarketingPageLayout({ children }: MarketingPageLayoutProps) {
  return (
    <div className="container mx-auto p-4 max-w-2xl space-y-8">
      <h1 className="text-2xl font-bold mb-6">Générateur de liens UTM</h1>
      {children}
    </div>
  )
}
