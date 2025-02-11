
import { MetricsSummary } from "@/components/metrics/MetricsSummary";
import { SEO } from "@/components/SEO";

export default function MetricsPage() {
  return (
    <>
      <SEO 
        title="Statistiques | PedagoIA - Analysez votre utilisation"
        description="Visualisez et analysez vos statistiques d'utilisation de PedagoIA pour optimiser votre expérience pédagogique."
      />
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <img 
            src="/lovable-uploads/03e0c631-6214-4562-af65-219e8210fdf1.png" 
            alt="PedagoIA Logo" 
            className="w-[100px] h-[120px] object-contain mx-auto mb-4" 
          />
          <h1 className="text-3xl font-bold">Statistiques d'utilisation</h1>
        </div>
        <MetricsSummary />
      </div>
    </>
  );
}
