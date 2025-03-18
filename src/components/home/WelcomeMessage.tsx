
import React from 'react';

interface WelcomeMessageProps {
  firstName: string;
}

export const WelcomeMessage = ({ firstName }: WelcomeMessageProps) => {
  return (
    <div className="text-center mb-10 pt-12">
      <h1 className="text-5xl font-extrabold mb-4 text-gray-800 leading-tight tracking-tight">
        Bonjour {firstName || "Enseignant"} 👋
      </h1>
      <p className="text-xl text-gray-600 mb-4">Que souhaitez-vous faire aujourd'hui ?</p>
      
      {/* Le lien vers le guide a été temporairement supprimé */}
    </div>
  );
};
