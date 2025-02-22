
import { useState, useCallback } from 'react'
import { supabase } from '@/integrations/supabase/client'

interface RateLimitConfig {
  maxRequests?: number
  timeWindow?: number // in milliseconds
}

export const useRateLimit = ({ maxRequests = 5, timeWindow = 2592000000 }: RateLimitConfig = {}) => {
  const [isLimited, setIsLimited] = useState(false)

  const checkRateLimit = useCallback(async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return false

      const currentMonth = new Date().toISOString().slice(0, 7) + '-01'

      // Try to get the current usage
      const { data: usageData, error: selectError } = await supabase
        .from('image_generation_usage')
        .select('monthly_generation_count')
        .eq('user_id', user.id)
        .eq('generation_month', currentMonth)
        .maybeSingle()

      if (selectError) {
        console.error('Error checking rate limit:', selectError)
        return false
      }

      if (!usageData) {
        // If no record exists, create one
        const initialRecord = {
          user_id: user.id,
          monthly_generation_count: 1,
          generation_month: currentMonth,
          prompt: 'Initial rate limit check',
          image_url: null,
          status: 'pending'
        }

        const { error: insertError } = await supabase
          .from('image_generation_usage')
          .insert(initialRecord)

        if (insertError) {
          console.error('Error creating usage record:', insertError)
          return false
        }

        return true
      }

      // Check if user has reached the limit
      if (usageData.monthly_generation_count >= maxRequests) {
        setIsLimited(true)
        return false
      }

      // Increment the counter
      const { error: updateError } = await supabase
        .from('image_generation_usage')
        .update({ 
          monthly_generation_count: (usageData.monthly_generation_count || 0) + 1 
        })
        .eq('user_id', user.id)
        .eq('generation_month', currentMonth)

      if (updateError) {
        console.error('Error updating usage count:', updateError)
        return false
      }

      return true
    } catch (error) {
      console.error('Error in checkRateLimit:', error)
      return false
    }
  }, [maxRequests])

  return {
    isLimited,
    checkRateLimit
  }
}
