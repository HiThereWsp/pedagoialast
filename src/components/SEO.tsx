import { Helmet } from 'react-helmet-async';

interface SEOProps {
  title: string;
  description: string;
  image?: string;
  article?: boolean;
}

export const SEO = ({ 
  title = "PedagoIA - L'assistant qui révolutionne la préparation des cours",
  description = "Créez des contenus pédagogiques personnalisés et innovants en quelques clics grâce à l'intelligence artificielle.",
  image = '/lovable-uploads/938303ce-e4da-498e-898b-f45a47cd942c.png',
  article = false 
}: SEOProps) => {
  const siteUrl = window.location.origin;

  return (
    <Helmet>
      {/* Balises meta générales */}
      <title>{title}</title>
      <meta name="description" content={description} />
      <meta name="robots" content="index, follow" />

      {/* Open Graph / Facebook */}
      <meta property="og:type" content={article ? 'article' : 'website'} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={`${siteUrl}${image}`} />
      <meta property="og:url" content={window.location.href} />

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={`${siteUrl}${image}`} />

      {/* Autres balises importantes pour le SEO */}
      <link rel="canonical" href={window.location.href} />
    </Helmet>
  );
};