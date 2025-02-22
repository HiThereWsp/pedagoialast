
import { AlertCircle } from "lucide-react";
import { Card } from "@/components/ui/card";

interface SavedContentErrorProps {
  error: string;
}

export const SavedContentError = ({ error }: SavedContentErrorProps) => {
  return (
    <Card className="p-6">
      <div className="flex items-center gap-2 text-red-500">
        <AlertCircle className="h-5 w-5" />
        <p>{error}</p>
      </div>
    </Card>
  );
};
