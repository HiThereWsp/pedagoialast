import React, { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { ResultDisplay } from "./result/ResultDisplay";

export function StandardExerciseGenerator() {
  const [subject, setSubject] = useState("");
  const [classLevel, setClassLevel] = useState("");
  const [objective, setObjective] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [generatedExercise, setGeneratedExercise] = useState("");
  const { toast } = useToast();

  const handleGenerate = async () => {
    if (!subject || !classLevel || !objective) {
      toast({
        description: "Veuillez remplir tous les champs requis.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("generate-exercises", {
        body: {
          type: "standard",
          subject,
          classLevel,
          objective,
        },
      });

      if (error) throw error;

      setGeneratedExercise(data.exercise);
      toast({
        description: "Exercice généré avec succès !",
      });
    } catch (error) {
      console.error("Error:", error);
      toast({
        description: "Une erreur est survenue lors de la génération.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-4 space-y-6">
      <Card className="relative overflow-hidden p-6 space-y-6 bg-white/90 backdrop-blur-md border-[#9b87f5]/20 shadow-lg hover:shadow-xl transition-all duration-300">
        <div className="absolute inset-0 bg-gradient-to-br from-[#9b87f5]/5 to-[#6E59A5]/5 pointer-events-none" />
        
        <div className="space-y-2">
          <Label htmlFor="subject" className="text-[#7E69AB] font-medium">Matière</Label>
          <Select value={subject} onValueChange={setSubject}>
            <SelectTrigger className="bg-white/80 border-[#9b87f5]/20 focus-visible:ring-[#9b87f5]/30">
              <SelectValue placeholder="Sélectionnez une matière" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="mathematics">Mathématiques</SelectItem>
              <SelectItem value="french">Français</SelectItem>
              <SelectItem value="history">Histoire</SelectItem>
              <SelectItem value="geography">Géographie</SelectItem>
              <SelectItem value="science">Sciences</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="classLevel" className="text-[#7E69AB] font-medium">Niveau de classe</Label>
          <Select value={classLevel} onValueChange={setClassLevel}>
            <SelectTrigger className="bg-white/80 border-[#9b87f5]/20 focus-visible:ring-[#9b87f5]/30">
              <SelectValue placeholder="Sélectionnez un niveau" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="cp">CP</SelectItem>
              <SelectItem value="ce1">CE1</SelectItem>
              <SelectItem value="ce2">CE2</SelectItem>
              <SelectItem value="cm1">CM1</SelectItem>
              <SelectItem value="cm2">CM2</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="objective" className="text-[#7E69AB] font-medium">Objectif pédagogique</Label>
          <Textarea
            id="objective"
            placeholder="Ex: Apprendre à additionner des nombres à deux chiffres..."
            value={objective}
            onChange={(e) => setObjective(e.target.value)}
            className="min-h-[100px] bg-white/80 border-[#9b87f5]/20 focus-visible:ring-[#9b87f5]/30"
          />
        </div>

        <Button 
          onClick={handleGenerate} 
          disabled={isLoading || !subject || !classLevel || !objective}
          className="w-full bg-gradient-to-r from-[#9b87f5] to-[#6E59A5] text-white hover:opacity-90 transition-all duration-300 shadow-md hover:shadow-lg"
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Génération en cours...
            </>
          ) : (
            "Générer l'exercice"
          )}
        </Button>
      </Card>

      {generatedExercise && <ResultDisplay text={generatedExercise} />}
    </div>
  );
}