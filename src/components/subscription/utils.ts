
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { Star, Sparkles, Clock } from "lucide-react";

// Function to format expiration date
export function formatExpiryDate(dateStr: string) {
  if (!dateStr) return 'Date inconnue';
  
  try {
    const date = new Date(dateStr);
    return format(date, 'PPP', { locale: fr });
  } catch (e) {
    console.error('Date format error:', e);
    return dateStr;
  }
}

// Function to get display information based on subscription type
export function getSubscriptionInfo(type: string | null) {
  switch (type) {
    case 'beta':
      return {
        title: 'Accès Beta',
        description: 'Vous bénéficiez d\'un accès privilégié à toutes les fonctionnalités en tant que testeur beta. Merci de votre participation au programme beta !',
        icon: Star ? <Star className="h-4 w-4 mr-2 text-yellow-500" /> : null,
        titleStyle: 'underline decoration-dashed underline-offset-4 decoration-yellow-400',
        badgeVariant: 'secondary' as const,
        badgeText: 'Bêta',
        badgeStyle: 'bg-yellow-100 text-yellow-800 hover:bg-yellow-100 font-medium rotate-1 self-start',
        showManageButton: false
      };
    
    case 'trial':
      return {
        title: 'Période d\'Essai',
        description: 'Vous profitez actuellement d\'une période d\'essai avec accès à toutes les fonctionnalités premium. Découvrez tous les avantages avant de choisir un abonnement.',
        icon: Clock ? <Clock className="h-4 w-4 mr-2 text-blue-500" /> : null,
        titleStyle: '',
        badgeVariant: 'default' as const,
        badgeText: 'Essai',
        badgeStyle: 'bg-blue-100 text-blue-800 hover:bg-blue-100',
        showManageButton: true
      };
    
    case 'paid':
    case 'monthly':
    case 'yearly':
      return {
        title: type === 'yearly' ? 'Abonnement Annuel' : 'Abonnement Mensuel',
        description: 'Vous bénéficiez d\'un accès complet à toutes les fonctionnalités premium de PedagoIA. Merci pour votre soutien !',
        icon: Sparkles ? <Sparkles className="h-4 w-4 mr-2 text-green-500" /> : null,
        titleStyle: '',
        badgeVariant: 'default' as const,
        badgeText: 'Premium',
        badgeStyle: 'bg-green-100 text-green-800 hover:bg-green-100',
        showManageButton: true
      };
    
    case 'dev_mode':
      return {
        title: 'Mode Développement',
        description: 'Vous êtes en mode développement avec un accès complet à toutes les fonctionnalités.',
        icon: null,
        titleStyle: '',
        badgeVariant: 'outline' as const,
        badgeText: 'Dev',
        badgeStyle: '',
        showManageButton: false
      };
    
    default:
      return {
        title: 'Abonnement Actif',
        description: 'Vous avez accès à toutes les fonctionnalités de PedagoIA.',
        icon: null,
        titleStyle: '',
        badgeVariant: 'default' as const,
        badgeText: 'Actif',
        badgeStyle: 'bg-green-100 text-green-800 hover:bg-green-100',
        showManageButton: true
      };
  }
}
