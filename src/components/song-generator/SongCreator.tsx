
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Music } from 'lucide-react';
import { SongHeader } from './SongHeader';
import { StyleButton } from './StyleButton';
import { toast } from "@/hooks/toast";
import { triggerSuccessConfetti } from "@/utils/confetti";

// Types pour la gestion du formulaire
type SongFormData = {
  title?: string;
  lyrics?: string;
  description?: string;
  style: string;
  classLevel: string;
  additionalInstructions: string;
};

export const SongCreator: React.FC = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'lyrics' | 'description'>('lyrics');
  const [isGenerating, setIsGenerating] = useState(false);
  const [formData, setFormData] = useState<SongFormData>({
    title: '',
    lyrics: '',
    description: '',
    style: 'Pop',
    classLevel: '',
    additionalInstructions: ''
  });

  // Styles musicaux disponibles
  const musicStyles = ['Pop', 'Rock', 'Rap', 'Enfantin', 'Jazz', 'Classique'];

  // Handlers pour les changements de champs
  const handleTextChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleStyleSelect = (style: string) => {
    setFormData(prev => ({ ...prev, style }));
  };

  // Validation du formulaire
  const validateForm = (): boolean => {
    if (activeTab === 'lyrics') {
      if (!formData.title?.trim()) {
        toast({ variant: "destructive", title: "Erreur", description: "Veuillez saisir un titre pour votre chanson" });
        return false;
      }
      if (!formData.lyrics?.trim()) {
        toast({ variant: "destructive", title: "Erreur", description: "Veuillez saisir les paroles de votre chanson" });
        return false;
      }
    } else {
      if (!formData.description?.trim()) {
        toast({ variant: "destructive", title: "Erreur", description: "Veuillez décrire la chanson que vous souhaitez créer" });
        return false;
      }
    }

    if (!formData.classLevel?.trim()) {
      toast({ variant: "destructive", title: "Erreur", description: "Veuillez indiquer le niveau de classe" });
      return false;
    }

    return true;
  };

  // Soumission du formulaire
  const handleGenerate = async () => {
    if (!validateForm()) return;
    
    setIsGenerating(true);
    
    try {
      // Simuler une API pour la génération (à remplacer par votre appel API réel)
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Déclencher l'effet confetti pour célébrer la réussite
      triggerSuccessConfetti();
      
      toast({ 
        variant: "default", // Changé de "success" à "default"
        title: "Succès", 
        description: "Votre chanson a été générée avec succès!"
      });
      
      // Redirection prévue vers la page de résultat (à implémenter)
      // navigate('/song-result');
    } catch (error) {
      toast({ 
        variant: "destructive", 
        title: "Erreur", 
        description: "Une erreur est survenue lors de la génération de la chanson"
      });
    } finally {
      setIsGenerating(false);
    }
  };

  // Handler pour revenir en arrière
  const handleGoBack = () => {
    navigate(-1);
  };

  return (
    <div className="flex flex-col min-h-screen bg-white overflow-y-auto" style={{ 
      backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'100%\' height=\'100%\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cdefs%3E%3Cpattern id=\'grid\' width=\'20\' height=\'20\' patternUnits=\'userSpaceOnUse\'%3E%3Cpath d=\'M 20 0 L 0 0 0 20\' fill=\'none\' stroke=\'%23f0f0f0\' stroke-width=\'0.5\'/%3E%3C/pattern%3E%3C/defs%3E%3Crect width=\'100%\' height=\'100%\' fill=\'url(%23grid)\'/%3E%3C/svg%3E")' 
    }}>
      {/* Header with Logo */}
      <SongHeader onBack={handleGoBack} />

      {/* Title Section */}
      <div className="px-6 py-8 text-center">
        <h1 className="text-5xl font-bold mb-2" style={{ 
          background: 'linear-gradient(90deg, #F8B195 0%, #F67280 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent'
        }}>
          Générateur
        </h1>
        <h2 className="text-4xl font-bold mb-4" style={{ 
          background: 'linear-gradient(90deg, #F67280 0%, #C06C84 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent'
        }}>
          de chansons
        </h2>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Créez des chansons pédagogiques adaptées à votre classe en quelques clics.
        </p>
      </div>

      {/* Main Content Container */}
      <div className="flex-1 max-w-4xl mx-auto w-full px-6 pb-8">
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          {/* Tabs Navigation */}
          <div className="flex mb-6 border-b">
            <button
              className={`py-3 px-6 font-medium relative ${
                activeTab === 'lyrics' 
                  ? 'text-purple-600' 
                  : 'text-gray-500 hover:text-gray-800'
              }`}
              onClick={() => setActiveTab('lyrics')}
            >
              Paroles
              {activeTab === 'lyrics' && (
                <div className="absolute bottom-0 left-0 w-full h-0.5 bg-purple-600"></div>
              )}
            </button>
            <button
              className={`py-3 px-6 font-medium relative ${
                activeTab === 'description' 
                  ? 'text-purple-600' 
                  : 'text-gray-500 hover:text-gray-800'
              }`}
              onClick={() => setActiveTab('description')}
            >
              Description
              {activeTab === 'description' && (
                <div className="absolute bottom-0 left-0 w-full h-0.5 bg-purple-600"></div>
              )}
            </button>
          </div>

          {/* Form Content */}
          {activeTab === 'lyrics' ? (
            <div className="space-y-6">
              <div>
                <label className="block text-gray-700 mb-2 font-medium">
                  Titre <span className="text-red-500">*</span>
                </label>
                <Input 
                  name="title"
                  value={formData.title}
                  onChange={handleTextChange}
                  className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg text-gray-800"
                  placeholder="Par exemple : Les tables de multiplication en chanson"
                />
                <p className="text-xs text-gray-500 mt-1">Donnez un titre explicite à votre chanson</p>
              </div>
              
              <div>
                <label className="block text-gray-700 mb-2 font-medium">
                  Paroles <span className="text-red-500">*</span>
                </label>
                <Textarea 
                  name="lyrics"
                  value={formData.lyrics}
                  onChange={handleTextChange}
                  className="w-full h-48 p-3 bg-gray-50 border border-gray-200 rounded-lg text-gray-800 resize-none"
                  placeholder="Entrez les paroles de votre chanson..."
                />
                <p className="text-xs text-gray-500 mt-1">Saisissez les paroles que vous souhaitez mettre en musique</p>
              </div>
              
              <div>
                <label className="block text-gray-700 mb-2 font-medium">
                  Style musical <span className="text-red-500">*</span>
                </label>
                <div className="flex flex-wrap gap-2">
                  {musicStyles.map((style) => (
                    <StyleButton 
                      key={style}
                      style={style}
                      isActive={formData.style === style}
                      onClick={() => handleStyleSelect(style)}
                    />
                  ))}
                </div>
                <p className="text-xs text-gray-500 mt-1">Sélectionnez un style musical pour votre chanson</p>
              </div>
              
              <div>
                <label className="block text-gray-700 mb-2 font-medium">
                  Niveau de classe <span className="text-red-500">*</span>
                </label>
                <Input 
                  name="classLevel"
                  value={formData.classLevel}
                  onChange={handleTextChange}
                  className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg text-gray-800"
                  placeholder="Par exemple : 6ème, CM2, CE1"
                />
              </div>
              
              <div>
                <label className="block text-gray-700 mb-2 font-medium">
                  Instructions supplémentaires (facultatif)
                </label>
                <Textarea 
                  name="additionalInstructions"
                  value={formData.additionalInstructions}
                  onChange={handleTextChange}
                  className="w-full h-24 p-3 bg-gray-50 border border-gray-200 rounded-lg text-gray-800 resize-none"
                  placeholder="Précisez toutes les exigences supplémentaires pour votre chanson"
                />
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              <div>
                <label className="block text-gray-700 mb-2 font-medium">
                  Description de la chanson <span className="text-red-500">*</span>
                </label>
                <Textarea 
                  name="description"
                  value={formData.description}
                  onChange={handleTextChange}
                  className="w-full h-48 p-3 bg-gray-50 border border-gray-200 rounded-lg text-gray-800 resize-none"
                  placeholder="Décrivez la chanson que vous souhaitez créer..."
                />
                <p className="text-xs text-gray-500 mt-1">Soyez précis dans votre description pour obtenir le meilleur résultat</p>
              </div>
              
              <div>
                <label className="block text-gray-700 mb-2 font-medium">
                  Style musical <span className="text-red-500">*</span>
                </label>
                <div className="flex flex-wrap gap-2">
                  {musicStyles.map((style) => (
                    <StyleButton 
                      key={style}
                      style={style}
                      isActive={formData.style === style}
                      onClick={() => handleStyleSelect(style)}
                    />
                  ))}
                </div>
                <p className="text-xs text-gray-500 mt-1">Sélectionnez un style musical pour votre chanson</p>
              </div>
              
              <div>
                <label className="block text-gray-700 mb-2 font-medium">
                  Niveau de classe <span className="text-red-500">*</span>
                </label>
                <Input 
                  name="classLevel"
                  value={formData.classLevel}
                  onChange={handleTextChange}
                  className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg text-gray-800"
                  placeholder="Par exemple : 6ème, CM2, CE1"
                />
              </div>
              
              <div>
                <label className="block text-gray-700 mb-2 font-medium">
                  Instructions supplémentaires (facultatif)
                </label>
                <Textarea 
                  name="additionalInstructions"
                  value={formData.additionalInstructions}
                  onChange={handleTextChange}
                  className="w-full h-24 p-3 bg-gray-50 border border-gray-200 rounded-lg text-gray-800 resize-none"
                  placeholder="Précisez toutes les exigences supplémentaires pour votre chanson"
                />
              </div>
            </div>
          )}
          
          {/* Action Button */}
          <div className="mt-8">
            <Button
              onClick={handleGenerate}
              disabled={isGenerating}
              className="w-full py-3 px-4 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-medium rounded-lg flex items-center justify-center transition-colors h-12"
            >
              {isGenerating ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                  Génération en cours...
                </>
              ) : (
                <>
                  <Music className="w-5 h-5 mr-2" />
                  Générer la chanson
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

