import { NextRequest, NextResponse } from "next/server";

// This endpoint verifies a Stripe purchase by customer email.
// Set STRIPE_SECRET_KEY in your environment variables.

export async function POST(req: NextRequest) {
  const { email } = await req.json();

  if (!email || typeof email !== "string") {
    return NextResponse.json({ error: "Email is required." }, { status: 400 });
  }

  const stripeKey = process.env.STRIPE_SECRET_KEY;
  if (!stripeKey) {
    return NextResponse.json(
      { error: "Payment verification is not configured yet." },
      { status: 503 }
    );
  }

  try {
    // Search Stripe for completed checkout sessions with this email
    const params = new URLSearchParams({
      "customer_details[email]": email.trim().toLowerCase(),
      limit: "1",
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
    const found = data.data?.some(
      (session: { payment_status: string }) =>
        session.payment_status === "paid"
    );

    if (found) {
      return NextResponse.json({ verified: true });
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
