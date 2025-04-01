import { FileSpreadsheet, CalendarDays, Image, Music, MessageSquare } from 'lucide-react';

export const actions = [
  {
    title: 'Générateur d\'exercices',
    description: 'Créez des exercices et des supports pour vos élèves',
    route: '/exercise',
    icon: FileSpreadsheet,
    isNew: false,
    isUtilityAction: false,
    maintenanceLabel: null,
  },
  {
    title: 'Plans de cours',
    description: 'Créez des séquences et des plans de cours détaillés',
    route: '/lesson-plan',
    icon: CalendarDays,
    isNew: false,
    isUtilityAction: false,
    maintenanceLabel: null,
  },
  {
    title: 'Générateur d\'images',
    description: 'Créez des images pédagogiques pour vos cours',
    route: '/image-generation',
    icon: Image,
    isNew: false,
    isUtilityAction: false,
    maintenanceLabel: null,
  },
  {
    title: 'Générateur de chansons',
    description: 'Créez des chansons pédagogiques pour vos élèves',
    route: '/song-generator',
    icon: Music,
    isNew: true,
    isUtilityAction: false,
    maintenanceLabel: null,
  },
  {
    title: 'Générateur de correspondances',
    description: 'Rédigez des courriers et des e-mails professionnels',
    route: '/correspondence',
    icon: MessageSquare,
    isNew: false,
    isUtilityAction: false,
    maintenanceLabel: null,
  },
];
