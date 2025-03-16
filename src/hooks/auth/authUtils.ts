
import { Location } from "react-router-dom";

/**
 * Determines if the current page is a public page that doesn't require authentication
 */
export const isPublicPage = (pathname: string): boolean => {
  const publicPaths = [
    // Pages d'accueil et landing
    '/', 
    '/bienvenue',
    
    // Pages d'authentification
    '/login', 
    '/signup', 
    '/forgot-password',
    '/reset-password',
    '/confirm-email',
    
    // Pages d'information
    '/contact', 
    '/pricing',
    
    // Pages légales
    '/terms',
    '/privacy',
    '/legal'
  ];
  
  return publicPaths.some(path => pathname.startsWith(path));
};

/**
 * Determines if the current page is a page used for authentication flows
 */
export const isAuthPage = (pathname: string): boolean => {
  const authPaths = ['/login', '/signup', '/forgot-password', '/reset-password', '/confirm-email'];
  return authPaths.some(path => pathname.startsWith(path));
};
