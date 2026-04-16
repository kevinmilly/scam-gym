import { Drill } from "../types";

const COMEDIC_REPLIES: Record<string, string[]> = {
  delivery_toll: [
    "Sir I don't even own a car",
    "My car has been in the shop since 2019, nice try",
    "I take the bus everywhere, who is this",
  ],
  bank_fraud_alert: [
    "My balance is $3.12. Please freeze it so I stop buying coffee",
    "Unusual activity? That was me buying ramen at 2am again",
    "Which account? The one with $0 or the other one with $0",
  ],
  account_verification: [
    "I haven't logged into anything since the pandemic",
    "My password is literally 'password', have at it",
    "Verify what? I can barely verify my own existence",
  ],
  tech_support: [
    "My computer runs Windows XP and I'm not changing",
    "I'll have my grandson look at it in 3-5 business years",
    "The only virus on my computer is the 47 toolbars I installed",
  ],
  job_seeker: [
    "You're offering ME $5000/week? I can barely make toast",
    "Work from home? I already do that, it's called unemployment",
    "Please forward this to someone who has ambition",
  ],
  romance_social: [
    "I haven't been to a party since 2019 and I don't know any Sarahs",
    "Ma'am this is a Wendy's",
    "My wife is reading this over my shoulder. Choose your next words wisely",
  ],
  invoice_vendor: [
    "I don't have a business, I have a couch and a dream",
    "Invoice? The only thing I owe is an apology to my mother",
    "Please remove me from whatever reality this is",
  ],
  marketplace: [
    "I'm selling a lamp for $5, not laundering money",
    "That's a lot of steps just to buy a used toaster",
    "Can you just Venmo me like a normal person",
  ],
  crypto_wallet: [
    "I don't have a crypto wallet, I have a regular wallet with $11 in it",
    "The only coin I'm invested in is the one stuck in my couch",
    "Sir I thought Bitcoin was a type of chocolate",
  ],
};

const DEFAULT_REPLIES = [
  "New phone who dis",
  "I'm showing this to my grandkids so they can laugh at you",
  "You picked the wrong person today buddy",
  "I'm going to need you to try harder than that",
  "This is going straight to my group chat",
];

function pickRandom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

export function generateImagePrompt(drill: Drill): string {
  const replies = COMEDIC_REPLIES[drill.pattern_family] ?? DEFAULT_REPLIES;
  const comedyReply = pickRandom(replies);

  const isEmail = drill.channel === "email";
  const isSms = drill.channel === "sms" || drill.channel === "dm";

  if (isEmail) {
    return [
      "Create a comedic image of a phone showing an email notification.",
      `From: "${drill.message.from_name}" <${drill.message.from_handle}>`,
      drill.message.subject ? `Subject: "${drill.message.subject}"` : "",
      `The email preview shows: "${drill.message.body.slice(0, 120)}..."`,
      `Below the email, show the person's reply: "${comedyReply}"`,
      "Style: clean, modern phone screen mockup with a slight cartoon/meme aesthetic.",
      "Bright colors, slightly exaggerated expressions. No real brand logos.",
      "Make it look shareable and funny — social media post style.",
    ]
      .filter(Boolean)
      .join("\n");
  }

  return [
    "Create a comedic iPhone text message screenshot in iMessage style.",
    `The received message (gray bubble) is from "${drill.message.from_name}" and reads:`,
    `"${drill.message.body.slice(0, 200)}"`,
    `The sent reply (blue bubble) reads: "${comedyReply}"`,
    "Style: realistic iMessage bubbles on a light background.",
    "Clean, funny, meme-quality, shareable. No real brand logos or phone chrome.",
    "Slightly exaggerated cartoon aesthetic — think social media viral post.",
  ].join("\n");
}

export function generateCaption(drill: Drill): string {
  const redFlagLabels = drill.red_flags
    .slice(0, 4)
    .map((rf) => rf.label)
    .join(", ");

  const channelEmoji =
    drill.channel === "email"
      ? "email"
      : drill.channel === "sms"
        ? "text"
        : "message";

  const familyTag = drill.pattern_family.replace(/_/g, "");

  return [
    `Can YOU spot the scam? This ${channelEmoji} is hitting phones everywhere.`,
    "",
    `Red flags: ${redFlagLabels}`,
    "",
    drill.explanation.short,
    "",
    `Pro tip: ${drill.explanation.safe_move}`,
    "",
    "Practice spotting scams for free: https://scam-gym.vercel.app",
    "",
    `#ScamGym #SpotTheScam #${familyTag} #ScamAwareness #OnlineSafety`,
  ].join("\n");
}
