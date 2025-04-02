
/// <reference types="vite/client" />

interface Window {
  gtag?: (event: string, action: string, params: any) => void;
  fbq?: any; // Using 'any' type for maximum flexibility with Meta Pixel API
  _fbq?: any;
  datafast?: (event: string, params: any) => void;
}
