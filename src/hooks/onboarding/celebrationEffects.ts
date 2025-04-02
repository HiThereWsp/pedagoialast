
import { toast } from "@/hooks/use-toast";

export const showCompletionCelebration = () => {
  // Show celebratory toast for completing all tasks
  toast({
    title: "🎉 Félicitations !",
    description: "Tu as maintenant les clés pour reprendre le controle de ton temps ! 🔑",
    className: "bg-gradient-to-r from-purple-500 to-indigo-500 text-white border-purple-300",
    duration: 5000, // Show for 5 seconds
  });
  
  // Trigger confetti effect when all tasks are completed
  if (typeof window !== 'undefined' && window.confetti) {
    window.confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 }
    });
  }
};
