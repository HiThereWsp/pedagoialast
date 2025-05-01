import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Button } from '../ui/button';
import { Dialog, DialogTrigger, DialogContent } from '../ui/dialog';
import { X, Menu, LogIn, LayoutDashboard } from 'lucide-react';
import { LoginDialog } from './auth/LoginDialog';
import { useAuth } from '@/hooks/useAuth';
import { PromoButton } from '../ui/promo-button';

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  // Définition des liens de navigation - On supprime tous les liens sauf le logo
  const links = [];  // On vide le tableau des liens
  
  const handleDashboardClick = () => {
    navigate('/tableaudebord');
  };
  
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-2">
          <Link to="/" className="flex items-center gap-2">
            <img 
              src="/lovable-uploads/03e0c631-6214-4562-af65-219e8210fdf1.png" 
              alt="PedagoIA Logo" 
              className="h-24 w-24 object-contain" />
          </Link>
        </div>
        
        {/* Section centrale avec bouton promo */}
        <div className="flex-1 flex justify-center">
          <PromoButton className="hidden md:inline-flex" />
        </div>

        {/* Actions de droite (login/dashboard) */}
        <div className="flex items-center gap-3">
          {user ? (
            <Button 
              variant="outline" 
              className="hidden md:flex gap-2"
              onClick={handleDashboardClick}
            >
              <LayoutDashboard className="h-4 w-4" />
              Tableau de bord
            </Button>
          ) : (
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="outline" className="hidden md:flex gap-2">
                  <LogIn className="h-4 w-4" />
                  Se connecter
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px] p-6">
                <LoginDialog />
              </DialogContent>
            </Dialog>
          )}
          
          {/* Bouton du menu mobile */}
          <Button variant="ghost" size="icon" onClick={() => setMobileMenuOpen(true)} className="md:hidden">
            <Menu className="h-6 w-6" />
            <span className="sr-only">Ouvrir le menu</span>
          </Button>
        </div>

        {/* Menu Mobile - Simplifié également */}
        {mobileMenuOpen && (
          <div className="fixed inset-0 z-50 bg-background md:hidden">
            <div className="container flex h-16 items-center justify-between">
              <div className="flex items-center gap-2">
                <Link to="/" className="flex items-center gap-2">
                  <img 
                    src="/lovable-uploads/03e0c631-6214-4562-af65-219e8210fdf1.png" 
                    alt="PedagoIA Logo" 
                    className="h-20 w-20 object-contain" />
                </Link>
              </div>
              <Button variant="ghost" size="icon" onClick={() => setMobileMenuOpen(false)}>
                <X className="h-6 w-6" />
                <span className="sr-only">Fermer le menu</span>
              </Button>
            </div>
            <nav className="container mt-4 flex flex-col gap-4">
              {/* Bouton promo mobile */}
              <PromoButton className="mx-auto" />
              
              <div className="flex flex-col gap-2 mt-4">
                {user ? (
                  <Button 
                    variant="outline" 
                    className="w-full gap-2 justify-center"
                    onClick={() => {
                      setMobileMenuOpen(false);
                      navigate('/tableaudebord');
                    }}
                  >
                    <LayoutDashboard className="h-4 w-4" />
                    Tableau de bord
                  </Button>
                ) : (
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button variant="outline" className="w-full gap-2 justify-center">
                        <LogIn className="h-4 w-4" />
                        Se connecter
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[425px] p-6">
                      <LoginDialog />
                    </DialogContent>
                  </Dialog>
                )}
              </div>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}
