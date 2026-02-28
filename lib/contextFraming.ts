import type { UserContext } from "./types";

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
