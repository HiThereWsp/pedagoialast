
import React, { useMemo } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { Card } from "@/components/ui/card";
import { Book, FileText, Image, Mail } from "lucide-react";

export type SkeletonType = "exercise" | "lesson-plan" | "image" | "correspondence";

interface ResourceSkeletonProps {
  type?: SkeletonType;
}

export const ResourceSkeleton: React.FC<ResourceSkeletonProps> = React.memo(({ 
  type = "lesson-plan" 
}) => {
  const icon = useMemo(() => {
    switch (type) {
      case "exercise":
        return <FileText className="h-8 w-8 text-gray-300" />;
      case "lesson-plan":
        return <Book className="h-8 w-8 text-gray-300" />;
      case "image":
        return <Image className="h-8 w-8 text-gray-300" />;
      case "correspondence":
        return <Mail className="h-8 w-8 text-gray-300" />;
    }
  }, [type]);

  return (
    <Card className="overflow-hidden bg-white dark:bg-gray-900">
      {type === "image" ? (
        <div className="aspect-square bg-gray-200 animate-pulse flex items-center justify-center">
          {icon}
        </div>
      ) : (
        <div className="p-6">
          <div className="flex items-start space-x-4">
            <div className="hidden sm:flex items-center justify-center rounded-full w-10 h-10 bg-gray-100">
              {icon}
            </div>
            <div className="flex-1 space-y-4">
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
            </div>
          </div>
          <div className="mt-6 space-y-2">
            <div className="flex space-x-2">
              <Skeleton className="h-3 w-24 rounded-full" />
              <Skeleton className="h-3 w-16 rounded-full" />
            </div>
            <div className="flex space-x-2 mt-3">
              <Skeleton className="h-5 w-16 rounded-full" />
              <Skeleton className="h-5 w-20 rounded-full" />
            </div>
          </div>
        </div>
      )}
    </Card>
  );
});

ResourceSkeleton.displayName = "ResourceSkeleton";
