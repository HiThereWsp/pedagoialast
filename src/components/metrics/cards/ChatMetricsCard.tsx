import { Card } from "@/components/ui/card";
import { useQuery } from '@tanstack/react-query';
import { supabase } from "@/integrations/supabase/client";

export function ChatMetricsCard() {
  const { data: chats } = useQuery({
    queryKey: ['chats-metrics'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('chats')
        .select('message_type, feedback_score')
        .is('deleted_at', null);
      
      if (error) throw error;
      return data;
    }
  });

  const chatStats = chats?.reduce((acc, chat) => {
    acc.total++;
    if (chat.feedback_score === 1) acc.positiveFeeback++;
    if (!acc.byType[chat.message_type ?? 'other']) acc.byType[chat.message_type ?? 'other'] = 0;
    acc.byType[chat.message_type ?? 'other']++;
    return acc;
  }, { total: 0, positiveFeeback: 0, byType: {} as Record<string, number> }) ?? { total: 0, positiveFeeback: 0, byType: {} };

  return (
    <Card className="p-6">
      <h2 className="text-lg font-semibold mb-4">Conversations</h2>
      <div className="space-y-2">
        <p>Total des messages: {chatStats.total}</p>
        <p>Retours positifs: {chatStats.positiveFeeback}</p>
        <div className="mt-4">
          <h3 className="font-medium mb-2">Par type de message:</h3>
          {Object.entries(chatStats.byType).map(([type, count]) => (
            <p key={type}>{type}: {count}</p>
          ))}
        </div>
      </div>
    </Card>
  );
}