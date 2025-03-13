
import { useState, useEffect } from 'react';
import { posthog } from '@/integrations/posthog/client';

export const usePromoCode = () => {
  const [promoCode, setPromoCode] = useState<string | null>(null);
  
  useEffect(() => {
    const refSource = localStorage.getItem('pedago_ref');
    
    if (refSource) {
      // Generate promo code based on referral source
      if (refSource.includes('maitreClement')) {
        setPromoCode('CLEMENT25');
      } else if (refSource.includes('lollieUnicorn')) {
        setPromoCode('LOLLIE25');
      } else if (refSource.includes('laprof40')) {
        setPromoCode('PROF40-25');
      } else if (refSource.includes('mehdush')) {
        setPromoCode('MEHDUSH25');
      } else if (refSource.includes('sylvie')) {
        setPromoCode('SYLVIE25');
      } else if (refSource.includes('fb')) {
        setPromoCode('FB25');
      } else if (refSource.includes('tt')) {
        setPromoCode('TT25');
      } else if (refSource.startsWith('t20/') || refSource.startsWith('t40/')) {
        setPromoCode('TIKTOK25');
      } else if (refSource.startsWith('i20/') || refSource.startsWith('i40/')) {
        setPromoCode('INSTA25');
      }
      
      // Track promo code generation
      if (promoCode) {
        posthog.capture('promo_code_generated', {
          promo_code: promoCode,
          ref_source: refSource,
          redirect_id: localStorage.getItem('pedago_redirect_id')
        });
      }
    }
  }, []);

  return promoCode;
};
