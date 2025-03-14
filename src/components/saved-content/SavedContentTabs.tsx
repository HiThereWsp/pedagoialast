
import React, { useCallback } from "react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { savedContentTabs } from "./SavedContentHeader";
import { useIsMobile } from '@/hooks/use-mobile';

interface SavedContentTabsProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export const SavedContentTabs: React.FC<SavedContentTabsProps> = React.memo(({ 
  activeTab, 
  onTabChange 
}) => {
  const isMobile = useIsMobile();
  
  const handleValueChange = useCallback((value: string) => {
    onTabChange(value);
  }, [onTabChange]);

  return (
    <div className="mb-6 md:mb-8 sticky top-0 z-10 bg-background pb-1">
      <Tabs 
        value={activeTab}
        onValueChange={handleValueChange}
      >
        <TabsList className={`w-full ${isMobile ? 'flex overflow-x-auto scrollbar-none' : 'justify-start'} border-b bg-transparent p-0`}>
          {savedContentTabs.map((tab) => (
            <TabsTrigger
              key={tab.id}
              value={tab.id}
              className={`${isMobile ? 'py-2 px-3 text-xs' : 'py-3 px-4 text-sm'} min-w-fit font-medium text-gray-600 dark:text-gray-400 data-[state=active]:text-[#FFA800] data-[state=active]:border-b-2 data-[state=active]:border-[#FFA800] transition-colors rounded-none whitespace-nowrap`}
            >
              {tab.label}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>
    </div>
  );
});

SavedContentTabs.displayName = "SavedContentTabs";
