
import { useEffect } from 'react';
import { posthog } from '@/integrations/posthog/client';

export const usePricingAnalytics = (promoCode: string | null) => {
  // Track pricing page view
  useEffect(() => {
    if (typeof window !== 'undefined') {
      posthog.capture('pricing_page_viewed', {
        ref_source: localStorage.getItem('pedago_ref'),
        promo_code_displayed: promoCode
      });
    }
  }, [promoCode]);

  const trackPlanSelection = (plan: string, productId: string) => {
    posthog.capture('pricing_plan_selected', {
      plan,
      product_id: productId,
      location: 'pricing_page',
      promo_code_displayed: promoCode,
      ref_source: localStorage.getItem('pedago_ref')
    });
  };

  return { trackPlanSelection };
};
