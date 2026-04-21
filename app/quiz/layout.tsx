import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Scam IQ Quiz — Scam Gym",
  description: "10 real messages. Scam or legit? Test your scam detection skills and see how you rank.",
  openGraph: {
    title: "Scam IQ Quiz — Can you spot the scams?",
    description: "10 questions. Real messages. See if you'd fall for these scams.",
    images: [{ url: "/api/og/result?score=0&total=10&type=quiz", width: 1200, height: 630 }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Scam IQ Quiz",
    description: "Test your scam detection skills — 10 questions, free.",
  },
};

export default function QuizLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
