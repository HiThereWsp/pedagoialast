import { MetricsSummary } from "@/components/metrics/MetricsSummary";
import { SEO } from "@/components/SEO";

export default function MetricsPage() {
  return (
    <>
      <SEO 
        title="Statistiques | PedagoIA - Analysez votre utilisation"
        description="Visualisez et analysez vos statistiques d'utilisation de PedagoIA pour optimiser votre expérience pédagogique."
      />
      <MetricsSummary />
    </>
  );
}