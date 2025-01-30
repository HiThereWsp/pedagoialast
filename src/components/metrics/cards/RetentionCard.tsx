import { Card } from "@/components/ui/card";
import { useQuery } from '@tanstack/react-query';
import { supabase } from "@/integrations/supabase/client";
import { Users } from "lucide-react";

export function RetentionCard() {
  const { data: retentionData } = useQuery({
    queryKey: ['retention-metrics'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('user_retention')
        .select('retention_7_days, retention_30_days, retention_90_days');
      
      if (error) throw error;
      return data;
    }
  });

  const { data: dauMau } = useQuery({
    queryKey: ['dau-mau'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('dau_mau_ratio')
        .select('*')
        .order('month', { ascending: false })
        .limit(1);
      
      if (error) throw error;
      return data?.[0];
    }
  });

  const retentionStats = retentionData?.reduce((acc, user) => {
    if (user.retention_7_days) acc.sevenDays++;
    if (user.retention_30_days) acc.thirtyDays++;
    if (user.retention_90_days) acc.ninetyDays++;
    return acc;
  }, { sevenDays: 0, thirtyDays: 0, ninetyDays: 0 }) ?? { sevenDays: 0, thirtyDays: 0, ninetyDays: 0 };

  return (
    <Card className="p-6">
      <div className="flex items-center gap-2 mb-4">
        <Users className="h-5 w-5 text-blue-500" />
        <h2 className="text-lg font-semibold">Rétention</h2>
      </div>
      <div className="space-y-2">
        <p>Rétention 7 jours: {retentionStats.sevenDays} utilisateurs</p>
        <p>Rétention 30 jours: {retentionStats.thirtyDays} utilisateurs</p>
        <p>Rétention 90 jours: {retentionStats.ninetyDays} utilisateurs</p>
        <p className="mt-4 text-sm text-gray-500">
          DAU/MAU: {dauMau?.dau_mau_ratio ? (dauMau.dau_mau_ratio * 100).toFixed(1) : 0}%
        </p>
      </div>
    </Card>
  );
}