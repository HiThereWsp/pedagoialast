
/**
 * Email template for ambassador welcome emails
 */

/**
 * Generates HTML content for the ambassador welcome email
 * @param firstName The recipient's first name
 * @returns HTML string for the email body
 */
export const getAmbassadorWelcomeTemplate = (firstName: string) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Bienvenue dans le programme Ambassadeur PedagoIA</title>
  <style>
    body {
      font-family: system-ui, -apple-system, sans-serif;
      line-height: 1.5;
      color: #374151;
    }
    .container {
      max-width: 600px;
      margin: 0 auto;
      padding: 20px;
    }
    .header {
      text-align: center;
      margin-bottom: 30px;
    }
    .content {
      background-color: #ffffff;
      padding: 30px;
      border-radius: 8px;
    }
    .button {
      display: inline-block;
      padding: 12px 24px;
      background-color: #4F46E5;
      color: white;
      text-decoration: none;
      border-radius: 6px;
      margin-top: 20px;
    }
    .footer {
      text-align: center;
      margin-top: 30px;
      font-size: 0.875rem;
      color: #6B7280;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Bienvenue dans le programme Ambassadeur PedagoIA !</h1>
    </div>
    <div class="content">
      <p>Bonjour ${firstName} !</p>
      <p>Merci de faire partie de nos ambassadeurs. Ton inscription est confirmée !</p>
      <p>Tu peux dès maintenant te connecter et utiliser toutes les fonctionnalités de PedagoIA avec ton compte ambassadeur.</p>
      <p>N'hésite pas à explorer toutes les fonctionnalités disponibles et à nous faire part de tes retours !</p>
      <a href="https://app.pedagoia.fr/login" class="button">Accéder à PedagoIA</a>
    </div>
    <div class="footer">
      <p>© 2024 PedagoIA. Tous droits réservés.</p>
    </div>
  </div>
</body>
</html>
`
