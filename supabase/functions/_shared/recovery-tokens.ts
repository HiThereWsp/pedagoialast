
// This file holds recovery-related constants that are shared between edge functions

// Simple constant for token validation
// In production, this should be a more secure, randomly generated token
// stored as a Supabase secret
export const RECOVERY_TOKEN_NAME = 'ADMIN_RECOVERY_TOKEN';
