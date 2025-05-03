import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2 } from "lucide-react";

interface ModificationFormProps {
  onModify: (instructions: string) => Promise<void>;
  isModifying: boolean;
}

export function ModificationForm({ onModify, isModifying }: ModificationFormProps) {
  const [instructions, setInstructions] = useState<string>("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!instructions.trim()) return;
    
    await onModify(instructions);
    // Ne pas réinitialiser les instructions après la soumission pour permettre
    // des modifications incrémentales
  };

  return (
    <Card className="mt-8">
      <CardHeader>
        <CardTitle>Modifier l'exercice</CardTitle>
        <CardDescription>
          Décrivez précisément les modifications que vous souhaitez apporter à l'exercice généré.
        </CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent>
          <Textarea
            placeholder="Exemple: Simplifier le premier exercice, ajouter une question bonus, adapter le vocabulaire pour des CM1..."
            className="min-h-[120px]"
            value={instructions}
            onChange={(e) => setInstructions(e.target.value)}
            disabled={isModifying}
          />
        </CardContent>
        <CardFooter>
          <Button 
            type="submit" 
            disabled={!instructions.trim() || isModifying}
            className="w-full"
          >
            {isModifying ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Modification en cours...
              </>
            ) : (
              "Modifier l'exercice"
            )}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
} 