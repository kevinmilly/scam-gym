import { NextRequest, NextResponse } from "next/server";
import { createHmac } from "crypto";

/**
 * POST /api/unlock
 *
 * Verifies a Stripe Checkout session ID and returns a signed unlock token.
 * The client stores this token and presents it whenever isPremium() is checked.
 * Cross-device sync is handled client-side via Firestore (see lib/auth.ts).
 */

function signToken(sessionId: string, secret: string): string {
  const payload = `premium:${sessionId}`;
  const sig = createHmac("sha256", secret).update(payload).digest("hex");
  return `${Buffer.from(payload).toString("base64")}.${sig}`;
}

export async function POST(req: NextRequest) {
  const stripeKey = process.env.STRIPE_SECRET_KEY;
  const tokenSecret = process.env.PREMIUM_TOKEN_SECRET;

  if (!stripeKey || !tokenSecret) {
    return NextResponse.json(
      { error: "Payment verification is not configured." },
      { status: 503 }
    );
  }

  let sessionId: string;
  try {
    const body = await req.json();
    sessionId = body.sessionId;
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  if (!sessionId || typeof sessionId !== "string" || !sessionId.startsWith("cs_")) {
    return NextResponse.json({ error: "Invalid session ID." }, { status: 400 });
  }

  try {
    const res = await fetch(
      `https://api.stripe.com/v1/checkout/sessions/${encodeURIComponent(sessionId)}`,
      {
        headers: { Authorization: `Bearer ${stripeKey}` },
      }
    );

    if (!res.ok) {
      return NextResponse.json(
        { error: "Could not verify with Stripe. Try again later." },
        { status: 502 }
      );
    }

    const session = await res.json();

    if (session.payment_status !== "paid") {
      return NextResponse.json(
        { error: "Payment not completed." },
        { status: 402 }
      );
    }

    const token = signToken(sessionId, tokenSecret);
    return NextResponse.json({ token });
  } catch {
    return NextResponse.json(
      { error: "Verification failed. Try again later." },
      { status: 500 }
    );
  }
}
