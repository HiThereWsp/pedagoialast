import { useState, useEffect } from "react";
interface AnimatedTextProps {
  phrases: string[];
  typingSpeed?: number;
  deletingSpeed?: number;
  delayBetweenPhrases?: number;
  className?: string;
}
export function AnimatedText({
  phrases,
  typingSpeed = 100,
  deletingSpeed = 50,
  delayBetweenPhrases = 2000,
  className = ""
}: AnimatedTextProps) {
  const [currentPhraseIndex, setCurrentPhraseIndex] = useState(0);
  const [currentText, setCurrentText] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const [isWaiting, setIsWaiting] = useState(false);
  useEffect(() => {
    const timeout = setTimeout(() => {
      // If waiting, do nothing until wait time is over
      if (isWaiting) {
        setIsWaiting(false);
        setIsDeleting(true);
        return;
      }

      // Current phrase we're working with
      const currentPhrase = phrases[currentPhraseIndex];

      // Typing
      if (!isDeleting) {
        setCurrentText(currentPhrase.substring(0, currentText.length + 1));

        // If we've completed typing the phrase
        if (currentText.length === currentPhrase.length) {
          setIsWaiting(true);
        }
      }
      // Deleting
      else {
        setCurrentText(currentPhrase.substring(0, currentText.length - 1));

        // If we've deleted the entire phrase
        if (currentText.length === 0) {
          setIsDeleting(false);
          setCurrentPhraseIndex(prevIndex => (prevIndex + 1) % phrases.length);
        }
      }
    }, isWaiting ? delayBetweenPhrases : isDeleting ? deletingSpeed : typingSpeed);
    return () => clearTimeout(timeout);
  }, [currentText, isDeleting, isWaiting, currentPhraseIndex, phrases, typingSpeed, deletingSpeed, delayBetweenPhrases]);
  return <div className={className}>
      <span className="inline-block text-xl">{currentText}</span>
      <span className="inline-block animate-blink ml-1">|</span>
    </div>;
}