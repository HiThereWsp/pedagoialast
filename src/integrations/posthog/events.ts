
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
  
  subscriptionCompleted: (
    plan: 'monthly' | 'yearly', 
    price: number, 
    metadata?: Record<string, any>
  ) => {
    posthog.capture('subscription_completed', {
      plan_type: plan,
      price: price,
      currency: 'EUR',
      annual_value: plan === 'monthly' ? price * 12 : price,
      ...metadata
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
  },

  cancellationRequested: (source: string) => {
    posthog.capture('subscription_cancellation_requested', {
      source: source,
      timestamp: new Date().toISOString()
    })
  }
}

export const bugReportEvents = {
  reportCreated: (data: { 
    userId?: string, 
    hasScreenshot: boolean, 
    source: string 
  }) => {
    posthog.capture('bug_report_created', {
      user_id: data.userId,
      has_screenshot: data.hasScreenshot,
      source: data.source
    })
  },
  
  reportSubmitted: (data: { 
    reportId: string, 
    success: boolean, 
    errorMessage?: string 
  }) => {
    posthog.capture('bug_report_submitted', {
      report_id: data.reportId,
      success: data.success,
      error_message: data.errorMessage
    })
  }
}
