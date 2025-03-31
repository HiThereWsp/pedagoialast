
import { CreateTypes } from 'canvas-confetti';

declare global {
  interface Window {
    confetti: CreateTypes;
  }
}
