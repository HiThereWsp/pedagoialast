
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
    <Tabs 
      value={activeTab}
      onValueChange={handleValueChange}
      className="mb-8"
    >
      <TabsList className="w-full justify-start border-b bg-transparent p-0">
        {savedContentTabs.map((tab) => (
          <TabsTrigger
            key={tab.id}
            value={tab.id}
            className="py-3 px-4 text-sm font-medium text-gray-600 dark:text-gray-400 data-[state=active]:text-[#FFA800] data-[state=active]:border-b-2 data-[state=active]:border-[#FFA800] transition-colors rounded-none"
          >
            {tab.label}
          </TabsTrigger>
        ))}
      </TabsList>
    </Tabs>
  );
});

SavedContentTabs.displayName = "SavedContentTabs";
