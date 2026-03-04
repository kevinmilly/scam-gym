export type HelpChannel = "sms" | "email" | "phone" | "dm";
export type HelpAsk = "money" | "info" | "click" | "urgent" | "verify" | "offer" | "threat" | "romance";
export type HelpTheme =
  | "bank"
  | "delivery"
  | "tech_support"
  | "government"
  | "job"
  | "marketplace"
  | "crypto"
  | "general";
export type HelpUrgency = "right_now" | "within_hours" | "not_urgent";

export type HelpOutput = {
  safeMove: string;
  verifySteps: string[];
  neverDo: string[];
  suggestedFamilies: string[];
};

const UNIVERSAL_NEVER_DO = [
  "Never send money, gift cards, or cryptocurrency to someone you haven't verified",
  "Never share passwords, PINs, or 2FA codes — no real company asks for these",
  "Never click links in messages that create urgency or fear",
  "Never call phone numbers provided in a suspicious message",
  "Never give remote access to your computer or phone",
];

const HELP_TEMPLATES: Record<string, HelpOutput> = {
  // SMS combos
  sms_money: {
    safeMove: "Do not send anything. Real organizations never request payment via text message. Close the conversation.",
    verifySteps: [
      "Look up the company's real phone number from their official website (not from the text)",
      "Call them directly and ask if they sent this message",
      "Check your actual account by logging in through the official app or website",
    ],
    neverDo: UNIVERSAL_NEVER_DO,
    suggestedFamilies: ["bank_fraud_alert", "delivery_toll"],
  },
  sms_money_bank: {
    safeMove: "Do not reply or tap any links. Your bank will never ask you to transfer money or buy gift cards via text.",
    verifySteps: [
      "Call the number on the back of your debit/credit card",
      "Log in to your bank's official app to check for alerts",
      "Visit your bank branch in person if you're concerned",
    ],
    neverDo: UNIVERSAL_NEVER_DO,
    suggestedFamilies: ["bank_fraud_alert"],
  },
  sms_money_delivery: {
    safeMove: "Do not pay any 'delivery fee' or 'customs charge' via text. Real delivery companies charge at checkout or at delivery.",
    verifySteps: [
      "Check the tracking number on the official carrier website (USPS, UPS, FedEx)",
      "Look at your recent orders — are you actually expecting a package?",
      "Call the carrier's official customer service number",
    ],
    neverDo: UNIVERSAL_NEVER_DO,
    suggestedFamilies: ["delivery_toll"],
  },
  sms_click: {
    safeMove: "Do not tap the link. If it's about an account, go to the official app or website directly by typing the address yourself.",
    verifySteps: [
      "Check if you have an account with the company mentioned",
      "Log in to the real website (type it yourself, don't use the link)",
      "Call the company's official number to verify",
    ],
    neverDo: UNIVERSAL_NEVER_DO,
    suggestedFamilies: ["account_verification", "delivery_toll"],
  },
  sms_info: {
    safeMove: "Don't reply with any personal information. Legitimate companies already have your info on file.",
    verifySteps: [
      "Ask yourself: did I initiate this conversation?",
      "Look up the company independently and contact them",
      "Check for previous legitimate correspondence from this sender",
    ],
    neverDo: UNIVERSAL_NEVER_DO,
    suggestedFamilies: ["account_verification", "bank_fraud_alert"],
  },
  sms_urgent: {
    safeMove: "Pause. Urgency is the #1 tool scammers use. Take 10 minutes before doing anything.",
    verifySteps: [
      "Put the phone down and take a few breaths",
      "Look up the real contact info for whoever supposedly sent this",
      "Call a trusted friend or family member to get a second opinion",
    ],
    neverDo: UNIVERSAL_NEVER_DO,
    suggestedFamilies: ["bank_fraud_alert", "tech_support"],
  },
  sms_verify: {
    safeMove: "If someone asks you to read back a verification code, stop. That code is for your account — they're trying to break in.",
    verifySteps: [
      "Check: did YOU request this verification code?",
      "If not, someone may be trying to access your account — change your password",
      "Enable two-factor authentication on your accounts",
    ],
    neverDo: UNIVERSAL_NEVER_DO,
    suggestedFamilies: ["account_verification"],
  },
  sms_offer: {
    safeMove: "If it sounds too good to be true, it is. Don't respond or click any links.",
    verifySteps: [
      "Search for the offer online — is it on the company's real website?",
      "Check if the company actually exists",
      "Look for reviews or scam reports about this offer",
    ],
    neverDo: UNIVERSAL_NEVER_DO,
    suggestedFamilies: ["marketplace", "crypto_wallet"],
  },
  sms_threat: {
    safeMove: "Don't panic. Real law enforcement or companies don't threaten you via text. This is designed to scare you into acting fast.",
    verifySteps: [
      "Take a screenshot for your records",
      "Look up the agency's real number and call them directly",
      "Report the message to your phone carrier (forward to 7726 / SPAM)",
    ],
    neverDo: UNIVERSAL_NEVER_DO,
    suggestedFamilies: ["bank_fraud_alert", "tech_support"],
  },
  sms_romance: {
    safeMove: "If someone you've only met online asks for money or personal information, stop all contact.",
    verifySteps: [
      "Do a reverse image search on their profile photos",
      "Have you ever met this person in real life or on video?",
      "Talk to someone you trust about the situation",
    ],
    neverDo: UNIVERSAL_NEVER_DO,
    suggestedFamilies: ["romance_social"],
  },

  // Email combos
  email_money: {
    safeMove: "Do not pay any invoice or fee from an unexpected email. Forward it to the real company's fraud department.",
    verifySteps: [
      "Check the sender's actual email address (hover/tap to see the full address)",
      "Look for the company's real billing page by going to their website directly",
      "Call the company's official billing support number",
    ],
    neverDo: UNIVERSAL_NEVER_DO,
    suggestedFamilies: ["invoice_vendor", "bank_fraud_alert"],
  },
  email_click: {
    safeMove: "Do not click links in the email. Go to the website directly by typing the address in your browser.",
    verifySteps: [
      "Hover over the link to see the real URL — does it match the company?",
      "Check the sender's full email address for misspellings",
      "Forward the email to the company's official abuse/phishing address",
    ],
    neverDo: UNIVERSAL_NEVER_DO,
    suggestedFamilies: ["account_verification", "oauth_consent"],
  },
  email_info: {
    safeMove: "Don't reply with personal details. Companies with your account already have this information.",
    verifySteps: [
      "Inspect the sender's email address carefully",
      "Check if the email has generic greetings like 'Dear Customer' instead of your name",
      "Contact the company through their official website",
    ],
    neverDo: UNIVERSAL_NEVER_DO,
    suggestedFamilies: ["account_verification", "job_seeker"],
  },
  email_urgent: {
    safeMove: "Urgency in an email is a red flag. Take your time — no legitimate deadline is measured in minutes.",
    verifySteps: [
      "Check if you have an existing relationship with this company",
      "Look at the email headers and sender address closely",
      "Call the company directly using a number from their official website",
    ],
    neverDo: UNIVERSAL_NEVER_DO,
    suggestedFamilies: ["bank_fraud_alert", "invoice_vendor"],
  },
  email_offer: {
    safeMove: "Don't click on 'too good to be true' offers. Real deals are on the company's actual website.",
    verifySteps: [
      "Search for the offer on the company's official website",
      "Check if the email domain matches the real company domain",
      "Look for scam reports about similar offers",
    ],
    neverDo: UNIVERSAL_NEVER_DO,
    suggestedFamilies: ["marketplace", "job_seeker"],
  },
  email_threat: {
    safeMove: "Don't panic. Threatening emails about account closures, legal action, or penalties are almost always scams.",
    verifySteps: [
      "Take a screenshot of the email",
      "Verify by contacting the company through official channels",
      "Report the email as phishing in your email client",
    ],
    neverDo: UNIVERSAL_NEVER_DO,
    suggestedFamilies: ["tech_support", "bank_fraud_alert"],
  },
  email_verify: {
    safeMove: "If you didn't request a verification email, don't click anything. Someone may be trying to access your account.",
    verifySteps: [
      "Check: did you just try to log in or sign up?",
      "Go to the site directly and check your account security settings",
      "Change your password if you're concerned",
    ],
    neverDo: UNIVERSAL_NEVER_DO,
    suggestedFamilies: ["account_verification", "oauth_consent"],
  },
  email_romance: {
    safeMove: "If an online connection starts asking for money or personal details via email, end the conversation.",
    verifySteps: [
      "Reverse image search their photos",
      "Check if their story has inconsistencies",
      "Talk to a trusted friend or family member about the situation",
    ],
    neverDo: UNIVERSAL_NEVER_DO,
    suggestedFamilies: ["romance_social"],
  },

  // Phone combos
  phone_money: {
    safeMove: "Hang up. Real companies and government agencies do not demand immediate payment over the phone.",
    verifySteps: [
      "Hang up and call back using the company's official number",
      "Check your real account through the official app or website",
      "Ask a trusted person for a second opinion before sending anything",
    ],
    neverDo: UNIVERSAL_NEVER_DO,
    suggestedFamilies: ["bank_fraud_alert", "tech_support"],
  },
  phone_info: {
    safeMove: "Do not confirm or provide personal information to an inbound caller. Tell them you'll call back using the official number.",
    verifySteps: [
      "Say: 'I'll call you back through the main line'",
      "Look up the real number independently",
      "Check your account directly through official channels",
    ],
    neverDo: UNIVERSAL_NEVER_DO,
    suggestedFamilies: ["bank_fraud_alert", "account_verification"],
  },
  phone_urgent: {
    safeMove: "Hang up immediately. Urgency over the phone is the biggest red flag. Take your time to verify independently.",
    verifySteps: [
      "Hang up — do NOT stay on the line",
      "Wait 5 minutes, then call the organization's official number yourself",
      "If they claimed something about your account, check it through the official app",
    ],
    neverDo: UNIVERSAL_NEVER_DO,
    suggestedFamilies: ["tech_support", "bank_fraud_alert"],
  },
  phone_threat: {
    safeMove: "Hang up. No real agency will arrest you, sue you, or cancel your benefits over the phone without prior written notice.",
    verifySteps: [
      "Take note of what they said (caller ID, claims made)",
      "Look up the agency's official contact number",
      "Report the call to the FTC at reportfraud.ftc.gov",
    ],
    neverDo: UNIVERSAL_NEVER_DO,
    suggestedFamilies: ["tech_support", "bank_fraud_alert"],
  },
  phone_click: {
    safeMove: "If a caller tells you to visit a website or download software, hang up. This is a tech support scam.",
    verifySteps: [
      "Do not visit any URL they gave you",
      "If they claimed to be from a company, call the company directly",
      "Run a virus scan if you already visited the site",
    ],
    neverDo: UNIVERSAL_NEVER_DO,
    suggestedFamilies: ["tech_support"],
  },
  phone_verify: {
    safeMove: "Never read back verification codes to a caller. That code is for YOUR account security.",
    verifySteps: [
      "Hang up immediately",
      "Check your account for unauthorized access",
      "Change your password and enable 2FA",
    ],
    neverDo: UNIVERSAL_NEVER_DO,
    suggestedFamilies: ["account_verification"],
  },
  phone_offer: {
    safeMove: "If it sounds too good to be true, hang up. Legitimate prizes don't require upfront payment.",
    verifySteps: [
      "Search online for the company or offer name + 'scam'",
      "Ask: did I enter any contest or sweepstakes?",
      "Talk to a trusted friend before responding",
    ],
    neverDo: UNIVERSAL_NEVER_DO,
    suggestedFamilies: ["marketplace"],
  },
  phone_romance: {
    safeMove: "If someone you've only spoken to online calls asking for money, hang up and block them.",
    verifySteps: [
      "Have you ever met this person in real life?",
      "Search their name and details for inconsistencies",
      "Talk to a trusted friend or family member",
    ],
    neverDo: UNIVERSAL_NEVER_DO,
    suggestedFamilies: ["romance_social"],
  },

  // DM combos
  dm_money: {
    safeMove: "Don't send money to anyone through DMs. Block and report the account.",
    verifySteps: [
      "Check how old the account is and how many followers/friends it has",
      "Do they have a verified badge? Even so, verify independently",
      "Contact the person through a different channel to confirm it's really them",
    ],
    neverDo: UNIVERSAL_NEVER_DO,
    suggestedFamilies: ["romance_social", "marketplace"],
  },
  dm_click: {
    safeMove: "Don't click links in DMs, especially from people you don't know well. The link could steal your login or install malware.",
    verifySteps: [
      "Ask yourself: is this person someone I actually know?",
      "If it's a 'deal' or 'opportunity', search for it independently",
      "Report the message to the platform",
    ],
    neverDo: UNIVERSAL_NEVER_DO,
    suggestedFamilies: ["marketplace", "crypto_wallet"],
  },
  dm_info: {
    safeMove: "Don't share personal information in DMs. No legitimate business conducts sensitive transactions through social media messages.",
    verifySteps: [
      "Verify the person's identity through another channel",
      "Check if the account looks legitimate (age, activity, mutual connections)",
      "If it's from a 'company', contact them through their official website",
    ],
    neverDo: UNIVERSAL_NEVER_DO,
    suggestedFamilies: ["romance_social", "job_seeker"],
  },
  dm_offer: {
    safeMove: "Investment opportunities, free money, and 'exclusive deals' in DMs are almost always scams. Ignore and block.",
    verifySteps: [
      "Search for the offer or opportunity online for scam reports",
      "Check if the account has been recently created",
      "Ask a trusted friend if this sounds legitimate",
    ],
    neverDo: UNIVERSAL_NEVER_DO,
    suggestedFamilies: ["crypto_wallet", "marketplace"],
  },
  dm_urgent: {
    safeMove: "If a DM creates urgency ('act now,' 'limited time'), it's a manipulation tactic. Take your time.",
    verifySteps: [
      "Verify the sender's identity through a different channel",
      "Search for similar messages online — is this a known scam?",
      "Report the account to the platform",
    ],
    neverDo: UNIVERSAL_NEVER_DO,
    suggestedFamilies: ["marketplace", "crypto_wallet"],
  },
  dm_threat: {
    safeMove: "If someone threatens to share private information or hack your account, don't pay. Block, screenshot, and report.",
    verifySteps: [
      "Take screenshots of the conversation",
      "Report to the platform immediately",
      "If it involves explicit threats, consider reporting to law enforcement",
    ],
    neverDo: UNIVERSAL_NEVER_DO,
    suggestedFamilies: ["romance_social"],
  },
  dm_verify: {
    safeMove: "If a DM asks you to verify your identity or account, it's not real. Platforms never verify through DMs.",
    verifySteps: [
      "Go to the platform's official settings/security page",
      "Check if the sender is actually the platform's official account",
      "Report the message",
    ],
    neverDo: UNIVERSAL_NEVER_DO,
    suggestedFamilies: ["account_verification"],
  },
  dm_romance: {
    safeMove: "Online romances that quickly move to DMs and ask for money are a classic scam pattern. Slow down and verify.",
    verifySteps: [
      "Reverse image search their profile photos",
      "Have you video-called this person?",
      "Talk to a trusted friend or family member about the situation",
    ],
    neverDo: UNIVERSAL_NEVER_DO,
    suggestedFamilies: ["romance_social"],
  },
};

