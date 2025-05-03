import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { MusicLessonParams } from "@/services/music-lessons";

interface MusicLessonFormProps {
  onGenerate: (params: MusicLessonParams) => void;
  isGenerating: boolean;
}

export function MusicLessonForm({ onGenerate, isGenerating }: MusicLessonFormProps) {
  const [classLevel, setClassLevel] = useState("");
  const [subject, setSubject] = useState("");
  const [fromText, setFromText] = useState("");
  const [learningPoints, setLearningPoints] = useState("");

  const handleGenerate = () => {
    onGenerate({
      classLevel,
      subject,
      concept: subject, // Utiliser la matière comme concept par défaut
      musicGenre: "", // Champ supprimé mais gardé dans les params pour compatibilité
      learningPoints,
      fromText,
      creationMode: fromText ? "fromText" : "create" // Détecter automatiquement le mode
    });
  };

  return (
    <div className="space-y-6">
      <h1 className="text-4xl font-bold mb-8 text-center">Générer une chanson pédagogique</h1>
      
      {/* Formulaire simplifié */}
      <div className="space-y-6">
        {/* Niveau de classe */}
        <div>
          <label className="block text-lg font-medium mb-2">Niveau de classe</label>
          <Input 
            placeholder="CP, CE1, CE2, CM1, CM2, 6ème..." 
            className="w-full py-6 bg-gray-100 border-none"
            value={classLevel}
            onChange={(e) => setClassLevel(e.target.value)}
          />
        </div>
        
        {/* Matière */}
        <div>
          <label className="block text-lg font-medium mb-2">Matière</label>
          <Input 
            placeholder="Mathématiques, Français, Histoire, Sciences..." 
            className="w-full py-6 bg-gray-100 border-none"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
          />
        </div>
        
        {/* Texte (facultatif) */}
        <div>
          <label className="block text-lg font-medium mb-2">
            Texte source
            <span className="text-sm font-normal ml-2 text-gray-500">Facultatif</span>
          </label>
          <Textarea 
            placeholder="Collez ici un texte à transformer en chanson" 
            className="w-full py-6 bg-gray-100 border-none min-h-[150px]"
            value={fromText}
            onChange={(e) => setFromText(e.target.value)}
          />
        </div>
        
        {/* Objectif d'apprentissage */}
        <div>
          <label className="block text-lg font-medium mb-2">Objectif d'apprentissage</label>
          <Textarea 
            placeholder="Mémoriser les tables de multiplication, Comprendre les règles d'accord du pluriel..." 
            className="w-full py-6 bg-gray-100 border-none min-h-[100px]"
            value={learningPoints}
            onChange={(e) => setLearningPoints(e.target.value)}
          />
        </div>
        
        {/* Bouton de génération */}
        <Button 
          className="w-full py-6 mt-8 rounded-full bg-gradient-to-r from-[#F47C7C] to-[#AC7AB5] text-white hover:opacity-90 transition-opacity"
          onClick={handleGenerate}
          disabled={isGenerating}
        >
          {isGenerating ? "Génération en cours..." : "Générer la chanson"}
        </Button>
      </div>
    </div>
  );
} 