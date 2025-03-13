
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RedirectTable } from "@/components/redirects/RedirectTable";
import { RedirectDialog } from "@/components/redirects/RedirectDialog";
import { useRedirects } from "@/components/redirects/useRedirects";
import { RedirectsHeader } from "@/components/redirects/RedirectsHeader";

export default function RedirectsPage() {
  const {
    redirects,
    loading,
    openDialog,
    setOpenDialog,
    editRedirect,
    formData,
    handleFormChange,
    handleSubmit,
    handleDelete,
    handleEdit,
    resetForm,
  } = useRedirects();

  return (
    <div className="container mx-auto py-8 px-4">
      <Card className="mb-8">
        <RedirectsHeader />
        <CardContent>
          <Button 
            onClick={() => {
              resetForm();
              setOpenDialog(true);
            }}
            className="mb-4"
          >
            Nouvelle Redirection
          </Button>

          <RedirectTable 
            redirects={redirects}
            loading={loading}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        </CardContent>
      </Card>

      {/* Create/Edit Dialog */}
      <RedirectDialog
        open={openDialog}
        onOpenChange={setOpenDialog}
        editRedirect={editRedirect}
        formData={formData}
        onFormChange={handleFormChange}
        onSubmit={handleSubmit}
        onCancel={() => {
          setOpenDialog(false);
          resetForm();
        }}
      />
    </div>
  );
}
