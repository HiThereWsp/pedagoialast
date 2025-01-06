import React from 'react';
import { SEO } from './SEO';

interface BlogPostProps {
  title: string;
  content: string;
  description: string;
  image?: string;
}

export const BlogPost: React.FC<BlogPostProps> = ({ title, content, description, image }) => {
  return (
    <article className="max-w-3xl mx-auto px-4 py-8">
      <SEO 
        title={title}
        description={description}
        image={image}
        article={true}
      />
      <h1 className="text-4xl font-bold mb-6">{title}</h1>
      <div className="prose prose-lg max-w-none">
        {content}
      </div>
    </article>
  );
};