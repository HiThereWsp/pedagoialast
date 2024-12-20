import React from 'react';
import { ArrowRight } from 'lucide-react';
import { Button } from '../ui/button';
import { Dialog, DialogContent } from '../ui/dialog';
import { LoginForm } from './LoginForm';

export function CTASection() {
  const [showLoginForm, setShowLoginForm] = React.useState(false);

  return (
    <section className="py-20">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Prêt à transformer votre enseignement avec l'IA ?
          </h2>
          <p className="text-xl text-muted-foreground mb-8">
            Rejoignez des milliers d'enseignants qui gagnent des heures de travail chaque semaine grâce à Pédagoia.
          </p>
          <Button 
            size="lg"
            onClick={() => setShowLoginForm(true)}
            className="bg-primary text-white hover:bg-primary/90 transition-all duration-200 text-lg px-8 py-6 rounded-xl shadow-premium hover:shadow-premium-lg transform hover:scale-105"
          >
            Je m'inscris gratuitement
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </div>
      </div>
      <Dialog open={showLoginForm} onOpenChange={setShowLoginForm}>
        <DialogContent className="sm:max-w-[425px]">
          <LoginForm defaultView="sign_up" />
        </DialogContent>
      </Dialog>
    </section>
  );
}