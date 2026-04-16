import { NextRequest, NextResponse } from "next/server";
import { createHmac } from "crypto";
import { Redis } from "@upstash/redis";

// This endpoint verifies a Stripe purchase by customer email and returns a signed token.
// Set STRIPE_SECRET_KEY and PREMIUM_TOKEN_SECRET in your environment variables.

function signToken(payload: string, secret: string): string {
  const sig = createHmac("sha256", secret).update(`premium:${payload}`).digest("hex");
  return `${Buffer.from(`premium:${payload}`).toString("base64")}.${sig}`;
}

export async function POST(req: NextRequest) {
  const { email } = await req.json();

  if (!email || typeof email !== "string") {
    return NextResponse.json({ error: "Email is required." }, { status: 400 });
  }

  const stripeKey = process.env.STRIPE_SECRET_KEY;
  const tokenSecret = process.env.PREMIUM_TOKEN_SECRET;

  if (!stripeKey || !tokenSecret) {
    return NextResponse.json(
      { error: "Payment verification is not configured yet." },
      { status: 503 }
    );
  }

  const normalizedEmail = email.trim().toLowerCase();

  // Check Redis cache first (fast path)
  if (process.env.KV_REST_API_URL) {
    try {
      const redis = new Redis({
        url: process.env.KV_REST_API_URL,
        token: process.env.KV_REST_API_TOKEN!,
      });
      const cached = await redis.get<{ sessionId: string }>(`premium:${normalizedEmail}`);
      if (cached) {
        const token = signToken(cached.sessionId, tokenSecret);
        return NextResponse.json({ verified: true, token });
      }
    } catch {
      // Redis check failed — fall through to Stripe
    }
  }

  try {
    // Search Stripe for completed checkout sessions with this email
    const params = new URLSearchParams({
      "customer_details[email]": email.trim().toLowerCase(),
      limit: "5",
    });

    const res = await fetch(
      `https://api.stripe.com/v1/checkout/sessions?${params}`,
      {
        headers: {
          Authorization: `Bearer ${stripeKey}`,
        },
      }
    );

    if (!res.ok) {
      return NextResponse.json(
        { error: "Could not verify. Try again later." },
        { status: 502 }
      );
    }

    const data = await res.json();
    const paidSession = data.data?.find(
      (session: { payment_status: string; id: string }) =>
        session.payment_status === "paid"
    );

    if (paidSession) {
      // Cache in Redis for faster future lookups
      if (process.env.KV_REST_API_URL) {
        try {
          const redis = new Redis({
            url: process.env.KV_REST_API_URL,
            token: process.env.KV_REST_API_TOKEN!,
          });
          await redis.set(`premium:${normalizedEmail}`, {
            sessionId: paidSession.id,
            unlockedAt: new Date().toISOString(),
          });
        } catch {
          // Cache write failed — non-critical
        }
      }

      const token = signToken(paidSession.id, tokenSecret);
      return NextResponse.json({ verified: true, token });
    }

    return NextResponse.json({
      verified: false,
      message: "No purchase found for this email. Make sure you use the same email you paid with.",
    });
  } catch {
    return NextResponse.json(
      { error: "Verification failed. Try again later." },
      { status: 500 }
    );
  }
}
