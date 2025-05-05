/**
 * Utilitaire pour hacher les données sensibles selon les exigences de l'API Conversions Meta
 * Utilise l'algorithme SHA-256 requis par Meta
 */

export async function sha256Hash(input: string): Promise<string> {
  // Convertir la chaîne en ArrayBuffer
  const encoder = new TextEncoder();
  const data = encoder.encode(input);
  
  // Calculer le hash SHA-256
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  
  // Convertir le buffer en chaîne hexadécimale
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  
  return hashHex;
}

/**
 * Normalise et hache une adresse e-mail selon les exigences de Meta
 */
export async function hashEmail(email: string): Promise<string> {
  // Normalization: lowercase and trim
  const normalized = email.toLowerCase().trim();
  return sha256Hash(normalized);
}

/**
 * Normalise et hache un numéro de téléphone selon les exigences de Meta
 */
export async function hashPhone(phone: string): Promise<string> {
  // Supprime tout ce qui n'est pas un chiffre
  const digitsOnly = phone.replace(/\D/g, '');
  return sha256Hash(digitsOnly);
}

/**
 * Normalise et hache un prénom selon les exigences de Meta
 */
export async function hashName(name: string): Promise<string> {
  // Normalization: lowercase and trim
  const normalized = name.toLowerCase().trim();
  return sha256Hash(normalized);
}

/**
 * Normalise et hache un code postal selon les exigences de Meta
 */
export async function hashZipcode(zipcode: string): Promise<string> {
  // Supprime tous les espaces
  const normalized = zipcode.replace(/\s/g, '');
  return sha256Hash(normalized);
} 