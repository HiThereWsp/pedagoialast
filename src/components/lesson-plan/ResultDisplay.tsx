
import React, { useState, useEffect, useRef } from 'react';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useNavigate } from 'react-router-dom';

interface ResultDisplayProps {
  lessonPlan: string;
  lessonPlanId?: string;
  subject?: string;
  classLevel?: string;
}

export function ResultDisplay({ lessonPlan, lessonPlanId, subject, classLevel }: ResultDisplayProps) {
  const navigate = useNavigate();
  const [displayedContent, setDisplayedContent] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleGenerateExercise = () => {
    navigate('/exercise', { 
      state: { 
        lessonPlanId,
        lessonPlanContent: lessonPlan,
        subject,
        classLevel
      } 
    });
  };

  const typeContent = (content: string, index = 0) => {
    if (index <= content.length) {
      setDisplayedContent(content.slice(0, index));
      timeoutRef.current = setTimeout(() => {
        typeContent(content, index + 3); // Augmente de 3 caractères à la fois pour une vitesse optimale
      }, 1); // Délai minimal entre chaque ajout de caractères
    } else {
      setIsTyping(false);
    }
  };

  useEffect(() => {
    if (lessonPlan) {
      setIsTyping(true);
      setDisplayedContent("");
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      typeContent(lessonPlan);
    }

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [lessonPlan]);

  const formatContent = (content: string) => {
    const formattedContent = content
      .replace(/#{3,4}\s/g, '')
      .replace(/\*\*/g, '')
      .split('\n')
      .map(line => {
        if (line.includes('Séquence pédagogique')) {
          return `<h1 class="text-2xl font-bold mb-6">${line}</h1>`;
        }
        if (line.match(/^\d+\./)) {
          return `<h2 class="text-xl font-bold mt-8 mb-4">${line}</h2>`;
        }
        if (line.match(/^Phase \d+:/)) {
          return `<h3 class="text-lg font-bold mt-6 mb-3 text-black">${line}</h3>`;
        }
        if (line.match(/^Séance \d+/)) {
          return `<h4 class="font-bold mt-4 mb-2 text-black">${line}</h4>`;
        }
        if (line.trim().startsWith('-')) {
          return `<p class="ml-4 my-1 text-black">${line}</p>`;
        }
        return line ? `<p class="my-2 text-black">${line}</p>` : '<br/>';
      })
      .join('\n');

    return formattedContent;
  };

  return (
    <div className="space-y-4">
      <Card className={`p-6 relative ${isTyping ? 'animate-pulse-subtle' : ''}`}>
        <div className="prose prose-headings:text-black prose-p:text-black max-w-none">
          <div 
            dangerouslySetInnerHTML={{ __html: formatContent(displayedContent) }}
            className="space-y-2 text-black selection:bg-blue-100"
          />
        </div>
        {isTyping && (
          <div className="absolute bottom-4 right-4">
            <div className="flex items-center gap-2">
              <div className="text-sm text-gray-500">Génération en cours</div>
              <div className="flex space-x-1">
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
              </div>
            </div>
          </div>
        )}
      </Card>
      
      {lessonPlan && !isTyping && (
        <div className="flex justify-end space-x-4">
          <Button
            onClick={handleGenerateExercise}
            className="bg-gradient-to-r from-[#F97316] via-[#D946EF] to-pink-500 text-white"
          >
            Générer un exercice à partir de cette séquence
          </Button>
        </div>
      )}
    </div>
  );
}
