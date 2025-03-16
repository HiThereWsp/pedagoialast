
import { useState, useCallback } from "react";
import type { SavedContent } from "@/types/saved-content";

/**
 * Hook for managing content navigation (tabs, preview, item selection)
 * @returns State and handlers for navigation
 */
export function useContentNavigation() {
  const [selectedContent, setSelectedContent] = useState<SavedContent | null>(null);
  const [activeTab, setActiveTab] = useState<string>('sequences');
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  const handleItemSelect = useCallback((item: SavedContent) => {
    setSelectedContent(item);
    setIsPreviewOpen(true);
  }, []);

  const handleTabChange = useCallback((tab: string) => {
    setActiveTab(tab);
  }, []);

  const handlePreviewOpenChange = useCallback((open: boolean) => {
    setIsPreviewOpen(open);
  }, []);

  return {
    // State
    selectedContent,
    activeTab,
    isPreviewOpen,
    
    // Handlers
    handleItemSelect,
    handleTabChange,
    handlePreviewOpenChange
  };
}
