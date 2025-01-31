import { Card } from "@/components/ui/card";
import { useQuery } from '@tanstack/react-query';
import { supabase } from "@/integrations/supabase/client";
import { Clock } from "lucide-react";

export function SessionMetricsCard() {
  const { data: sessionMetrics } = useQuery({
    queryKey: ['session-metrics'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('session_metrics')
        .select('session_duration_seconds, total_messages, successful_actions');
      
      if (error) throw error;
      return data;
    }
  });

  const sessionStats = sessionMetrics?.reduce((acc, session) => {
    acc.totalDuration += session.session_duration_seconds ?? 0;
    acc.totalMessages += session.total_messages ?? 0;
    acc.totalActions += session.successful_actions ?? 0;
    return acc;
  }, { totalDuration: 0, totalMessages: 0, totalActions: 0 }) ?? { totalDuration: 0, totalMessages: 0, totalActions: 0 };

  return (
    <Card className="p-6">
      <div className="flex items-center gap-2 mb-4">
        <Clock className="h-5 w-5 text-green-500" />
        <h2 className="text-lg font-semibold">Sessions</h2>
      </div>
      <div className="space-y-2">
        <p>Durée totale: {Math.round(sessionStats.totalDuration / 3600)}h</p>
        <p>Messages échangés: {sessionStats.totalMessages}</p>
        <p>Actions réussies: {sessionStats.totalActions}</p>
      </div>
    </Card>
  );
}