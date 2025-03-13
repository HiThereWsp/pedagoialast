
import React from "react";
import {
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";

export const RedirectsHeader = () => {
  return (
    <CardHeader>
      <CardTitle className="text-5xl font-bold leading-tight tracking-tight text-balance">
        Gestion des Redirections
      </CardTitle>
      <CardDescription>
        Créez et gérez des liens courts pour vos campagnes marketing
      </CardDescription>
    </CardHeader>
  );
};
