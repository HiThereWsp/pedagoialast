
import type { SavedContent } from "@/types/saved-content";

export interface ContentErrors {
  exercises?: string;
  lessonPlans?: string;
  correspondences?: string;
  images?: string;
  delete?: string;
}

export interface SavedContentState {
  content: SavedContent[];
  errors: ContentErrors;
  isLoadingInitial: boolean;
  isRefreshing: boolean;
}

export interface FetchConfig {
  forceRefresh?: boolean;
  signal?: AbortSignal;
  requestId?: number;
}
