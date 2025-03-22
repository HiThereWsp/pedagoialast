
// Function to check development mode
export function checkDevelopmentMode(environment: string | undefined) {
  if (environment === 'development') {
    console.log("Development environment detected, granting access");
    return { 
      access: true, 
      type: 'dev_mode',
      expires_at: null,
      message: 'Accès accordé en mode développement'
    };
  }
  
  return null;
}