export function resolveHelpOutput(
  channel: HelpChannel,
  ask: HelpAsk,
  theme?: HelpTheme,
  _urgency?: HelpUrgency,
): HelpOutput {
  // Try most specific key first
  if (theme) {
    const specific = HELP_TEMPLATES[`${channel}_${ask}_${theme}`];
    if (specific) return specific;
  }
  // Fall back to channel + ask
  const base = HELP_TEMPLATES[`${channel}_${ask}`];
  if (base) return base;

  // Ultimate fallback
  return {
    safeMove: "Stop and don't respond. When in doubt, verify through official channels before taking any action.",
    verifySteps: [
      "Look up the company or person's real contact info independently",
      "Call or visit them directly using a verified number or website",
      "Ask a trusted friend or family member for a second opinion",
    ],
    neverDo: UNIVERSAL_NEVER_DO,
    suggestedFamilies: [],
  };
}

export const CHANNEL_OPTIONS: { value: HelpChannel; label: string; icon: string }[] = [
  { value: "sms", label: "Text / SMS", icon: "💬" },
  { value: "email", label: "Email", icon: "📧" },
  { value: "phone", label: "Phone call", icon: "📞" },
  { value: "dm", label: "Social media DM", icon: "📱" },
];

export const ASK_OPTIONS: { value: HelpAsk; label: string; icon: string }[] = [
  { value: "money", label: "Asking for money or payment", icon: "💰" },
  { value: "info", label: "Asking for personal info", icon: "🔑" },
  { value: "click", label: "Wants me to click a link", icon: "🔗" },
  { value: "urgent", label: "Saying it's urgent / time-sensitive", icon: "⏰" },
  { value: "verify", label: "Asking me to verify my identity", icon: "🪪" },
  { value: "offer", label: "Offering a deal or prize", icon: "🎁" },
  { value: "threat", label: "Threatening me", icon: "⚠️" },
  { value: "romance", label: "Someone I met online", icon: "💕" },
];

export const THEME_OPTIONS: { value: HelpTheme; label: string }[] = [
  { value: "bank", label: "Bank / financial" },
  { value: "delivery", label: "Package / delivery" },
  { value: "tech_support", label: "Tech support" },
  { value: "government", label: "Government / IRS" },
  { value: "job", label: "Job offer" },
  { value: "marketplace", label: "Marketplace / shopping" },
  { value: "crypto", label: "Crypto / investment" },
  { value: "general", label: "Not sure / other" },
];

export const URGENCY_OPTIONS: { value: HelpUrgency; label: string }[] = [
  { value: "right_now", label: "Happening right now" },
  { value: "within_hours", label: "Got it recently" },
  { value: "not_urgent", label: "Just want to be prepared" },
];
