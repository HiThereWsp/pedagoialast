
import { 
  CreditCard, 
  Sparkles, 
  Medal,
  BadgeCheck, 
  BugOff, 
  Crown,
  Calendar 
} from "lucide-react";

export const getSubscriptionInfo = (type: string | null) => {
  switch (type) {
    case 'paid':
      return {
        title: 'Abonnement Premium',
        description: 'Vous avez accès à toutes les fonctionnalités premium.',
        icon: <Crown className="h-8 w-8 text-yellow-500" />,
        color: 'bg-gradient-to-br from-yellow-400 to-yellow-600',
        textClass: 'text-yellow-600'
      };
    case 'trial':
      return {
        title: 'Période d\'essai',
        description: 'Vous bénéficiez actuellement d\'une période d\'essai.',
        icon: <Sparkles className="h-8 w-8 text-purple-500" />,
        color: 'bg-gradient-to-br from-purple-400 to-purple-600',
        textClass: 'text-purple-600'
      };
    case 'trial_long':
      return {
        title: 'Essai 200 jours',
        description: 'Vous bénéficiez d\'une période d\'essai étendue de 200 jours.',
        icon: <Calendar className="h-8 w-8 text-indigo-500" />,
        color: 'bg-gradient-to-br from-indigo-400 to-indigo-600',
        textClass: 'text-indigo-600'
      };
    case 'beta':
      return {
        title: 'Accès Beta',
        description: 'En tant que testeur beta, vous avez accès à toutes les fonctionnalités.',
        icon: <BugOff className="h-8 w-8 text-green-500" />,
        color: 'bg-gradient-to-br from-green-400 to-green-600',
        textClass: 'text-green-600'
      };
    case 'ambassador':
      return {
        title: 'Ambassadeur Pedagogia',
        description: 'En tant qu\'ambassadeur, vous avez accès gratuit à toutes les fonctionnalités premium.',
        icon: <Medal className="h-8 w-8 text-blue-500" />,
        color: 'bg-gradient-to-br from-blue-400 to-blue-600',
        textClass: 'text-blue-600'
      };
    case 'dev_mode':
      return {
        title: 'Mode Développement',
        description: 'Accès spécial pour les développeurs.',
        icon: <BadgeCheck className="h-8 w-8 text-indigo-500" />,
        color: 'bg-gradient-to-br from-indigo-400 to-indigo-600',
        textClass: 'text-indigo-600'
      };
    default:
      return {
        title: 'Statut Inconnu',
        description: 'Votre type d\'abonnement n\'est pas reconnu.',
        icon: <CreditCard className="h-8 w-8 text-gray-500" />,
        color: 'bg-gradient-to-br from-gray-400 to-gray-600',
        textClass: 'text-gray-600'
      };
  }
};
