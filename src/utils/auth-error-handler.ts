import { AuthError, AuthApiError } from "@supabase/supabase-js"

export const getAuthErrorMessage = (error: AuthError): string => {
  console.log({error})
  if (error instanceof AuthApiError) {
    switch (error.status) {
      case 400:
        if (error.message.includes("Email not confirmed")) {
          return "Veuillez confirmer votre email avant de vous connecter."
        }
        if (error.message.includes("Invalid login credentials")) {
          return "Email ou mot de passe incorrect."
        }
        if (error.message.includes("User already registered")) {
          return "Un compte existe déjà avec cet email. Veuillez vous connecter."
        }
        return "Les identifiants fournis sont invalides."
      case 422:
        return "Format d'email invalide."
      case 429:
        return "Trop de tentatives. Veuillez réessayer plus tard."
      case 500:
        if (error.message.includes("Database error saving new user")) {
          return "Une erreur est survenue lors de la création de votre compte. Veuillez réessayer avec un autre email."
        }
        return "Une erreur serveur est survenue. Veuillez réessayer plus tard."
      default:
        return "Une erreur est survenue. Veuillez réessayer."
    }
  }
  return "aUne erreur est survenue. Veuillez réessayer."
}

export const validateAuthForm = (email: string, password: string) => {
  const errors: string[] = []

  if (!email.trim()) {
    errors.push("Veuillez saisir votre email.")
  }

  if (!password.trim()) {
    errors.push("Veuillez saisir votre mot de passe.")
  }

  if (password.length < 6) {
    errors.push("Le mot de passe doit contenir au moins 6 caractères.")
  }

  return errors
}

export const validatePasswordResetForm = (password: string, confirmPassword: string) => {
  const errors: string[] = []

  if (!password.trim()) {
    errors.push("Veuillez saisir votre mot de passe.")
  }

  if (password.length < 6) {
    errors.push("Le mot de passe doit contenir au moins 6 caractères.")
  }

  if (password !== confirmPassword) {
    errors.push("Les mots de passe ne correspondent pas.")
  }

  return errors
}
