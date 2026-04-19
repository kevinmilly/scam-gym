export type Channel = "sms" | "email" | "dm" | "phone";
export type Verdict = "scam" | "legit";
export type DrillType = "standard" | "spot_flag" | "preview" | "thread" | "comparison";
export type CalibrationVerdict =
  | "well-calibrated"
  | "cautious-win"
  | "self-aware-miss"
  | "overconfident-miss";

export type UserContext = "personal" | "small_business" | "job_seeker" | "family_safety";

// Pattern families (string on Drill for future-proofing):
// existing: "delivery_toll" | "bank_fraud_alert" | "account_verification" | "tech_support"
//           | "job_seeker" | "invoice_vendor" | "romance_social" | "qr_code"
// new:      "marketplace" | "oauth_consent" | "crypto_wallet"

export type RedFlag = {
  id: string;
  label: string;
};

export type TrickType =
  | "urgency"
  | "authority_impersonation"
  | "secrecy"
  | "small_dollar_bait"
  | "advance_fee"
  | "credential_harvest"
  | "remote_access"
  | "callback_trap"
  | "lookalike_domain"
  | "trust_then_pivot"
  | "emotional_leverage"
  | "fear_lockout"
  | "qr_redirect"
  | "payment_redirect"
  | "social_proof"
  | "overconfidence_trap";

export type Drill = {
  id: string;
  channel: Channel;
  pattern_family: string;
  difficulty: 1 | 2 | 3 | 4 | 5;
  ground_truth: Verdict;
  context?: UserContext;
  ai_amplified: boolean;
  tricks?: TrickType[];
  drill_type?: DrillType;
  framing?: string;
  // spot_flag format
  spot_flag_options?: { id: string; label: string }[];
  spot_flag_correct_id?: string;
  // thread format
  thread?: { sender: "them" | "you"; body: string }[];
  // comparison format
  paired_drill_id?: string;
  comparison_role?: "scam" | "legit";
  message: {
    from_name: string | null;
    from_handle: string;
    subject: string | null;
    body: string;
  };
  red_flags: RedFlag[];
  green_flags?: RedFlag[];
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
  drill_type?: DrillType;
  spot_flag_pick?: string;
  spot_flag_correct?: boolean;
  thread_sus_index?: number;
  comparison_pick_id?: string;
};

export type ContentFlag = {
  id: string;
  drillId: string;
  timestamp: number;
  reason: "answer_wrong" | "question_unclear" | "red_flags_wrong" | "other";
  detail: string | null;
  syncedAt: number | null;
};
