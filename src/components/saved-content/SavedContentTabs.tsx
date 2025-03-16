
import React, { useCallback } from "react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { savedContentTabs } from "./SavedContentHeader";

interface SavedContentTabsProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export const SavedContentTabs: React.FC<SavedContentTabsProps> = React.memo(({ 
  activeTab, 
  onTabChange 
}) => {
  const handleValueChange = useCallback((value: string) => {
    onTabChange(value);
  }, [onTabChange]);

  return (
    <div className="mb-6 md:mb-8 sticky top-0 z-10 bg-background pb-1">
      <Tabs 
        value={activeTab}
        onValueChange={handleValueChange}
      >
        <TabsList className="w-full justify-start border-b bg-transparent p-0 overflow-x-auto scrollbar-none">
          {savedContentTabs.map((tab) => (
            <TabsTrigger
              key={tab.id}
              value={tab.id}
              className="py-2.5 px-4 text-sm whitespace-nowrap min-w-fit font-medium text-gray-600 dark:text-gray-400 data-[state=active]:text-[#FFA800] data-[state=active]:border-b-2 data-[state=active]:border-[#FFA800] transition-colors rounded-none"
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
