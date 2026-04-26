import { NextRequest, NextResponse } from "next/server";
import { createHmac } from "crypto";

/**
 * POST /api/verify-play-purchase
 *
 * Verifies a Google Play purchase by querying the RevenueCat REST API for the
 * entitlement state of a given appUserID, then returns a signed unlock token
 * mirroring the Stripe flow in /api/unlock.
 *
 * Required env vars:
 *  - REVENUECAT_SECRET_KEY    RevenueCat REST API secret key (server-only)
 *  - PREMIUM_TOKEN_SECRET     Same HMAC secret used by /api/unlock
 *
 * Optional:
 *  - REVENUECAT_ENTITLEMENT_ID  Defaults to "pro"
 */

const DEFAULT_ENTITLEMENT_ID = "pro";

function signToken(payload: string, secret: string): string {
  const sig = createHmac("sha256", secret).update(`premium:${payload}`).digest("hex");
  return `${Buffer.from(`premium:${payload}`).toString("base64")}.${sig}`;
}

function isAppUserIDSafe(id: unknown): id is string {
  return typeof id === "string" && id.length > 0 && id.length < 256 && /^[A-Za-z0-9._:$-]+$/.test(id);
}

type RcEntitlement = {
  expires_date: string | null;
  product_identifier?: string;
};

type RcSubscriberResponse = {
  subscriber?: {
    entitlements?: Record<string, RcEntitlement>;
  };
};

export async function POST(req: NextRequest) {
  const secretKey = process.env.REVENUECAT_SECRET_KEY;
  const tokenSecret = process.env.PREMIUM_TOKEN_SECRET;
  const entitlementId = process.env.REVENUECAT_ENTITLEMENT_ID || DEFAULT_ENTITLEMENT_ID;

  if (!secretKey || !tokenSecret) {
    return NextResponse.json(
      { error: "Play purchase verification is not configured." },
      { status: 503 }
    );
  }

  let appUserID: unknown;
  try {
    const body = await req.json();
    appUserID = body.appUserID;
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  if (!isAppUserIDSafe(appUserID)) {
    return NextResponse.json({ error: "Invalid appUserID." }, { status: 400 });
  }

  try {
    const res = await fetch(
      `https://api.revenuecat.com/v1/subscribers/${encodeURIComponent(appUserID)}`,
      {
        headers: {
          Authorization: `Bearer ${secretKey}`,
          "Content-Type": "application/json",
        },
      }
    );

    if (!res.ok) {
      return NextResponse.json(
        { error: "Could not verify purchase. Try again later." },
        { status: 502 }
      );
    }

    const data: RcSubscriberResponse = await res.json();
    const ent = data.subscriber?.entitlements?.[entitlementId];

    if (!ent) {
      return NextResponse.json(
        { verified: false, message: "No purchase found on this account." },
        { status: 200 }
      );
    }

    // For non-consumable lifetime unlocks, expires_date is null.
    // For subscriptions it would be a future ISO timestamp.
    const stillActive =
      ent.expires_date === null || (ent.expires_date && new Date(ent.expires_date).getTime() > Date.now());

    if (!stillActive) {
      return NextResponse.json(
        { verified: false, message: "Purchase is no longer active." },
        { status: 200 }
      );
    }

    const token = signToken(`gp_${appUserID}`, tokenSecret);
    return NextResponse.json({ verified: true, token });
  } catch {
    return NextResponse.json(
      { error: "Verification failed. Try again later." },
      { status: 500 }
    );
  }
}
