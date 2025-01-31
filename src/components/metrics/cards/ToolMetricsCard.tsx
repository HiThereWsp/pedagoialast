import { Card } from "@/components/ui/card";
import { useQuery } from '@tanstack/react-query';
import { supabase } from "@/integrations/supabase/client";

export function ToolMetricsCard() {
  const { data: toolMetrics } = useQuery({
    queryKey: ['tool-metrics'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('tool_metrics')
        .select('tool_type, action_type, feedback_score');
      
      if (error) throw error;
      return data;
    }
  });

  const toolStats = toolMetrics?.reduce((acc, metric) => {
    acc.total++;
    if (metric.feedback_score === 1) acc.positiveFeeback++;
    if (!acc.byType[metric.tool_type]) acc.byType[metric.tool_type] = 0;
    acc.byType[metric.tool_type]++;
    return acc;
  }, { total: 0, positiveFeeback: 0, byType: {} as Record<string, number> }) ?? { total: 0, positiveFeeback: 0, byType: {} };

  return (
    <Card className="p-6">
      <h2 className="text-lg font-semibold mb-4">Utilisation des Outils</h2>
      <div className="space-y-2">
        <p>Total des utilisations: {toolStats.total}</p>
        <p>Retours positifs: {toolStats.positiveFeeback}</p>
        <div className="mt-4">
          <h3 className="font-medium mb-2">Par type d'outil:</h3>
          {Object.entries(toolStats.byType).map(([type, count]) => (
            <p key={type}>{type}: {count}</p>
          ))}
        </div>
      </div>
    </Card>
  );
}