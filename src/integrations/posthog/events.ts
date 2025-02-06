
import { posthog } from './client'

export const pricingEvents = {
  viewPricing: () => {
    posthog.capture('pricing_page_viewed')
  },
  selectPlan: (plan: string) => {
    posthog.capture('pricing_plan_selected', { plan })
  }
}
