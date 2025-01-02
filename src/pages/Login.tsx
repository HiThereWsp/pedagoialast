import { SEO } from "@/components/SEO"
import React from 'react';

const Login = () => {
  return (
    <>
      <SEO 
        title="Connexion | PedagoIA - Assistant pédagogique intelligent"
        description="Connectez-vous à votre compte PedagoIA pour accéder à votre assistant pédagogique personnel et optimiser votre enseignement."
      />
      <div className="min-h-screen flex items-center justify-center bg-background">
        <form className="w-full max-w-md">
          <h2 className="text-2xl font-bold mb-6">Connexion</h2>
          <div className="mb-4">
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email</label>
            <input type="email" id="email" className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" required />
          </div>
          <div className="mb-6">
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">Mot de passe</label>
            <input type="password" id="password" className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" required />
          </div>
          <button type="submit" className="w-full bg-primary text-white py-2 rounded-md hover:bg-primary/90 transition">Se connecter</button>
        </form>
      </div>
    </>
  )
}

export default Login
