
import { LoadingIndicator } from "@/components/ui/loading-indicator";

export function SubscriptionLoading() {
  return (
    <div className="flex items-center justify-center min-h-[50vh] transition-opacity duration-300">
      <div className="text-center">
        <LoadingIndicator type="spinner" size="md" />
        <p className="text-muted-foreground mt-4">Chargement en cours...</p>
      </div>
    </div>
  );
}
