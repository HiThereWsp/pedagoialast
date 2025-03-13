
import { UTMGenerator } from "@/components/marketing/UTMGenerator"
import { UTMHistory } from "@/components/marketing/UTMHistory"
import { MarketingPageLayout } from "@/components/marketing/MarketingPageLayout"
import { useMarketingAccess } from "@/hooks/useMarketingAccess"

export default function MarketingPage() {
  // Use the custom hook for access control
  useMarketingAccess()

  return (
    <MarketingPageLayout>
      <UTMGenerator />
      <UTMHistory />
    </MarketingPageLayout>
  )
}
