import { NextResponse } from "next/server";
import { initializeApp, getApps, cert } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import { getMessaging } from "firebase-admin/messaging";

function getAdminServices() {
  if (!getApps().length) {
    initializeApp({
      credential: cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
      }),
    });
  }
  return { db: getFirestore(), messaging: getMessaging() };
}

const REMINDERS = [
  "Time for a quick drill 💪 — one scam caught is one scam avoided.",
  "Your streak is waiting. 60 seconds of practice is all it takes.",
  "New scam tactics emerge daily. Stay sharp — open Scam Gym.",
  "Are you sure you'd spot a scam? Prove it today.",
  "One drill a day keeps the scammers away.",
];

export async function GET(req: Request) {
  // Vercel cron requests include this header; reject any other caller
  if (req.headers.get("authorization") !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { db, messaging } = getAdminServices();
  const snapshot = await db.collection("push_tokens").get();

  if (snapshot.empty) {
    return NextResponse.json({ sent: 0 });
  }

  const tokens = snapshot.docs.map((d) => d.id);
  const body = REMINDERS[new Date().getDay() % REMINDERS.length];

  // FCM batch send (up to 500 tokens per call)
  const results = await messaging.sendEachForMulticast({
    tokens,
    notification: {
      title: "Scam Gym 🏋️",
      body,
    },
    android: {
      notification: {
        clickAction: "OPEN_DRILL",
        channelId: "reminders",
      },
    },
    apns: {
      payload: {
        aps: { badge: 1, sound: "default" },
      },
    },
  });

  // Prune stale tokens (unregistered devices)
  const staleTokens: string[] = [];
  results.responses.forEach((r, i) => {
    if (!r.success && r.error?.code === "messaging/registration-token-not-registered") {
      staleTokens.push(tokens[i]);
    }
  });
  if (staleTokens.length) {
    const batch = db.batch();
    staleTokens.forEach((t) => batch.delete(db.collection("push_tokens").doc(t)));
    await batch.commit();
  }

  return NextResponse.json({
    sent: results.successCount,
    failed: results.failureCount,
    pruned: staleTokens.length,
  });
}
