import React, { useState, useEffect, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter,
  DialogClose 
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  ArrowRight, 
  Edit3, 
  Loader, 
  Save 
} from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
// import { createClient } from '@supabase/supabase-js'; // Supprimé car nous importons le client configuré

// Importer le client Supabase configuré centralement
import { supabase } from '@/integrations/supabase/client'; 

// Définition des étapes du processus
enum STEPS {
  INPUT_URL = 0,
  CONFIGURE = 1,
  RESULT = 2
}

export function YouTubeLessonGenerator() {
  // États pour la gestion de l'URL et l'ID vidéo YouTube
  const [videoUrl, setVideoUrl] = useState<string>("");
  const [videoId, setVideoId] = useState<string | null>(null);
  
  // États pour la configuration de la leçon
  const [contentType, setContentType] = useState<string>("Séquence");
  const [otherContentType, setOtherContentType] = useState<string>("");
  const [classLevel, setClassLevel] = useState<string>("");
  const [subject, setSubject] = useState<string>("");
  const [learningObjective, setLearningObjective] = useState<string>("");
  const [additionalInstructions, setAdditionalInstructions] = useState<string>("");
  
  // États pour la génération et la sauvegarde
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [resourceContent, setResourceContent] = useState<string>("");
  const [resourceTitle, setResourceTitle] = useState<string>("");
  const [savedResourceId, setSavedResourceId] = useState<string | null>(null);
  
  // État pour le suivi des étapes
  const [step, setStep] = useState<STEPS>(STEPS.INPUT_URL);
  
  // État pour la modal de sauvegarde
  const [showSaveModal, setShowSaveModal] = useState<boolean>(false);
  
  // Référence pour le scrolling
  const resultRef = useRef<HTMLDivElement>(null);
  
  // Liste des types de contenu disponibles
  const contentTypes = ["Séquence", "Questionnaire à trous", "QCM", "Fiche de synthèse", "Autre"];

  const { toast } = useToast();

  // Fonction pour extraire l'ID vidéo de l'URL YouTube
  const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const url = e.target.value;
    setVideoUrl(url);
    
    // Logique d'extraction de l'ID vidéo
    const regExp = /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#&?]*).*/;
    const match = url.match(regExp);
    const id = (match && match[7].length === 11) ? match[7] : null;
    
    setVideoId(id);
  };
  
  // Fonction pour valider l'URL et passer à l'étape suivante
  const handleUrlValidation = () => {
    if (videoId) {
      setStep(STEPS.CONFIGURE);
    }
  };
  
  const handleResourceContentChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    setResourceContent(event.target.value);
  };

  const handleGenerate = async () => {
    if (!videoId || !learningObjective.trim() || !classLevel.trim() || !subject.trim()) return;
    
    // Vérification pour le type de contenu "Autre"
    if (contentType === "Autre" && !otherContentType.trim()) return;
    
    setIsLoading(true);
    setResourceContent(""); // Réinitialiser le contenu précédent
    
    const selectedResourceType = contentType === "Autre" ? otherContentType : contentType;

    // Récupérer la session Supabase pour le token JWT
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();

    if (sessionError) {
      setIsLoading(false);
      setResourceContent(`Erreur lors de la récupération de la session: ${sessionError.message}`);
      setStep(STEPS.RESULT);
      console.error("Erreur Supabase Auth getSession:", sessionError);
      return;
    }

    if (!session?.access_token) {
      setIsLoading(false);
      setResourceContent("Erreur: Utilisateur non authentifié ou session expirée. Veuillez vous reconnecter.");
      setStep(STEPS.RESULT);
      console.error("Erreur d'authentification: Token d'accès Supabase manquant.");
      return;
    }

    try {
      const response = await fetch(
        'https://jpelncawdaounkidvymu.supabase.co/functions/v1/youtube-lesson',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session.access_token}`,
          },
          body: JSON.stringify({
            videoId: videoId,
            resourceType: selectedResourceType,
            classLevel: classLevel,
            subject: subject,
            learningObjective: learningObjective,
            additionalInstructions: additionalInstructions,
          }),
        }
      );

      setIsLoading(false);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Erreur HTTP: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.resource) {
        setResourceContent(data.resource);
        setSavedResourceId(null);
        setStep(STEPS.RESULT);
      } else {
        throw new Error("La réponse de l'API ne contient pas de ressource.");
      }

    } catch (error) {
      setIsLoading(false);
      // Afficher l'erreur à l'utilisateur de manière plus visible si nécessaire
      console.error("Erreur lors de la génération de la ressource:", error);
      setResourceContent(`Désolé, une erreur est survenue lors de la génération de la ressource: ${error.message}`);
      setStep(STEPS.RESULT); // Afficher l'erreur dans la section résultat
    }
  };
  
  const handleSave = async () => {
    if (!resourceContent || !resourceTitle) {
      toast({
        variant: "destructive",
        title: "Champs manquants",
        description: "Veuillez vérifier le titre et le contenu de la ressource.",
      });
      return;
    }

    setIsSaving(true);

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      toast({
        variant: "destructive",
        title: "Non authentifié",
        description: "Veuillez vous connecter pour sauvegarder la ressource.",
      });
      setIsSaving(false);
      return;
    }

    const resourceToSave = {
      user_id: user.id,
      title: resourceTitle,
      generated_lesson: resourceContent,
      video_url: videoUrl,
      class_level: classLevel,
      subject: subject,
      objective: learningObjective,
      resource_type: contentType === "Autre" ? otherContentType : contentType,
      additional_instructions: additionalInstructions,
    };

    try {
      let savedData;
      if (savedResourceId) {
        const { data, error } = await supabase
          .from('youtube_lessons')
          .update(resourceToSave)
          .eq('id', savedResourceId)
          .eq('user_id', user.id)
          .select()
          .single();
        if (error) throw error;
        savedData = data;
        toast({ title: "Succès", description: "Ressource mise à jour avec succès !" });
      } else {
        const { data, error } = await supabase
          .from('youtube_lessons')
          .insert(resourceToSave)
          .select()
          .single();
        if (error) throw error;
        savedData = data;
        setSavedResourceId(savedData.id);
        toast({ title: "Succès", description: "Ressource sauvegardée avec succès !" });
      }
      setShowSaveModal(false);
    } catch (error: any) {
      console.error("Erreur lors de la sauvegarde:", error);
      toast({
        variant: "destructive",
        title: "Erreur de sauvegarde",
        description: error.message || "Une erreur est survenue.",
      });
    } finally {
      setIsSaving(false);
    }
  };
  
  // Effet pour extraire automatiquement un titre du contenu généré
  useEffect(() => {
    if (step === STEPS.RESULT && resourceContent && !resourceTitle) {
      const match = resourceContent.match(/^#*\s*(.+)$/m);
      if (match) setResourceTitle(match[1]);
    }
  }, [step, resourceContent, resourceTitle]);

  return (
    <>
      {/* Step 1: Input URL */}
      <Card className={`mb-8 ${step !== STEPS.INPUT_URL ? 'opacity-50' : ''}`}>
        <CardHeader>
          <CardTitle>Collez le lien de la vidéo YouTube</CardTitle>
        </CardHeader>
        <CardContent>
          {/* Aperçu vidéo minimaliste toujours visible */}
          <div className="mb-4 aspect-video rounded-lg overflow-hidden border bg-gray-50 flex items-center justify-center">
            {videoId ? (
              <iframe
                key={videoId}
                width="100%"
                height="100%"
                src={`https://www.youtube.com/embed/${videoId}`}
                title="YouTube video player"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
              ></iframe>
            ) : (
              <span className="text-gray-400">Aperçu vidéo</span>
            )}
          </div>
          {/* Champ de saisie URL */}
          <div className="flex items-center space-x-2">
            <Input
              id="video-url"
              placeholder="https://www.youtube.com/watch?v=..."
              value={videoUrl}
              onChange={handleUrlChange}
              disabled={step !== STEPS.INPUT_URL}
            />
            <Button onClick={handleUrlValidation} disabled={!videoId || step !== STEPS.INPUT_URL}>
              Valider <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Step 2: Configure */}
      {step >= STEPS.CONFIGURE && (
        <Card className={`mb-8 ${step !== STEPS.CONFIGURE ? 'opacity-50' : ''}`}>
          <CardHeader>
            <CardTitle>Type de ressources à générer</CardTitle>
          </CardHeader>
          <CardContent>
            {/* Content type selection cards */}
            <div className="grid grid-cols-2 gap-4 mb-6">
              {contentTypes.map(type => (
                <Button
                  key={type}
                  variant={contentType === type ? 'default' : 'outline'}
                  onClick={() => setContentType(type)}
                  disabled={step !== STEPS.CONFIGURE}
                  className={`justify-center h-20 text-lg font-semibold ${contentType === type ? 'ring-2 ring-primary' : ''}`}
                >
                  {type}
                </Button>
              ))}
            </div>
            
            {/* Champ de texte pour "Autre" */}
            {contentType === "Autre" && (
              <div className="mb-6">
                <Label htmlFor="other-content-type" className="font-semibold">Précisez le type de ressource <span className="text-red-500">*</span></Label>
                <Input
                  id="other-content-type"
                  placeholder="Ex: Exercice d'application..."
                  value={otherContentType}
                  onChange={e => setOtherContentType(e.target.value)}
                  disabled={step !== STEPS.CONFIGURE}
                  required
                  className="mt-1"
                />
              </div>
            )}
            
            {/* Champs côte à côte */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="class-level" className="font-semibold">Niveau de classe <span className="text-red-500">*</span></Label>
                <Input
                  id="class-level"
                  placeholder="Ex: CM1, Seconde..."
                  value={classLevel}
                  onChange={e => setClassLevel(e.target.value)}
                  disabled={step !== STEPS.CONFIGURE}
                  required
                />
              </div>
              <div>
                <Label htmlFor="subject" className="font-semibold">Matière <span className="text-red-500">*</span></Label>
                <Input
                  id="subject"
                  placeholder="Ex: Mathématiques"
                  value={subject}
                  onChange={e => setSubject(e.target.value)}
                  disabled={step !== STEPS.CONFIGURE}
                  required
                />
              </div>
            </div>
            <div className="space-y-4 mt-4">
              <div>
                <Label htmlFor="learning-objective" className="font-semibold">Objectif d'apprentissage <span className="text-red-500">*</span></Label>
                <Input
                  id="learning-objective"
                  placeholder="Ex: Comprendre la photosynthèse"
                  value={learningObjective}
                  onChange={e => setLearningObjective(e.target.value)}
                  disabled={step !== STEPS.CONFIGURE}
                  required
                />
              </div>
              <div>
                <Label htmlFor="additional-instructions" className="font-semibold">Instructions complémentaires (optionnel)</Label>
                <Textarea
                  id="additional-instructions"
                  placeholder="Ex: Ton de voix, points spécifiques à aborder..."
                  value={additionalInstructions}
                  onChange={e => setAdditionalInstructions(e.target.value)}
                  className="mt-1"
                  rows={3}
                  disabled={step !== STEPS.CONFIGURE}
                />
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex justify-end">
            <Button
              onClick={handleGenerate}
              disabled={
                isLoading || 
                step !== STEPS.CONFIGURE || 
                !learningObjective.trim() || 
                !classLevel.trim() || 
                !subject.trim() || 
                (contentType === "Autre" && !otherContentType.trim())
              }
            >
              {isLoading ? <Loader className="w-4 h-4 mr-2 animate-spin" /> : null}
              Générer la ressource <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </CardFooter>
        </Card>
      )}

      {/* Step 3: Result */}
      {step === STEPS.RESULT && resourceContent && videoId && (
        <div ref={resultRef}>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Votre ressource générée</CardTitle>
              <div className="flex space-x-2">
                {/* Le bouton Modifier ne change plus l'étape, l'édition est directe */}
                {/* <Button variant="outline" onClick={() => setStep(STEPS.CONFIGURE)}><Edit3 className="w-4 h-4 mr-2"/> Modifier</Button> */}
              </div>
            </CardHeader>
            <CardContent className="grid md:grid-cols-2 gap-6">
              {/* Vidéo à gauche */}
              <div className="space-y-4">
                <div className="aspect-video rounded-lg overflow-hidden border">
                  <iframe
                    key={`result-${videoId}`}
                    width="100%"
                    height="100%"
                    src={`https://www.youtube.com/embed/${videoId}`}
                    title="YouTube video player"
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    allowFullScreen
                  ></iframe>
                </div>
              </div>
              {/* Ressource éditable à droite */}
              <div className="border rounded-md p-1">
                <ScrollArea className="h-[600px] w-full p-3">
                  <Textarea
                    className="prose prose-sm max-w-none outline-none w-full h-full min-h-[580px] border-0 focus:ring-0 p-0 m-0"
                    value={resourceContent}
                    onChange={handleResourceContentChange}
                    placeholder="Votre ressource générée apparaîtra ici..."
                  />
                </ScrollArea>
              </div>
            </CardContent>
            <CardFooter className="flex justify-end">
              <Button onClick={() => setShowSaveModal(true)}>
                <Save className="w-4 h-4 mr-2" /> Sauvegarder
              </Button>
            </CardFooter>
          </Card>
        </div>
      )}

      {/* Modale de sauvegarde */}
      <Dialog open={showSaveModal} onOpenChange={setShowSaveModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Sauvegarder la ressource</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div>
              <Label htmlFor="resource-title-modal">Titre de la ressource</Label>
              <Input
                id="resource-title-modal"
                value={resourceTitle}
                onChange={e => setResourceTitle(e.target.value)}
                className="mt-1"
              />
            </div>
            <div>
              <Label>Aperçu de la ressource (premières lignes)</Label>
              <ScrollArea className="h-24 mt-1 p-3 border rounded-md bg-muted/10 text-xs">
                <ReactMarkdown className="prose prose-sm max-w-none">
                  {resourceContent?.substring(0, 300) + (resourceContent && resourceContent.length > 300 ? "..." : "")}
                </ReactMarkdown>
              </ScrollArea>
            </div>
          </div>
          <DialogFooter className="flex justify-end space-x-2 pt-4">
            <DialogClose asChild>
              <Button variant="ghost">Annuler</Button>
            </DialogClose>
            <Button onClick={handleSave} disabled={isSaving}>
              {isSaving ? <Loader className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
              {savedResourceId ? "Mettre à jour" : "Sauvegarder"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

export default YouTubeLessonGenerator; 