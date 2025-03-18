
import { 
  CreditCard, 
  Sparkles, 
  Medal,
  BadgeCheck, 
  BugOff, 
  Crown 
} from "lucide-react";

/**
 * Formats an expiry date from ISO string to a readable French date format
 */
export const formatExpiryDate = (dateString: string): string => {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('fr-FR', { 
    day: 'numeric', 
    month: 'long', 
    year: 'numeric' 
  }).format(date);
};

/**
 * Returns detailed display information for a subscription type
 */
export const getSubscriptionInfo = (type: string | null) => {
  switch (type) {
    case 'paid':
      return {
        title: 'Abonnement Premium',
        description: 'Vous avez accès à toutes les fonctionnalités premium.',
        icon: <Crown className="h-8 w-8 mr-2 text-yellow-500" />,
        titleStyle: "text-yellow-600 font-bold",
        badgeVariant: "default" as const,
        badgeText: "Premium",
        badgeStyle: "bg-yellow-500 hover:bg-yellow-600",
        showManageButton: true
      };
    case 'trial':
      return {
        title: 'Période d\'essai',
        description: 'Vous bénéficiez actuellement d\'une période d\'essai.',
        icon: <Sparkles className="h-8 w-8 mr-2 text-purple-500" />,
        titleStyle: "text-purple-600 font-bold",
        badgeVariant: "secondary" as const,
        badgeText: "Essai",
        badgeStyle: "bg-purple-100 text-purple-800 hover:bg-purple-200",
        showManageButton: true
      };
    case 'beta':
      return {
        title: 'Accès Beta',
        description: 'En tant que testeur beta, vous avez accès à toutes les fonctionnalités.',
        icon: <BugOff className="h-8 w-8 mr-2 text-green-500" />,
        titleStyle: "text-green-600 font-bold",
        badgeVariant: "outline" as const,
        badgeText: "Beta",
        badgeStyle: "border-green-500 text-green-600",
        showManageButton: false
      };
    case 'ambassador':
      return {
        title: 'Ambassadeur Pedagogia',
        description: 'En tant qu\'ambassadeur, vous avez accès gratuit à toutes les fonctionnalités premium.',
        icon: <Medal className="h-8 w-8 mr-2 text-blue-500" />,
        titleStyle: "text-blue-600 font-bold",
        badgeVariant: "default" as const,
        badgeText: "Ambassadeur",
        badgeStyle: "bg-blue-500 hover:bg-blue-600",
        showManageButton: false
      };
    case 'dev_mode':
      return {
        title: 'Mode Développement',
        description: 'Accès spécial pour les développeurs.',
        icon: <BadgeCheck className="h-8 w-8 mr-2 text-indigo-500" />,
        titleStyle: "text-indigo-600 font-bold",
        badgeVariant: "outline" as const,
        badgeText: "Dev",
        badgeStyle: "border-indigo-500 text-indigo-600",
        showManageButton: false
      };
    default:
      return {
        title: 'Statut Inconnu',
        description: 'Votre type d\'abonnement n\'est pas reconnu.',
        icon: <CreditCard className="h-8 w-8 mr-2 text-gray-500" />,
        titleStyle: "text-gray-600 font-bold",
        badgeVariant: "outline" as const,
        badgeText: "Inconnu",
        badgeStyle: "border-gray-300 text-gray-600",
        showManageButton: true
      };
  }
};
