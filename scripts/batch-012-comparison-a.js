const fs = require('fs');
const drills = JSON.parse(fs.readFileSync('data/drills.json', 'utf-8'));
const REAL_BRANDS = ['Amazon','Google','Apple','Microsoft','PayPal','Chase','Wells Fargo','Coinbase','Facebook','Instagram','Netflix','UPS','FedEx','DHL','Venmo','Zelle','Cash App','WhatsApp','Telegram','LinkedIn','Indeed','Twitter','Snapchat','TikTok'];

const newDrills = [
  // COMPARISON DRILLS — 30 pairs across multiple families
  {
    id: 'comp_email_phish_vs_legit_001', channel: 'email', pattern_family: 'credential_phishing', difficulty: 3, ground_truth: 'scam', ai_amplified: false, drill_type: 'comparison',
    framing: 'Two emails about your account. Which one is the scam?',
    messages: [
      { label: 'A', from_name: 'MailVault Security', from_handle: 'security@mailvault-login-alert.net', subject: 'Suspicious login detected — verify now', body: 'We detected a login from an unknown device. Click below immediately to verify your identity or your account will be locked.\n\n[Verify Account Now]\n\nMailVault Security Team' },
      { label: 'B', from_name: 'MailVault', from_handle: 'security@mailvault.com', subject: 'New sign-in to your account', body: 'A new sign-in was detected from Chicago, IL. If this was you, no action needed. If not, visit mailvault.com/security to review.\n\nMailVault Security' }
    ],
    scam_label: 'A',
    red_flags: [
      { id: 'lookalike_domain_a', label: 'A: mailvault-login-alert.net is not the real service domain' },
      { id: 'immediate_verify_or_locked', label: 'A: Verify immediately or be locked — creates panic' },
      { id: 'b_matches_real_domain', label: 'B: Uses the real service domain (mailvault.com)' },
      { id: 'b_no_action_needed', label: 'B: Says no action needed if it was you — no false urgency' }
    ],
    correct_red_flag_ids: ['lookalike_domain_a', 'immediate_verify_or_locked'],
    explanation: { short: 'A uses a lookalike domain and demands immediate action with a lock threat. B comes from the real domain and requires no action if you recognize the login.', tells: ['Lookalike domains with extra words are a primary phishing indicator', 'Legitimate security alerts say "no action needed" — phishing alerts create urgency', 'B directs you to the real service domain path, not an external link'], safe_move: 'B is legitimate — no action needed if you recognize the login. Ignore A and delete it.', consequence: 'Clicking A leads to a fake login page that captures your credentials.', behavioral_reinforcement: 'Legitimate security emails never demand immediate action under threat of lockout.' },
    tags: ['phishing', 'credential_harvest', 'comparison'], tricks: ['lookalike_domain', 'urgency', 'fear_lockout']
  },
  {
    id: 'comp_sms_bank_vs_legit_001', channel: 'sms', pattern_family: 'bank_fraud_alert', difficulty: 3, ground_truth: 'scam', ai_amplified: false, drill_type: 'comparison',
    framing: 'Two texts about a bank transaction. Which one is the scam?',
    messages: [
      { label: 'A', from_handle: '22799', from_name: null, body: 'TrustBank: Did you authorize a $312 charge at FuelMart? Reply YES or NO to confirm. Reply STOP to opt out.' },
      { label: 'B', from_handle: '+1 (877) 555-0143', from_name: 'TrustBank Alerts', body: 'ALERT: Your TrustBank account has been suspended due to fraud. Click trustbank-secure-hold.com NOW to restore access before 6pm.' }
    ],
    scam_label: 'B',
    red_flags: [
      { id: 'b_full_phone_number', label: 'B: Real bank fraud alerts come from short codes, not full phone numbers' },
      { id: 'b_lookalike_domain', label: 'B: trustbank-secure-hold.com is not the real bank website' },
      { id: 'b_same_day_deadline', label: 'B: Restore before 6pm creates panic pressure' },
      { id: 'a_short_code_sender', label: 'A: Short code (22799) is how real bank fraud texts arrive' }
    ],
    correct_red_flag_ids: ['b_full_phone_number', 'b_lookalike_domain', 'b_same_day_deadline'],
    explanation: { short: 'A is a legitimate fraud confirmation — short code sender, simple yes/no, no link. B is a scam — full phone number, lookalike domain, and a time-pressure threat.', tells: ['Bank fraud texts come from 5-6 digit short codes, never full phone numbers', 'Legitimate fraud alerts ask yes/no — they do not threaten suspension with a link', 'Lookalike bank domains are the defining feature of banking phishing'], safe_move: 'Respond to A as appropriate. Ignore and delete B — call the number on your card if you have concerns.', consequence: 'Clicking B captures your bank login credentials on a phishing page.', behavioral_reinforcement: 'Real bank alerts use short codes and ask yes/no questions — scam alerts use full numbers and links.' },
    tags: ['bank_fraud', 'smishing', 'comparison'], tricks: ['lookalike_domain', 'urgency', 'full_number_sender']
  },
  {
    id: 'comp_email_job_vs_legit_001', channel: 'email', pattern_family: 'job_seeker', difficulty: 3, ground_truth: 'scam', ai_amplified: false, drill_type: 'comparison',
    framing: 'Two emails about job opportunities. Which one is the scam?',
    messages: [
      { label: 'A', from_name: 'Meridian Creative Group', from_handle: 'talent@meridiancreative.com', subject: 'Interview Invitation — Marketing Coordinator', body: 'Thanks for applying. We\'d love to schedule a 30-minute phone screen. Please use the link to book a time.\n\nSamantha L., Talent Acquisition' },
      { label: 'B', from_name: 'Global Staffing Partners', from_handle: 'placement@global-staffing-partners.net', subject: 'Remote Position — $28/hr — Start Immediately', body: 'We reviewed your profile and have an immediate data entry role. No experience required. A $49 background check fee is required to proceed.\n\nGlobal Staffing Partners' }
    ],
    scam_label: 'B',
    red_flags: [
      { id: 'b_background_check_fee', label: 'B: Requires you to pay for a background check — employers pay this' },
      { id: 'b_no_experience_high_pay', label: 'B: Unrealistically high pay for zero experience remote work' },
      { id: 'a_responds_to_application', label: 'A: Responds to an application you submitted' },
      { id: 'a_only_asks_for_time', label: 'A: Only requests your time for an interview — no fees' }
    ],
    correct_red_flag_ids: ['b_background_check_fee', 'b_no_experience_high_pay'],
    explanation: { short: 'B requires a fee that employers always pay, and offers unrealistic pay for zero experience. A is a standard recruiter follow-up to a real application.', tells: ['Candidates never pay for background checks — employers absorb this cost', 'High-pay zero-experience remote work does not exist at legitimate companies', 'A responds to an actual application and only asks for your time'], safe_move: 'Proceed with A. Ignore and report B to the job site.', consequence: 'Paying B\'s fee results in no job and possible additional card charges.', behavioral_reinforcement: 'Any job that requires you to pay anything upfront is a scam.' },
    tags: ['job_scam', 'comparison', 'fee_harvesting'], tricks: ['advance_fee', 'fake_offer']
  },
  {
    id: 'comp_email_invoice_vs_legit_001', channel: 'email', pattern_family: 'invoice_vendor', difficulty: 4, ground_truth: 'scam', ai_amplified: false, drill_type: 'comparison',
    framing: 'Two invoice emails arrive in your work inbox on the same day. Which is the scam?',
    messages: [
      { label: 'A', from_name: 'Parkway Supply Co', from_handle: 'accounts@parkway-supply.com', subject: 'Invoice #PS-2244 — October Delivery', body: 'Please find Invoice #PS-2244 attached for your October supply order — $1,840. Payment due Nov 15 via check or ACH to our account on file.\n\nParkway Supply Accounts' },
      { label: 'B', from_name: 'Parkway Supply Co', from_handle: 'accounts@parkway-supply-billing.net', subject: 'Updated Banking Details — Action Required', body: 'Please update your records — our banking details have changed effective immediately. All payments should now be wired to the new account below. Previous account closes this week.\n\nParkway Supply Finance' }
    ],
    scam_label: 'B',
    red_flags: [
      { id: 'b_banking_change_by_email', label: 'B: Banking detail changes sent by email alone should always be verified by phone' },
      { id: 'b_lookalike_domain', label: 'B: parkway-supply-billing.net differs from the real vendor domain' },
      { id: 'b_immediate_effect', label: 'B: Effective immediately prevents verification before updating records' },
      { id: 'a_standard_invoice', label: 'A: Standard invoice with normal payment methods and matching domain' }
    ],
    correct_red_flag_ids: ['b_banking_change_by_email', 'b_lookalike_domain', 'b_immediate_effect'],
    explanation: { short: 'B is a business email compromise attempt — lookalike domain, banking redirect, immediate effect. A is a normal invoice from the real vendor domain.', tells: ['Banking changes emailed from a slightly different domain is a classic BEC pattern', 'Immediate effect prevents the call-to-verify that would expose the fraud', 'Call the vendor at a number from your own records to verify any banking change'], safe_move: 'Pay A normally. Call Parkway Supply at a number you already have to verify whether B is legitimate before changing any payment details.', consequence: 'Updating to B\'s account redirects your next payment to the scammer. Wire transfers are irreversible.', behavioral_reinforcement: 'Verify all banking detail changes by phone call to a number from your own records.' },
    tags: ['bec', 'invoice_scam', 'comparison'], tricks: ['banking_redirect', 'lookalike_domain', 'urgency']
  },
  {
    id: 'comp_sms_delivery_vs_legit_001', channel: 'sms', pattern_family: 'delivery_toll', difficulty: 2, ground_truth: 'scam', ai_amplified: false, drill_type: 'comparison',
    framing: 'You are expecting a package. Two texts arrive. Which one is the scam?',
    messages: [
      { label: 'A', from_handle: '48773', from_name: null, body: 'Your package is out for delivery today. Track at ShipTrack.com/track or reply with your 10-digit tracking number for updates. Reply STOP to opt out.' },
      { label: 'B', from_handle: '+1 (657) 555-0143', from_name: 'NexShip Delivery', body: 'NexShip: Package held — incomplete address. Pay $1.99 release fee at nexship-delivery-update.com/pay to receive today.' }
    ],
    scam_label: 'B',
    red_flags: [
      { id: 'b_fee_to_release', label: 'B: Carriers never charge fees to release a held package' },
      { id: 'b_full_phone_number', label: 'B: Real carrier alerts use short codes, not full phone numbers' },
      { id: 'b_lookalike_domain', label: 'B: nexship-delivery-update.com is not a real carrier site' },
      { id: 'a_short_code_no_fee', label: 'A: Short code, no fee, standard tracking instructions' }
    ],
    correct_red_flag_ids: ['b_fee_to_release', 'b_full_phone_number', 'b_lookalike_domain'],
    explanation: { short: 'A is a standard delivery alert — short code, no fees, track on the real site. B charges a fee to release your package, which carriers never do.', tells: ['No carrier charges a fee to release a package for address issues — they contact the sender', 'Real carrier texts use short codes', 'The small fee captures your card for larger unauthorized charges'], safe_move: 'Track via A as directed. Ignore B — if genuinely concerned about a package, track it on the carrier\'s real website.', consequence: 'Paying B\'s fee captures your card details and uses them for larger unauthorized charges.', behavioral_reinforcement: 'Carriers never charge fees to release packages — any text asking for one is a scam.' },
    tags: ['delivery_scam', 'smishing', 'comparison'], tricks: ['fee_harvesting', 'lookalike_domain']
  },
  {
    id: 'comp_email_reset_vs_legit_001', channel: 'email', pattern_family: 'credential_phishing', difficulty: 2, ground_truth: 'scam', ai_amplified: false, drill_type: 'comparison',
    framing: 'Two password reset emails. Which one is the scam?',
    messages: [
      { label: 'A', from_name: 'DataVault', from_handle: 'noreply@datavault-security-alerts.com', subject: 'Password Reset — Act Within 30 Minutes', body: 'A reset was requested. Click below. This link expires in 30 minutes. If you did NOT request this, still click to secure your account.\n\n[Reset Password]' },
      { label: 'B', from_name: 'MailVault', from_handle: 'noreply@mailvault.com', subject: 'Password reset requested', body: 'We received a request to reset your password. Click the link to set a new one.\n\n[Reset Password]\n\nThis link expires in 1 hour. If you did not request this, ignore this email — your password has not changed.' }
    ],
    scam_label: 'A',
    red_flags: [
      { id: 'a_click_even_if_not_you', label: 'A: Tells you to click even if you did not request the reset — dangerous' },
      { id: 'a_lookalike_domain', label: 'A: datavault-security-alerts.com is not a real service domain' },
      { id: 'b_ignore_if_not_you', label: 'B: Correctly tells you to ignore the email if you did not request it' },
      { id: 'b_real_domain', label: 'B: Comes from the real service domain (mailvault.com)' }
    ],
    correct_red_flag_ids: ['a_click_even_if_not_you', 'a_lookalike_domain'],
    explanation: { short: 'A tells you to click even if you did not request the reset — the opposite of what a real service would say. B correctly says to ignore if you did not request it.', tells: ['Real password reset emails say ignore if you did not request it — scam emails say click anyway', 'A\'s lookalike domain and 30-minute urgency are additional indicators', 'B follows the expected pattern for legitimate password resets'], safe_move: 'If you requested a reset, use B\'s link. Ignore A entirely.', consequence: 'Clicking A leads to a fake login page where your credentials are captured.', behavioral_reinforcement: 'If a password reset email tells you to click even if you didn\'t request it — that\'s always a scam.' },
    tags: ['phishing', 'credential_harvest', 'comparison'], tricks: ['urgency', 'lookalike_domain', 'reverse_psychology']
  },
  {
    id: 'comp_sms_gov_vs_legit_001', channel: 'sms', pattern_family: 'government_impersonation', difficulty: 3, ground_truth: 'scam', ai_amplified: false, drill_type: 'comparison',
    framing: 'Two texts about government accounts. Which one is the scam?',
    messages: [
      { label: 'A', from_handle: '77311', from_name: null, body: 'StateBenefits: Your biweekly certification is due Sunday. Log into benefits.state.gov to complete it. Reply STOP to opt out.' },
      { label: 'B', from_handle: '+1 (800) 555-0193', from_name: 'Benefits Office', body: 'ALERT: Your federal benefits account has been suspended. Call 1-888-555-0177 within 24 hours. Provide your member ID, date of birth, and last 4 SSN to restore access.' }
    ],
    scam_label: 'B',
    red_flags: [
      { id: 'b_pii_request_sms', label: 'B: Requests SSN digits, DOB, and member ID by text' },
      { id: 'b_full_number_sender', label: 'B: Government alerts use short codes, not full phone numbers' },
      { id: 'b_suspension_threat', label: 'B: Threatens account suspension to create panic' },
      { id: 'a_short_code_gov_domain', label: 'A: Short code and .gov domain — standard government text alert pattern' }
    ],
    correct_red_flag_ids: ['b_pii_request_sms', 'b_full_number_sender', 'b_suspension_threat'],
    explanation: { short: 'A is a legitimate government reminder — short code and .gov domain, no PII requested. B asks for SSN and personal details via text, which government agencies never do.', tells: ['Government agencies never request SSN or DOB via text message', 'Short codes are used by real government text programs', '.gov is the only legitimate domain for US government services'], safe_move: 'Respond to A by logging into the .gov site. Ignore B — if concerned about benefits, call the number on your benefits card.', consequence: 'Calling B connects you to a scammer who collects your personal details for identity theft.', behavioral_reinforcement: 'Government agencies never request SSN or personal details via text.' },
    tags: ['government_scam', 'smishing', 'comparison'], tricks: ['pii_harvest', 'fear_lockout', 'authority_impersonation']
  },
  {
    id: 'comp_email_charity_vs_legit_001', channel: 'email', pattern_family: 'charity_fraud', difficulty: 3, ground_truth: 'scam', ai_amplified: false, drill_type: 'comparison',
    framing: 'Two charity fundraising emails. Which one is the scam?',
    messages: [
      { label: 'A', from_name: 'Bright Hope Animal Rescue', from_handle: 'donate@brighthoperescue.org', subject: 'Help us care for 12 rescued dogs', body: 'Last week we rescued 12 dogs from a neglect case. They need vet care and we need your help. Your $25 covers one dog\'s first exam. Donate at brighthoperescue.org/give.\n\nWe are a 501(c)(3) org — EIN 47-1234567.' },
      { label: 'B', from_name: 'PawSafe Animal Relief', from_handle: 'rescue@pawsafe-animal-relief.org', subject: '47 dogs need surgery NOW', body: 'We rescued 47 dogs and are overwhelmed. A donor matches all gifts dollar-for-dollar until midnight. Without your $30 today, we may have to surrender them.\n\nDonate now — time is running out.' }
    ],
    scam_label: 'B',
    red_flags: [
      { id: 'b_no_ein_or_registration', label: 'B: No EIN, registration number, or verifiable nonprofit status provided' },
      { id: 'b_midnight_match', label: 'B: Midnight matching deadline is a fabricated urgency tactic' },
      { id: 'b_surrender_threat', label: 'B: Threatening to surrender animals is emotional manipulation' },
      { id: 'a_provides_ein', label: 'A: Provides EIN — verifiable nonprofit registration' }
    ],
    correct_red_flag_ids: ['b_no_ein_or_registration', 'b_midnight_match', 'b_surrender_threat'],
    explanation: { short: 'A provides a verifiable EIN and directs to a real domain. B has no registration info, a fake midnight deadline, and emotional pressure tactics.', tells: ['EIN and 501(c)(3) status are verifiable at irs.gov and Charity Navigator', 'Midnight matching deadlines are almost always fabricated', 'Surrender threats are emotional manipulation designed to override skepticism'], safe_move: 'Verify A\'s EIN at Charity Navigator or irs.gov before donating. Ignore B.', consequence: 'Donating to B enriches the scammer. No dogs are helped.', behavioral_reinforcement: 'Verify EIN and nonprofit status before donating to any animal rescue appeal.' },
    tags: ['charity_scam', 'comparison', 'animal_rescue_fraud'], tricks: ['emotional_appeal', 'fake_match', 'urgency']
  },
  {
    id: 'comp_email_prize_vs_legit_001', channel: 'email', pattern_family: 'prize_lottery', difficulty: 2, ground_truth: 'scam', ai_amplified: false, drill_type: 'comparison',
    framing: 'Two prize notification emails. Which one is the scam?',
    messages: [
      { label: 'A', from_name: 'Westside Community Center', from_handle: 'events@westsidecc.org', subject: 'Spring Fair Raffle Winner — Ticket #4412', body: 'Your ticket was drawn as a winner at Saturday\'s Spring Fair. You\'ve won a $50 restaurant card. Pick it up at our office (88 Park Ave) this week. Bring this email.\n\n(555) 204-3310' },
      { label: 'B', from_name: 'Winners Circle Foundation', from_handle: 'prizes@winners-circle-foundation.net', subject: 'You Have Won $10,000 — Claim Within 72 Hours', body: 'Your email was selected from 2.4 million entries. You\'ve won $10,000! Pay a $195 release fee to claim within 72 hours.\n\nwinners-claim.net/verify' }
    ],
    scam_label: 'B',
    red_flags: [
      { id: 'b_fee_to_claim_prize', label: 'B: Requires fee to claim prize — real prizes are free to receive' },
      { id: 'b_never_entered', label: 'B: You never entered any sweepstakes with 2.4 million entries' },
      { id: 'a_pick_up_in_person', label: 'A: Legitimate small prize requires in-person pickup — no fees' },
      { id: 'a_real_raffle_you_entered', label: 'A: References a raffle you actually participated in' }
    ],
    correct_red_flag_ids: ['b_fee_to_claim_prize', 'b_never_entered'],
    explanation: { short: 'A is a legitimate community raffle you entered — in-person pickup, no fees. B requires a fee for a prize you never entered, which is always a scam.', tells: ['Any prize requiring a fee is fraudulent', 'You cannot win a sweepstakes you never entered', 'Legitimate local prizes involve in-person pickup without fees'], safe_move: 'Pick up A\'s prize. Ignore B.', consequence: 'Paying B\'s $195 fee results in no prize. More fees follow.', behavioral_reinforcement: 'Real prizes never require fees — if you have to pay to claim, it\'s a scam.' },
    tags: ['prize_scam', 'comparison'], tricks: ['advance_fee', 'fake_prize']
  },
  {
    id: 'comp_sms_tech_vs_legit_001', channel: 'sms', pattern_family: 'tech_support', difficulty: 3, ground_truth: 'scam', ai_amplified: false, drill_type: 'comparison',
    framing: 'Two texts about your computer or device. Which one is the scam?',
    messages: [
      { label: 'A', from_handle: '55273', from_name: null, body: 'Your ShieldGuard antivirus definitions were updated successfully. You\'re protected. No action needed. Reply STOP to opt out.' },
      { label: 'B', from_handle: '+1 (855) 555-0167', from_name: 'NexCloud Security', body: 'CRITICAL: Malware detected on your device attempting to access your NexCloud account. Call 1-888-555-0122 immediately to remove it. Do not restart your computer.' }
    ],
    scam_label: 'B',
    red_flags: [
      { id: 'b_remote_scan_claim', label: 'B: NexCloud cannot scan your local device — this claim is false' },
      { id: 'b_dont_restart_control', label: 'B: Do not restart creates dependency and fear' },
      { id: 'b_callback_number', label: 'B: Calling the number connects you to a tech support scammer' },
      { id: 'a_no_action_needed', label: 'A: Standard update notification — no action needed, short code sender' }
    ],
    correct_red_flag_ids: ['b_remote_scan_claim', 'b_callback_number', 'b_dont_restart_control'],
    explanation: { short: 'A is a routine software update notification. B is a tech support scam — cloud services cannot scan your local device, and the callback leads to a scammer.', tells: ['Cloud services cannot detect local malware on your device', 'Do not restart is a manipulation tactic to maintain urgency and control', 'Calling the number results in a scammer requesting remote access to your computer'], safe_move: 'Ignore A (no action needed). Ignore and delete B — run your own antivirus if concerned.', consequence: 'Calling B grants the scammer remote access to your computer for theft, fraud, and malware installation.', behavioral_reinforcement: 'Cloud services cannot scan your local device — any text claiming they detected malware is a scam.' },
    tags: ['tech_support_scam', 'smishing', 'comparison'], tricks: ['fear_malware', 'callback_number', 'false_authority']
  },
  {
    id: 'comp_email_sub_vs_legit_001', channel: 'email', pattern_family: 'subscription_renewal', difficulty: 2, ground_truth: 'scam', ai_amplified: false, drill_type: 'comparison',
    framing: 'Two renewal emails arrive. Which one is the scam?',
    messages: [
      { label: 'A', from_name: 'KeySafe', from_handle: 'billing@keysafe.io', subject: 'Your KeySafe plan renews tomorrow — $35.88', body: 'Your annual KeySafe Premium plan renews tomorrow for $35.88. To update billing or cancel, visit keysafe.io/account/billing.\n\nKeySafe Billing' },
      { label: 'B', from_name: 'ShieldGuard Antivirus', from_handle: 'billing@shieldguard-renewal-center.com', subject: 'Your subscription renewed — $349.99 Charged', body: 'Your ShieldGuard subscription has been renewed for $349.99. If you did not authorize this, call 1-888-555-0148 to cancel and receive a full refund.\n\nOrder #: SG-2024-88012' }
    ],
    scam_label: 'B',
    red_flags: [
      { id: 'b_inflated_amount', label: 'B: $349.99 is inflated to create alarm and urgency to call' },
      { id: 'b_lookalike_domain', label: 'B: shieldguard-renewal-center.com is not the real software domain' },
      { id: 'b_callback_to_cancel', label: 'B: Calling the number connects you to a scammer, not the real company' },
      { id: 'a_expected_amount', label: 'A: Expected renewal amount from the real service domain' }
    ],
    correct_red_flag_ids: ['b_inflated_amount', 'b_lookalike_domain', 'b_callback_to_cancel'],
    explanation: { short: 'A is a standard renewal notice from the real domain. B is a fake charge notification designed to make you call a scammer.', tells: ['Check your actual card statement — B\'s $349.99 charge likely does not exist', 'Real software renewals come from the software\'s own domain', 'The callback number connects you to a scam operation that extracts remote access or banking details'], safe_move: 'Verify A by logging into keysafe.io. Check your actual bank statement before calling anyone about B.', consequence: 'Calling B\'s number leads to a scammer who requests remote access or banking details for your "refund."', behavioral_reinforcement: 'Check your actual card statement before acting on any unexpected renewal charge.' },
    tags: ['refund_scam', 'subscription_scam', 'comparison'], tricks: ['fake_charge', 'callback_number', 'lookalike_domain']
  },
  {
    id: 'comp_dm_marketplace_vs_legit_001', channel: 'dm', pattern_family: 'marketplace', difficulty: 3, ground_truth: 'scam', ai_amplified: false, drill_type: 'comparison',
    framing: 'You are selling your camera. Two buyers message you. Which message is from a scammer?',
    messages: [
      { label: 'A', from_handle: '@photo_buyer_kate', from_name: 'Kate M', body: 'Hi! Is the camera still available? I\'m local — could we meet somewhere public to look at it this weekend? I can bring cash.' },
      { label: 'B', from_handle: '@buyer_mark92', from_name: 'Mark B', body: 'Very interested! I\'m out of town but will pay full price + shipping. My cousin can pick it up and ship it. I\'ll send payment via QuickSend — may send a bit extra by accident, just return the difference.' }
    ],
    scam_label: 'B',
    red_flags: [
      { id: 'b_overpayment_setup', label: 'B: Extra by accident + return the difference is the overpayment scam' },
      { id: 'b_cannot_meet_in_person', label: 'B: Out of town with a cousin pickup — classic remote buyer pattern' },
      { id: 'b_payment_app_seller_risk', label: 'B: Payment app payment can be reversed after you\'ve forwarded the difference' },
      { id: 'a_local_cash_in_person', label: 'A: Local buyer, in person, cash — lowest risk transaction' }
    ],
    correct_red_flag_ids: ['b_overpayment_setup', 'b_cannot_meet_in_person'],
    explanation: { short: 'A is a straightforward local buyer — the safest transaction. B\'s overpayment-with-refund request is a classic fraud pattern.', tells: ['Overpayment + return the difference is always a scam, regardless of how natural it seems', 'Remote buyers who cannot meet in person are a red flag for marketplace transactions', 'Payment app funds can be reversed, leaving you liable for the amount you forwarded'], safe_move: 'Proceed with A — meet in a public place. Decline B immediately.', consequence: 'B sends payment app funds, you return the difference in cash, then B reverses the original payment. You lose the returned amount.', behavioral_reinforcement: 'Any buyer who overpays and asks for money back is running a scam.' },
    tags: ['marketplace_scam', 'comparison', 'overpayment_scam'], tricks: ['overpayment', 'remote_buyer']
  },
  {
    id: 'comp_email_rental_vs_legit_001', channel: 'email', pattern_family: 'rental_housing', difficulty: 3, ground_truth: 'scam', ai_amplified: false, drill_type: 'comparison',
    framing: 'You inquire about two apartment listings. Which response is from a scammer?',
    messages: [
      { label: 'A', from_handle: 'mark.dalton.rentals@gmail.com', from_name: 'Mark Dalton', body: 'Thanks for your interest! I\'m currently working overseas as a missionary. To hold the apartment, I need a $600 deposit via wire transfer. I\'ll mail you the keys once it clears.' },
      { label: 'B', from_handle: 'leasing@urban-apartments.com', from_name: 'Urban Apartments Leasing', body: 'Thanks for reaching out! The unit is available. We have showings Tuesday and Thursday this week — does either work for you? Deposit is due upon signing the lease.\n\nUrban Apartments Leasing Office, (555) 301-4477' }
    ],
    scam_label: 'A',
    red_flags: [
      { id: 'a_overseas_landlord', label: 'A: Overseas landlord cannot show the property — classic rental scam element' },
      { id: 'a_wire_before_viewing', label: 'A: Requires wire transfer deposit before any showing or lease' },
      { id: 'a_mail_keys_after_payment', label: 'A: Will mail keys after payment — no property viewing involved' },
      { id: 'b_showing_first', label: 'B: Offers showing before any payment — standard legitimate process' }
    ],
    correct_red_flag_ids: ['a_overseas_landlord', 'a_wire_before_viewing', 'a_mail_keys_after_payment'],
    explanation: { short: 'A follows the classic rental scam script: overseas landlord, wire deposit, mailed keys. B is a normal leasing office — showing first, deposit on lease signing.', tells: ['Legitimate landlords always offer showings before collecting deposits', 'Wire deposits before a showing are always fraudulent', 'Mailed keys in exchange for a wire transfer is impossible in any legitimate rental'], safe_move: 'Schedule a showing with B. Ignore A and report the listing.', consequence: 'You wire A\'s deposit and receive nothing. The property may not exist or belongs to someone else.', behavioral_reinforcement: 'Never pay a deposit without first seeing the property in person — period.' },
    tags: ['rental_scam', 'comparison', 'advance_fee'], tricks: ['overseas_landlord', 'advance_fee']
  },
  {
    id: 'comp_sms_otp_vs_legit_001', channel: 'sms', pattern_family: 'account_verification', difficulty: 3, ground_truth: 'scam', ai_amplified: false, drill_type: 'comparison',
    framing: 'Two texts involving verification codes. Which one is the scam?',
    messages: [
      { label: 'A', from_handle: '22799', from_name: null, body: 'TrustBank: Your one-time code is 847291. Never share this code with anyone. TrustBank will never call and ask for it.' },
      { label: 'B', from_handle: '+1 (415) 555-0198', from_name: 'TrustBank Support', body: 'TrustBank: We detected a login attempt. A code was sent to your phone. Reply with the code to confirm it was you and restore access.' }
    ],
    scam_label: 'B',
    red_flags: [
      { id: 'b_asks_you_to_share_code', label: 'B: Asks you to share the verification code — which is your security key' },
      { id: 'b_full_phone_number', label: 'B: Real bank alerts use short codes, not full phone numbers' },
      { id: 'b_scammer_triggered_code', label: 'B: The code being requested was triggered by the scammer\'s login attempt' },
      { id: 'a_explicitly_says_never_share', label: 'A: Explicitly instructs you to never share the code — correct behavior' }
    ],
    correct_red_flag_ids: ['b_asks_you_to_share_code', 'b_full_phone_number', 'b_scammer_triggered_code'],
    explanation: { short: 'A sends you a code with a warning never to share it — that is correct. B asks for the code — which means they triggered the login attempt to steal your account.', tells: ['Verification codes are security locks — whoever asks for yours is trying to break in', 'The code B wants was sent because someone tried to log into your account', 'Real banks never ask you to reply with verification codes', 'A\'s explicit "never share" instruction is standard — B\'s request for the code is the violation'], safe_move: 'Never share a code with anyone. B is a scammer who triggered the login — change your password immediately.', consequence: 'Sharing the code gives the scammer the key to log into your account and lock you out.', behavioral_reinforcement: 'A verification code is your security key — anyone asking for it is trying to break into your account.' },
    tags: ['account_takeover', 'smishing', 'comparison'], tricks: ['otp_theft', 'social_engineering']
  },
  {
    id: 'comp_email_romance_vs_legit_001', channel: 'email', pattern_family: 'romance_social', difficulty: 3, ground_truth: 'scam', ai_amplified: true, drill_type: 'comparison',
    framing: 'You have been emailing two people from a dating site. Which message is from a scammer?',
    messages: [
      { label: 'A', from_handle: 'david.chen.chicago@gmail.com', from_name: 'David C', body: 'Hey! I had a great time on our call Tuesday. Still thinking about that restaurant conversation. Would you want to grab coffee Saturday? There\'s a nice place near Wicker Park.' },
      { label: 'B', from_handle: 'col.james.harris.usa@gmail.com', from_name: 'James Harris', body: 'I feel so connected to you already. My leave was approved but the military account holding my savings is frozen until I return stateside. Would you be able to help with the $680 ticket home? I\'d repay you the moment I land.' }
    ],
    scam_label: 'B',
    red_flags: [
      { id: 'b_frozen_funds_story', label: 'B: Frozen military funds is a standard romance scam narrative' },
      { id: 'b_money_ask_before_meeting', label: 'B: Asks for money before any in-person meeting' },
      { id: 'b_repay_on_arrival_promise', label: 'B: Repayment on arrival — the arrival never happens' },
      { id: 'a_in_person_meeting', label: 'A: Proposes an in-person meeting — standard real relationship progression' }
    ],
    correct_red_flag_ids: ['b_frozen_funds_story', 'b_money_ask_before_meeting', 'b_repay_on_arrival_promise'],
    explanation: { short: 'A proposes a real in-person meeting — normal relationship progression. B asks for money before meeting and uses the frozen military funds script.', tells: ['Military romance scams follow a predictable script: soldier overseas, frozen account, needs ticket home', 'A genuine interest is demonstrated through plans to meet, not money requests', 'Repayment promises from people you have never met in person are not enforceable'], safe_move: 'Meet A in a public place. Do not send money to B — end contact.', consequence: 'Sending B\'s $680 leads to escalating requests. The person never arrives.', behavioral_reinforcement: 'Never send money to someone you have not met in person — romantic feelings are not a guarantee of identity.' },
    tags: ['romance_scam', 'comparison', 'military_impersonation'], tricks: ['emotional_bond', 'military_persona', 'advance_fee']
  },
  {
    id: 'comp_sms_crypto_vs_legit_001', channel: 'sms', pattern_family: 'crypto_investment', difficulty: 3, ground_truth: 'scam', ai_amplified: false, drill_type: 'comparison',
    framing: 'Two texts about cryptocurrency. Which one is the scam?',
    messages: [
      { label: 'A', from_handle: '44821', from_name: null, body: 'CoinVault: Your 2FA code is 391847. Valid for 5 minutes. Never share this code with anyone — CoinVault will never ask for it.' },
      { label: 'B', from_handle: '+1 (702) 555-0141', from_name: 'CoinVault Security', body: 'ALERT: Your CoinVault wallet requires re-verification. Visit coinvault-secure-migration.com within 48 hours or your funds will be locked.' }
    ],
    scam_label: 'B',
    red_flags: [
      { id: 'b_lookalike_crypto_domain', label: 'B: coinvault-secure-migration.com is not the real platform domain' },
      { id: 'b_funds_locked_threat', label: 'B: Funds locked threat creates maximum urgency for crypto holders' },
      { id: 'b_full_number_sender', label: 'B: Real crypto platform alerts use short codes' },
      { id: 'a_standard_2fa', label: 'A: Standard 2FA code delivery with explicit never-share instruction' }
    ],
    correct_red_flag_ids: ['b_lookalike_crypto_domain', 'b_funds_locked_threat', 'b_full_number_sender'],
    explanation: { short: 'A is a standard 2FA delivery with a security reminder. B uses a lookalike domain, funds-locked threat, and full phone number — all scam indicators.', tells: ['Platform migration never requires SMS verification to a different domain', 'Real platform alerts use short codes for verification messages', 'The funds-locked threat is designed to override careful URL inspection'], safe_move: 'Use A\'s code for your login. Ignore B — check your account status by logging in directly.', consequence: 'B\'s link leads to a phishing site that collects your login credentials or seed phrase. Wallet is drained.', behavioral_reinforcement: 'Check your crypto account by logging in directly — never via a link from an unexpected text.' },
    tags: ['crypto_scam', 'smishing', 'comparison'], tricks: ['lookalike_domain', 'fear_lockout', 'urgency']
  },
  {
    id: 'comp_email_gov_vs_legit_001', channel: 'email', pattern_family: 'government_impersonation', difficulty: 3, ground_truth: 'scam', ai_amplified: false, drill_type: 'comparison',
    framing: 'Two emails claiming to be from government agencies. Which one is the scam?',
    messages: [
      { label: 'A', from_handle: 'noreply@irs.gov', from_name: 'IRS', subject: 'Your 2023 tax return has been processed', body: 'Your 2023 federal tax return has been processed. View your return status and any notices at irs.gov/account. No action needed at this time.\n\nInternal Revenue Service' },
      { label: 'B', from_handle: 'refunds@fedtax-refund-portal.com', from_name: 'Federal Tax Refund Office', subject: 'Your $847 refund expires in 72 hours', body: 'You are owed a $847 refund from the previous tax year. Provide your bank account and routing number at federal-payment-verify.com to receive your refund before it expires.' }
    ],
    scam_label: 'B',
    red_flags: [
      { id: 'b_not_gov_domain', label: 'B: fedtax-refund-portal.com is not a .gov domain' },
      { id: 'b_bank_details_by_email', label: 'B: Requests bank account and routing number by email' },
      { id: 'b_expiring_refund', label: 'B: Tax refunds do not expire — fabricated urgency' },
      { id: 'a_gov_domain', label: 'A: Uses the real IRS .gov domain — government agencies only use .gov' }
    ],
    correct_red_flag_ids: ['b_not_gov_domain', 'b_bank_details_by_email', 'b_expiring_refund'],
    explanation: { short: 'A comes from irs.gov — the only legitimate IRS domain. B uses a lookalike .com domain and asks for banking details, which the IRS never does by email.', tells: ['US government agencies exclusively use .gov domains for official communications', 'The IRS never requests banking details by email', 'Tax refunds do not expire and are issued automatically', 'A\'s message requires no action — consistent with a processing notification'], safe_move: 'Verify A\'s message by logging into your real IRS account at irs.gov. Ignore B.', consequence: 'Providing banking details to B enables direct ACH withdrawal from your account.', behavioral_reinforcement: 'US government agencies only use .gov domains — any other domain claiming to be government is a scam.' },
    tags: ['government_scam', 'comparison', 'phishing'], tricks: ['lookalike_domain', 'authority_impersonation', 'pii_harvest']
  },
  {
    id: 'comp_email_tech_vs_legit_001', channel: 'email', pattern_family: 'tech_support', difficulty: 3, ground_truth: 'scam', ai_amplified: false, drill_type: 'comparison',
    framing: 'Two security-related emails about your computer. Which one is the scam?',
    messages: [
      { label: 'A', from_handle: 'security@nexcloud-device-alert.com', from_name: 'NexCloud Security Team', subject: 'Critical: Malware Detected — Call Us Now', body: 'Our systems have detected malicious software attempting to access your NexCloud account. Call 1-855-555-0167 to allow our team to connect remotely and remove it immediately.' },
      { label: 'B', from_handle: 'security@shieldguard.com', from_name: 'ShieldGuard', subject: 'Virus definitions updated', body: 'Your ShieldGuard antivirus definitions were updated on November 5. Your device is protected. No action needed.\n\nShieldGuard Security' }
    ],
    scam_label: 'A',
    red_flags: [
      { id: 'a_remote_access_request', label: 'A: Requests you allow remote access to your computer' },
      { id: 'a_lookalike_domain', label: 'A: nexcloud-device-alert.com is not the real service domain' },
      { id: 'a_cloud_scans_local_claim', label: 'A: Cloud services cannot detect local malware on your device' },
      { id: 'b_no_action_needed', label: 'B: Standard security update notification — no action required' }
    ],
    correct_red_flag_ids: ['a_remote_access_request', 'a_lookalike_domain', 'a_cloud_scans_local_claim'],
    explanation: { short: 'A requests remote computer access from a lookalike domain — a classic tech support scam. B is a routine software update notification.', tells: ['Cloud services cannot scan your local device for malware — this claim is impossible', 'Remote access grants the scammer full control of your computer', 'Lookalike domains with extra words are standard phishing infrastructure', 'B requires no action and comes from the real software domain'], safe_move: 'Ignore A. B requires no action — your device is updated.', consequence: 'Calling A connects you to a scammer who gains full remote access. Banking, files, and passwords are all at risk.', behavioral_reinforcement: 'Never grant remote computer access to someone who contacts you unsolicited.' },
    tags: ['tech_support_scam', 'comparison', 'remote_access'], tricks: ['remote_access', 'lookalike_domain', 'false_authority']
  },
  {
    id: 'comp_sms_sub_vs_legit_001', channel: 'sms', pattern_family: 'subscription_renewal', difficulty: 2, ground_truth: 'scam', ai_amplified: false, drill_type: 'comparison',
    framing: 'Two texts about subscription charges. Which one is the scam?',
    messages: [
      { label: 'A', from_handle: '44791', from_name: null, body: 'CloudDrive: Your Plus plan renews in 3 days for $9.99. To manage, visit clouddrive.com/account. Reply STOP to opt out.' },
      { label: 'B', from_handle: '+1 (312) 555-0177', from_name: 'StreamNow Billing', body: 'StreamNow: Your account was charged $99.99 today. If unauthorized, call 1-888-555-0122 immediately to dispute and receive a refund.' }
    ],
    scam_label: 'B',
    red_flags: [
      { id: 'b_inflated_streaming_charge', label: 'B: $99.99 is much higher than typical streaming prices — designed to alarm' },
      { id: 'b_full_number_sender', label: 'B: Real service billing alerts use short codes, not full phone numbers' },
      { id: 'b_dispute_callback', label: 'B: Dispute callback connects you to a scammer, not the real service' },
      { id: 'a_short_code_real_domain', label: 'A: Short code sender and real service domain — legitimate pattern' }
    ],
    correct_red_flag_ids: ['b_inflated_streaming_charge', 'b_full_number_sender', 'b_dispute_callback'],
    explanation: { short: 'A is a routine subscription reminder — short code, real domain, standard amount. B has an inflated charge from a full phone number with a dispute callback.', tells: ['Check your actual bank statement — B\'s $99.99 likely does not exist', 'Real streaming services use short codes for billing alerts', 'Calling B\'s dispute number connects you to a scammer who collects banking details'], safe_move: 'Manage A normally. Check your real bank statement before calling anyone about B.', consequence: 'Calling B connects you to a scammer who asks for banking details to process your refund.', behavioral_reinforcement: 'Verify any unexpected charge on your actual bank statement before calling any number.' },
    tags: ['subscription_scam', 'smishing', 'comparison'], tricks: ['fake_charge', 'callback_number', 'urgency']
  },
  {
    id: 'comp_email_qr_vs_legit_001', channel: 'email', pattern_family: 'qr_code', difficulty: 3, ground_truth: 'scam', ai_amplified: false, drill_type: 'comparison',
    framing: 'Two emails contain QR codes. Which one should you not scan?',
    messages: [
      { label: 'A', from_handle: 'events@westsidecc.org', from_name: 'Westside Community Center', subject: 'Your event ticket — QR code inside', body: 'Your ticket for the Spring Fair is attached. Scan the QR code at the entrance for admission. See you Saturday!\n\nWestside Community Center' },
      { label: 'B', from_handle: 'delivery@novamart-shipping-update.com', from_name: 'NovaMart Delivery', subject: 'Scan QR to confirm delivery address', body: 'Your NovaMart order is held pending address confirmation. Scan the QR code or visit novamart-address-confirm.com to update and pay a $3 redelivery fee.' }
    ],
    scam_label: 'B',
    red_flags: [
      { id: 'b_lookalike_domain', label: 'B: novamart-shipping-update.com is not the real retailer domain' },
      { id: 'b_fee_to_redeliver', label: 'B: Redelivery fee requested alongside QR code — card capture setup' },
      { id: 'b_qr_in_email_hides_url', label: 'B: QR in email hides the destination URL until scanned' },
      { id: 'a_expected_event_ticket', label: 'A: QR code for a known event you registered for — expected use case' }
    ],
    correct_red_flag_ids: ['b_lookalike_domain', 'b_fee_to_redeliver', 'b_qr_in_email_hides_url'],
    explanation: { short: 'A\'s QR is expected — a ticket for an event you registered for. B uses a QR to hide a lookalike domain and adds a redelivery fee as a card capture mechanism.', tells: ['QR codes in unexpected emails hide phishing URLs until after they are scanned', 'A redelivery fee alongside a QR code is a card capture setup', 'Verify the sender domain before scanning any unexpected QR code', 'A\'s QR code is for a known event — context and source are clear'], safe_move: 'Scan A at the event entrance. Do not scan B — check your order on the retailer\'s real website instead.', consequence: 'B\'s QR leads to a phishing site that captures your card details for the redelivery fee and then uses them for larger charges.', behavioral_reinforcement: 'Never scan a QR code from an unexpected email — verify the sender and domain first.' },
    tags: ['qr_scam', 'comparison', 'phishing'], tricks: ['qr_phishing', 'lookalike_domain', 'fee_harvesting']
  },
  {
    id: 'comp_email_advance_fee_vs_legit_001', channel: 'email', pattern_family: 'prize_lottery', difficulty: 2, ground_truth: 'scam', ai_amplified: false, drill_type: 'comparison',
    framing: 'Two emails offer you money. Which one is the scam?',
    messages: [
      { label: 'A', from_handle: 'hr@meridiancreative.com', from_name: 'Meridian Creative Group', subject: 'Q3 performance bonus', body: 'Hi, your Q3 performance bonus of $500 has been approved. It will be included in your next regular paycheck on November 15. Well done this quarter!\n\nHR Team' },
      { label: 'B', from_handle: 'awards@intl-lottery-commission.org', from_name: 'International Lottery Commission', subject: 'Final Notice: $50,000 Unclaimed Prize', body: 'This is your final notice. Your unclaimed lottery prize of $50,000 requires a $450 processing deposit to release. Contact our claims agent immediately.\n\nInternational Lottery Commission' }
    ],
    scam_label: 'B',
    red_flags: [
      { id: 'b_deposit_to_claim_prize', label: 'B: Requires deposit to claim prize — real prizes are never fee-gated' },
      { id: 'b_lottery_never_entered', label: 'B: You never entered this lottery' },
      { id: 'b_final_notice_fabricated', label: 'B: Final notice for a prize you never knew about is fabricated urgency' },
      { id: 'a_via_normal_payroll', label: 'A: Bonus paid through normal payroll — no action or fee required' }
    ],
    correct_red_flag_ids: ['b_deposit_to_claim_prize', 'b_lottery_never_entered'],
    explanation: { short: 'A is a normal workplace bonus through payroll — no action needed. B requires a fee for a lottery you never entered, which is the defining pattern of advance fee fraud.', tells: ['Legitimate money coming to you never requires you to pay first', 'You cannot win a lottery you never entered', 'The $450 deposit is the entire scam — no $50,000 exists'], safe_move: 'Expect A in your next paycheck. Ignore and delete B.', consequence: 'Paying B\'s $450 deposit leads to more fee requests. No prize is ever received.', behavioral_reinforcement: 'Legitimate money owed to you never requires you to pay to receive it.' },
    tags: ['advance_fee', 'comparison', 'prize_scam'], tricks: ['advance_fee', 'fake_prize']
  },
  {
    id: 'comp_sms_phish_vs_legit_001', channel: 'sms', pattern_family: 'credential_phishing', difficulty: 2, ground_truth: 'scam', ai_amplified: false, drill_type: 'comparison',
    framing: 'Two texts about your streaming account. Which one is the scam?',
    messages: [
      { label: 'A', from_handle: '55821', from_name: null, body: 'StreamNow: Your monthly plan renews tomorrow for $14.99. To manage your account, visit streamnow.com. Reply STOP to opt out.' },
      { label: 'B', from_handle: '+1 (929) 555-0134', from_name: 'StreamNow Billing', body: 'StreamNow: Payment failed. Your account suspends in 24 hours. Update billing at streamnow-billing-support.net immediately.' }
    ],
    scam_label: 'B',
    red_flags: [
      { id: 'b_lookalike_domain', label: 'B: streamnow-billing-support.net is not the real service domain' },
      { id: 'b_full_number_sender', label: 'B: Service alerts use short codes, not full phone numbers' },
      { id: 'b_suspension_threat', label: 'B: 24-hour suspension threat creates urgency to click without checking the URL' },
      { id: 'a_short_code_real_domain', label: 'A: Short code sender and real service domain — standard renewal reminder' }
    ],
    correct_red_flag_ids: ['b_lookalike_domain', 'b_full_number_sender', 'b_suspension_threat'],
    explanation: { short: 'A is a standard renewal reminder — short code, real domain, no urgency. B uses a lookalike domain, full number, and a 24-hour suspension threat.', tells: ['Real service billing texts come from short codes and link to the real service domain', 'Lookalike domains with .net or extra words are a primary indicator', '24-hour suspension threats create urgency that prevents careful URL inspection'], safe_move: 'Manage A normally at the real service website. Ignore B — log into the service directly if you have concerns.', consequence: 'Clicking B\'s link leads to a phishing page that captures your card details or login credentials.', behavioral_reinforcement: 'Service texts use short codes and real domains — lookalike domains with urgency are always scams.' },
    tags: ['phishing', 'smishing', 'comparison'], tricks: ['lookalike_domain', 'urgency', 'fear_lockout']
  },
  {
    id: 'comp_email_charity_ask_vs_legit_001', channel: 'email', pattern_family: 'charity_fraud', difficulty: 3, ground_truth: 'scam', ai_amplified: true, drill_type: 'comparison',
    framing: 'Two donation request emails. Which is the legitimate charity?',
    messages: [
      { label: 'A', from_handle: 'donate@brighthoperescue.org', from_name: 'Bright Hope Animal Rescue', subject: 'Annual fundraiser — help us hit our goal', body: 'We\'re in our annual fundraiser. Last year your donation helped us adopt out 47 animals. Our goal this year is $15,000. Donate at brighthoperescue.org/donate.\n\nWe\'re a registered 501(c)(3) — EIN 47-1234567. Tax deductible.' },
      { label: 'B', from_handle: 'giving@brighthope-children-fund.com', from_name: 'Bright Hope Children\'s Fund', subject: 'Marcus, 7, needs your help by tonight', body: 'Marcus has leukemia. His family cannot afford treatment. Your $25 covers one day of care. We reached our goal last week but are asking again to continue his treatment tonight.\n\n[Donate Now]' }
    ],
    scam_label: 'B',
    red_flags: [
      { id: 'b_goal_met_asks_again', label: 'B: Says goal was met but immediately asks for more — inconsistent' },
      { id: 'b_no_ein_registration', label: 'B: No EIN, 501(c)(3) status, or verifiable registration provided' },
      { id: 'b_tonight_deadline', label: 'B: Tonight deadline is fabricated urgency to prevent verification' },
      { id: 'a_verifiable_ein', label: 'A: Provides EIN and 501(c)(3) status — verifiable at Charity Navigator' }
    ],
    correct_red_flag_ids: ['b_goal_met_asks_again', 'b_no_ein_registration', 'b_tonight_deadline'],
    explanation: { short: 'A provides verifiable registration and references real past results. B has no verifiable registration, a contradictory story about already reaching its goal, and a tonight deadline.', tells: ['Meeting a goal then immediately asking for more is a logical inconsistency that signals a scam', 'EIN and 501(c)(3) status are publicly verifiable at Charity Navigator and irs.gov', 'Tonight deadlines are fabricated to prevent the verification that would reveal the fraud'], safe_move: 'Verify A\'s EIN before donating. Ignore B.', consequence: 'Donating to B enriches the scammer. No child receives any help.', behavioral_reinforcement: 'Always verify a charity\'s EIN and registration before donating.' },
    tags: ['charity_scam', 'comparison', 'emotional_manipulation'], tricks: ['emotional_appeal', 'urgency', 'fake_legitimacy']
  },
  {
    id: 'comp_email_rental_short_vs_legit_001', channel: 'email', pattern_family: 'rental_housing', difficulty: 3, ground_truth: 'scam', ai_amplified: false, drill_type: 'comparison',
    framing: 'You are looking for a vacation rental. Two hosts reply. Which one is the scammer?',
    messages: [
      { label: 'A', from_handle: 'host@staycoastal.com', from_name: 'StayCoastal Rentals', subject: 'Re: Clearwater Beach July 18-25', body: 'Hi! The beachfront unit is available for those dates. Nightly rate: $175. Book through our secure platform at staycoastal.com — full renter protection applies. Happy to answer any questions!\n\nStayCoastal Team' },
      { label: 'B', from_handle: 'beach.house.rentals.fl@gmail.com', from_name: 'Coastal Rentals', subject: 'Re: Clearwater July listing', body: 'Yes it\'s available! $175/night. To confirm your reservation, I need 50% upfront ($612.50) via gift card — call with the numbers. Balance due 7 days before. Check-in info sent once payment clears.' }
    ],
    scam_label: 'B',
    red_flags: [
      { id: 'b_gift_card_payment', label: 'B: Requests gift card payment — never legitimate for vacation rentals' },
      { id: 'b_gmail_host', label: 'B: Legitimate rental businesses use company emails, not personal Gmail' },
      { id: 'b_checkin_info_after_payment', label: 'B: Check-in info only after payment — no recourse if property does not exist' },
      { id: 'a_established_platform', label: 'A: Directs to a booking platform with renter protection' }
    ],
    correct_red_flag_ids: ['b_gift_card_payment', 'b_gmail_host', 'b_checkin_info_after_payment'],
    explanation: { short: 'A uses an established platform with renter protection. B requests gift card payment through a personal Gmail — an instant red flag for any financial transaction.', tells: ['Gift card payments for vacation rentals are never legitimate', 'Personal Gmail addresses for rental businesses lack accountability', 'No check-in info until after payment means you have no recourse if the property is fake', 'Established rental platforms offer fraud protection and dispute resolution'], safe_move: 'Book through A\'s platform. Ignore B.', consequence: 'You call B with gift card numbers. Numbers are redeemed immediately. No rental exists.', behavioral_reinforcement: 'Book vacation rentals only through established platforms — never via gift card or wire transfer to individuals.' },
    tags: ['rental_scam', 'comparison', 'advance_fee'], tricks: ['gift_card_pressure', 'advance_fee']
  },
  {
    id: 'comp_sms_prize_vs_legit_001', channel: 'sms', pattern_family: 'prize_lottery', difficulty: 2, ground_truth: 'scam', ai_amplified: false, drill_type: 'comparison',
    framing: 'Two prize-related texts arrive. Which one is the scam?',
    messages: [
      { label: 'A', from_handle: '33281', from_name: null, body: 'NovaMart: Congrats! Your ticket from last Saturday\'s in-store drawing was selected. Visit any NovaMart location to claim your $25 gift card. Ticket: NM-4412.' },
      { label: 'B', from_handle: '+1 (914) 555-0127', from_name: 'NovaMart Rewards', body: 'NovaMart: You\'ve won $500 in gift cards! Claim at novamart-winners.net/claim before midnight. Ref: NVM-WIN-2024-8812.' }
    ],
    scam_label: 'B',
    red_flags: [
      { id: 'b_lookalike_brand_domain', label: 'B: novamart-winners.net is not the real store website' },
      { id: 'b_large_prize_sms', label: 'B: $500 prize notification from a full phone number is disproportionate' },
      { id: 'b_midnight_deadline', label: 'B: Midnight deadline prevents you from verifying the promotion' },
      { id: 'a_in_store_claim_drawing', label: 'A: References an in-store drawing you participated in — in-person pickup' }
    ],
    correct_red_flag_ids: ['b_lookalike_brand_domain', 'b_large_prize_sms', 'b_midnight_deadline'],
    explanation: { short: 'A references a real in-store drawing with in-person pickup — no fees, no links. B has a lookalike domain, a midnight deadline, and a full phone number sender.', tells: ['Real brand prize notifications use official short codes or in-store processes', 'Lookalike domains with "winners" or "prizes" in the name are almost always phishing sites', 'Midnight deadlines for online prize claims are always fabricated pressure'], safe_move: 'Visit a NovaMart location with ticket NM-4412 to claim A\'s prize. Ignore B.', consequence: 'B\'s claim site captures card details to deliver the prize, then uses them for larger unauthorized charges.', behavioral_reinforcement: 'Real local prize wins involve in-person claims — online links with deadlines are scam signals.' },
    tags: ['prize_scam', 'smishing', 'comparison'], tricks: ['lookalike_domain', 'urgency', 'fake_prize']
  },
  {
    id: 'comp_email_account_vs_legit_001', channel: 'email', pattern_family: 'account_verification', difficulty: 2, ground_truth: 'scam', ai_amplified: false, drill_type: 'comparison',
    framing: 'Two emails about your account. Which one is the scam?',
    messages: [
      { label: 'A', from_handle: 'security@mailvault.com', from_name: 'MailVault', subject: 'New sign-in to your MailVault account', body: 'A new sign-in was detected (Chicago, IL). If this was you, no action needed. If not, visit mailvault.com/security.\n\nMailVault Security' },
      { label: 'B', from_handle: 'security@streamnow-account-alert.com', from_name: 'StreamNow Security', subject: 'Unusual login — verify within 24 hours or account locked', body: 'We detected a sign-in from another country. Verify your identity within 24 hours or your account and subscription will be locked.\n\n[Verify Account Now]' }
    ],
    scam_label: 'B',
    red_flags: [
      { id: 'b_lookalike_domain', label: 'B: streamnow-account-alert.com is not the real service domain' },
      { id: 'b_subscription_locked_threat', label: 'B: Threatens subscription lock to add financial pressure' },
      { id: 'b_twenty_four_hour_verify', label: 'B: 24-hour verify or lock creates pressure to click without checking URL' },
      { id: 'a_no_action_needed', label: 'A: No action needed if you recognize the sign-in — no threat, real domain' }
    ],
    correct_red_flag_ids: ['b_lookalike_domain', 'b_subscription_locked_threat', 'b_twenty_four_hour_verify'],
    explanation: { short: 'A is a legitimate security notification with no action needed. B threatens to lock your account in 24 hours from a lookalike domain.', tells: ['Real security notifications require no action if you recognize the sign-in', 'Lookalike domains with "alert" in the name are common phishing infrastructure', 'Subscription lock threats combine financial and access fear to overcome skepticism'], safe_move: 'Ignore A if you recognize the login. Ignore B — log into the service directly if concerned.', consequence: 'Clicking B\'s verify link leads to a phishing page capturing your credentials.', behavioral_reinforcement: 'Legitimate security alerts require no action if you recognize the activity — urgency and threats mean scam.' },
    tags: ['phishing', 'comparison', 'credential_harvest'], tricks: ['lookalike_domain', 'urgency', 'fear_lockout']
  },
  {
    id: 'comp_email_job_onboard_vs_legit_001', channel: 'email', pattern_family: 'job_seeker', difficulty: 4, ground_truth: 'scam', ai_amplified: false, drill_type: 'comparison',
    framing: 'You recently accepted a job offer. Two onboarding emails arrive. Which one is the scam?',
    messages: [
      { label: 'A', from_handle: 'hr@meridiancreative.com', from_name: 'Meridian Creative HR', subject: 'Onboarding — I-9 and Direct Deposit Setup', body: 'Welcome aboard! To complete your onboarding, log into our secure HR portal at meridian-hr.bamboohr.com to complete your I-9 and direct deposit form. Forms must be completed before your start date.\n\nHR Team' },
      { label: 'B', from_handle: 'hr@novacorp-employment-group.com', from_name: 'NovaCorp HR', subject: 'Onboarding — Reply with Required Documents', body: 'Please reply to this email with: (1) Photo of your driver\'s license (both sides), (2) Your Social Security Number, (3) Bank account and routing number for payroll.\n\nNovaCorp HR' }
    ],
    scam_label: 'B',
    red_flags: [
      { id: 'b_reply_with_ssn_and_id', label: 'B: Asks you to reply to an email with SSN, ID photo, and banking details' },
      { id: 'b_email_not_secure_portal', label: 'B: Real onboarding uses secure HR portals, not plain email replies' },
      { id: 'b_combination_pii_request', label: 'B: SSN + ID + banking details together enables complete identity theft' },
      { id: 'a_uses_secure_hr_portal', label: 'A: Directs to a named secure HR platform — standard onboarding' }
    ],
    correct_red_flag_ids: ['b_reply_with_ssn_and_id', 'b_email_not_secure_portal', 'b_combination_pii_request'],
    explanation: { short: 'A uses a named HR portal for secure document submission. B asks you to reply to an email with your SSN, ID, and banking details — which is identity theft, not onboarding.', tells: ['Real companies use secure HR platforms (BambooHR, Workday, etc.) for document submission', 'SSN, ID photos, and banking details via email reply enables full identity theft', 'If you did not apply to NovaCorp, B is entirely fabricated'], safe_move: 'Complete A\'s onboarding through the secure portal. If you did not apply to NovaCorp, ignore and report B.', consequence: 'Replying to B with your documents enables identity theft, new account fraud, and bank account access.', behavioral_reinforcement: 'Real onboarding uses secure portals — never reply to emails with SSN, ID photos, or banking details.' },
    tags: ['job_scam', 'identity_theft', 'comparison'], tricks: ['pii_harvest', 'fake_onboarding']
  },
  {
    id: 'comp_email_crypto_vs_legit_001', channel: 'email', pattern_family: 'crypto_investment', difficulty: 3, ground_truth: 'scam', ai_amplified: false, drill_type: 'comparison',
    framing: 'Two emails about your crypto account. Which one is the scam?',
    messages: [
      { label: 'A', from_handle: 'noreply@coinvault.io', from_name: 'CoinVault', subject: 'Withdrawal confirmed — 0.01 BTC', body: 'Your withdrawal of 0.01 BTC was processed. Transaction ID: 7f3a82...d91b. If you did not initiate this, visit coinvault.io/security to secure your account.\n\nCoinVault' },
      { label: 'B', from_handle: 'security@coinvault-secure-migration.com', from_name: 'CoinVault Security', subject: 'Mandatory Wallet Migration — Action Required', body: 'Your wallet must be migrated to our new security infrastructure. Provide your recovery phrase at coinvault-verify.com to complete migration within 48 hours.\n\nCoinVault Security' }
    ],
    scam_label: 'B',
    red_flags: [
      { id: 'b_recovery_phrase_request', label: 'B: Requests your recovery phrase — this gives complete wallet access to anyone' },
      { id: 'b_lookalike_domain', label: 'B: coinvault-secure-migration.com is not the real platform domain' },
      { id: 'b_mandatory_migration_pretext', label: 'B: Wallet migrations never require users to submit their recovery phrase' },
      { id: 'a_real_domain_no_action', label: 'A: Comes from the real domain and requires no action if you recognize the withdrawal' }
    ],
    correct_red_flag_ids: ['b_recovery_phrase_request', 'b_lookalike_domain', 'b_mandatory_migration_pretext'],
    explanation: { short: 'A is a standard transaction confirmation from the real domain. B requests your recovery phrase — sharing it gives complete wallet control to the scammer.', tells: ['Your recovery phrase grants complete control of your wallet — legitimate services NEVER ask for it', 'Platform migrations are performed server-side and never require user seed phrases', 'Lookalike domains for crypto platforms are designed to harvest credentials and seed phrases'], safe_move: 'Verify A by logging into your account at coinvault.io. Ignore B — never share your recovery phrase with anyone.', consequence: 'Providing your recovery phrase to B gives the scammer complete control of your wallet. All funds are drained immediately.', behavioral_reinforcement: 'Never share your crypto recovery phrase with anyone, under any circumstances.' },
    tags: ['crypto_scam', 'comparison', 'credential_harvest'], tricks: ['seed_phrase_theft', 'lookalike_domain', 'fake_migration']
  }
];

let issues = [];
newDrills.forEach(d => {
  const text = JSON.stringify(d);
  REAL_BRANDS.forEach(b => { if (text.includes(b)) issues.push(d.id + ': ' + b); });
});
if (issues.length) { console.error('BRAND ISSUES:', issues); process.exit(1); }

const existingIds = new Set(drills.map(d => d.id));
let dupes = [];
newDrills.forEach(d => { if (existingIds.has(d.id)) dupes.push(d.id); });
if (dupes.length) { console.error('DUPLICATE IDs:', dupes); process.exit(1); }

const updated = [...drills, ...newDrills];
fs.writeFileSync('data/drills.json', JSON.stringify(updated, null, 2));
console.log('Added', newDrills.length, 'drills. Total:', updated.length);
