
import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Button } from '../ui/button';
import { Dialog, DialogTrigger, DialogContent } from '../ui/dialog';
import { X, Menu, LogIn, LayoutDashboard } from 'lucide-react';
import { LoginForm } from './LoginForm';
import { useAuth } from '@/hooks/useAuth';

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  // Définition des liens de navigation
  const links = [
    // Vous pouvez ajouter des liens ici si nécessaire
  ];
  
  const handleDashboardClick = () => {
    navigate('/home');
  };
  
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-2">
          <Link to="/" className="flex items-center gap-2">
            <img src="/lovable-uploads/03e0c631-6214-4562-af65-219e8210fdf1.png" alt="PedagoIA Logo" className="h-16 w-auto" />
          </Link>
        </div>

        {/* Navigation Desktop */}
        <nav className="flex items-center gap-6">
          {links.map(link => (
            <Link
              key={link.name}
              to={link.href}
              className={`text-sm font-medium transition-colors hover:text-primary ${
                location.pathname === link.href
                  ? 'text-foreground'
                  : 'text-foreground/60'
              }`}
            >
              {link.name}
            </Link>
          ))}
        </nav>

        {/* Actions de droite (login/dashboard) */}
        <div className="flex items-center gap-3">
          {user ? (
            // Bouton Tableau de bord pour utilisateurs connectés
            <Button 
              variant="outline" 
              className="flex gap-2"
              onClick={handleDashboardClick}
            >
              <LayoutDashboard className="h-4 w-4" />
              Tableau de bord
            </Button>
          ) : (
            // Dialog de connexion pour utilisateurs non connectés
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="outline" className="flex gap-2">
                  <LogIn className="h-4 w-4" />
                  Se connecter
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px]">
                <LoginForm />
              </DialogContent>
            </Dialog>
          )}
          
          {/* Bouton du menu mobile */}
          <Button variant="ghost" size="icon" onClick={() => setMobileMenuOpen(true)} className="md:hidden">
            <Menu className="h-6 w-6" />
            <span className="sr-only">Ouvrir le menu</span>
          </Button>
        </div>

        {/* Menu Mobile */}
        {mobileMenuOpen && (
          <div className="fixed inset-0 z-50 bg-background md:hidden">
            <div className="container flex h-16 items-center justify-between">
              <div className="flex items-center gap-2">
                <Link to="/" className="flex items-center gap-2">
                  <img src="/lovable-uploads/03e0c631-6214-4562-af65-219e8210fdf1.png" alt="PedagoIA Logo" className="h-16 w-auto" />
                </Link>
              </div>
              <Button variant="ghost" size="icon" onClick={() => setMobileMenuOpen(false)}>
                <X className="h-6 w-6" />
                <span className="sr-only">Fermer le menu</span>
              </Button>
            </div>
            <nav className="container mt-4 flex flex-col gap-4">
              {links.map(link => (
                <Link
                  key={link.name}
                  to={link.href}
                  className={`p-2 rounded-md text-base ${
                    location.pathname === link.href
                      ? 'bg-muted text-foreground font-medium'
                      : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                  }`}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {link.name}
                </Link>
              ))}
              <div className="flex flex-col gap-2 mt-4">
                {user ? (
                  // Bouton Tableau de bord pour utilisateurs connectés (mobile)
                  <Button 
                    variant="outline" 
                    className="w-full gap-2 justify-center"
                    onClick={() => {
                      setMobileMenuOpen(false);
                      navigate('/home');
                    }}
                  >
                    <LayoutDashboard className="h-4 w-4" />
                    Tableau de bord
                  </Button>
                ) : (
                  // Dialog de connexion pour utilisateurs non connectés (mobile)
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button variant="outline" className="w-full gap-2 justify-center">
                        <LogIn className="h-4 w-4" />
                        Se connecter
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[425px]">
                      <LoginForm />
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
