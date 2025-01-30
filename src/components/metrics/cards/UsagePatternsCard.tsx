import { Card } from "@/components/ui/card";
import { useQuery } from '@tanstack/react-query';
import { supabase } from "@/integrations/supabase/client";
import { TrendingUp } from "lucide-react";

export function UsagePatternsCard() {
  const { data: usagePatterns } = useQuery({
    queryKey: ['usage-patterns'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('usage_patterns')
        .select('tool_type, day_of_week, hour_of_day, feature_complexity');
      
      if (error) throw error;
      return data;
    }
  });

  const patternStats = usagePatterns?.reduce((acc, pattern) => {
    if (!acc.byComplexity[pattern.feature_complexity ?? 'basic']) {
      acc.byComplexity[pattern.feature_complexity ?? 'basic'] = 0;
    }
    acc.byComplexity[pattern.feature_complexity ?? 'basic']++;
    acc.total++;
    return acc;
  }, { total: 0, byComplexity: {} as Record<string, number> }) ?? { total: 0, byComplexity: {} };

  return (
    <Card className="p-6">
      <div className="flex items-center gap-2 mb-4">
        <TrendingUp className="h-5 w-5 text-green-500" />
        <h2 className="text-lg font-semibold">Patterns d'utilisation</h2>
      </div>
      <div className="space-y-2">
        <p>Sessions totales: {patternStats.total}</p>
        <div className="mt-4">
          <h3 className="font-medium mb-2">Par complexité:</h3>
          {Object.entries(patternStats.byComplexity).map(([complexity, count]) => (
            <p key={complexity}>{complexity}: {count} sessions</p>
          ))}
        </div>
      </div>
    </Card>
  );
}