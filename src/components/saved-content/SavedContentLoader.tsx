
import { Loader2 } from "lucide-react";

export const SavedContentLoader = () => {
  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="h-10 w-24 bg-gray-200 animate-pulse rounded mb-8"></div>
      
      <div className="flex items-center justify-between mb-8">
        <div className="h-10 w-48 bg-gray-200 animate-pulse rounded"></div>
        <div className="h-10 w-32 bg-gray-200 animate-pulse rounded"></div>
      </div>
      
      <div className="h-12 w-full bg-gray-200 animate-pulse rounded mb-8"></div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 xl:gap-8">
        {Array(6).fill(0).map((_, i) => (
          <div key={i} className="h-64 bg-gray-200 animate-pulse rounded-lg"></div>
        ))}
      </div>
      
      <div className="flex flex-col items-center justify-center mt-10 space-y-4">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="text-gray-600">Chargement de vos ressources...</span>
        <p className="text-sm text-gray-500 max-w-md text-center">
          Les données sont en cours de récupération. Veuillez patienter quelques instants...
        </p>
      </div>
    </div>
  );
};
