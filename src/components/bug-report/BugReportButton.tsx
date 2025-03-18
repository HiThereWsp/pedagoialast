import React, { useState } from 'react';
import { AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { BugReportDialog } from './BugReportDialog';
export const BugReportButton = () => {
  const [open, setOpen] = useState(false);
  return <>
      <Button onClick={() => setOpen(true)} aria-label="Signaler un bug" variant="secondary" className="fixed bottom-4 right-4 z-50 p-3 shadow-lg rounded-3xl bg-slate-900 hover:bg-slate-800">
        <AlertCircle className="h-5 w-5 text-white" />
      </Button>
      <BugReportDialog open={open} onOpenChange={setOpen} />
    </>;
};