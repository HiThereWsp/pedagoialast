export type ImageStyle = 'auto' | 'sketch' | 'realistic' | '3d' | 'anime';

export interface GenerationPrompt {
  context: string;
  user_prompt: string;
  style: ImageStyle;
}

export interface StyleOption {
  value: ImageStyle;
  label: string;
  description: string;
  icon: React.ComponentType;
}