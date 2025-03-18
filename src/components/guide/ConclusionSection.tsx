
import React from 'react';
import { Link } from 'react-router-dom';
import { posthog } from '@/integrations/posthog/client';

export function ConclusionSection() {
  return (
    <section id="conclusion" className="space-y-8">
      <h2 className="text-3xl font-bold text-[#2c3e50] border-b border-gray-100 pb-4">
        Conclusion : Transformez votre façon d'enseigner avec PedagoIA
      </h2>
      
      <p className="text-lg leading-relaxed text-gray-700 mb-8">
        PedagoIA représente une véritable révolution dans la <strong className="text-[#2c3e50]">gestion du temps des enseignants</strong>. En automatisant les tâches chronophages de préparation et d'administration, cet assistant intelligent vous permet de vous recentrer sur l'essentiel : l'accompagnement de vos élèves et la qualité de votre enseignement.
      </p>
      
      <p className="text-lg leading-relaxed text-gray-700 mb-12">Prêt à transformer votre pratique enseignante et à redécouvrir le plaisir d'enseigner ?</p>
      
      <div className="text-center my-16">
        <Link to="/login" className="inline-block bg-purple-600 hover:bg-purple-700 text-white py-4 px-8 rounded-lg font-medium transition-colors text-lg shadow-md hover:shadow-lg" onClick={() => posthog.capture('guide_cta_clicked')}>
          Essayer PedagoIA gratuitement pendant 3 jours
        </Link>
      </div>
    </section>
  );
}
