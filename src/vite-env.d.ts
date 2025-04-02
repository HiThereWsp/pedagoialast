
/// <reference types="vite/client" />

interface Window {
  gtag?: (event: string, action: string, params: any) => void;
  fbq?: (event: string, action: string, params?: any) => void;
  datafast?: (event: string, params: any) => void;
}
