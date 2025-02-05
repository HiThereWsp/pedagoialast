import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Copy } from "lucide-react";
import { MarkdownContent } from './MarkdownContent';

interface ExerciseTabsProps {
  studentSheet: string;
  teacherSheet: string;
  onCopy: (text: string) => Promise<void>;
}

export function ExerciseTabs({ studentSheet, teacherSheet, onCopy }: ExerciseTabsProps) {
  return (
    <Tabs defaultValue="student" className="w-full">
      <TabsList className="grid w-full grid-cols-2 mb-4">
        <TabsTrigger value="student">Fiche Élève</TabsTrigger>
        <TabsTrigger value="teacher">Fiche Pédagogique</TabsTrigger>
      </TabsList>
      <TabsContent value="student" className="relative">
        <MarkdownContent content={studentSheet} />
        <button
          onClick={() => onCopy(studentSheet)}
          className="absolute top-2 right-2 p-2 text-gray-500 hover:text-gray-700 bg-white/80 rounded-full hover:bg-gray-100 transition-colors"
          aria-label="Copier la fiche élève"
        >
          <Copy className="h-5 w-5" />
        </button>
      </TabsContent>
      <TabsContent value="teacher" className="relative">
        <MarkdownContent content={teacherSheet} />
        <button
          onClick={() => onCopy(teacherSheet)}
          className="absolute top-2 right-2 p-2 text-gray-500 hover:text-gray-700 bg-white/80 rounded-full hover:bg-gray-100 transition-colors"
          aria-label="Copier la fiche pédagogique"
        >
          <Copy className="h-5 w-5" />
        </button>
      </TabsContent>
    </Tabs>
  );
}