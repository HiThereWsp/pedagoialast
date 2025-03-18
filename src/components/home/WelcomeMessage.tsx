
import React from 'react';
import { Link } from 'react-router-dom';

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
      
      {/* Nouveau lien vers le guide */}
      <p className="text-sm text-gray-500">
        <Link to="/guide" className="text-purple-600 hover:text-purple-800 underline">
          Découvrez notre guide complet pour maîtriser PedagoIA
        </Link>
      </p>
    </div>
  );
};
