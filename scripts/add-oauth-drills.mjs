#!/usr/bin/env node
import * as fs from "fs";
import * as path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const drillsPath = path.join(__dirname, "../data/drills.json");

const BR = "An OAuth authorization request grants real account access — read the permissions being requested, and never authorize an app you didn't initiate from inside a trusted service.";

const newDrills = [
  // ─── OAUTH_CONSENT SCAM (13) ─────────────────────────────────────────────
  {
    id: "email_oauth_scam_001",
    channel: "email",
    pattern_family: "oauth_consent",
    difficulty: 3,
    ground_truth: "scam",
    context: "personal",
    ai_amplified: true,
    message: {
      from_name: "Orbit Tech Security",
      from_handle: "security@orbit-tech-alerts.com",
      subject: "A new app is requesting access to your Orbit Tech account",
      body: "Hi,\n\nAn application called 'Account Recovery Assistant' is requesting access to your Orbit Tech account including your email, contacts, and Google Drive files.\n\nIf you initiated this, click Approve. If not, you should still approve to confirm your identity and secure your account.\n\n[Approve Access]\n\nOrbit Tech Security Team"
    },
    red_flags: [
      { id: "lookalike_domain", label: "Lookalike sender domain (orbit-tech-alerts.com)" },
      { id: "broad_permissions_requested", label: "Requesting email, contacts, and Drive access" },
      { id: "approve_to_deny_logic", label: "'Approve to secure account' reversal logic" },
      { id: "unsolicited_app_request", label: "App request you didn't initiate" }
    ],
    correct_red_flag_ids: ["lookalike_domain", "broad_permissions_requested", "approve_to_deny_logic", "unsolicited_app_request"],
    explanation: {
      short: "Real security emails tell you to deny unexpected app requests — not approve them to 'confirm your identity.'",
      tells: [
        "'orbit-tech-alerts.com' is not Orbit Tech's domain — the real domain is orbittech.com",
        "Legitimate OAuth notifications explain what the app does; 'Account Recovery Assistant' is vague and alarming",
        "'Approve to secure your account' is a logic reversal — denying is always the safe move for unexpected requests",
        "Approving this hands the attacker read access to your email, contacts, and Drive"
      ],
      safe_move: "Do not click the link. Log in to orbittech.com directly and check Security → Third-party apps. Revoke anything unrecognized.",
      consequence: "Clicking 'Approve' grants the attacker's app real OAuth access to your email and files. They can read all messages, steal contact data, and access stored documents.",
      behavioral_reinforcement: BR
    },
    tags: ["phishing", "oauth", "credential_theft", "impersonation", "ai_amplified"]
  },
  {
    id: "dm_oauth_scam_001",
    channel: "dm",
    pattern_family: "oauth_consent",
    difficulty: 3,
    ground_truth: "scam",
    context: "job_seeker",
    ai_amplified: true,
    message: {
      from_name: "TalentLink Recruiting",
      from_handle: "@talentlink_recruiting_bot",
      subject: null,
      body: "Hi! We reviewed your profile and think you'd be a great fit for a Senior Analyst role. To move forward, our ATS needs read-only access to your TalentLink profile. Just click this link to authorize: talentlink-ats-verify.com/auth. Takes 30 seconds — no password shared."
    },
    red_flags: [
      { id: "lookalike_domain", label: "Lookalike domain (talentlink-ats-verify.com)" },
      { id: "unsolicited_oauth_via_dm", label: "OAuth request arriving via unsolicited DM" },
      { id: "no_password_reassurance", label: "'No password shared' is technically true but misleading" }
    ],
    correct_red_flag_ids: ["lookalike_domain", "unsolicited_oauth_via_dm", "no_password_reassurance"],
    explanation: {
      short: "Legitimate recruiters and ATS tools link out from within TalentLink — they don't send OAuth requests via cold DMs.",
      tells: [
        "'talentlink-ats-verify.com' is not talentlink.com",
        "Real ATS integrations are configured from within the platform's settings or employer dashboard",
        "'No password shared' is technically true for OAuth but it still grants real access to your profile data",
        "A cold DM promising a job in exchange for authorization is a classic social engineering setup"
      ],
      safe_move: "Check your TalentLink job applications through the platform directly. Legitimate employers communicate through official TalentLink messaging.",
      consequence: "Authorizing grants the attacker's app access to your profile, resume, and contact details. Your data is scraped for identity fraud or sold to other scammers.",
      behavioral_reinforcement: BR
    },
    tags: ["phishing", "oauth", "job_seeker", "social_engineering", "ai_amplified"]
  },
  {
    id: "email_oauth_scam_002",
    channel: "email",
    pattern_family: "oauth_consent",
    difficulty: 4,
    ground_truth: "scam",
    context: "personal",
    ai_amplified: true,
    message: {
      from_name: "Orbit Tech Account Security",
      from_handle: "no-reply@orbittech-secure.net",
      subject: "New sign-in detected — verify it was you",
      body: "Hi,\n\nWe detected a sign-in to your Orbit Tech account from a new device (Windows, Chicago IL).\n\nIf this was you, no action needed. If this wasn't you, secure your account immediately by revoking access to any new applications:\n\n[Secure My Account Now]\n\nThis link will also help confirm that your trusted devices retain access.\n\nOrbit Tech Security"
    },
    red_flags: [
      { id: "lookalike_domain", label: "Lookalike sender domain (orbittech-secure.net)" },
      { id: "fear_lure", label: "Unauthorized login fear used as lure" },
      { id: "click_to_secure_link", label: "Link to 'secure account' goes to attacker's domain" }
    ],
    correct_red_flag_ids: ["lookalike_domain", "fear_lure", "click_to_secure_link"],
    explanation: {
      short: "Fear of an unauthorized login is used to make you click 'secure my account' — which itself initiates an OAuth grant.",
      tells: [
        "'orbittech-secure.net' is not orbittech.com",
        "The 'new device' detail adds urgency and specificity to seem more legitimate",
        "Real new-device notifications from Orbit Tech link to orbittech.com, not third-party domains",
        "'Secure My Account Now' initiates an OAuth flow that grants the attacker app access, not a revocation"
      ],
      safe_move: "Go directly to orbittech.com → Security → Activity. If no suspicious login appears, the email was fake.",
      consequence: "Clicking 'Secure My Account' redirects to a fake OAuth consent screen. Approving it grants the attacker access to your account. The 'security' action is itself the attack.",
      behavioral_reinforcement: BR
    },
    tags: ["phishing", "oauth", "fear_lure", "impersonation", "ai_amplified"]
  },
  {
    id: "dm_oauth_scam_002",
    channel: "dm",
    pattern_family: "oauth_consent",
    difficulty: 3,
    ground_truth: "scam",
    context: "small_business",
    ai_amplified: true,
    message: {
      from_name: "Arkade Business",
      from_handle: "@arkade_business_hub",
      subject: null,
      body: "Hi! Someone from your team shared an Arkade workspace with you. To join and collaborate, you'll need to grant Arkade access to your Orbit Tech account. Click here to authorize: arkade-workspace-connect.com/auth. It only takes a second!"
    },
    red_flags: [
      { id: "lookalike_domain", label: "Lookalike domain (arkade-workspace-connect.com)" },
      { id: "social_proof_bait", label: "'Your teammate shared this' to add legitimacy" },
      { id: "cross_service_oauth", label: "App requesting access to a different service (Orbit Tech)" }
    ],
    correct_red_flag_ids: ["lookalike_domain", "social_proof_bait", "cross_service_oauth"],
    explanation: {
      short: "Real Arkade workspace invitations arrive in your email from arkade.io — not as DMs from unverified accounts.",
      tells: [
        "'arkade-workspace-connect.com' is not arkade.io",
        "The 'someone from your team shared this' claim creates social legitimacy you can't verify",
        "Real cross-service OAuth from legitimate apps is initiated inside the application itself, not via external DM",
        "Granting Orbit Tech access to an unvetted app exposes email, calendar, and contacts"
      ],
      safe_move: "Contact the supposed teammate directly to confirm they sent an invite. Then join Arkade via arkade.io directly.",
      consequence: "Authorizing the app via this link grants the attacker full Orbit Tech account access. They can read your business email, access shared files, and impersonate you.",
      behavioral_reinforcement: BR
    },
    tags: ["phishing", "oauth", "social_engineering", "small_business", "ai_amplified"]
  },
  {
    id: "email_oauth_scam_003",
    channel: "email",
    pattern_family: "oauth_consent",
    difficulty: 4,
    ground_truth: "scam",
    context: "small_business",
    ai_amplified: false,
    message: {
      from_name: "IT Department",
      from_handle: "it-support@company-it-helpdesk.net",
      subject: "Required: Authorize new security compliance app by EOD",
      body: "Hi Team,\n\nAs part of our security compliance upgrade, all employees must authorize the 'ComplianceGuard Pro' app to access your Pinnacle 365 account by end of business today.\n\nClick here to authorize: company-it-helpdesk.net/compliance-auth\n\nThis is required for continued access to company resources. Contact IT with questions.\n\nIT Support"
    },
    red_flags: [
      { id: "lookalike_domain", label: "Lookalike sender domain (not company's real domain)" },
      { id: "mandatory_oauth_by_deadline", label: "Mandatory OAuth authorization with EOD deadline" },
      { id: "access_threat", label: "Threat of losing access to company resources" }
    ],
    correct_red_flag_ids: ["lookalike_domain", "mandatory_oauth_by_deadline", "access_threat"],
    explanation: {
      short: "Real IT compliance deployments come from your company's verified IT communication channels — not from unknown domains.",
      tells: [
        "Sender domain 'company-it-helpdesk.net' is not your company's real domain",
        "Real IT app deployments are pushed through your company's device management — employees don't authorize them manually via email link",
        "'Required by EOD or lose access' is urgency pressure designed to prevent verification",
        "Calling the IT department directly (from a known internal number) would confirm this is fake"
      ],
      safe_move: "Call IT directly using the number from your company's internal directory — not the number in this email. Confirm before clicking any link.",
      consequence: "Authorizing grants the attacker's app access to your Pinnacle 365 account including company email, SharePoint files, and Teams messages. This is how many business email compromise attacks start.",
      behavioral_reinforcement: BR
    },
    tags: ["phishing", "oauth", "business_email_compromise", "impersonation", "urgency"]
  },
  {
    id: "dm_oauth_scam_003",
    channel: "dm",
    pattern_family: "oauth_consent",
    difficulty: 2,
    ground_truth: "scam",
    context: "personal",
    ai_amplified: false,
    message: {
      from_name: "SocialHub Contests",
      from_handle: "@socialhub_contests_official",
      subject: null,
      body: "Congrats! 🎉 You've been selected for a $500 SocialHub gift card giveaway. To claim, sign in with your Orbit Tech account to verify your identity: contest-verify-claim.com/oauth. Offer expires in 2 hours."
    },
    red_flags: [
      { id: "too_good_prize", label: "Unexpected prize/giveaway claim" },
      { id: "lookalike_domain", label: "Lookalike domain (contest-verify-claim.com)" },
      { id: "urgency_2hr", label: "2-hour expiry pressure" },
      { id: "sign_in_to_claim", label: "'Sign in with Orbit Tech' to claim prize" }
    ],
    correct_red_flag_ids: ["too_good_prize", "lookalike_domain", "urgency_2hr", "sign_in_to_claim"],
    explanation: {
      short: "Prize claims that require you to 'sign in with' a major account are credential or OAuth phishing, not contests.",
      tells: [
        "'contest-verify-claim.com' is not SocialHub's domain",
        "Legitimate contests don't require authorizing third-party Orbit Tech app access to claim",
        "The 2-hour deadline stops you from verifying the contest is real",
        "Signing in via this link either harvests your Orbit Tech password directly or grants the attacker's app OAuth access"
      ],
      safe_move: "Search for the contest on SocialHub's official account. Real giveaways are publicly posted and verified.",
      consequence: "Entering your Orbit Tech credentials on the fake page hands them to the attacker. If you authorize via OAuth, they gain access to everything in your account.",
      behavioral_reinforcement: BR
    },
    tags: ["phishing", "oauth", "prize_lure", "urgency", "impersonation"]
  },
  {
    id: "sms_oauth_scam_001",
    channel: "sms",
    pattern_family: "oauth_consent",
    difficulty: 3,
    ground_truth: "scam",
    context: "small_business",
    ai_amplified: false,
    message: {
      from_name: "Pinnacle Software",
      from_handle: "+1 (617) 555-0189",
      subject: null,
      body: "ALERT: Your Pinnacle 365 session expired. Re-verify your identity to restore access: pinnacle-365-auth.net/verify. Failure to verify within 1 hr will lock your account."
    },
    red_flags: [
      { id: "lookalike_domain", label: "Lookalike domain (pinnacle-365-auth.net)" },
      { id: "sms_from_phone_not_shortcode", label: "Pinnacle sends alerts via email, not random numbers" },
      { id: "urgency_1hr", label: "1-hour account lock threat" }
    ],
    correct_red_flag_ids: ["lookalike_domain", "sms_from_phone_not_shortcode", "urgency_1hr"],
    explanation: {
      short: "Pinnacle Software communicates via registered email addresses — not from random phone numbers with lookalike domains.",
      tells: [
        "'pinnacle-365-auth.net' is not Pinnacle Software's domain",
        "Pinnacle doesn't send authentication alerts via SMS from 10-digit numbers",
        "1-hour lock threats are pure pressure to prevent verification",
        "Real expired session notices appear when you try to use the app itself"
      ],
      safe_move: "Open Pinnacle 365 directly. If your session is genuinely expired, it will prompt you to log in within the app.",
      consequence: "The link leads to a fake Pinnacle 365 login page. Entering your credentials gives the attacker access to your entire Microsoft-equivalent account and all your files.",
      behavioral_reinforcement: BR
    },
    tags: ["phishing", "credential_theft", "impersonation", "urgency", "small_business"]
  },
  {
    id: "email_oauth_scam_004",
    channel: "email",
    pattern_family: "oauth_consent",
    difficulty: 4,
    ground_truth: "scam",
    context: "job_seeker",
    ai_amplified: true,
    message: {
      from_name: "TalentLink Recruiter Tools",
      from_handle: "recruiter@talentlink-pro-connect.com",
      subject: "Connect your TalentLink profile for automatic submission",
      body: "Hi,\n\nThank you for your application to Meridian Consulting. To process your application, our recruitment platform needs read access to your TalentLink profile.\n\nThis will allow us to:\n- Automatically pull your work history\n- Submit your profile to the hiring manager\n- Send you real-time interview updates\n\nAuthorize here: talentlink-pro-connect.com/authorize\n\nThis is a one-time step used by all Meridian candidates.\n\nMeridian Recruiting"
    },
    red_flags: [
      { id: "lookalike_domain", label: "Lookalike domain (talentlink-pro-connect.com)" },
      { id: "unsolicited_oauth_request", label: "OAuth request you didn't initiate from the platform" },
      { id: "broad_data_access", label: "Requesting work history and profile data via third party" }
    ],
    correct_red_flag_ids: ["lookalike_domain", "unsolicited_oauth_request", "broad_data_access"],
    explanation: {
      short: "Real recruiters access the profile data you've already made available on TalentLink — they don't need you to authorize a separate app.",
      tells: [
        "'talentlink-pro-connect.com' is not talentlink.com",
        "Legitimate recruiters view your TalentLink profile directly — they don't need a separate OAuth grant",
        "The detailed benefit list ('real-time interview updates') is social engineering designed to make the request feel routine",
        "If 'Meridian Consulting' is real, their job posting on TalentLink would confirm their official contact details"
      ],
      safe_move: "Go to your TalentLink messages directly to find any real communication from Meridian Consulting. Don't click this link.",
      consequence: "Authorizing grants the attacker read access to your TalentLink profile including your contact info, work history, and any private data. This is also used to impersonate job seekers in identity fraud.",
      behavioral_reinforcement: BR
    },
    tags: ["phishing", "oauth", "job_seeker", "social_engineering", "ai_amplified"]
  },
  {
    id: "dm_oauth_scam_004",
    channel: "dm",
    pattern_family: "oauth_consent",
    difficulty: 2,
    ground_truth: "scam",
    context: "personal",
    ai_amplified: false,
    message: {
      from_name: "StreamVault Exclusive",
      from_handle: "@streamvault_exclusives",
      subject: null,
      body: "Hi! Exclusive members can unlock ad-free content with one step — just authenticate with your Orbit Tech account so we can verify your subscription. Click: streamvault-exclusive-verify.com/auth. Free and instant."
    },
    red_flags: [
      { id: "lookalike_domain", label: "Lookalike domain (streamvault-exclusive-verify.com)" },
      { id: "unsolicited_verification", label: "Verification you never requested" },
      { id: "unrelated_service_oauth", label: "StreamVault asking for Orbit Tech credentials" }
    ],
    correct_red_flag_ids: ["lookalike_domain", "unsolicited_verification", "unrelated_service_oauth"],
    explanation: {
      short: "StreamVault manages subscriptions through its own login — it has no reason to request your Orbit Tech account access.",
      tells: [
        "'streamvault-exclusive-verify.com' is not streamvault.com",
        "StreamVault verifies your subscription through your StreamVault account, not your Orbit Tech",
        "Any 'ad-free' or 'exclusive' perk that requires authorizing a separate app is a social engineering hook",
        "You never initiated this request — it arrived out of nowhere via DM"
      ],
      safe_move: "Log in to StreamVault directly. Legitimate subscription perks are managed in your account settings.",
      consequence: "The 'authenticate' link is an OAuth phishing page that grants the attacker access to your Orbit Tech account: email, contacts, Drive — not just StreamVault.",
      behavioral_reinforcement: BR
    },
    tags: ["phishing", "oauth", "prize_lure", "impersonation"]
  },
  {
    id: "email_oauth_scam_005",
    channel: "email",
    pattern_family: "oauth_consent",
    difficulty: 3,
    ground_truth: "scam",
    context: "personal",
    ai_amplified: true,
    message: {
      from_name: "CloudDrive Storage Team",
      from_handle: "storage@clouddrive-migration.net",
      subject: "Your CloudDrive storage is 97% full — migrate your files now",
      body: "Hi,\n\nYour CloudDrive account is nearly full (47.2 GB of 50 GB used). To prevent file loss and continue syncing, you need to migrate your existing files to our new CloudDrive Pro infrastructure.\n\nAuthorize the migration assistant:\n[Start Migration]\n\nThis process takes 2 minutes and requires read/write access to your CloudDrive files.\n\nCloudDrive Storage Team"
    },
    red_flags: [
      { id: "lookalike_domain", label: "Lookalike sender domain (clouddrive-migration.net)" },
      { id: "file_loss_threat", label: "Threat of file loss to create urgency" },
      { id: "read_write_access_request", label: "Requesting read/write access to your files" }
    ],
    correct_red_flag_ids: ["lookalike_domain", "file_loss_threat", "read_write_access_request"],
    explanation: {
      short: "CloudDrive handles storage upgrades and migrations within its own app — not via emailed OAuth authorization links.",
      tells: [
        "'clouddrive-migration.net' is not CloudDrive's real domain",
        "Real 'storage full' warnings appear inside the CloudDrive app itself, not from external migration services",
        "Legitimate storage upgrades don't require you to grant a 'migration assistant' read/write OAuth access",
        "File loss threat is emotional urgency designed to prevent you from verifying"
      ],
      safe_move: "Log in to CloudDrive directly to check your actual storage. Real migration options are within your account settings.",
      consequence: "Authorizing the 'migration assistant' grants full read/write access to all your stored files. The attacker can exfiltrate sensitive documents and then delete them.",
      behavioral_reinforcement: BR
    },
    tags: ["phishing", "oauth", "fear_lure", "impersonation", "ai_amplified"]
  },
  {
    id: "dm_oauth_scam_005",
    channel: "dm",
    pattern_family: "oauth_consent",
    difficulty: 3,
    ground_truth: "scam",
    context: "personal",
    ai_amplified: false,
    message: {
      from_name: "PixelPlay Support",
      from_handle: "@pixelplay_support_bot",
      subject: null,
      body: "Hi, your PixelPlay account has been flagged for unusual activity. To verify ownership and avoid suspension, you must re-authorize your account here within 24 hours: pixelplay-verify.net/auth"
    },
    red_flags: [
      { id: "lookalike_domain", label: "Lookalike domain (pixelplay-verify.net)" },
      { id: "account_flagged_threat", label: "Account flagged / suspension threat" },
      { id: "urgency_24hr", label: "24-hour re-authorization deadline" }
    ],
    correct_red_flag_ids: ["lookalike_domain", "account_flagged_threat", "urgency_24hr"],
    explanation: {
      short: "Real PixelPlay account issues are handled through your account settings at PixelPlay's official website — not via DM links.",
      tells: [
        "'pixelplay-verify.net' is not PixelPlay's domain",
        "Real platform security actions require you to log into the platform directly — they don't send DM links",
        "The 24-hour urgency prevents you from verifying through the official site first",
        "Unauthorized DMs from 'support' accounts on social platforms are almost always scams"
      ],
      safe_move: "Log in to PixelPlay directly and check your account status. If there's a real issue, it will be visible in your account settings.",
      consequence: "The 're-authorize' link is an OAuth phishing page. Approving it grants the attacker access to your linked accounts, game library, and stored payment method.",
      behavioral_reinforcement: BR
    },
    tags: ["phishing", "oauth", "impersonation", "urgency"]
  },
  {
    id: "email_oauth_scam_006",
    channel: "email",
    pattern_family: "oauth_consent",
    difficulty: 3,
    ground_truth: "scam",
    context: "personal",
    ai_amplified: false,
    message: {
      from_name: "SocialHub",
      from_handle: "accounts@socialhub-mail.net",
      subject: "Your SocialHub account needs reauthorization",
      body: "Hi,\n\nSocialHub recently updated its security infrastructure. All accounts must reauthorize connected apps to continue receiving notifications.\n\nClick below to reauthorize your account within 48 hours:\n[Reauthorize Now]\n\nIf you don't reauthorize, your account may be restricted.\n\nSocialHub Security"
    },
    red_flags: [
      { id: "lookalike_domain", label: "Lookalike sender domain (socialhub-mail.net)" },
      { id: "vague_infrastructure_reason", label: "Vague 'infrastructure update' justification" },
      { id: "urgency_48hr_restriction", label: "48-hour restriction threat" }
    ],
    correct_red_flag_ids: ["lookalike_domain", "vague_infrastructure_reason", "urgency_48hr_restriction"],
    explanation: {
      short: "SocialHub's real emails come from socialhub.com — 'socialhub-mail.net' is a phishing domain.",
      tells: [
        "'socialhub-mail.net' is not socialhub.com — extra domain suffix signals a fake",
        "Real platform infrastructure updates don't require users to manually re-authorize via emailed links",
        "The 48-hour threat is pressure to prevent verification",
        "Connected app settings are managed from within your SocialHub account settings, not via email links"
      ],
      safe_move: "Log in to SocialHub directly and check Settings → Security → Apps. No reauthorization will be required there.",
      consequence: "The 'Reauthorize Now' link leads to a fake SocialHub login page. Your credentials are stolen and the account is taken over.",
      behavioral_reinforcement: BR
    },
    tags: ["phishing", "credential_theft", "impersonation", "urgency"]
  },
  {
    id: "sms_oauth_scam_002",
    channel: "sms",
    pattern_family: "oauth_consent",
    difficulty: 3,
    ground_truth: "scam",
    context: "personal",
    ai_amplified: false,
    message: {
      from_name: "Orbit Tech",
      from_handle: "+1 (206) 555-0177",
      subject: null,
      body: "Orbit Tech: Access to your account was denied from a new device. Re-authorize your account to restore full access: orbit-account-restore.com/auth. Code expires in 30 min."
    },
    red_flags: [
      { id: "lookalike_domain", label: "Lookalike domain (orbit-account-restore.com)" },
      { id: "sms_from_phone_not_shortcode", label: "Orbit Tech sends alerts via email, not random phone numbers" },
      { id: "urgency_30min", label: "30-minute expiry" },
      { id: "fear_of_lockout", label: "Fear of account access loss used as lure" }
    ],
    correct_red_flag_ids: ["lookalike_domain", "sms_from_phone_not_shortcode", "fear_of_lockout"],
    explanation: {
      short: "Orbit Tech sends account security alerts to your registered email — not via SMS from random phone numbers.",
      tells: [
        "'orbit-account-restore.com' is not Orbit Tech's domain",
        "Real Orbit Tech security notifications go to your registered email address, not SMS",
        "The 30-minute expiry is urgency pressure to bypass verification",
        "If you were actually denied access, trying to log in to orbittech.com would show you that directly"
      ],
      safe_move: "Try logging in to orbittech.com directly. If access is fine, this text was fake. If there's a real issue, the platform will guide you.",
      consequence: "The link leads to a fake Orbit Tech OAuth/login page. Your credentials are stolen and used to access your account and any services linked to it.",
      behavioral_reinforcement: BR
    },
    tags: ["phishing", "oauth", "fear_lure", "impersonation", "urgency"]
  },

  // ─── OAUTH_CONSENT LEGIT (7) ─────────────────────────────────────────────
  {
    id: "email_oauth_legit_001",
    channel: "email",
    pattern_family: "oauth_consent",
    difficulty: 2,
    ground_truth: "legit",
    context: "personal",
    ai_amplified: false,
    message: {
      from_name: "Orbit Tech",
      from_handle: "no-reply@orbittech.com",
      subject: "PixelCanvas was just authorized on your Orbit Tech account",
      body: "Hi,\n\nPixelCanvas was authorized to access your Orbit Tech account on Feb 14 at 3:22 PM.\n\nPermissions granted: View your email address\n\nIf you authorized this: no action needed.\nIf you didn't authorize this: revoke access immediately at orbittech.com/security\n\nOrbit Tech"
    },
    red_flags: [
      { id: "app_access_notification", label: "App access notification email" },
      { id: "contains_link", label: "Contains a link" }
    ],
    correct_red_flag_ids: [],
    explanation: {
      short: "This is a legitimate post-authorization notification from Orbit Tech — it confirms what was granted and tells you how to revoke if needed.",
      tells: [
        "Sender is no-reply@orbittech.com — the real domain",
        "Specifically names the app (PixelCanvas), date/time, and limited permission scope",
        "Tells you to revoke if you didn't authorize it — the safe action is clearly stated",
        "No action required, no credentials requested"
      ],
      safe_move: "If you authorized PixelCanvas, this is expected. If not, follow the revoke link at orbittech.com/security.",
      consequence: "This is legitimate. It confirms a real OAuth event and tells you how to undo it if needed.",
      behavioral_reinforcement: BR
    },
    tags: ["legitimate", "oauth_notification", "email"]
  },
  {
    id: "dm_oauth_legit_001",
    channel: "dm",
    pattern_family: "oauth_consent",
    difficulty: 3,
    ground_truth: "legit",
    context: "job_seeker",
    ai_amplified: false,
    message: {
      from_name: "TalentLink Jobs",
      from_handle: "@talentlink",
      subject: null,
      body: "Hi! You started an application for the Data Analyst role at Crestline Analytics. To continue, their ATS (HireFlow) needs to access your TalentLink profile. You'll see a TalentLink permission prompt — it only reads your name, headline, and resume. Initiated from your application."
    },
    red_flags: [
      { id: "oauth_request_in_application", label: "OAuth request as part of job application" },
      { id: "dm_from_platform", label: "DM from the official platform account" }
    ],
    correct_red_flag_ids: [],
    explanation: {
      short: "A TalentLink-initiated OAuth request during an active application is a standard part of many ATS integrations.",
      tells: [
        "The DM is from @talentlink — the official platform account you're already using",
        "The request references a specific application you initiated (Data Analyst at Crestline Analytics)",
        "The permission scope is narrow and specific: name, headline, and resume only",
        "The OAuth prompt will appear on TalentLink's own domain, not an external site"
      ],
      safe_move: "Proceed with authorizing via TalentLink's own consent screen. Verify the permissions match what's described.",
      consequence: "This is a legitimate ATS integration. Authorizing is a normal part of completing the application.",
      behavioral_reinforcement: BR
    },
    tags: ["legitimate", "oauth", "job_seeker", "ats_integration"]
  },
  {
    id: "email_oauth_legit_002",
    channel: "email",
    pattern_family: "oauth_consent",
    difficulty: 2,
    ground_truth: "legit",
    context: "personal",
    ai_amplified: false,
    message: {
      from_name: "Orbit Tech",
      from_handle: "no-reply@orbittech.com",
      subject: "New app connected to your account",
      body: "Hi Sam,\n\nA new app called 'Arkade' was connected to your Orbit Tech account.\n\nPermissions: View your basic profile information\nDate: Feb 14, 2026, 11:04 AM\n\nDidn't authorize this? Disconnect it at orbittech.com/security\n\nOrbit Tech Team"
    },
    red_flags: [
      { id: "app_connection_email", label: "Email about new app connected" },
      { id: "link_to_settings", label: "Contains a settings link" }
    ],
    correct_red_flag_ids: [],
    explanation: {
      short: "A standard post-OAuth notification from Orbit Tech's real domain — confirms what connected, and how to revoke if needed.",
      tells: [
        "Sender is no-reply@orbittech.com — the official domain",
        "Named recipient with specific app name, permission scope, and timestamp",
        "Clearly explains how to disconnect if the user didn't authorize it",
        "No urgent action required, no credentials requested"
      ],
      safe_move: "If you connected Arkade, this is expected. If not, visit orbittech.com/security to disconnect it.",
      consequence: "This is legitimate. Standard OAuth security notification.",
      behavioral_reinforcement: BR
    },
    tags: ["legitimate", "oauth_notification", "email"]
  },
  {
    id: "email_oauth_legit_003",
    channel: "email",
    pattern_family: "oauth_consent",
    difficulty: 4,
    ground_truth: "legit",
    context: "small_business",
    ai_amplified: false,
    message: {
      from_name: "Pinnacle Software",
      from_handle: "noreply@pinnaclesoftware.com",
      subject: "App consent required: ComplianceTrack integration",
      body: "Hi,\n\nYour IT administrator has configured a ComplianceTrack integration for your organization's Pinnacle 365 account. Your personal consent is required to complete setup.\n\nPermissions requested: Read your Pinnacle 365 calendar and view your display name.\n\nReview and consent at: pinnaclesoftware.com/apps/consent\n\nIf you have questions, contact your IT administrator.\n\nPinnacle Software"
    },
    red_flags: [
      { id: "it_admin_consent_request", label: "IT admin-initiated OAuth consent" },
      { id: "permissions_listed", label: "Permissions explicitly listed" },
      { id: "contains_link", label: "Contains a link" }
    ],
    correct_red_flag_ids: [],
    explanation: {
      short: "A legitimate admin-initiated app consent from Pinnacle's real domain — permissions are specific, and your IT team can confirm they configured it.",
      tells: [
        "Sender is noreply@pinnaclesoftware.com — the real domain",
        "Explicitly lists narrow permissions: calendar and display name only",
        "Refers to an IT admin action you can verify by contacting IT directly",
        "Consent link goes to pinnaclesoftware.com itself, not a third-party domain"
      ],
      safe_move: "Verify with your IT department that they did set up a ComplianceTrack integration. If confirmed, proceed via pinnaclesoftware.com.",
      consequence: "Legitimate IT integration. Verify with IT, then consent if confirmed.",
      behavioral_reinforcement: BR
    },
    tags: ["legitimate", "oauth", "it_admin", "small_business"]
  },
  {
    id: "dm_oauth_legit_002",
    channel: "dm",
    pattern_family: "oauth_consent",
    difficulty: 3,
    ground_truth: "legit",
    context: "personal",
    ai_amplified: false,
    message: {
      from_name: "PixelCanvas",
      from_handle: "@pixelcanvas",
      subject: null,
      body: "Welcome to PixelCanvas! To get started, connect your Orbit Tech account so we can import your profile photo and display name. You'll be redirected to Orbit Tech's consent screen — PixelCanvas never sees your password."
    },
    red_flags: [
      { id: "oauth_request_from_service", label: "App requesting Orbit Tech account access" },
      { id: "dm_from_service", label: "Message from the service you're signing up for" }
    ],
    correct_red_flag_ids: [],
    explanation: {
      short: "A standard 'sign in with Orbit Tech' onboarding step — you'll see the actual Orbit Tech consent screen before authorizing anything.",
      tells: [
        "The DM is from @pixelcanvas — the service you're in the process of using",
        "The request is for profile photo and display name only — narrow, expected permissions",
        "You'll be sent to Orbit Tech's own domain to authorize — you can verify this in the browser URL bar",
        "'PixelCanvas never sees your password' is technically accurate for real OAuth"
      ],
      safe_move: "Proceed. Verify the Orbit Tech consent screen URL is orbittech.com before clicking Allow.",
      consequence: "This is a standard sign-in-with-OAuth flow. The authorization happens on Orbit Tech's own servers.",
      behavioral_reinforcement: BR
    },
    tags: ["legitimate", "oauth", "onboarding", "social_login"]
  },
  {
    id: "email_oauth_legit_004",
    channel: "email",
    pattern_family: "oauth_consent",
    difficulty: 3,
    ground_truth: "legit",
    context: "personal",
    ai_amplified: false,
    message: {
      from_name: "Orbit Tech",
      from_handle: "no-reply@orbittech.com",
      subject: "CloudDrive is requesting offline access to your files",
      body: "Hi,\n\nCloudDrive has requested additional access to your Orbit Tech account:\n\n  NEW: Access your files when you're not using the app (offline access)\n\nYou previously authorized CloudDrive on Jan 3. This new permission lets it sync your files in the background.\n\nReview and approve at orbittech.com/security\n\nOrbit Tech"
    },
    red_flags: [
      { id: "permission_expansion_notice", label: "App requesting expanded permissions" },
      { id: "offline_access_request", label: "Offline access (background sync) permission" }
    ],
    correct_red_flag_ids: [],
    explanation: {
      short: "A legitimate permission expansion notice from Orbit Tech's real domain — referencing an app you already connected.",
      tells: [
        "Sender is no-reply@orbittech.com — the real domain",
        "References a prior authorization (Jan 3) that you can verify in your Orbit Tech security settings",
        "Explains clearly what the new permission does (background sync)",
        "Review link goes to orbittech.com/security — Orbit Tech's own domain"
      ],
      safe_move: "Review the permission request at orbittech.com/security. If background sync makes sense for how you use CloudDrive, approve it.",
      consequence: "This is a legitimate permission expansion notice. Review it and approve or deny based on your preference.",
      behavioral_reinforcement: BR
    },
    tags: ["legitimate", "oauth_notification", "permission_expansion"]
  },
  {
    id: "sms_oauth_legit_001",
    channel: "sms",
    pattern_family: "oauth_consent",
    difficulty: 2,
    ground_truth: "legit",
    context: "personal",
    ai_amplified: false,
    message: {
      from_name: "Orbit Tech",
      from_handle: "73825",
      subject: null,
      body: "Orbit Tech: 'TaskFlow' was just authorized on your account. If this wasn't you, revoke access: orbittech.com/security"
    },
    red_flags: [
      { id: "app_auth_notification", label: "App authorization notification via SMS" },
      { id: "contains_link", label: "Contains a URL" }
    ],
    correct_red_flag_ids: [],
    explanation: {
      short: "A real post-OAuth notification from Orbit Tech's short code — tells you what connected and how to revoke if needed.",
      tells: [
        "Short code 73825 is Orbit Tech's registered notification service",
        "Names the app ('TaskFlow') specifically — not vague",
        "Link points to orbittech.com/security — the real domain",
        "No credentials requested, no urgency — purely informational"
      ],
      safe_move: "If you connected TaskFlow, this is expected. If not, visit orbittech.com/security to revoke.",
      consequence: "Legitimate notification. Acts as a security confirmation of a real OAuth event.",
      behavioral_reinforcement: BR
    },
    tags: ["legitimate", "oauth_notification", "short_code"]
  }
];

const existing = JSON.parse(fs.readFileSync(drillsPath, "utf-8"));
const combined = [...existing, ...newDrills];
fs.writeFileSync(drillsPath, JSON.stringify(combined, null, 2));
console.log(`✅ Added ${newDrills.length} oauth_consent drills. Total: ${combined.length}`);
