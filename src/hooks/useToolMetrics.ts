import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from './use-toast';
import type { ToolMetricRow } from '@/types/database/tables';

export const useToolMetrics = () => {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const logToolUsage = async (
    toolType: ToolMetricRow['tool_type'],
    actionType: ToolMetricRow['action_type'],
    contentLength?: number,
    generationTimeMs?: number,
    feedbackScore?: -1 | 1
  ) => {
    try {
      setIsLoading(true);
      
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { error } = await supabase
        .from('tool_metrics')
        .insert({
          user_id: user.id,
          tool_type: toolType,
          action_type: actionType,
          content_length: contentLength,
          generation_time_ms: generationTimeMs,
          feedback_score: feedbackScore
        });

      if (error) throw error;

    } catch (err) {
      console.error('Error logging tool metrics:', err);
      toast({
        variant: "destructive",
        description: "Une erreur est survenue lors de l'enregistrement des métriques",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return { logToolUsage, isLoading };
};