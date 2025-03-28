const BREVO_API_KEY = Deno.env.get('BREVO_API_KEY') || '';
const BASE_URL = 'https://api.brevo.com/v3';

// List IDs from your provided data
const LIST_IDS = {
    FREE_USERS: 8,    // "Free users"
    PREMIUM_USERS: 9  // "Premium users"
} as const;

// Interface for Brevo API responses
interface BrevoResponse<T> {
    success: boolean;
    data?: T;
    error?: string;
}

/**
 * Manages Brevo contact lists based on subscription status
 * @param email - User's email address
 * @param status - Stripe subscription status
 */
export async function manageContactList(email: string, status: string): Promise<void> {
    // Only handle trialing and active statuses for list management
    const relevantStatuses = ['trialing', 'active'];
    if (!relevantStatuses.includes(status)) {
        console.log(`Skipping list management for status: ${status}`);
        return;
    }

    try {
        // Check current list membership
        const currentLists = await getContactLists(email);
        if (!currentLists.success) {
            throw new Error(currentLists.error || 'Failed to fetch contact lists');
        }

        const isInFreeList = currentLists.data?.includes(LIST_IDS.FREE_USERS) || false;
        const isInPremiumList = currentLists.data?.includes(LIST_IDS.PREMIUM_USERS) || false;

        // Determine actions based on status
        if (status === 'trialing') {
            // Add to Free users if not already there
            if (!isInFreeList) {
                await addToList(email, LIST_IDS.FREE_USERS);
                console.log(`Added ${email} to Free users list`);
            }
            // Remove from Premium users if present
            if (isInPremiumList) {
                await removeFromList(email, LIST_IDS.PREMIUM_USERS);
                console.log(`Removed ${email} from Premium users list`);
            }
        } else if (status === 'active') {
            // Add to Premium users if not already there
            if (!isInPremiumList) {
                await addToList(email, LIST_IDS.PREMIUM_USERS);
                console.log(`Added ${email} to Premium users list`);
            }
            // Remove from Free users if present
            if (isInFreeList) {
                await removeFromList(email, LIST_IDS.FREE_USERS);
                console.log(`Removed ${email} from Free users list`);
            }
        }
    } catch (error) {
        console.error(`Failed to manage contact list for ${email}: ${error.message}`);
        throw error;
    }
}

/**
 * Fetches the lists a contact belongs to
 * @param email - Contact's email
 * @returns Array of list IDs or error
 */
async function getContactLists(email: string): Promise<BrevoResponse<number[]>> {
    try {
        const response = await fetch(`${BASE_URL}/contacts/${encodeURIComponent(email)}`, {
            method: 'GET',
            headers: {
                'api-key': BREVO_API_KEY,
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            if (response.status === 404) {
                return { success: true, data: [] }; // Contact not found, return empty list
            }
            throw new Error(await response.text());
        }

        const data = await response.json();
        return { success: true, data: data.listIds || [] };
    } catch (error) {
        return { success: false, error: error.message };
    }
}

/**
 * Adds a contact to a specified list
 * @param email - Contact's email
 * @param listId - Brevo list ID
 */
async function addToList(email: string, listId: number): Promise<void> {
    const response = await fetch(`${BASE_URL}/contacts`, {
        method: 'POST',
        headers: {
            'api-key': BREVO_API_KEY,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            email,
            listIds: [listId],
            updateEnabled: true // Allows updating existing contact
        })
    });

    if (!response.ok) {
        throw new Error(`Failed to add ${email} to list ${listId}: ${await response.text()}`);
    }
}

/**
 * Removes a contact from a specified list
 * @param email - Contact's email
 * @param listId - Brevo list ID
 */
async function removeFromList(email: string, listId: number): Promise<void> {
    const response = await fetch(`${BASE_URL}/contacts/${encodeURIComponent(email)}/lists/${listId}`, {
        method: 'DELETE',
        headers: {
            'api-key': BREVO_API_KEY,
            'Content-Type': 'application/json'
        }
    });

    if (!response.ok && response.status !== 404) { // 404 is okay (contact not in list)
        throw new Error(`Failed to remove ${email} from list ${listId}: ${await response.text()}`);
    }
}