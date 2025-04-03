const BREVO_API_KEY = Deno.env.get('BREVO_API_KEY') || '';
const BREVO_SENDER_EMAIL = Deno.env.get('BREVO_SENDER_EMAIL') || 'noreply@yourdomain.com';
const BREVO_SENDER_NAME = 'Pedagoia';

// Email content configuration
const EMAIL_CONTENT = {
    trialing: {
        subject: 'Bienvenue sur PedagoIA – Ton aventure commence ici !',
        html: '<html><body><p>Salut [Prénom],</p><p>Merci de nous rejoindre dans cette aventure ! 🙌</p><p>Avec PedagoIA, mon objectif est clair : t’aider à éliminer la surcharge de travail grâce à une IA vraiment pensée pour l’éducation.</p><p>Tu as maintenant accès à tout ce dont tu as besoin pour gagner du temps et te concentrer sur l’essentiel.</p><p>Je suis convaincu que PedagoIA deviendra vite un allié incontournable pour toi.</p><p>Reste bien connecté.e, de belles surprises arrivent bientôt !</p><p>Hâte d’avoir ton retour !</p><p>À très vite,<br>Andy<br>Fondateur de PedagoIA</p></body></html>'
    },
    active: {
        subject: 'C’est officiel, ton abonnement PedagoIA est actif !',
        html: '<html><body><p>Salut [Prénom],</p><p>Bonne nouvelle : ton abonnement PedagoIA est maintenant actif ! 🎉</p><p>Tu peux profiter pleinement de toutes les fonctionnalités pour alléger ta charge de travail et te concentrer sur l’essentiel. En tant qu’abonné.e, tu auras aussi accès en avant-première aux nouvelles fonctionnalités que nous préparons ! 🚀</p><p>On est ravis de t’avoir avec nous dans cette aventure. Si tu as la moindre question, je suis là !</p><p>À très vite,<br>Andy @PedagoIA</p></body></html>'
    },
    past_due: {
        subject: 'Oups, un souci avec ton paiement :confused:',
        html: '<html><body><p>Salut [Prénom],</p><p>On a remarqué que ton dernier paiement n’a pas pu être traité. Pour éviter toute interruption de ton accès à PedagoIA, pense à mettre à jour ton moyen de paiement dès que possible.</p><p>Tu peux le faire en quelques clics ici : {Link to update payment method}</p><p>Si tu as besoin d’aide, n’hésite pas à me contacter !</p><p>À bientôt,<br>Andy @PedagoIA</p></body></html>'
    }
};

export async function sendSubscriptionEmail(email: string, status: string, name: string): Promise<void> {
    if (!Object.keys(EMAIL_CONTENT).includes(status)) {
        console.log(`Skipping email for unsupported status: ${status}`);
        return;
    }

    const displayName = name === "Anonymous" ? "Customer" : name;
    const content = EMAIL_CONTENT[status as keyof typeof EMAIL_CONTENT];
    const personalizedHtml = content.html.replace("[Prénom]", displayName);

    try {
        const response = await fetch('https://api.brevo.com/v3/smtp/email', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'api-key': BREVO_API_KEY,
            },
            body: JSON.stringify({
                sender: { name: BREVO_SENDER_NAME, email: BREVO_SENDER_EMAIL },
                to: [{ email, name: 'Pedagoia Subscriber' }],
                subject: content.subject,
                htmlContent: personalizedHtml
            })
        });

        if (!response.ok) {
            throw new Error(`Brevo API error: ${await response.text()}`);
        }
        console.log(`Email sent successfully to ${email} for status ${status}`);
    } catch (error) {
        console.error(`Failed to send email to ${email} for status ${status}: ${error.message}`);
        throw error; // Re-throw to allow caller to handle if needed
    }
}