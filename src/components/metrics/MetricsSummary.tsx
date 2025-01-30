import React from 'react';
import { Card } from "@/components/ui/card";
import { useQuery } from '@tanstack/react-query';
import { supabase } from "@/integrations/supabase/client";
import { Loader2, Users, Clock, TrendingUp, AlertCircle } from "lucide-react";

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

  const { data: retentionData, isLoading: loadingRetention } = useQuery({
    queryKey: ['retention-metrics'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('user_retention')
        .select('retention_7_days, retention_30_days, retention_90_days');
      
      if (error) throw error;
      return data;
    }
  });

  const { data: usagePatterns, isLoading: loadingPatterns } = useQuery({
    queryKey: ['usage-patterns'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('usage_patterns')
        .select('tool_type, day_of_week, hour_of_day, feature_complexity');
      
      if (error) throw error;
      return data;
    }
  });

  const { data: frictionPoints, isLoading: loadingFriction } = useQuery({
    queryKey: ['friction-points'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('friction_points')
        .select('tool_type, was_abandoned, regeneration_count, error_occurred');
      
      if (error) throw error;
      return data;
    }
  });

  const { data: dauMau, isLoading: loadingDauMau } = useQuery({
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

  if (loadingTools || loadingSessions || loadingChats || loadingRetention || loadingPatterns || loadingFriction || loadingDauMau) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
      </div>
    );
  }

  // Calculate tool stats
  const toolStats = toolMetrics?.reduce((acc, metric) => {
    acc.total++;
    if (metric.feedback_score === 1) acc.positiveFeeback++;
    if (!acc.byType[metric.tool_type]) acc.byType[metric.tool_type] = 0;
    acc.byType[metric.tool_type]++;
    return acc;
  }, { total: 0, positiveFeeback: 0, byType: {} as Record<string, number> }) ?? { total: 0, positiveFeeback: 0, byType: {} };

  // Calculate session stats
  const sessionStats = sessionMetrics?.reduce((acc, session) => {
    acc.totalDuration += session.session_duration_seconds ?? 0;
    acc.totalMessages += session.total_messages ?? 0;
    acc.totalActions += session.successful_actions ?? 0;
    return acc;
  }, { totalDuration: 0, totalMessages: 0, totalActions: 0 }) ?? { totalDuration: 0, totalMessages: 0, totalActions: 0 };

  // Calculate chat stats
  const chatStats = chats?.reduce((acc, chat) => {
    acc.total++;
    if (chat.feedback_score === 1) acc.positiveFeeback++;
    if (!acc.byType[chat.message_type ?? 'other']) acc.byType[chat.message_type ?? 'other'] = 0;
    acc.byType[chat.message_type ?? 'other']++;
    return acc;
  }, { total: 0, positiveFeeback: 0, byType: {} as Record<string, number> }) ?? { total: 0, positiveFeeback: 0, byType: {} };

  // Calculate retention rates
  const retentionStats = retentionData?.reduce((acc, user) => {
    if (user.retention_7_days) acc.sevenDays++;
    if (user.retention_30_days) acc.thirtyDays++;
    if (user.retention_90_days) acc.ninetyDays++;
    return acc;
  }, { sevenDays: 0, thirtyDays: 0, ninetyDays: 0 }) ?? { sevenDays: 0, thirtyDays: 0, ninetyDays: 0 };

  // Calculate usage patterns
  const patternStats = usagePatterns?.reduce((acc, pattern) => {
    if (!acc.byComplexity[pattern.feature_complexity ?? 'basic']) {
      acc.byComplexity[pattern.feature_complexity ?? 'basic'] = 0;
    }
    acc.byComplexity[pattern.feature_complexity ?? 'basic']++;
    acc.total++;
    return acc;
  }, { total: 0, byComplexity: {} as Record<string, number> }) ?? { total: 0, byComplexity: {} };

  // Calculate friction points
  const frictionStats = frictionPoints?.reduce((acc, point) => {
    acc.total++;
    if (point.was_abandoned) acc.abandoned++;
    if (point.error_occurred) acc.errors++;
    acc.totalRegenerations += point.regeneration_count ?? 0;
    return acc;
  }, { total: 0, abandoned: 0, errors: 0, totalRegenerations: 0 }) ?? { total: 0, abandoned: 0, errors: 0, totalRegenerations: 0 };

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

        {/* Rétention */}
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
              DAU/MAU: {(dauMau?.dau_mau_ratio * 100 ?? 0).toFixed(1)}%
            </p>
          </div>
        </Card>

        {/* Patterns d'utilisation */}
        <Card className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <Clock className="h-5 w-5 text-green-500" />
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

        {/* Points de friction */}
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
      </div>
    </div>
  );
}
