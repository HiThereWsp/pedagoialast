import React, { useState } from "react";
import { DashboardWrapper } from "@/components/dashboard/DashboardWrapper";
import { Helmet } from "react-helmet-async";
import { MusicLessonForm } from "@/components/music-lessons/MusicLessonForm";
import { MusicLessonParams, musicLessonsService } from "@/services/music-lessons";
import { useToast } from "@/hooks/use-toast";
import { Steps, Step } from "@/components/ui/steps";
import { Textarea } from "@/components/ui/textarea";

const MusicLessonPage: React.FC = () => {
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState(0);
  const [isGenerating, setIsGenerating] = useState(false);
  const [editedLyrics, setEditedLyrics] = useState<string>("");
  const [formData, setFormData] = useState<MusicLessonParams | null>(null);
  
  const handleGenerateParoles = async (params: MusicLessonParams) => {
    setFormData(params);
    setIsGenerating(true);
    try {
      const result = await musicLessonsService.generate(params);
      
      // Formatage des paroles avec espacement amélioré pour la lisibilité
      const formattedLyrics = result.lyrics
        .replace(/Titre:/g, '\nTitre:')
        .replace(/Refrain:/g, '\n\nRefrain:\n')
        .replace(/Couplet \d+:/g, (match) => `\n\n${match}\n`)
        .trim();
      
      setEditedLyrics(formattedLyrics);
      toast({
        description: "Paroles générées avec succès!",
      });
      setCurrentStep(1);
    } catch (error) {
      console.error("Erreur lors de la génération:", error);
      toast({
        variant: "destructive",
        description: "Une erreur est survenue lors de la génération des paroles",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSaveLesson = async () => {
    try {
      if (!formData) {
        throw new Error("Données de formulaire manquantes");
      }

      // Déterminer si on a un texte source
      const hasSourceText = formData.fromText && formData.fromText.trim().length > 0;
      
      // Nouveau format de titre plus cohérent
      const title = hasSourceText
        ? `Chanson pédagogique - ${formData.subject} (texte source)`
        : `Chanson pédagogique - ${formData.subject}`;

      await musicLessonsService.save({
        title: title,
        content: `Chanson pédagogique pour le niveau ${formData.classLevel} en ${formData.subject}`,
        lyrics: editedLyrics,
        subject: formData.subject,
        class_level: formData.classLevel,
        // Le champ genre musical n'est plus utilisé
      });
      
      toast({
        description: "Chanson sauvegardée avec succès!",
      });
    } catch (error) {
      console.error("Erreur lors de la sauvegarde:", error);
      toast({
        variant: "destructive",
        description: "Une erreur est survenue lors de la sauvegarde",
      });
    }
  };

  return (
    <DashboardWrapper>
      <Helmet>
        <title>Générer des chansons pédagogiques | PedagoIA</title>
        <meta name="description" content="Créez des chansons pédagogiques pour faciliter l'apprentissage" />
      </Helmet>

      <div className="container mx-auto py-8 px-4 max-w-3xl">
        <Steps currentStep={currentStep} className="mb-8">
          <Step title="Formulaire" description="Informations de base" />
          <Step title="Résultat" description="Chanson générée" />
        </Steps>

        {currentStep === 0 && (
          <MusicLessonForm 
            onGenerate={handleGenerateParoles}
            isGenerating={isGenerating}
          />
        )}
        
        {currentStep === 1 && (
          <div className="space-y-6">
            <h2 className="text-3xl font-bold mb-4 text-center">Votre chanson pédagogique est prête !</h2>
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="mb-4">
                <h3 className="text-xl font-medium">Paroles de la chanson</h3>
              </div>
              
              <Textarea
                value={editedLyrics}
                onChange={(e) => setEditedLyrics(e.target.value)}
                className="w-full min-h-[400px] p-6 font-sans text-lg bg-gray-50 border border-gray-200 rounded-lg focus:border-purple-300 focus:ring focus:ring-purple-200 focus:ring-opacity-50 leading-relaxed"
                placeholder="Les paroles de votre chanson apparaîtront ici..."
                style={{
                  whiteSpace: 'pre-wrap',
                  fontFamily: 'system-ui, -apple-system, sans-serif',
                  letterSpacing: '0.01em',
                  lineHeight: '1.6'
                }}
              />
              <p className="text-sm text-gray-500 mt-2">
                Vous pouvez modifier les paroles selon vos besoins.
              </p>
              
              <div className="flex justify-between mt-6">
                <button 
                  className="px-4 py-2 rounded-md bg-gray-200 hover:bg-gray-300"
                  onClick={() => setCurrentStep(0)}
                >
                  Modifier les paramètres
                </button>
                
                <button 
                  className="px-6 py-2 rounded-md bg-gradient-to-r from-[#F47C7C] to-[#AC7AB5] text-white"
                  onClick={handleSaveLesson}
                >
                  Sauvegarder
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardWrapper>
  );
};

export default MusicLessonPage; 