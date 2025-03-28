
import React, { useState } from "react";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { CalendarRange, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

export interface SearchFiltersProps {
  onFilterChange: (filters: FilterOptions) => void;
  className?: string;
  subjectOptions: string[];
  currentFilters: FilterOptions;
}

export interface FilterOptions {
  sortBy: 'recent' | 'oldest' | 'title';
  dateRange: {
    from: Date | undefined;
    to: Date | undefined;
  };
  subjects: string[];
}

export const SearchFilters: React.FC<SearchFiltersProps> = ({
  onFilterChange,
  className,
  subjectOptions,
  currentFilters
}) => {
  const [dateOpen, setDateOpen] = useState(false);
  
  const handleSortChange = (value: string) => {
    if (value) {
      onFilterChange({
        ...currentFilters,
        sortBy: value as FilterOptions['sortBy']
      });
    }
  };
  
  const handleDateRangeChange = (range: { from: Date | undefined; to: Date | undefined }) => {
    onFilterChange({
      ...currentFilters,
      dateRange: range
    });
  };
  
  const handleSubjectToggle = (subject: string) => {
    const subjects = currentFilters.subjects.includes(subject)
      ? currentFilters.subjects.filter(s => s !== subject)
      : [...currentFilters.subjects, subject];
      
    onFilterChange({
      ...currentFilters,
      subjects
    });
  };
  
  const resetFilters = () => {
    onFilterChange({
      sortBy: 'recent',
      dateRange: { from: undefined, to: undefined },
      subjects: []
    });
  };
  
  const hasActiveFilters = 
    currentFilters.sortBy !== 'recent' || 
    !!currentFilters.dateRange.from || 
    !!currentFilters.dateRange.to || 
    currentFilters.subjects.length > 0;
    
  return (
    <div className={cn("space-y-4 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-md", className)}>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h3 className="text-sm font-medium">Filtres</h3>
        {hasActiveFilters && (
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={resetFilters}
            className="text-xs h-7 px-2"
          >
            Réinitialiser
          </Button>
        )}
      </div>
      
      <div className="space-y-4">
        <div>
          <h4 className="text-xs text-muted-foreground mb-2">Trier par</h4>
          <ToggleGroup 
            type="single" 
            value={currentFilters.sortBy} 
            onValueChange={handleSortChange} 
            className="justify-start"
          >
            <ToggleGroupItem value="recent" size="sm" className="text-xs">Plus récent</ToggleGroupItem>
            <ToggleGroupItem value="oldest" size="sm" className="text-xs">Plus ancien</ToggleGroupItem>
            <ToggleGroupItem value="title" size="sm" className="text-xs">Titre</ToggleGroupItem>
          </ToggleGroup>
        </div>
        
        <div>
          <h4 className="text-xs text-muted-foreground mb-2">Période</h4>
          <Popover open={dateOpen} onOpenChange={setDateOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className={cn(
                  "justify-start text-left w-full font-normal",
                  !currentFilters.dateRange.from && !currentFilters.dateRange.to && "text-muted-foreground"
                )}
              >
                <CalendarRange className="mr-2 h-4 w-4" />
                {currentFilters.dateRange.from ? (
                  currentFilters.dateRange.to ? (
                    <>
                      {format(currentFilters.dateRange.from, "d LLL", { locale: fr })} - 
                      {format(currentFilters.dateRange.to, "d LLL", { locale: fr })}
                    </>
                  ) : (
                    format(currentFilters.dateRange.from, "d LLLL yyyy", { locale: fr })
                  )
                ) : (
                  "Sélectionner une période"
                )}
                <ChevronDown className="ml-auto h-4 w-4 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                initialFocus
                mode="range"
                defaultMonth={currentFilters.dateRange.from}
                selected={currentFilters.dateRange}
                onSelect={handleDateRangeChange}
                numberOfMonths={1}
                locale={fr}
              />
            </PopoverContent>
          </Popover>
        </div>
        
        {subjectOptions.length > 0 && (
          <div>
            <h4 className="text-xs text-muted-foreground mb-2">Matières</h4>
            <div className="flex flex-wrap gap-1.5">
              {subjectOptions.map((subject) => (
                <Button
                  key={subject}
                  variant={currentFilters.subjects.includes(subject) ? "default" : "outline"}
                  size="sm"
                  onClick={() => handleSubjectToggle(subject)}
                  className="text-xs h-7"
                >
                  {subject}
                </Button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
