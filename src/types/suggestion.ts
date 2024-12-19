export interface Suggestion {
  id: string;
  title: string;
  description: string;
  votes: number;
  status: 'créé' | 'complété';
  author: string;
  date: string;
}