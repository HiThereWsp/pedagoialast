
import React, { useMemo } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { ResourceSkeleton, type SkeletonType } from "./ResourceSkeleton";
import { LoadingIndicator } from "@/components/ui/loading-indicator";
import { BackButton } from "@/components/settings/BackButton";

interface SavedContentLoaderProps {
  activeTab?: string;
}

export const SavedContentLoader: React.FC<SavedContentLoaderProps> = React.memo(({ 
  activeTab = "sequences" 
}) => {
  const skeletonType = useMemo((): SkeletonType => {
    switch (activeTab) {
      case "sequences":
        return "lesson-plan";
      case "exercises":
        return "exercise";
      case "images":
        return "image";
      case "correspondence":
        return "correspondence";
      default:
        return "lesson-plan";
    }
  }, [activeTab]);

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-4">
        <BackButton />
      </div>
      
      <div className="flex items-center justify-between mb-8">
        <Skeleton className="h-10 w-48" />
        <Skeleton className="h-10 w-32" />
      </div>
      
      <div className="mb-8">
        <div className="flex space-x-4">
          {["sequences", "exercises", "images", "correspondence"].map((tab) => (
            <Skeleton 
              key={tab} 
              className={`h-10 w-32 ${activeTab === tab ? 'bg-amber-100/50' : ''}`} 
            />
          ))}
        </div>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 xl:gap-8">
        {Array(6).fill(0).map((_, i) => (
          <ResourceSkeleton key={i} type={skeletonType} />
        ))}
      </div>
      
      <div className="flex flex-col items-center justify-center mt-10 space-y-4">
        <LoadingIndicator 
          message="Chargement de vos ressources..." 
          submessage="Les données sont en cours de récupération" 
        />
      </div>
    </div>
  );
});

SavedContentLoader.displayName = "SavedContentLoader";
