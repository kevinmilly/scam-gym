import { isNativeAndroid } from "./platform";
import { apiUrl } from "./apiBase";

export const PLAY_PRODUCT_ID = "scamgym_pro_unlock";
export const PLAY_ENTITLEMENT_ID = "pro";

export type PurchaseResult =
  | { ok: true; token: string }
  | { ok: false; reason: "cancelled" | "unavailable" | "not_configured" | "error"; message?: string };

export type RestoreResult =
  | { found: true; token: string }
  | { found: false; reason?: string };

let configured = false;
let configuring: Promise<void> | null = null;

async function ensureConfigured(): Promise<void> {
  if (configured) return;
  if (configuring) return configuring;

  configuring = (async () => {
    const apiKey = process.env.NEXT_PUBLIC_REVENUECAT_ANDROID_KEY;
    if (!apiKey) {
      throw new Error("RevenueCat Android key is not set (NEXT_PUBLIC_REVENUECAT_ANDROID_KEY).");
    }
    const { Purchases } = await import("@revenuecat/purchases-capacitor");
    await Purchases.configure({ apiKey });
    configured = true;
  })();

  try {
    await configuring;
  } finally {
    configuring = null;
  }
}

async function getAppUserID(): Promise<string | null> {
  try {
    const { Purchases } = await import("@revenuecat/purchases-capacitor");
    const id = await Purchases.getAppUserID();
    return id?.appUserID ?? null;
  } catch {
    return null;
  }
}

async function exchangeForSignedToken(appUserID: string): Promise<string | null> {
  try {
    const res = await fetch(apiUrl("/api/verify-play-purchase"), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ appUserID }),
    });
    const data = await res.json();
    if (res.ok && data.verified && data.token) return data.token;
    return null;
  } catch {
    return null;
  }
}

/**
 * Trigger the Google Play Billing purchase flow for the Pro unlock.
 * On success, returns a server-signed `premium:gp_…` token suitable for unlockPremiumWithToken().
 */
export async function purchasePremium(): Promise<PurchaseResult> {
  if (!isNativeAndroid()) {
    return { ok: false, reason: "unavailable", message: "Purchase is only available in the Android app." };
  }

  try {
    await ensureConfigured();
  } catch (e) {
    return { ok: false, reason: "not_configured", message: (e as Error).message };
  }

  try {
    const { Purchases } = await import("@revenuecat/purchases-capacitor");
    const offerings = await Purchases.getOfferings();
    const current = offerings.current;
    if (!current || current.availablePackages.length === 0) {
      return {
        ok: false,
        reason: "unavailable",
        message: "Pro is not available right now. Make sure the in-app product is published in Play Console and active in RevenueCat.",
      };
    }

    const proPackage =
      current.availablePackages.find((p) => p.product.identifier === PLAY_PRODUCT_ID) ??
      current.lifetime ??
      current.availablePackages[0];

    let result;
    try {
      result = await Purchases.purchasePackage({ aPackage: proPackage });
    } catch (err) {
      const e = err as { userCancelled?: boolean; message?: string };
      if (e?.userCancelled) return { ok: false, reason: "cancelled" };
      return { ok: false, reason: "error", message: e?.message ?? "Purchase failed." };
    }

    const active = result.customerInfo.entitlements.active?.[PLAY_ENTITLEMENT_ID];
    if (!active?.isActive) {
      return { ok: false, reason: "error", message: "Purchase did not unlock the Pro entitlement. Contact support if you were charged." };
    }

    const appUserID = await getAppUserID();
    if (!appUserID) {
      return { ok: false, reason: "error", message: "Could not identify your purchase. Try Restore." };
    }

    const token = await exchangeForSignedToken(appUserID);
    if (!token) {
      return { ok: false, reason: "error", message: "Could not verify purchase with our server. Try Restore." };
    }
    return { ok: true, token };
  } catch (err) {
    return { ok: false, reason: "error", message: (err as Error).message ?? "Purchase failed." };
  }
}

/**
 * Query Play Billing for an existing entitlement on this Google account.
 * Returns a server-signed token if the user already owns the Pro unlock.
 */
export async function restorePurchases(): Promise<RestoreResult> {
  if (!isNativeAndroid()) {
    return { found: false, reason: "Restore is only available in the Android app." };
  }

  try {
    await ensureConfigured();
  } catch (e) {
    return { found: false, reason: (e as Error).message };
  }

  try {
    const { Purchases } = await import("@revenuecat/purchases-capacitor");
    const result = await Purchases.restorePurchases();
    const active = result.customerInfo.entitlements.active?.[PLAY_ENTITLEMENT_ID];
    if (!active?.isActive) {
      return { found: false, reason: "No previous purchase found on this Google account." };
    }

    const appUserID = await getAppUserID();
    if (!appUserID) {
      return { found: false, reason: "Could not identify your account." };
    }

    const token = await exchangeForSignedToken(appUserID);
    if (!token) {
      return { found: false, reason: "Could not verify purchase with our server." };
    }
    return { found: true, token };
  } catch (err) {
    return { found: false, reason: (err as Error).message ?? "Restore failed." };
  }
}
