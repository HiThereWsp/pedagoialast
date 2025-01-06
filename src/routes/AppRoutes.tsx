import React from "react";
import { Routes, Route } from "react-router-dom";
import { ProtectedRoute } from "./ProtectedRoute";
import { LessonPlanPage } from "@/pages/LessonPlanPage";
import { Settings } from "@/pages/Settings";
import { SuggestionsPage } from "@/pages/SuggestionsPage";
import { ExerciseGenerator } from "@/components/exercise/ExerciseGenerator";
import { CorrespondenceGenerator } from "@/components/correspondence/CorrespondenceGenerator";

export function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<ProtectedRoute />}>
        <Route path="creersequence" element={<LessonPlanPage />} />
        <Route path="exercices" element={<ExerciseGenerator />} />
        <Route path="correspondance" element={<CorrespondenceGenerator />} />
        <Route path="suggestions" element={<SuggestionsPage />} />
        <Route path="parametres" element={<Settings />} />
      </Route>
    </Routes>
  );
}