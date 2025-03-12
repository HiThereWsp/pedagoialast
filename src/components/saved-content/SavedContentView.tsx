
import React from "react";
import { SavedContentContainer } from "./SavedContentContainer";
import { SavedContentList } from "./SavedContentList";
import { DeleteDialog } from "./DeleteDialog";
import { ContentPreviewSheet } from "./ContentPreviewSheet";
import { useSavedContentPage } from "@/hooks/saved-content/useSavedContentPage";
import { SavedContentLoader } from "./SavedContentLoader";

export const SavedContentView: React.FC = () => {
  const {
    selectedContent,
    activeTab,
    isPreviewOpen,
    deleteDialog,
    stableContent,
    errors,
    isLoading,
    isRefreshing,
    
    handleItemSelect,
    handleTabChange,
    handlePreviewOpenChange,
    handleDeleteRequest,
    handleDeleteDialogChange,
    handleConfirmDelete,
    handleRefresh,
    
    hasError,
    errorMessage,
    authReady
  } = useSavedContentPage();

  if (!authReady) {
    return (
      <SavedContentContainer 
        isLoading={true}
        isRefreshing={false}
        hasError={false}
        errorMessage=""
        activeTab={activeTab}
        contentCount={0}
        onRefresh={handleRefresh}
        onTabChange={handleTabChange}
      >
        <SavedContentLoader message="Préparation de votre espace..." />
      </SavedContentContainer>
    );
  }

  return (
    <>
      <SavedContentContainer 
        isLoading={isLoading}
        isRefreshing={isRefreshing}
        hasError={hasError}
        errorMessage={errorMessage}
        activeTab={activeTab}
        contentCount={stableContent.length}
        onRefresh={handleRefresh}
        onTabChange={handleTabChange}
      >
        <SavedContentList
          content={stableContent}
          onItemSelect={handleItemSelect}
          selectedItemId={selectedContent?.id}
          activeTab={activeTab}
        />
      </SavedContentContainer>

      <ContentPreviewSheet
        content={selectedContent}
        isOpen={isPreviewOpen}
        onOpenChange={handlePreviewOpenChange}
        onDelete={handleDeleteRequest}
      />

      <DeleteDialog 
        isOpen={deleteDialog.isOpen}
        onOpenChange={handleDeleteDialogChange}
        onDelete={handleConfirmDelete}
        itemType={deleteDialog.itemType}
        error={errors.delete}
      />
    </>
  );
};
