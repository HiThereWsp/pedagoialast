import React, { useMemo, useCallback, useState } from "react";
import { type SavedContent } from "@/types/saved-content";
import { ResourceCard } from "./ResourceCard";
import { SearchBar } from "./SearchBar";
import { SearchFilters, FilterOptions } from "./SearchFilters";
import { savedContentTabs } from "./SavedContentHeader";

interface SavedContentListProps {
  content: SavedContent[];
  onItemSelect: (item: SavedContent) => void;
  selectedItemId?: string;
  activeTab: string;
  isMobileView?: boolean;
  sectionMode?: boolean;
}

export const SavedContentList = React.memo(({ 
  content, 
  onItemSelect, 
  selectedItemId,
  activeTab,
  isMobileView = false,
  sectionMode = false
}: SavedContentListProps) => {
  
  const [searchText, setSearchText] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<FilterOptions>({
    sortBy: 'recent',
    dateRange: { from: undefined, to: undefined },
    subjects: []
  });
  
  console.log(`🔍 SavedContentList: Contenu reçu: ${content.length} éléments, onglet actif: ${activeTab}, mode section: ${sectionMode}`);
  
  // Collect all unique subjects from the content for filter options
  const subjectOptions = useMemo(() => {
    const subjects = new Set<string>();
    content.forEach(item => {
      if (item.subject) {
        subjects.add(item.subject);
      }
    });
    return Array.from(subjects);
  }, [content]);
  
  // Check if content has changed by comparing IDs
  if (content.length > 0) {
    console.log("📋 Exemple d'élément:", { 
      id: content[0].id,
      title: content[0].title,
      type: content[0].type,
      displayType: content[0].displayType,
      tags: content[0].tags
    });
  }
  
  // Filter content based on the selected tab
  const filteredByTypeContent = useMemo(() => content.filter(item => {
    if (!item) return false; // Protection supplémentaire contre les éléments null
    
    switch (activeTab) {
      case 'sequences':
        return item.type === 'lesson-plan';
      case 'exercises':
        return item.type === 'exercise';
      case 'images':
        return item.type === 'Image';
      case 'correspondence':
        return item.type === 'correspondence';
      case 'music-lessons':
        return item.type === 'music-lesson';
      default:
        return true;
    }
  }), [content, activeTab]);

  // Apply search and filters to the already type-filtered content
  const filteredContent = useMemo(() => {
    let result = filteredByTypeContent;
    
    // Apply text search
    if (searchText) {
      const searchLower = searchText.toLowerCase();
      result = result.filter(item => 
        item.title.toLowerCase().includes(searchLower) || 
        (item.subject && item.subject.toLowerCase().includes(searchLower)) ||
        (item.class_level && item.class_level.toLowerCase().includes(searchLower)) ||
        (item.summary && item.summary.toLowerCase().includes(searchLower))
      );
    }
    
    // Apply subject filters
    if (filters.subjects.length > 0) {
      result = result.filter(item => 
        item.subject && filters.subjects.includes(item.subject)
      );
    }
    
    // Apply date range filter
    if (filters.dateRange.from || filters.dateRange.to) {
      result = result.filter(item => {
        const itemDate = new Date(item.created_at);
        
        if (filters.dateRange.from && filters.dateRange.to) {
          return itemDate >= filters.dateRange.from && itemDate <= filters.dateRange.to;
        }
        
        if (filters.dateRange.from) {
          return itemDate >= filters.dateRange.from;
        }
        
        if (filters.dateRange.to) {
          return itemDate <= filters.dateRange.to;
        }
        
        return true;
      });
    }
    
    // Apply sorting
    return result.sort((a, b) => {
      switch (filters.sortBy) {
        case 'recent':
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        case 'oldest':
          return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
        case 'title':
          return a.title.localeCompare(b.title);
        default:
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      }
    });
  }, [filteredByTypeContent, searchText, filters]);

  console.log(`📊 SavedContentList: Contenu filtré pour l'onglet ${activeTab}: ${filteredContent.length} éléments`);

  const handleItemSelect = useCallback((item: SavedContent) => {
    onItemSelect(item);
  }, [onItemSelect]);
  
  const handleSearch = useCallback((value: string) => {
    setSearchText(value);
  }, []);
  
  const handleToggleFilters = useCallback(() => {
    setShowFilters(prev => !prev);
  }, []);
  
  const handleFilterChange = useCallback((newFilters: FilterOptions) => {
    setFilters(newFilters);
  }, []);

  const activeTabInfo = savedContentTabs.find(tab => tab.id === activeTab) || savedContentTabs[0];
  const placeholderText = `Rechercher dans ${activeTabInfo.label.toLowerCase()}...`;

  if (filteredContent.length === 0) {
    return (
      <div className="space-y-4">
        <SearchBar 
          onSearch={handleSearch}
          onToggleFilters={handleToggleFilters}
          showFilters={showFilters}
          searchText={searchText}
          placeholderText={placeholderText}
          className="mb-4"
        />
        
        {showFilters && (
          <SearchFilters 
            onFilterChange={handleFilterChange}
            subjectOptions={subjectOptions}
            currentFilters={filters}
            className="mb-4"
          />
        )}
        
        <div className="text-center py-4">
          <p className="text-gray-500 dark:text-gray-400 text-sm">
            Aucun contenu disponible pour cette catégorie
          </p>
        </div>
      </div>
    );
  }

  // Mobile view with sections uses full width cards
  return (
    <div className="space-y-4">
      <SearchBar 
        onSearch={handleSearch}
        onToggleFilters={handleToggleFilters}
        showFilters={showFilters}
        searchText={searchText}
        placeholderText={placeholderText}
        className="mb-4"
      />
      
      {showFilters && (
        <SearchFilters 
          onFilterChange={handleFilterChange}
          subjectOptions={subjectOptions}
          currentFilters={filters}
          className="mb-4"
        />
      )}
      
      <div className={`grid ${isMobileView || sectionMode ? 'grid-cols-1 gap-3' : 'sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6'}`}>
        {filteredContent.map((item) => (
          <ResourceCard
            key={item.id}
            resource={item}
            onSelect={handleItemSelect}
            isSelected={item.id === selectedItemId}
          />
        ))}
      </div>
    </div>
  );
});

SavedContentList.displayName = "SavedContentList";
