
import type { FC } from "react";

interface WelcomeMessageProps {
  firstName: string;
}

export const WelcomeMessage: FC<WelcomeMessageProps> = ({
  firstName
}) => {
  return (
    <div className="text-center mb-12">
      <h1 className="text-5xl sm:text-6xl font-extrabold mb-6 flex items-center justify-center gap-2 leading-tight tracking-tight text-balance">
        Bonjour {firstName} 
        <span role="img" aria-label="wave" className="animate-bounce">👋</span>
      </h1>
      <p className="text-xl text-gray-600 flex items-center justify-center px-4 sm:px-0">
        Bienvenue sur votre tableau de bord
      </p>
    </div>
  );
};
