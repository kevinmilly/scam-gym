import type { UserContext } from "./types";

type PatternFamily =
  | "delivery_toll"
  | "bank_fraud_alert"
  | "account_verification"
  | "tech_support"
  | "job_seeker"
  | "invoice_vendor"
  | "romance_social"
  | "qr_code"
  | "marketplace"
  | "oauth_consent"
  | "crypto_wallet";

const FRAMING_CUES: Record<UserContext, Record<string, string>> = {
  personal: {
    delivery_toll:        "Imagine this just arrived while you were waiting on a package.",
    bank_fraud_alert:     "Assume this just appeared on your personal banking app.",
    account_verification: "This message is asking you to secure one of your personal accounts.",
    tech_support:         "This message arrived on your personal device.",
    job_seeker:           "You've applied to a few positions online recently.",
    invoice_vendor:       "You sometimes pay bills or vendors for personal services.",
    romance_social:       "You've been active on social media and messaging apps.",
    qr_code:              "You encountered this QR code in your daily life.",
    marketplace:          "You have active listings on an online marketplace.",
    oauth_consent:        "An app is requesting access to one of your personal accounts.",
    crypto_wallet:        "You hold some crypto on an exchange.",
  },
  small_business: {
    delivery_toll:        "You receive frequent deliveries for your business.",
    bank_fraud_alert:     "You manage a business bank account and review alerts regularly.",
    account_verification: "This message targets one of your business accounts.",
    tech_support:         "This arrived on a device you use for business operations.",
    job_seeker:           "You've recently posted a job opening and are reviewing applicants.",
    invoice_vendor:       "You manage payments and vendor relationships for your business.",
    romance_social:       "A new contact has reached out about a potential business opportunity.",
    qr_code:              "You scanned this code at a business event or from a vendor.",
    marketplace:          "You sell products through an online marketplace.",
    oauth_consent:        "An app is requesting access to a business account.",
    crypto_wallet:        "Your business occasionally handles crypto payments.",
  },
  job_seeker: {
    delivery_toll:        "You've been ordering supplies while job searching from home.",
    bank_fraud_alert:     "You're managing your finances carefully during your job search.",
    account_verification: "You've signed up for many platforms as part of your job search.",
    tech_support:         "You rely heavily on your devices for job applications and interviews.",
    job_seeker:           "You've applied to several positions online this week.",
    invoice_vendor:       "You do freelance work between job applications.",
    romance_social:       "You've been networking heavily on professional and social platforms.",
    qr_code:              "You scanned this code at a networking event or job fair.",
    marketplace:          "You're selling items to cover expenses while between jobs.",
    oauth_consent:        "A recruiter or employer is asking you to authorize an app.",
    crypto_wallet:        "You've been researching crypto as an alternative income source.",
  },
  family_safety: {
    delivery_toll:        "Consider whether an older family member could spot this delivery text.",
    bank_fraud_alert:     "Think about whether your parent would recognize this bank alert as a scam.",
    account_verification: "Would a less tech-savvy family member know not to click this?",
    tech_support:         "Imagine your parent receiving this message on their phone.",
    job_seeker:           "Picture a younger family member who just graduated getting this 'job offer.'",
    invoice_vendor:       "Consider whether a family member who runs a small business could spot this.",
    romance_social:       "Think about a lonely family member receiving this kind of message.",
    qr_code:              "Imagine a family member scanning this QR code in public.",
    marketplace:          "Consider whether a family member trying to sell something could recognize this.",
    oauth_consent:        "Would your parent know what they're authorizing if they saw this?",
    crypto_wallet:        "Imagine a family member curious about crypto receiving this message.",
  },
};

const DEFAULT_CUE = "Read this message carefully before deciding.";

export function getFramingCue(context: UserContext, patternFamily: string): string {
  return FRAMING_CUES[context]?.[patternFamily as PatternFamily] ?? DEFAULT_CUE;
}

export const CONTEXT_LABELS: Record<UserContext, string> = {
  personal:      "Personal",
  small_business: "Small Business",
  job_seeker:    "Job Seeker",
  family_safety: "Family Safety",
};

export const CONTEXT_DESCRIPTIONS: Record<UserContext, string> = {
  personal:      "Everyday messages on your personal phone or email.",
  small_business: "You manage payments, vendors, and accounts for a small business.",
  job_seeker:    "You're actively applying for jobs and networking online.",
  family_safety: "Train your eye to protect a less tech-savvy family member.",
};
