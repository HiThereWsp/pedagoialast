
export interface ImageStyle {
  id: string;
  name: string;
  example: string;
}

export interface GenerationPrompt {
  prompt: string;
  style?: string;
  user_prompt?: string;
  context?: string;
}
