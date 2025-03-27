
import React, { useState, useCallback } from "react";
import { Input } from "@/components/ui/input";
import { Search, CalendarRange, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Toggle } from "@/components/ui/toggle";
import { cn } from "@/lib/utils";

interface SearchBarProps {
  onSearch: (search: string) => void;
  onToggleFilters: () => void;
  showFilters: boolean;
  searchText: string;
  placeholderText?: string;
  className?: string;
}

export const SearchBar: React.FC<SearchBarProps> = ({
  onSearch,
  onToggleFilters,
  showFilters,
  searchText,
  placeholderText = "Rechercher...",
  className
}) => {
  const [inputValue, setInputValue] = useState(searchText);
  
  const handleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setInputValue(value);
    onSearch(value);
  }, [onSearch]);

  const handleClear = useCallback(() => {
    setInputValue('');
    onSearch('');
  }, [onSearch]);

  return (
    <div className={cn("relative flex items-center w-full", className)}>
      <div className="relative flex-grow">
        <div className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400">
          <Search className="h-4 w-4" />
        </div>
        <Input
          type="text"
          placeholder={placeholderText}
          value={inputValue}
          onChange={handleSearchChange}
          className="pl-9 pr-9 py-2 w-full text-sm placeholder:text-gray-400"
        />
        {inputValue && (
          <button 
            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            onClick={handleClear}
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>
      <Toggle
        pressed={showFilters}
        onPressedChange={onToggleFilters}
        className="ml-2 p-2 h-10 aspect-square"
        title="Filtres avancés"
      >
        <CalendarRange className="h-4 w-4" />
      </Toggle>
    </div>
  );
};
