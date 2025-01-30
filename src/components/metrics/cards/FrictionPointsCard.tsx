import { Card } from "@/components/ui/card";
import { useQuery } from '@tanstack/react-query';
import { supabase } from "@/integrations/supabase/client";
import { AlertCircle } from "lucide-react";

export function FrictionPointsCard() {
  const { data: frictionPoints } = useQuery({
    queryKey: ['friction-points'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('friction_points')
        .select('tool_type, was_abandoned, regeneration_count, error_occurred');
      
      if (error) throw error;
      return data;
    }
  });

  const frictionStats = frictionPoints?.reduce((acc, point) => {
    acc.total++;
    if (point.was_abandoned) acc.abandoned++;
    if (point.error_occurred) acc.errors++;
    acc.totalRegenerations += point.regeneration_count ?? 0;
    return acc;
  }, { total: 0, abandoned: 0, errors: 0, totalRegenerations: 0 }) ?? { total: 0, abandoned: 0, errors: 0, totalRegenerations: 0 };

  return (
    <Card className="p-6">
      <div className="flex items-center gap-2 mb-4">
        <AlertCircle className="h-5 w-5 text-red-500" />
        <h2 className="text-lg font-semibold">Points de friction</h2>
      </div>
      <div className="space-y-2">
        <p>Total des interactions: {frictionStats.total}</p>
        <p>Sessions abandonnées: {frictionStats.abandoned}</p>
        <p>Erreurs rencontrées: {frictionStats.errors}</p>
        <p>Régénérations totales: {frictionStats.totalRegenerations}</p>
      </div>
    </Card>
  );
}