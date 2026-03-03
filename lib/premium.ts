const PREMIUM_KEY = "scamgym_premium";

export const PREMIUM_PRICE = "$2.99";
export const STRIPE_PAYMENT_URL = "https://buy.stripe.com/PLACEHOLDER"; // Replace with real Stripe Payment Link

export function isPremium(): boolean {
  if (typeof window === "undefined") return false;
  return localStorage.getItem(PREMIUM_KEY) === "1";
}

export function unlockPremium(): void {
  localStorage.setItem(PREMIUM_KEY, "1");
}

export function removePremium(): void {
  localStorage.removeItem(PREMIUM_KEY);
}
