const fs = require('fs');
const drills = JSON.parse(fs.readFileSync('data/drills.json', 'utf-8'));
const REAL_BRANDS = ['Amazon','Google','Apple','Microsoft','PayPal','Chase','Wells Fargo','Coinbase','Facebook','Instagram','Netflix','UPS','FedEx','DHL','Venmo','Zelle','Cash App','WhatsApp','Telegram','LinkedIn','Indeed','Twitter','Snapchat','TikTok'];

const newDrills = [
  // PREVIEW DRILLS — invoice_vendor (6)
  {
    id: 'preview_email_invoice_001', channel: 'email', pattern_family: 'invoice_vendor', difficulty: 3, ground_truth: 'scam', ai_amplified: false, drill_type: 'preview',
    framing: 'You receive this email in your work inbox. Read it carefully before answering.',
    preview_focus: 'sender',
    message: { from_name: 'OfficeSupply Direct', from_handle: 'billing@officesupply-direct-invoices.com', subject: 'Invoice #INV-2024-7741 — Payment Due', body: 'Please find attached invoice #INV-2024-7741 for $3,847.00 for office supplies ordered in October. Payment is due within 5 business days. Wire transfer details are attached.\n\nOfficeSupply Direct\nAccounts Receivable' },
    ground_truth: 'scam',
    red_flags: [
      { id: 'lookalike_vendor_domain', label: 'officesupply-direct-invoices.com is not the real vendor domain' },
      { id: 'unsolicited_invoice', label: 'No such order was placed — this is a fabricated invoice' },
      { id: 'wire_transfer_payment', label: 'Requests wire transfer which is irreversible' },
      { id: 'large_amount_urgency', label: '5-day deadline on a large amount pressures quick payment' }
    ],
    correct_red_flag_ids: ['lookalike_vendor_domain', 'unsolicited_invoice', 'wire_transfer_payment'],
    explanation: { short: 'Fake vendor invoices target businesses, hoping someone pays without verifying whether the order was actually placed.', tells: ['Verify any invoice against actual purchase orders before paying', 'Lookalike vendor domains are created specifically to deceive accounts payable staff', 'Wire transfers cannot be recalled once sent', 'Real vendor invoices come from domains matching the vendor\'s actual website'], safe_move: 'Contact the vendor directly using contact info from their real website — not from this email — to verify the invoice.', consequence: 'The wire transfer is sent to the scammer\'s account. Wire transfers are nearly impossible to reverse.', behavioral_reinforcement: 'Always verify invoices against purchase orders before payment — especially wire transfers.' },
    tags: ['invoice_scam', 'bec', 'wire_fraud'], tricks: ['lookalike_domain', 'fake_invoice', 'urgency']
  },
  {
    id: 'preview_email_invoice_002', channel: 'email', pattern_family: 'invoice_vendor', difficulty: 4, ground_truth: 'scam', ai_amplified: true, drill_type: 'preview',
    framing: 'You receive this email appearing to be from your regular software vendor.',
    preview_focus: 'sender',
    message: { from_name: 'NexSoft Licensing', from_handle: 'renewals@nexsoft-license-renewals.net', subject: 'Urgent: Software License Renewal — Expiring in 48 Hours', body: 'Your NexSoft Enterprise license expires in 48 hours. To avoid service interruption, complete renewal payment of $6,200 via the link below.\n\n[Renew License Now]\n\nFailure to renew will disable your software access. Contact renewals@nexsoft-license-renewals.net with any questions.\n\nNexSoft Licensing Team' },
    ground_truth: 'scam',
    red_flags: [
      { id: 'lookalike_vendor_domain', label: 'nexsoft-license-renewals.net is not the real vendor domain' },
      { id: 'service_interruption_threat', label: 'Threatens immediate service interruption to drive panic payment' },
      { id: 'click_to_pay', label: 'Payment link in email bypasses normal purchase order process' },
      { id: 'large_renewal_amount', label: '$6,200 renewal with a 48-hour deadline prevents proper verification' }
    ],
    correct_red_flag_ids: ['lookalike_vendor_domain', 'service_interruption_threat', 'click_to_pay'],
    explanation: { short: 'Software vendors send renewal notices weeks in advance through official channels — 48-hour ultimatums from lookalike domains are scams.', tells: ['Legitimate software renewals come from the vendor\'s real domain with advance notice', 'Service interruption threats create urgency that bypasses verification', 'Large payments should always go through a proper purchase order, not an email link', 'Log into the vendor\'s real website to check your actual license status'], safe_move: 'Log into your vendor account directly. Call the vendor using the number on their official website to verify.', consequence: 'Payment is sent to the scammer. Your actual software license was not expiring.', behavioral_reinforcement: 'Verify software renewal notices by logging into the vendor\'s real account — never pay via an email link.' },
    tags: ['invoice_scam', 'bec', 'credential_harvest'], tricks: ['lookalike_domain', 'urgency', 'fear_lockout']
  },
  {
    id: 'preview_email_invoice_003', channel: 'email', pattern_family: 'invoice_vendor', difficulty: 3, ground_truth: 'scam', ai_amplified: false, drill_type: 'preview',
    framing: 'You get this email claiming to be from your accounting software provider.',
    preview_focus: 'body',
    message: { from_name: 'LedgerPro Support', from_handle: 'support@ledgerpro-billing-update.com', subject: 'Action Required: Update Payment Method to Avoid Suspension', body: 'Your LedgerPro subscription payment failed. To keep your account active and avoid data loss, update your billing information within 24 hours.\n\n[Update Payment Method]\n\nAfter 24 hours, your account will be suspended and data may be permanently deleted.\n\nLedgerPro Customer Success' },
    ground_truth: 'scam',
    red_flags: [
      { id: 'data_deletion_threat', label: 'Threatens permanent data deletion to create panic' },
      { id: 'lookalike_domain', label: 'ledgerpro-billing-update.com is not the real service domain' },
      { id: 'click_to_update_billing', label: 'Links to update billing information — leads to a credential or card phishing page' },
      { id: 'twenty_four_hour_deadline', label: '24-hour deadline prevents careful verification' }
    ],
    correct_red_flag_ids: ['data_deletion_threat', 'lookalike_domain', 'click_to_update_billing'],
    explanation: { short: 'Legitimate SaaS companies give ample notice for billing failures and direct you to your account dashboard — not a link in an email.', tells: ['Real billing failure notices come from the company\'s actual domain', 'Data deletion threats are exaggerated to create panic and bypass skepticism', 'Update billing links in emails lead to phishing pages — always go directly to the service', 'Log into your account dashboard directly to check subscription status'], safe_move: 'Navigate to the service\'s real website yourself and log in to check your subscription status.', consequence: 'The update billing link leads to a phishing page. Your card and login details are captured.', behavioral_reinforcement: 'Never click billing update links in emails — always log into the service directly.' },
    tags: ['phishing', 'credential_harvest', 'invoice_scam'], tricks: ['fear_lockout', 'lookalike_domain', 'urgency']
  },
  {
    id: 'preview_email_invoice_004', channel: 'email', pattern_family: 'invoice_vendor', difficulty: 2, ground_truth: 'legit', ai_amplified: false, drill_type: 'preview',
    framing: 'You receive this invoice from your office cleaning service.',
    preview_focus: 'sender',
    message: { from_name: 'CleanSpace Services', from_handle: 'invoices@cleanspaceservices.com', subject: 'Invoice #CS-1194 — October Services', body: 'Hi Team,\n\nPlease find attached Invoice #CS-1194 for October cleaning services — $420.00, due November 15.\n\nYou can pay by check to the address on file or ACH to the account on the invoice. Please reach out with any questions.\n\nThank you,\nCleanSpace Services\nPhone: (555) 203-4410' },
    ground_truth: 'legit',
    red_flags: [
      { id: 'domain_matches_business', label: 'Sender domain matches the business name' },
      { id: 'phone_number_provided', label: 'Real contact phone number is included' },
      { id: 'reasonable_amount', label: 'Invoice amount is consistent with expected service costs' },
      { id: 'standard_payment_terms', label: 'Requests check or ACH — not wire transfer or gift cards' }
    ],
    correct_red_flag_ids: [],
    explanation: { short: 'This is a legitimate invoice — the sender domain matches the business, a real phone number is provided, and standard payment methods are requested.', tells: ['Domain matches the vendor name — no hyphenated subdomain tricks', 'Phone number allows independent verification of the invoice', 'Check and ACH are standard business payment methods, not red flags', 'Invoice amount is reasonable for the described service'], safe_move: 'Verify the invoice against your service agreement and pay through your normal accounts payable process.', consequence: 'No scam here — this is what a legitimate vendor invoice looks like.', behavioral_reinforcement: 'Legitimate invoices have matching domains, verifiable contact info, and standard payment methods.' },
    tags: ['legit', 'invoice', 'business_email'], tricks: []
  },
  {
    id: 'preview_email_invoice_005', channel: 'email', pattern_family: 'invoice_vendor', difficulty: 4, ground_truth: 'scam', ai_amplified: true, drill_type: 'preview',
    framing: 'You receive this email appearing to change payment details for a regular supplier.',
    preview_focus: 'body',
    message: { from_name: 'Parkway Supply Co', from_handle: 'accounts@parkway-supply.com', subject: 'Important: Updated Banking Details for Future Payments', body: 'Dear Valued Customer,\n\nPlease be advised that our banking details have changed effective immediately. All future payments should be sent to our new account:\n\nBank: Horizon Financial\nAccount: 7741882293\nRouting: 021000089\n\nPlease update your records. Our previous account will be closed by month end. Contact us at the number below if you have any questions.\n\nParkway Supply Finance Team' },
    ground_truth: 'scam',
    red_flags: [
      { id: 'banking_change_by_email', label: 'Bank account changes sent only by email should always be verified by phone' },
      { id: 'immediate_effect', label: 'Effective immediately creates urgency before verification can happen' },
      { id: 'old_account_closing', label: 'Previous account closing soon adds pressure to switch quickly' },
      { id: 'bec_pattern', label: 'Business email compromise redirects payments to scammer accounts' }
    ],
    correct_red_flag_ids: ['banking_change_by_email', 'immediate_effect', 'bec_pattern'],
    explanation: { short: 'Redirecting payments to new bank accounts via email is the core technique of business email compromise fraud — always verify by phone.', tells: ['Legitimate vendors communicate banking changes through multiple channels and allow time to verify', 'Immediate effect leaves no time for verification — this is intentional', 'Call the vendor at a number from your own records, not from this email', 'Even if the email domain looks real, the vendor\'s email may be compromised'], safe_move: 'Call the vendor at a phone number from your existing records — not from this email — to verify the banking change before updating anything.', consequence: 'You update the payment details. Next invoice payment goes to the scammer\'s account. The real vendor is also a victim.', behavioral_reinforcement: 'Always verify banking detail changes with a phone call to a number you already have on file.' },
    tags: ['bec', 'wire_fraud', 'invoice_scam'], tricks: ['bec', 'urgency', 'banking_redirect']
  },
  {
    id: 'preview_email_invoice_006', channel: 'email', pattern_family: 'invoice_vendor', difficulty: 2, ground_truth: 'legit', ai_amplified: false, drill_type: 'preview',
    framing: 'You get this renewal notice for your team\'s project management tool.',
    preview_focus: 'sender',
    message: { from_name: 'TaskFlow', from_handle: 'billing@taskflow.io', subject: 'Your TaskFlow subscription renews in 14 days', body: 'Hi there,\n\nYour TaskFlow Business plan ($89/month) renews on November 28. No action needed — your card on file will be charged automatically.\n\nTo update your payment method or plan, log into your account at taskflow.io/billing.\n\nQuestions? Contact support@taskflow.io or visit our help center.\n\nTaskFlow Billing' },
    ground_truth: 'legit',
    red_flags: [],
    correct_red_flag_ids: [],
    explanation: { short: 'This is a legitimate renewal notice — 14 days advance notice, no urgent action required, and directs you to the real domain to manage your account.', tells: ['Sender domain matches the service domain (taskflow.io)', '14-day advance notice is ample time to verify — no artificial urgency', 'No action is required — the charge is automatic, which is normal for subscriptions', 'Directs you to the real website to manage billing, not to click a payment link'], safe_move: 'Log into your account at the real domain to verify the renewal if needed.', consequence: 'No scam here — this is a model example of a legitimate renewal notice.', behavioral_reinforcement: 'Legitimate subscription renewals give advance notice and direct you to the real service website.' },
    tags: ['legit', 'subscription', 'billing'], tricks: []
  },

  // PREVIEW DRILLS — job_seeker (6)
  {
    id: 'preview_email_job_001', channel: 'email', pattern_family: 'job_seeker', difficulty: 2, ground_truth: 'scam', ai_amplified: false, drill_type: 'preview',
    framing: 'You applied to several jobs recently and get this email.',
    preview_focus: 'sender',
    message: { from_name: 'TalentBridge HR', from_handle: 'recruiter@talentbridge-careers-hiring.com', subject: 'Job Offer — Remote Customer Success Role — $65K', body: 'Congratulations! After reviewing your profile on JobBoard, we would like to offer you a Customer Success Representative position. This is a fully remote role paying $65,000/year.\n\nTo get started, please complete a brief online interview at talentbridge-screen.com. If selected, equipment will be shipped to you and an initial check for supplies will be mailed.\n\nTalentBridge Recruitment' },
    ground_truth: 'scam',
    red_flags: [
      { id: 'check_for_supplies', label: 'Mails a check for supplies — classic overpayment scam setup' },
      { id: 'lookalike_recruiter_domain', label: 'talentbridge-careers-hiring.com is not a real recruiter domain' },
      { id: 'no_interview_before_offer', label: 'Job offer made before any interview or screening' },
      { id: 'equipment_shipped_pretext', label: 'Equipment shipped to your address sets up additional scam steps' }
    ],
    correct_red_flag_ids: ['check_for_supplies', 'lookalike_recruiter_domain', 'no_interview_before_offer'],
    explanation: { short: 'Unsolicited job offers that mention mailing a check for supplies are always the setup for an overpayment check fraud scam.', tells: ['Legitimate jobs require interviews before offers', 'A check mailed for supplies is the setup: you deposit it, buy gift cards, send codes — check bounces days later', 'Lookalike recruiter domains are created to look professional but are unregistered', 'Real companies ship equipment through corporate accounts, not by mailing personal checks'], safe_move: 'Ignore. Search the company name separately to find their real website and verify they have real open positions.', consequence: 'You deposit the check and buy gift cards for "supplies." The check bounces. You are liable for the full amount.', behavioral_reinforcement: 'Any job that mails you a check and asks you to buy things with it is a scam.' },
    tags: ['job_scam', 'overpayment_scam', 'check_fraud'], tricks: ['overpayment', 'fake_offer', 'advance_fee']
  },
  {
    id: 'preview_email_job_002', channel: 'email', pattern_family: 'job_seeker', difficulty: 3, ground_truth: 'scam', ai_amplified: true, drill_type: 'preview',
    framing: 'You receive this message after uploading your resume to a job site.',
    preview_focus: 'body',
    message: { from_name: 'Global Staffing Partners', from_handle: 'placement@global-staffing-partners.net', subject: 'Immediate Placement Available — $28/hr Data Entry', body: 'Dear Job Seeker,\n\nWe have reviewed your profile and have an immediate data entry position available at $28/hr, fully remote. This role requires no experience.\n\nTo proceed, a background check is required ($49 processing fee) payable at bgcheck-portal.com/apply. Once cleared, your start date will be confirmed within 24 hours.\n\nGlobal Staffing Partners' },
    ground_truth: 'scam',
    red_flags: [
      { id: 'upfront_background_check_fee', label: 'Requires you to pay for your own background check upfront' },
      { id: 'lookalike_domain', label: 'global-staffing-partners.net and bgcheck-portal.com are not legitimate' },
      { id: 'no_experience_high_pay', label: 'High pay for no-experience remote work is unrealistically attractive' },
      { id: 'twenty_four_hour_start', label: '24-hour start date after fee payment creates urgency' }
    ],
    correct_red_flag_ids: ['upfront_background_check_fee', 'lookalike_domain', 'no_experience_high_pay'],
    explanation: { short: 'Legitimate employers pay for background checks — any job that requires you to pay for your own is a fee harvesting scam.', tells: ['Real employers absorb background check costs — candidates never pay', 'High hourly pay for zero-experience remote work does not reflect real market rates', 'The fee site is separate from the staffing company — both are controlled by the scammer', '24-hour placement promises are unrealistic and designed to prevent research'], safe_move: 'Never pay fees to get a job. Report the listing to the job site where you uploaded your resume.', consequence: 'You pay $49 for a background check. No job follows. Your card details may also be used for further charges.', behavioral_reinforcement: 'Employers pay for background checks — any job that makes you pay is a scam.' },
    tags: ['job_scam', 'fee_harvesting', 'phishing'], tricks: ['advance_fee', 'urgency', 'lookalike_domain']
  },
  {
    id: 'preview_email_job_003', channel: 'email', pattern_family: 'job_seeker', difficulty: 2, ground_truth: 'legit', ai_amplified: false, drill_type: 'preview',
    framing: 'You applied for a marketing coordinator role two weeks ago and get this response.',
    preview_focus: 'sender',
    message: { from_name: 'Meridian Creative Group', from_handle: 'talent@meridiancreative.com', subject: 'Interview Invitation — Marketing Coordinator', body: 'Hi,\n\nThank you for applying for the Marketing Coordinator role at Meridian Creative. We\'d love to schedule a 30-minute phone screen with you.\n\nPlease use the link below to pick a time that works for you:\n[Schedule Interview]\n\nLooking forward to speaking with you.\n\nSamantha L.\nTalent Acquisition, Meridian Creative Group' },
    ground_truth: 'legit',
    red_flags: [],
    correct_red_flag_ids: [],
    explanation: { short: 'This is a legitimate recruiter email — it responds to an application you made, comes from a matching domain, and only asks you to schedule a call.', tells: ['Domain matches the company name without extra hyphens or keywords', 'Responds to an application you actually submitted', 'Only asks for your time — no fees, equipment, or checks mentioned', 'Named recruiter with a title adds verifiability'], safe_move: 'Proceed with scheduling the interview. You can verify the company is real by searching their website before the call.', consequence: 'No scam here — this is what a legitimate recruiter follow-up looks like.', behavioral_reinforcement: 'Legitimate recruiters ask for your time, not your money.' },
    tags: ['legit', 'job', 'recruiting'], tricks: []
  },
  {
    id: 'preview_email_job_004', channel: 'email', pattern_family: 'job_seeker', difficulty: 3, ground_truth: 'scam', ai_amplified: false, drill_type: 'preview',
    framing: 'You receive this job offer from a company you did not apply to.',
    preview_focus: 'body',
    message: { from_name: 'NovaCorp HR', from_handle: 'hr@novacorp-employment-group.com', subject: 'Offer Letter — Remote Administrative Assistant', body: 'Dear Candidate,\n\nWe are pleased to offer you the Remote Administrative Assistant position at $55,000/year. Your profile was recommended to us by a mutual contact.\n\nBefore your start date, we require the following to process your onboarding:\n— Copy of your driver\'s license\n— Social Security Number for payroll setup\n— Direct deposit banking information\n\nPlease reply with these details at your earliest convenience.\n\nNovaCorp HR Department' },
    ground_truth: 'scam',
    red_flags: [
      { id: 'ssn_before_start', label: 'Requests Social Security Number before any interview or formal offer' },
      { id: 'driver_license_by_email', label: 'Requests copy of driver\'s license by email' },
      { id: 'bank_details_for_payroll', label: 'Requests banking information before employment is confirmed' },
      { id: 'no_application_submitted', label: 'You never applied to this company' }
    ],
    correct_red_flag_ids: ['ssn_before_start', 'no_application_submitted', 'bank_details_for_payroll'],
    explanation: { short: 'Collecting your SSN, ID, and banking details before any interview is identity theft, not onboarding.', tells: ['Legitimate employers collect tax documents (including SSN) only after you formally accept and begin onboarding through secured systems', 'Driver\'s license copies are never sent by reply email to an unknown sender', 'No company makes a job offer without an interview to someone who never applied', 'The combination of SSN, ID, and banking info enables full identity theft and account takeover'], safe_move: 'Do not reply. This is an identity theft attempt disguised as a job offer.', consequence: 'Your SSN, ID, and banking details are used to open fraudulent accounts, file false tax returns, and drain your bank account.', behavioral_reinforcement: 'Never send your SSN, ID, or banking details to an employer before you have formally started.' },
    tags: ['job_scam', 'identity_theft', 'phishing'], tricks: ['pii_harvest', 'authority_impersonation', 'fake_offer']
  },
  {
    id: 'preview_email_job_005', channel: 'email', pattern_family: 'job_seeker', difficulty: 3, ground_truth: 'scam', ai_amplified: true, drill_type: 'preview',
    framing: 'You get this message from a company after connecting on a professional network.',
    preview_focus: 'sender',
    message: { from_name: 'SkyLink Consulting', from_handle: 'opportunities@skylink-consulting-careers.net', subject: 'Exclusive Opportunity — $80K Remote Analyst Role', body: 'Hi, we came across your profile and believe you\'d be a perfect fit for a Senior Data Analyst role we\'re filling urgently. $80K base, fully remote, flexible hours.\n\nThis role will not be posted publicly. Interested candidates must complete a skills assessment at skylink-assess.com/apply and provide a $25 assessment processing fee.\n\nSpots are limited. Respond within 48 hours.\n\nSkyLink Talent Acquisition' },
    ground_truth: 'scam',
    red_flags: [
      { id: 'assessment_fee', label: 'Requires a fee to complete a job skills assessment' },
      { id: 'not_posted_publicly', label: '"Not posted publicly" creates exclusivity to prevent research' },
      { id: 'lookalike_domain', label: 'skylink-consulting-careers.net is not the real company domain' },
      { id: 'forty_eight_hour_deadline', label: '48-hour deadline prevents careful verification of the company' }
    ],
    correct_red_flag_ids: ['assessment_fee', 'lookalike_domain', 'not_posted_publicly'],
    explanation: { short: 'Legitimate employers never charge candidates assessment fees — this is a fee harvesting scam using exclusivity as cover.', tells: ['Real employers pay for assessments — candidates never pay', 'Not-posted-publicly claims make you feel special and prevent external verification', 'Lookalike career domains are created to appear professional', '48-hour response windows are designed to prevent you from researching the company'], safe_move: 'Ignore. Search the company name separately to find their real website and verify they are a real company with real openings.', consequence: 'You pay $25 and receive no job. Your card details may be used for additional charges.', behavioral_reinforcement: 'No legitimate employer charges candidates to complete an assessment.' },
    tags: ['job_scam', 'fee_harvesting', 'phishing'], tricks: ['advance_fee', 'exclusivity', 'urgency']
  },
  {
    id: 'preview_email_job_006', channel: 'email', pattern_family: 'job_seeker', difficulty: 4, ground_truth: 'scam', ai_amplified: false, drill_type: 'preview',
    framing: 'You are currently employed and receive this message from a headhunter.',
    preview_focus: 'body',
    message: { from_name: 'Premier Executive Search', from_handle: 'executive@premier-exec-search.com', subject: 'Confidential: VP-Level Opportunity — $180K', body: 'We are conducting a confidential search for a VP of Operations for a growth-stage company. Based on your background, you are one of five candidates we are considering.\n\nDue to the confidential nature of this search, we require a refundable $150 engagement deposit to verify your seriousness before sharing the company\'s identity.\n\nThis is refundable at any point if you choose not to proceed. Reply to express interest.\n\nPremier Executive Search' },
    ground_truth: 'scam',
    red_flags: [
      { id: 'engagement_deposit', label: 'Requires a deposit to be considered for a job' },
      { id: 'refundable_promise', label: 'Promises refundability — refunds from scammers do not happen' },
      { id: 'confidential_identity', label: 'Company identity withheld until deposit is paid — prevents verification' },
      { id: 'exclusivity_five_candidates', label: 'One of five candidates creates artificial status and urgency' }
    ],
    correct_red_flag_ids: ['engagement_deposit', 'confidential_identity', 'refundable_promise'],
    explanation: { short: 'Executive recruiters are paid by the hiring company — candidates never pay engagement deposits for any legitimate search.', tells: ['Legitimate executive recruiters earn placement fees from employers, never candidates', 'Withholding the company name until payment is received prevents you from verifying the search', 'Refundable deposit promises from strangers online are not enforceable', 'Real executive searches require extensive interviews, not deposit payments'], safe_move: 'Decline. Real executive recruiters do not charge candidates. If genuinely interested, research the firm independently.', consequence: 'You pay $150. The recruiter goes silent. The company and opportunity do not exist.', behavioral_reinforcement: 'Recruiters are paid by employers, never by candidates — any deposit request is a scam.' },
    tags: ['job_scam', 'advance_fee', 'executive_fraud'], tricks: ['advance_fee', 'exclusivity', 'fake_refund_promise']
  },

  // PREVIEW DRILLS — account_verification (6)
  {
    id: 'preview_sms_account_001', channel: 'sms', pattern_family: 'account_verification', difficulty: 2, ground_truth: 'scam', ai_amplified: false, drill_type: 'preview',
    framing: 'You get this text while using your bank\'s mobile app.',
    preview_focus: 'sender',
    message: { from_name: 'TrustBank', from_handle: '+1 (877) 555-0143', subject: null, body: 'TrustBank Alert: Your account has been suspended due to unusual activity. Verify your identity at trustbank-secure-verify.com within 2 hours to restore access.' },
    ground_truth: 'scam',
    red_flags: [
      { id: 'lookalike_bank_domain', label: 'trustbank-secure-verify.com is not the real bank website' },
      { id: 'full_phone_number', label: 'Real bank alerts use 5-6 digit short codes, not full phone numbers' },
      { id: 'two_hour_suspension', label: '2-hour deadline to verify or lose account access is pressure tactic' },
      { id: 'click_link_in_sms', label: 'Banks do not ask you to click SMS links to verify your identity' }
    ],
    correct_red_flag_ids: ['lookalike_bank_domain', 'full_phone_number', 'two_hour_suspension'],
    explanation: { short: 'Banks use short codes for alerts and their own secure app — they never text you a link to an external site to verify your identity.', tells: ['Bank text alerts come from 5-6 digit short codes, not full phone numbers', 'Your bank app is the proper place to address any account issues', 'Lookalike bank domains are designed to steal login credentials', 'Two-hour deadlines are used to prevent you from calling the real bank first'], safe_move: 'Open your bank app directly or call the number on the back of your card. Do not click the link.', consequence: 'The link leads to a fake bank login page. Your credentials are captured and account is accessed.', behavioral_reinforcement: 'Never click SMS links claiming to be from your bank — open the app or call the card number directly.' },
    tags: ['phishing', 'smishing', 'credential_harvest'], tricks: ['urgency', 'lookalike_domain', 'fear_lockout']
  },
  {
    id: 'preview_email_account_002', channel: 'email', pattern_family: 'account_verification', difficulty: 3, ground_truth: 'scam', ai_amplified: true, drill_type: 'preview',
    framing: 'You get this email about unusual activity on a streaming account.',
    preview_focus: 'sender',
    message: { from_name: 'StreamNow Security', from_handle: 'security@streamnow-account-alert.com', subject: 'Unusual Sign-In Detected — Verify Your Account Now', body: 'We detected a sign-in to your StreamNow account from an unrecognized device in another country. To protect your account, verify your identity by clicking below within 24 hours.\n\n[Verify My Account]\n\nIf you do not verify, your account will be locked and your subscription canceled.\n\nStreamNow Security Team' },
    ground_truth: 'scam',
    red_flags: [
      { id: 'lookalike_domain', label: 'streamnow-account-alert.com is not the real service domain' },
      { id: 'subscription_cancellation_threat', label: 'Threatens subscription cancellation to add financial loss to the fear' },
      { id: 'foreign_login_alert', label: 'Foreign login alert is a common hook to create alarm and urgency' },
      { id: 'click_to_verify', label: 'Verification links in emails lead to phishing pages, not real service sites' }
    ],
    correct_red_flag_ids: ['lookalike_domain', 'click_to_verify', 'subscription_cancellation_threat'],
    explanation: { short: 'Streaming services have in-app security tools — they do not send email links to external sites to verify your identity.', tells: ['Real streaming security alerts direct you to log into the actual service', 'The domain has extra words added — the real service domain would be much simpler', 'Subscription cancellation threat adds financial urgency beyond just account access', 'Log into the service directly to check for any real alerts or active sessions'], safe_move: 'Log into your streaming account directly using your bookmark or by typing the URL. Check security settings there.', consequence: 'The link leads to a fake login page. Your email and password are captured and used to access your account.', behavioral_reinforcement: 'For any account security issue, always navigate directly to the service — never via a link in an email.' },
    tags: ['phishing', 'credential_harvest', 'account_takeover'], tricks: ['urgency', 'lookalike_domain', 'fear_lockout']
  },
  {
    id: 'preview_email_account_003', channel: 'email', pattern_family: 'account_verification', difficulty: 2, ground_truth: 'legit', ai_amplified: false, drill_type: 'preview',
    framing: 'You just logged into your email from a new laptop and get this.',
    preview_focus: 'sender',
    message: { from_name: 'MailVault', from_handle: 'security@mailvault.com', subject: 'New sign-in to your MailVault account', body: 'Hi,\n\nWe noticed a new sign-in to your MailVault account from:\n\nDevice: MacBook Pro\nLocation: Chicago, IL\nTime: Today at 2:47 PM\n\nIf this was you, no action is needed. If you don\'t recognize this sign-in, visit mailvault.com/security to review your account.\n\nMailVault Security' },
    ground_truth: 'legit',
    red_flags: [],
    correct_red_flag_ids: [],
    explanation: { short: 'This is a legitimate security notification — it matches your recent activity, requires no action, and directs you to the real service domain.', tells: ['Sender domain matches the service (mailvault.com)', 'Notification matches your actual recent activity — you just logged in', 'No action required if it was you — no urgency or threat', 'Directs you to the real website, not an external link'], safe_move: 'No action needed if you recognize the login. If you did not recognize it, go to the service directly using your bookmark.', consequence: 'No scam here — this is a model security notification.', behavioral_reinforcement: 'Legitimate security notifications require no action if you recognize the activity, and never link to external sites.' },
    tags: ['legit', 'account_verification', 'security'], tricks: []
  },
  {
    id: 'preview_sms_account_004', channel: 'sms', pattern_family: 'account_verification', difficulty: 3, ground_truth: 'scam', ai_amplified: false, drill_type: 'preview',
    framing: 'You get this text while you are at the grocery store.',
    preview_focus: 'body',
    message: { from_name: null, from_handle: '+1 (929) 555-0134', subject: null, body: 'Your CoinVault account has been flagged for suspicious withdrawal. Your funds have been frozen. Call 1-888-555-0155 immediately to unlock your account before funds are seized.' },
    ground_truth: 'scam',
    red_flags: [
      { id: 'funds_seized_threat', label: 'Threatens seizure of funds to create maximum panic' },
      { id: 'callback_number', label: 'Provides a phone number to call — you will be talking to the scammer' },
      { id: 'full_phone_number_sender', label: 'Legitimate financial service alerts use short codes, not full phone numbers' },
      { id: 'frozen_funds_urgency', label: 'Frozen funds narrative creates urgent pressure to act immediately' }
    ],
    correct_red_flag_ids: ['funds_seized_threat', 'callback_number', 'full_phone_number_sender'],
    explanation: { short: 'Financial platforms do not text from full phone numbers about fund seizures — the callback number connects you to the scammer, not the real company.', tells: ['Legitimate financial alerts come from verified short codes or the official app', 'Calling the provided number connects you to the scammer who will ask for account credentials or remote access', 'Fund seizure threats are designed to create panic that overrides skepticism', 'Log into the service directly or call the number on your debit card to check your real account status'], safe_move: 'Do not call the number. Log into your account directly or call the customer service number from the official website.', consequence: 'You call the number and speak with the scammer who guides you to share your account credentials or 2FA codes.', behavioral_reinforcement: 'Never call a number from a text about a frozen or flagged account — use the official contact info from your account.' },
    tags: ['smishing', 'account_takeover', 'credential_harvest'], tricks: ['fear_lockout', 'callback_number', 'urgency']
  },
  {
    id: 'preview_email_account_005', channel: 'email', pattern_family: 'account_verification', difficulty: 3, ground_truth: 'scam', ai_amplified: true, drill_type: 'preview',
    framing: 'You receive this email about your email account storage.',
    preview_focus: 'body',
    message: { from_name: 'MailVault Support', from_handle: 'noreply@mailvault-account-notice.com', subject: 'Your mailbox is 99% full — Action Required', body: 'Your MailVault mailbox has reached 99% capacity. Incoming messages are being blocked. To avoid losing emails, upgrade your storage or delete messages within 24 hours.\n\n[Manage My Storage]\n\nFailing to act will result in account deactivation and permanent data loss.\n\nMailVault Storage Team' },
    ground_truth: 'scam',
    red_flags: [
      { id: 'lookalike_domain', label: 'mailvault-account-notice.com is not the real service domain' },
      { id: 'account_deactivation_threat', label: 'Threatens account deactivation and data loss' },
      { id: 'storage_link_phish', label: 'Manage storage link leads to a phishing page' },
      { id: 'blocked_incoming_claim', label: 'Claiming incoming messages are blocked creates urgency without verification' }
    ],
    correct_red_flag_ids: ['lookalike_domain', 'account_deactivation_threat', 'storage_link_phish'],
    explanation: { short: 'Storage notifications come from the real service domain and direct you to log in — not to click links in emails from lookalike domains.', tells: ['Real service notifications use the same domain as the service itself', 'If you are actually near storage limits, you will see warnings when logged into the service', 'Account deactivation for storage issues has a longer grace period than 24 hours — this urgency is fabricated', 'Click the real service bookmark to check your actual storage status'], safe_move: 'Log into your email account directly to check actual storage usage. Ignore this email.', consequence: 'The storage management link captures your email login credentials.', behavioral_reinforcement: 'Check storage or account issues by logging in directly — never via email links.' },
    tags: ['phishing', 'credential_harvest', 'account_takeover'], tricks: ['urgency', 'lookalike_domain', 'fear_lockout']
  },
  {
    id: 'preview_email_account_006', channel: 'email', pattern_family: 'account_verification', difficulty: 2, ground_truth: 'legit', ai_amplified: false, drill_type: 'preview',
    framing: 'You requested a password reset earlier today and get this.',
    preview_focus: 'sender',
    message: { from_name: 'MailVault', from_handle: 'noreply@mailvault.com', subject: 'Reset your MailVault password', body: 'Hi,\n\nWe received a request to reset your MailVault password. Click the link below to set a new password:\n\n[Reset Password]\n\nThis link expires in 1 hour. If you did not request a reset, you can safely ignore this email — your password has not been changed.\n\nMailVault' },
    ground_truth: 'legit',
    red_flags: [],
    correct_red_flag_ids: [],
    explanation: { short: 'This is a legitimate password reset email — you requested it, it comes from the real domain, and correctly says to ignore it if you did not request it.', tells: ['You actually requested this reset — solicited emails are expected', 'Domain matches the real service (mailvault.com)', 'Correctly advises to ignore if you did not request it — not to click anyway', '1-hour expiry is reasonable and standard for password resets'], safe_move: 'Click the reset link to complete your password change.', consequence: 'No scam here — this is what a legitimate password reset looks like.', behavioral_reinforcement: 'A legitimate password reset email tells you to ignore it if you didn\'t request it — a scam tells you to click anyway.' },
    tags: ['legit', 'account_verification', 'password_reset'], tricks: []
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
