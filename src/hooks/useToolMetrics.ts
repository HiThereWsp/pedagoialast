import { supabase } from "@/integrations/supabase/client";
import { ToolMetrics } from "@/types/supabase";

type ToolType = 'exercise' | 'lesson_plan' | 'correspondence';
type ActionType = 'generate' | 'feedback' | 'share' | 'copy';

export const useToolMetrics = () => {
  const logToolUsage = async (
    toolType: ToolType,
    actionType: ActionType,
    contentLength?: number,
    generationTimeMs?: number,
    feedbackScore?: -1 | 1
  ) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        console.error('No authenticated user found');
        return;
      }

      const { error } = await supabase
        .from('tool_metrics')
        .insert({
          user_id: user.id,
          tool_type: toolType,
          action_type: actionType,
          content_length: contentLength,
          generation_time_ms: generationTimeMs,
          feedback_score: feedbackScore
        } as Partial<ToolMetrics>);

      if (error) {
        console.error('Error logging tool metrics:', error);
      }
    } catch (err) {
      console.error('Failed to log tool metrics:', err);
    }
  };

  return { logToolUsage };
};