
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Filter, Search, X } from 'lucide-react';

interface BugReportFiltersProps {
  onApplyFilters: (status: string, search: string) => void;
}

export const BugReportFilters: React.FC<BugReportFiltersProps> = ({ onApplyFilters }) => {
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');

  const handleApplyFilters = () => {
    onApplyFilters(statusFilter, searchTerm);
  };

  const handleReset = () => {
    setStatusFilter('all');
    setSearchTerm('');
    onApplyFilters('all', '');
  };

  return (
    <div className="flex flex-col sm:flex-row gap-4 items-end mb-6">
      <div className="flex-1 space-y-1">
        <label htmlFor="search" className="text-sm font-medium">Recherche</label>
        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            id="search"
            placeholder="Rechercher par description, url ou browser info..."
            className="pl-8"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                handleApplyFilters();
              }
            }}
          />
          {searchTerm && (
            <Button
              variant="ghost"
              size="sm"
              className="absolute right-1 top-1 h-7 w-7 p-0"
              onClick={() => {
                setSearchTerm('');
              }}
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>
      
      <div className="w-full sm:w-48 space-y-1">
        <label htmlFor="status-filter" className="text-sm font-medium">Statut</label>
        <Select
          value={statusFilter}
          onValueChange={setStatusFilter}
        >
          <SelectTrigger id="status-filter">
            <SelectValue placeholder="Tous les statuts" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tous les statuts</SelectItem>
            <SelectItem value="new">Nouveaux</SelectItem>
            <SelectItem value="in_progress">En cours</SelectItem>
            <SelectItem value="resolved">Résolus</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      <div className="flex gap-2 justify-end sm:justify-start">
        <Button variant="outline" onClick={handleReset}>
          Réinitialiser
        </Button>
        <Button onClick={handleApplyFilters}>
          <Filter className="mr-2 h-4 w-4" />
          Appliquer
        </Button>
      </div>
    </div>
  );
};
