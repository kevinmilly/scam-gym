import NextAuth from "next-auth";
import Resend from "next-auth/providers/resend";
import { Redis } from "@upstash/redis";

const redis = new Redis({
  url: process.env.KV_REST_API_URL!,
  token: process.env.KV_REST_API_TOKEN!,
});

async function checkPremiumByEmail(email: string): Promise<{ isPremium: boolean; sessionId?: string }> {
  // Check Redis cache first
  const cached = await redis.get<{ sessionId: string }>(`premium:${email.toLowerCase().trim()}`);
  if (cached) {
    return { isPremium: true, sessionId: cached.sessionId };
  }

  // Fall back to Stripe API
  const stripeKey = process.env.STRIPE_SECRET_KEY;
  if (!stripeKey) return { isPremium: false };

  try {
    const params = new URLSearchParams({
      "customer_details[email]": email.toLowerCase().trim(),
      limit: "5",
    });
    const res = await fetch(`https://api.stripe.com/v1/checkout/sessions?${params}`, {
      headers: { Authorization: `Bearer ${stripeKey}` },
    });
    if (!res.ok) return { isPremium: false };

    const data = await res.json();
    const paidSession = data.data?.find(
      (s: { payment_status: string }) => s.payment_status === "paid",
    );
    if (paidSession) {
      // Cache in Redis for next time
      await redis.set(`premium:${email.toLowerCase().trim()}`, { sessionId: paidSession.id });
      return { isPremium: true, sessionId: paidSession.id };
    }
  } catch {
    // Stripe lookup failed — not critical
  }

  return { isPremium: false };
}

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Resend({
      from: "Scam Gym <noreply@scamgym.com>",
    }),
  ],
  session: { strategy: "jwt" },
  pages: {
    signIn: "/settings",
    verifyRequest: "/auth/verify",
  },
  callbacks: {
    async jwt({ token, trigger }) {
      if ((trigger === "signIn" || trigger === "signUp") && token.email) {
        const result = await checkPremiumByEmail(token.email);
        token.isPremium = result.isPremium;
        token.premiumSessionId = result.sessionId;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session as unknown as Record<string, unknown>).isPremium = token.isPremium ?? false;
        (session as unknown as Record<string, unknown>).premiumSessionId = token.premiumSessionId;
      }
      return session;
    },
  },
});
