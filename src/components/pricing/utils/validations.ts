
export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

export const validatePhoneNumber = (number: string): boolean => {
  // Supprime tous les espaces, tirets et parenthèses
  const cleanNumber = number.replace(/[\s\-\(\)]/g, '')
  
  // Accepte les numéros avec ou sans indicatif international
  // Format: +XX... ou 06... ou 07...
  return /^(\+\d{2,3})?[67]\d{8}$/.test(cleanNumber)
}
