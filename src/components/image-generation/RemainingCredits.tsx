import { useEffect, useState } from 'react'
import { supabase } from '@/integrations/supabase/client'
import { Badge } from '@/components/ui/badge'

export const RemainingCredits = () => {
  const [remainingCredits, setRemainingCredits] = useState<number | null>(null)
  const maxCredits = 5 // Correspond à la limite définie dans useRateLimit

  useEffect(() => {
    const fetchRemainingCredits = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const currentMonth = new Date().toISOString().slice(0, 7) + '-01'

      const { data: usageData } = await supabase
        .from('image_generation_usage')
        .select('monthly_generation_count')
        .eq('user_id', user.id)
        .eq('generation_month', currentMonth)
        .maybeSingle()

      const usedCredits = usageData?.monthly_generation_count || 0
      setRemainingCredits(maxCredits - usedCredits)
    }

    fetchRemainingCredits()
  }, [])

  if (remainingCredits === null) return null

  return (
    <div className="flex items-center justify-center mb-4">
      <Badge variant={remainingCredits > 0 ? "secondary" : "destructive"} className="text-sm">
        {remainingCredits} génération{remainingCredits > 1 ? 's' : ''} restante{remainingCredits > 1 ? 's' : ''} ce mois-ci
      </Badge>
    </div>
  )
}