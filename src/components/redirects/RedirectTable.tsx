
import React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";

type Redirect = {
  id: string;
  short_path: string;
  target_url: string;
  description: string;
  click_count: number;
  created_at: string;
  last_clicked_at: string | null;
};

interface RedirectTableProps {
  redirects: Redirect[];
  loading: boolean;
  onEdit: (redirect: Redirect) => void;
  onDelete: (id: string) => void;
}

// Format date helper
const formatDate = (dateString: string | null) => {
  if (!dateString) return "Jamais";
  return new Date(dateString).toLocaleString("fr-FR");
};

// Get base URL helper
const getBaseUrl = () => {
  return window.location.origin;
};

export const RedirectTable = ({ redirects, loading, onEdit, onDelete }: RedirectTableProps) => {
  return (
    <div className="overflow-x-auto">
      {loading ? (
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Chemin court</TableHead>
              <TableHead>URL cible</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Clics</TableHead>
              <TableHead>Dernier clic</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {redirects.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8">
                  Aucune redirection trouvée.
                </TableCell>
              </TableRow>
            ) : (
              redirects.map((redirect) => (
                <TableRow key={redirect.id}>
                  <TableCell>
                    <a 
                      href={`${getBaseUrl()}/${redirect.short_path}`} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline"
                    >
                      {redirect.short_path}
                    </a>
                  </TableCell>
                  <TableCell className="max-w-md truncate">
                    <a 
                      href={redirect.target_url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline"
                    >
                      {redirect.target_url}
                    </a>
                  </TableCell>
                  <TableCell>{redirect.description}</TableCell>
                  <TableCell>{redirect.click_count}</TableCell>
                  <TableCell>{formatDate(redirect.last_clicked_at)}</TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => onEdit(redirect)}
                      >
                        Modifier
                      </Button>
                      <Button 
                        variant="destructive" 
                        size="sm" 
                        onClick={() => onDelete(redirect.id)}
                      >
                        Supprimer
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      )}
    </div>
  );
};
