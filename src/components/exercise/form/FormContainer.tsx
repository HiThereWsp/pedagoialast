
import React, { ReactNode, useRef, useEffect } from 'react';

interface FormContainerProps {
  children: ReactNode;
  onSubmit: (e: React.FormEvent) => void;
}

export const FormContainer: React.FC<FormContainerProps> = ({ children, onSubmit }) => {
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (formRef.current) {
      formRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, []);

  return (
    <form 
      ref={formRef}
      onSubmit={onSubmit} 
      className="relative z-10 max-w-4xl mx-auto space-y-6 bg-white/95 backdrop-blur-sm p-8 rounded-xl shadow-lg border border-pink-100 hover:shadow-xl transition-all duration-300 ease-in-out"
    >
      {children}
    </form>
  );
};
