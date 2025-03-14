
import { posthog } from './client'

export const pricingEvents = {
  viewPricing: () => {
    posthog.capture('pricing_page_viewed')
  },
  selectPlan: (plan: string) => {
    posthog.capture('pricing_plan_selected', { plan })
  },
  applyPromoCode: (code: string) => {
    posthog.capture('promo_code_applied', { 
      code,
      location: 'pricing_page' 
    })
  }
}

export const subscriptionEvents = {
  subscriptionStarted: (plan: 'monthly' | 'yearly', price: number) => {
    posthog.capture('subscription_started', { 
      plan_type: plan,
      price: price,
      currency: 'EUR'
    })
  },
  
  subscriptionCompleted: (plan: 'monthly' | 'yearly', price: number) => {
    posthog.capture('subscription_completed', {
      plan_type: plan,
      price: price,
      currency: 'EUR',
      annual_value: plan === 'monthly' ? price * 12 : price * 12
    })
  },

  subscriptionFailed: (plan: 'monthly' | 'yearly', error: string) => {
    posthog.capture('subscription_failed', {
      plan_type: plan,
      error_type: error
    })
  },

  subscriptionCanceled: (plan: 'monthly' | 'yearly', step: string) => {
    posthog.capture('subscription_canceled', {
      plan_type: plan,
      abandonment_step: step
    })
  },
  
  firstLogin: (plan: 'monthly' | 'yearly') => {
    posthog.capture('subscription_first_login', {
      plan_type: plan
    })
  }
}
