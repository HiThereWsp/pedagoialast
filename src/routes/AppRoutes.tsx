
import React from "react";
import { BrowserRouter, Routes } from "react-router-dom";
import { PublicRoutes } from "./PublicRoutes";
import { ProtectedRoutes } from "./ProtectedRoutes";
import {
  PlaygroundRoutes1,
  PlaygroundRoutes2,
  PlaygroundRoutes3,
  PlaygroundRoutes4,
  PlaygroundRoutes5
} from "./playground";

const AppRoutes = () => {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes */}
        <PublicRoutes />
        
        {/* Protected Routes */}
        <ProtectedRoutes />
        
        {/* Playground Routes */}
        <PlaygroundRoutes1 />
        <PlaygroundRoutes2 />
        <PlaygroundRoutes3 />
        <PlaygroundRoutes4 />
        <PlaygroundRoutes5 />
      </Routes>
    </BrowserRouter>
  );
};

export default AppRoutes;
