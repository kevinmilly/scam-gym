const PREMIUM_KEY = "scamgym_premium";
const PREMIUM_TOKEN_KEY = "scamgym_premium_token";

export const PREMIUM_PRICE = "$9.99";
export const PREMIUM_TAGLINE = "$9.99 once. The average scam costs $500.";
export const PREMIUM_SUBTEXT = "One-time payment. New practice rounds added every week.";

export const STRIPE_PAYMENT_URL = "https://buy.stripe.com/eVqcMZ0dyfhd5BkdLJe7m01";

/**
 * Check if premium is active.
 * Requires a signed token — bare "1" values are no longer accepted.
 * Accepts Stripe-issued tokens (`premium:cs_...`) on web and
 * Play Billing tokens (`premium:gp_...`) on Android.
 */
export function isPremium(): boolean {
  if (typeof window === "undefined") return false;
  const token = localStorage.getItem(PREMIUM_TOKEN_KEY);
  if (!token || !token.includes(".")) return false;
  try {
    const payload = atob(token.split(".")[0]);
    return payload.startsWith("premium:cs_") || payload.startsWith("premium:gp_");
  } catch {
    return false;
  }
}

/**
 * Called after server verifies a Stripe session and returns a signed token.
 */
export function unlockPremiumWithToken(token: string): void {
  localStorage.setItem(PREMIUM_TOKEN_KEY, token);
  // Keep legacy key for any old code that reads it (will be cleaned up)
  localStorage.setItem(PREMIUM_KEY, "1");
}

/**
 * Legacy unlock — only used for the restore flow while we migrate.
 * @deprecated Use unlockPremiumWithToken instead.
 */
export function unlockPremium(): void {
  // No-op for direct calls — requires server verification now.
  // This stub prevents import errors during migration.
}

export function removePremium(): void {
  localStorage.removeItem(PREMIUM_TOKEN_KEY);
  localStorage.removeItem(PREMIUM_KEY);
}
