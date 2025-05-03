import React, { useState, useRef, useEffect } from 'react';
import { ScrollCard } from './result/ScrollCard';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { PenLine, RefreshCw } from 'lucide-react';
import { LoadingIndicator } from '@/components/ui/loading-indicator';

interface ResultDisplayProps {
  exercises: string | null;
  exerciseId?: string;
  isModifying?: boolean;
  onModifyRequest?: (instructions: string) => void;
}

export function ResultDisplay({ 
  exercises, 
  exerciseId, 
  isModifying = false, 
  onModifyRequest 
}: ResultDisplayProps) {
  console.log("ResultDisplay rendu avec:", { exercises: !!exercises, exerciseId, isModifying, hasModifyHandler: !!onModifyRequest });

  if (!exercises) return null;

  const [showModificationForm, setShowModificationForm] = useState(false);
  const [modificationInstructions, setModificationInstructions] = useState('');
  const [showNewBadge, setShowNewBadge] = useState(true);
  const modificationFormRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    console.log("État du formulaire de modification:", { showModificationForm, isModifying });
  }, [showModificationForm, isModifying]);

  // Effet pour faire défiler vers le formulaire de modification lorsqu'il est affiché
  useEffect(() => {
    if (showModificationForm && modificationFormRef.current) {
      modificationFormRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [showModificationForm]);

  // Masquer le badge "Nouveau" quand l'utilisateur clique sur le bouton
  useEffect(() => {
    if (showModificationForm) {
      setShowNewBadge(false);
    }
  }, [showModificationForm]);

  const handleToggleModificationForm = () => {
    console.log("Clic sur le bouton de modification");
    setShowModificationForm(prev => !prev);
    if (showModificationForm) {
      setModificationInstructions('');
    }
  };

  const handleModifySubmit = () => {
    console.log("Tentative de soumission de modification:", modificationInstructions);
    if (modificationInstructions.trim() && onModifyRequest) {
      onModifyRequest(modificationInstructions);
    }
  };

  return (
    <div className="space-y-6 mb-10">
      <ScrollCard
        exercises={exercises}
        showCorrection={true}
        className="print:block"
        customClass="text-left"
        contentType="exercise"
        contentId={exerciseId}
      />

      {/* Affichage des chargements en cours */}
      {isModifying && (
        <div className="flex justify-center py-8">
          <div className="bg-white/80 backdrop-blur-sm rounded-lg p-4 shadow-md">
            <LoadingIndicator message="Modification de votre exercice en cours..." />
          </div>
        </div>
      )}

      {/* Bouton pour afficher le formulaire de modification */}
      <div className="mt-8 flex flex-col items-start">
        <div className="relative">
          <Button
            onClick={handleToggleModificationForm}
            variant={showModificationForm ? "outline" : "default"}
            className={`
              flex items-center justify-center relative
              ${showModificationForm 
                ? "border-2 border-gray-300" 
                : "bg-gradient-to-r from-pink-600 to-purple-700 hover:from-pink-700 hover:to-purple-800 text-white"
              }
            `}
          >
            {showModificationForm ? (
              <>
                <PenLine size={20} />
                Annuler les modifications
              </>
            ) : (
              <>
                <span className="relative z-10">Modifier l'exercice</span>
                <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent shine-effect"></span>
              </>
            )}
          </Button>
          {!showModificationForm && (
            <p className="text-base text-gray-700 mt-3 text-left max-w-md">
              En 1 clic, vous pouvez maintenant utiliser l'IA pour modifier cet exercice comme vous le souhaitez
            </p>
          )}
        </div>
      </div>

      {/* Formulaire de modification */}
      {showModificationForm && (
        <div 
          ref={modificationFormRef}
          className="mt-6 bg-white border-2 border-purple-200 rounded-xl p-6 shadow-md hover:shadow-lg transition-shadow duration-200"
        >
          <h3 className="text-lg font-medium mb-4 text-gray-800">
            Demander des modifications
          </h3>
          <p className="text-sm text-gray-600 mb-4">
            Décrivez les modifications que vous souhaitez apporter à votre exercice. Soyez aussi précis que possible.
          </p>
          <Textarea
            value={modificationInstructions}
            onChange={(e) => setModificationInstructions(e.target.value)}
            placeholder="Exemple : Ajouter une question supplémentaire, simplifier la difficulté de l'exercice 2, ajouter des indices pour chaque question..."
            className="min-h-[150px] mb-4"
          />
          <Button
            onClick={handleModifySubmit}
            disabled={!modificationInstructions.trim() || isModifying}
            className="w-full bg-gradient-to-r from-indigo-500 to-violet-500 hover:from-indigo-600 hover:to-violet-600 text-white font-medium py-2 px-4 rounded-lg transition-all duration-200 flex items-center justify-center gap-2"
          >
            <RefreshCw className={`w-5 h-5 ${isModifying ? 'animate-spin' : ''}`} />
            Appliquer les modifications
          </Button>
        </div>
      )}
    </div>
  );
}
