import { supabase } from "@/integrations/supabase/client";

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
      const { error } = await supabase
        .from('tool_metrics')
        .insert({
          tool_type: toolType,
          action_type: actionType,
          content_length: contentLength,
          generation_time_ms: generationTimeMs,
          feedback_score: feedbackScore
        });

      if (error) {
        console.error('Error logging tool metrics:', error);
      }
    } catch (err) {
      console.error('Failed to log tool metrics:', err);
    }
  };

  return { logToolUsage };
};