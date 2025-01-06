import React from 'react';
import { Card } from "@/components/ui/card";
import { useQuery } from '@tanstack/react-query';
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from "lucide-react";

export function MetricsSummary() {
  const { data: toolMetrics, isLoading: loadingTools } = useQuery({
    queryKey: ['tool-metrics'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('tool_metrics')
        .select('tool_type, action_type, feedback_score');
      
      if (error) throw error;
      return data;
    }
  });

  const { data: sessionMetrics, isLoading: loadingSessions } = useQuery({
    queryKey: ['session-metrics'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('session_metrics')
        .select('session_duration_seconds, total_messages, successful_actions');
      
      if (error) throw error;
      return data;
    }
  });

  const { data: chats, isLoading: loadingChats } = useQuery({
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

  if (loadingTools || loadingSessions || loadingChats) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
      </div>
    );
  }

  // Calculer les statistiques des outils
  const toolStats = toolMetrics?.reduce((acc, metric) => {
    acc.total++;
    if (metric.feedback_score === 1) acc.positiveFeeback++;
    if (!acc.byType[metric.tool_type]) acc.byType[metric.tool_type] = 0;
    acc.byType[metric.tool_type]++;
    return acc;
  }, { total: 0, positiveFeeback: 0, byType: {} as Record<string, number> }) ?? { total: 0, positiveFeeback: 0, byType: {} };

  // Calculer les statistiques des sessions
  const sessionStats = sessionMetrics?.reduce((acc, session) => {
    acc.totalDuration += session.session_duration_seconds ?? 0;
    acc.totalMessages += session.total_messages ?? 0;
    acc.totalActions += session.successful_actions ?? 0;
    return acc;
  }, { totalDuration: 0, totalMessages: 0, totalActions: 0 }) ?? { totalDuration: 0, totalMessages: 0, totalActions: 0 };

  // Calculer les statistiques des chats
  const chatStats = chats?.reduce((acc, chat) => {
    acc.total++;
    if (chat.feedback_score === 1) acc.positiveFeeback++;
    if (!acc.byType[chat.message_type ?? 'other']) acc.byType[chat.message_type ?? 'other'] = 0;
    acc.byType[chat.message_type ?? 'other']++;
    return acc;
  }, { total: 0, positiveFeeback: 0, byType: {} as Record<string, number> }) ?? { total: 0, positiveFeeback: 0, byType: {} };

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Résumé des Métriques</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Métriques des outils */}
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

        {/* Métriques des sessions */}
        <Card className="p-6">
          <h2 className="text-lg font-semibold mb-4">Sessions</h2>
          <div className="space-y-2">
            <p>Durée totale: {Math.round(sessionStats.totalDuration / 3600)}h</p>
            <p>Messages échangés: {sessionStats.totalMessages}</p>
            <p>Actions réussies: {sessionStats.totalActions}</p>
          </div>
        </Card>

        {/* Métriques des chats */}
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
      </div>
    </div>
  );
}