import React from 'react';
import { Loader2 } from "lucide-react";
import { useQuery } from '@tanstack/react-query';
import { ToolMetricsCard } from './cards/ToolMetricsCard';
import { SessionMetricsCard } from './cards/SessionMetricsCard';
import { ChatMetricsCard } from './cards/ChatMetricsCard';
import { RetentionCard } from './cards/RetentionCard';
import { UsagePatternsCard } from './cards/UsagePatternsCard';
import { FrictionPointsCard } from './cards/FrictionPointsCard';

export function MetricsSummary() {
  const { isLoading: loadingTools } = useQuery({ queryKey: ['tool-metrics'] });
  const { isLoading: loadingSessions } = useQuery({ queryKey: ['session-metrics'] });
  const { isLoading: loadingChats } = useQuery({ queryKey: ['chats-metrics'] });
  const { isLoading: loadingRetention } = useQuery({ queryKey: ['retention-metrics'] });
  const { isLoading: loadingPatterns } = useQuery({ queryKey: ['usage-patterns'] });
  const { isLoading: loadingFriction } = useQuery({ queryKey: ['friction-points'] });
  const { isLoading: loadingDauMau } = useQuery({ queryKey: ['dau-mau'] });

  if (loadingTools || loadingSessions || loadingChats || loadingRetention || loadingPatterns || loadingFriction || loadingDauMau) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Résumé des Métriques</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <ToolMetricsCard />
        <SessionMetricsCard />
        <ChatMetricsCard />
        <RetentionCard />
        <UsagePatternsCard />
        <FrictionPointsCard />
      </div>
    </div>
  );
}