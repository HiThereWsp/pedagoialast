
import { useState } from "react";
import { Input } from "@/components/ui/input";

interface UserFormProps {
  email: string;
  setEmail: (email: string) => void;
  adminKey: string;
  setAdminKey: (adminKey: string) => void;
}

export function UserForm({ email, setEmail, adminKey, setAdminKey }: UserFormProps) {
  return (
    <>
      <div className="space-y-2">
        <label htmlFor="email" className="text-sm font-medium text-muted-foreground">
          Email utilisateur
        </label>
        <Input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="utilisateur@exemple.fr"
        />
      </div>
      
      <div className="space-y-2">
        <label htmlFor="adminKey" className="text-sm font-medium text-muted-foreground">
          Clé admin
        </label>
        <Input
          id="adminKey"
          type="password"
          value={adminKey}
          onChange={(e) => setAdminKey(e.target.value)}
          placeholder="Clé secrète admin"
        />
      </div>
    </>
  );
}
