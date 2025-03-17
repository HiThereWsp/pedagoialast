
import React, { useState } from 'react';
import { AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { BugReportDialog } from './BugReportDialog';

export const BugReportButton = () => {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button
        onClick={() => setOpen(true)}
        className="fixed bottom-4 right-4 z-50 rounded-full p-3 bg-red-500 hover:bg-red-600 shadow-lg"
        aria-label="Signaler un bug"
        variant="secondary"
      >
        <AlertCircle className="h-5 w-5 text-white" />
      </Button>
      <BugReportDialog open={open} onOpenChange={setOpen} />
    </>
  );
};
