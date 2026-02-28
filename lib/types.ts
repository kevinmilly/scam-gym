export type Channel = "sms" | "email" | "dm";
export type Verdict = "scam" | "legit";
export type CalibrationVerdict =
  | "overconfident"
  | "underconfident"
  | "well-calibrated";

export type UserContext = "personal" | "small_business" | "job_seeker" | "family_safety";

// Pattern families (string on Drill for future-proofing):
// existing: "delivery_toll" | "bank_fraud_alert" | "account_verification" | "tech_support"
//           | "job_seeker" | "invoice_vendor" | "romance_social" | "qr_code"
// new:      "marketplace" | "oauth_consent" | "crypto_wallet"

export type RedFlag = {
  id: string;
  label: string;
};

export type Drill = {
  id: string;
  channel: Channel;
  pattern_family: string;
  difficulty: 1 | 2 | 3 | 4 | 5;
  ground_truth: Verdict;
  context: UserContext;
  ai_amplified: boolean;
  message: {
    from_name: string;
    from_handle: string;
    subject: string | null;
    body: string;
  };
  red_flags: RedFlag[];
  correct_red_flag_ids: string[];
  explanation: {
    short: string;
    tells: string[];
    safe_move: string;
    consequence: string;
    behavioral_reinforcement: string;
  };
  tags: string[];
};

export type BehaviorChoice = "ignore" | "verify" | "respond" | "click" | "call";

export type Attempt = {
  id: string;
  drillId: string;
  timestamp: number;
  userVerdict: Verdict;
  confidence: number; // 50 | 60 | 70 | 85 | 95
  selectedRedFlagIds: string[];
  isCorrect: boolean;
  brierScore: number; // 0–1
  redFlagRecall: number; // 0–1
  syncedAt: number | null;
  behaviorChoice?: BehaviorChoice;
};

export type ContentFlag = {
  id: string;
  drillId: string;
  timestamp: number;
  reason: "answer_wrong" | "question_unclear" | "red_flags_wrong" | "other";
  detail: string | null;
  syncedAt: number | null;
};
