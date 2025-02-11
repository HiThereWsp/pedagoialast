
export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

export const validatePhoneNumber = (number: string, countryCode: string): boolean => {
  // Supprime tous les espaces et tirets
  const cleanNumber = number.replace(/[\s-]/g, '')
  
  switch(countryCode) {
    case '+33': // France
      return /^[67]\d{8}$/.test(cleanNumber)
    case '+32': // Belgique
      return /^[1-9]\d{7}$/.test(cleanNumber)
    case '+41': // Suisse
      return /^[1-9]\d{8}$/.test(cleanNumber)
    case '+352': // Luxembourg
      return /^[1-9]\d{6,7}$/.test(cleanNumber)
    case '+377': // Monaco
      return /^[1-9]\d{7}$/.test(cleanNumber)
    default:
      return false
  }
}

export interface CountryCode {
  code: string
  country: string
  format: string
  example: string
}

export const countryCodes: CountryCode[] = [
  { 
    code: "+33",
    country: "France",
    format: "6 12 34 56 78",
    example: "612345678"
  },
  { 
    code: "+32",
    country: "Belgique",
    format: "470 12 34 56",
    example: "470123456"
  },
  { 
    code: "+41",
    country: "Suisse",
    format: "79 123 45 67",
    example: "791234567"
  },
  { 
    code: "+352",
    country: "Luxembourg",
    format: "621 123 456",
    example: "621123456"
  },
  { 
    code: "+377",
    country: "Monaco",
    format: "6 12 34 56 78",
    example: "612345678"
  }
]
