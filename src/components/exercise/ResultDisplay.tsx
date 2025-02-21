
import React, { useState, useCallback } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, Share2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface ResultDisplayProps {
  exercises: string | null;
}

export function ResultDisplay({ exercises }: ResultDisplayProps) {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('eleve');
  const [isLoading, setIsLoading] = useState(false);

  if (!exercises) return null;

  const tabs = [
    { id: 'eleve', label: 'Fiche Élève' },
    { id: 'correction', label: 'Correction' }
  ];

  const handleShare = async () => {
    try {
      setIsLoading(true);
      await navigator.share({
        title: 'Exercices générés par Pedagoia',
        text: exercises,
      });
      toast({
        description: "Merci d'avoir partagé ces exercices !",
      });
    } catch (err) {
      try {
        await navigator.clipboard.writeText(exercises);
        toast({
          description: "Contenu copié dans le presse-papier",
        });
      } catch (clipErr) {
        toast({
          variant: "destructive",
          description: "Erreur lors de la copie du contenu",
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto p-4">
      {/* Navigation header */}
      <div className="flex justify-between items-center mb-6 px-2">
        <button className="flex items-center text-gray-600 hover:text-gray-800">
          <ArrowLeft className="w-5 h-5 mr-2" />
          Retour
        </button>
        <button 
          onClick={handleShare}
          className="flex items-center text-gray-600 hover:text-gray-800"
        >
          <Share2 className="w-5 h-5 mr-2" />
          Partager
        </button>
      </div>

      {/* Tabs Navigation */}
      <div className="flex justify-center mb-6">
        <div className="inline-flex rounded-lg border border-gray-200 bg-white">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-8 py-3 text-sm font-medium transition-colors duration-200 
                ${activeTab === tab.id 
                  ? 'bg-orange-50 text-orange-800 border-orange-300 rounded-lg' 
                  : 'text-gray-700 hover:bg-gray-50'}`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Main card with scroll content */}
      <Card className="w-full bg-white shadow-lg">
        <CardContent className="h-[600px] overflow-y-auto p-8">
          {activeTab === 'eleve' ? (
            <>
              <div className="mb-8 text-center">
                <h1 className="text-2xl font-bold mb-6">FICHE ÉLÈVE</h1>
                <div className="w-full border-b border-gray-200 mb-6"></div>
              </div>

              <div className="mb-8">
                <h2 className="text-xl font-semibold mb-4">Titre de la séquence</h2>
                <div className="prose max-w-none">
                  {exercises}
                </div>
              </div>
            </>
          ) : (
            <div className="text-center">
              <h1 className="text-2xl font-bold mb-6">CORRECTION</h1>
              <div className="prose max-w-none">
                {exercises}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
