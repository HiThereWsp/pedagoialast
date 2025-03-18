
import React from 'react';

export function GuideFAQSection() {
  return (
    <section id="faq" className="space-y-8">
      <h2 className="text-3xl font-bold text-[#2c3e50] border-b border-gray-100 pb-4">
        FAQ : Réponses à vos questions
      </h2>
      
      {/* FAQ avec schema.org pour SEO */}
      <div itemScope itemType="https://schema.org/FAQPage" className="space-y-10 mt-8">
        
        <div itemScope itemProp="mainEntity" itemType="https://schema.org/Question" className="space-y-4">
          <h3 itemProp="name" className="text-xl font-semibold text-[#3d4852] hover:text-purple-700 transition-colors">
            Quelle est la différence entre PedagoIA et d'autres outils pédagogiques numériques ?
          </h3>
          <div itemScope itemProp="acceptedAnswer" itemType="https://schema.org/Answer">
            <div itemProp="text" className="pl-8 border-l-4 border-purple-200 py-4">
              <p className="text-lg leading-relaxed text-gray-700">
                Contrairement aux simples banques de ressources ou aux outils de présentation, PedagoIA est un <strong className="text-[#2c3e50]">assistant intelligent</strong> qui comprend les besoins spécifiques des enseignants français. Il ne se contente pas de vous fournir des ressources, il les crée spécifiquement pour vous selon vos besoins, vous permettant d'économiser jusqu'à 60% de votre temps de préparation.
              </p>
            </div>
          </div>
        </div>
        
        <div itemScope itemProp="mainEntity" itemType="https://schema.org/Question" className="space-y-4">
          <h3 itemProp="name" className="text-xl font-semibold text-[#3d4852] hover:text-purple-700 transition-colors">
            Les contenus générés par PedagoIA sont-ils conformes aux programmes officiels ?
          </h3>
          <div itemScope itemProp="acceptedAnswer" itemType="https://schema.org/Answer">
            <div itemProp="text" className="pl-8 border-l-4 border-purple-200 py-4">
              <p className="text-lg leading-relaxed text-gray-700">
                PedagoIA s'efforce de produire des contenus en lien avec les programmes officiels de l'Éducation nationale. Cependant, <strong className="text-[#2c3e50]">nous recommandons toujours aux enseignants de vérifier</strong> la conformité des contenus générés avec les programmes en vigueur et d'apporter les ajustements nécessaires. L'IA est régulièrement mise à jour, mais l'expertise pédagogique de l'enseignant reste essentielle.
              </p>
            </div>
          </div>
        </div>
        
        <div itemScope itemProp="mainEntity" itemType="https://schema.org/Question" className="space-y-4">
          <h3 itemProp="name" className="text-xl font-semibold text-[#3d4852] hover:text-purple-700 transition-colors">
            Puis-je essayer PedagoIA gratuitement avant de m'abonner ?
          </h3>
          <div itemScope itemProp="acceptedAnswer" itemType="https://schema.org/Answer">
            <div itemProp="text" className="pl-8 border-l-4 border-purple-200 py-4">
              <p className="text-lg leading-relaxed text-gray-700">
                Bien sûr ! PedagoIA propose un <strong className="text-[#2c3e50]">essai gratuit de 3 jours</strong> donnant accès à l'ensemble des fonctionnalités. Aucune carte bancaire n'est requise pour l'essai.
              </p>
            </div>
          </div>
        </div>
        
      </div>
    </section>
  );
}
