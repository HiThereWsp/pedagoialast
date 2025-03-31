const BREVO_API_KEY = Deno.env.get('BREVO_API_KEY') || '';
const BREVO_SENDER_EMAIL = Deno.env.get('BREVO_SENDER_EMAIL') || 'noreply@yourdomain.com';
const BREVO_SENDER_NAME = 'Pedagoia';

// Email content configuration
const EMAIL_CONTENT = {
    trialing: {
        subject: 'Welcome to Your Pedagoia Trial!',
        html: '<html><body><h1>Trial Started</h1><p>Your Pedagoia trial has begun! Enjoy your access.</p></body></html>'
    },
    active: {
        subject: 'Pedagoia Subscription Activated',
        html: '<html><body><h1>Subscription Active</h1><p>Your Pedagoia subscription is now active!</p></body></html>'
    },
    past_due: {
        subject: 'Action Required: Payment Issue',
        html: '<html><body><h1>Payment Past Due</h1><p>Please update your payment method to continue your Pedagoia subscription.</p></body></html>'
    }
};

export async function sendSubscriptionEmail(email: string, status: string): Promise<void> {
    if (!Object.keys(EMAIL_CONTENT).includes(status)) {
        console.log(`Skipping email for unsupported status: ${status}`);
        return;
    }

    const content = EMAIL_CONTENT[status as keyof typeof EMAIL_CONTENT];

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
                htmlContent: content.html
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