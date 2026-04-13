const fs = require('fs');
const drills = JSON.parse(fs.readFileSync('data/drills.json', 'utf-8'));
const REAL_BRANDS = ['Amazon','Google','Apple','Microsoft','PayPal','Chase','Wells Fargo','Coinbase','Facebook','Instagram','Netflix','UPS','FedEx','DHL','Venmo','Zelle','Cash App','WhatsApp','Telegram','LinkedIn','Indeed','Twitter','Snapchat','TikTok','Spotify'];

const newDrills = [
  // ── BANK FRAUD THREADS (7) ───────────────────────────────────────────────
  {
    id: 'thread_sms_bank_001', channel: 'sms', pattern_family: 'bank_fraud_alert', difficulty: 3, ground_truth: 'scam', ai_amplified: false, drill_type: 'thread',
    framing: 'A text thread with someone claiming to be your bank.',
    thread: [
      { sender: 'them', body: 'Horizon Bank Fraud Dept: We flagged a $1,400 charge at Vertex Electronics. Did you make this purchase? Reply YES or NO.' },
      { sender: 'you', body: 'No, that was not me.' },
      { sender: 'them', body: 'Thank you. To protect your account, a specialist will call you in 2 minutes. Please have your debit card ready to verify your identity.' }
    ],
    message: { from_name: 'Horizon Bank', from_handle: '+1 (800) 555-9312', subject: null, body: '[Thread: Bank fraud alert asking you to confirm a charge, then requesting card details by phone]' },
    red_flags: [
      { id: 'card_details_by_phone', label: 'Asks you to have your debit card ready for a callback' },
      { id: 'specialist_call', label: 'Initiates a callback to collect information' },
      { id: 'full_phone_number', label: 'Sent from a full phone number, not a short code' }
    ],
    correct_red_flag_ids: ['card_details_by_phone', 'specialist_call', 'full_phone_number'],
    explanation: { short: 'Real bank fraud teams never call you and ask for your card details — they already have them.', tells: ['Legitimate bank fraud alerts use short codes, not full phone numbers', 'Real fraud departments never need you to read back your card number — they have it on file', 'The callback setup hands you to a scammer posing as a banker', 'If you receive a real fraud alert, hang up and call the number on the back of your card'], safe_move: 'Do not wait for the callback. Hang up and call Horizon Bank using the number on the back of your card.', consequence: 'The callback is from a scammer who collects your full card number, CVV, and PIN to make fraudulent charges.', behavioral_reinforcement: 'Your bank never calls you to ask for your card details — if that happens, hang up and call the number on your card.' },
    tags: ['bank_fraud', 'callback_trap', 'smishing'], tricks: ['authority_impersonation', 'callback_trap']
  },
  {
    id: 'thread_sms_bank_002', channel: 'sms', pattern_family: 'bank_fraud_alert', difficulty: 3, ground_truth: 'scam', ai_amplified: false, drill_type: 'thread',
    framing: 'A bank texted you about suspicious activity.',
    thread: [
      { sender: 'them', body: 'TrustBank Alert: Suspicious login detected from Lagos, Nigeria. Your account has been temporarily locked. Reply UNLOCK to restore access.' },
      { sender: 'you', body: 'UNLOCK' },
      { sender: 'them', body: 'To verify your identity, please provide your full account number and the last 4 digits of your SSN.' }
    ],
    message: { from_name: 'TrustBank', from_handle: '+1 (877) 555-0214', subject: null, body: '[Thread: Bank lock notification that escalates to requesting account number and SSN]' },
    red_flags: [
      { id: 'account_number_request', label: 'Asks for your full account number via text' },
      { id: 'ssn_digits_request', label: 'Requests SSN digits to verify identity' },
      { id: 'reply_to_unlock', label: 'Unlocking an account via text reply is not how banks work' }
    ],
    correct_red_flag_ids: ['account_number_request', 'ssn_digits_request', 'reply_to_unlock'],
    explanation: { short: 'Banks never unlock accounts or verify identity by asking for your account number and SSN over text.', tells: ['Account verification requires you to call the bank or visit a branch — not reply to a text', 'Your bank already has your account number — asking for it proves this is not your bank', 'SSN digits via SMS are immediately usable for identity theft', 'The UNLOCK reply confirmed your number is active and engaged'], safe_move: 'Do not reply with any information. Call your bank directly using the number on your card.', consequence: 'Your account number and SSN are used to take over your account and open fraudulent credit lines.', behavioral_reinforcement: 'Your bank verifies you by asking security questions you set up — never by asking for your account number or SSN over text.' },
    tags: ['bank_fraud', 'account_takeover', 'smishing'], tricks: ['authority_impersonation', 'credential_harvest', 'fear_lockout']
  },
  {
    id: 'thread_sms_bank_003', channel: 'sms', pattern_family: 'bank_fraud_alert', difficulty: 3, ground_truth: 'scam', ai_amplified: false, drill_type: 'thread',
    framing: 'You received this SMS thread from your bank.',
    thread: [
      { sender: 'them', body: 'Granite Credit Union: A new payee was added to your online banking. If this was not you, reply STOP to block the transfer.' },
      { sender: 'you', body: 'STOP' },
      { sender: 'them', body: 'Transfer blocked. To secure your account, we need to verify your online banking password. Please reply with your current password.' }
    ],
    message: { from_name: 'Granite Credit Union', from_handle: '+1 (800) 555-7731', subject: null, body: '[Thread: Fraud alert that ends with a request for your banking password via text]' },
    red_flags: [
      { id: 'password_request', label: 'Asks for your banking password via text' },
      { id: 'no_bank_asks_password', label: 'No bank ever asks for your password — they cannot and should not know it' },
      { id: 'full_number_sender', label: 'Sent from a full phone number, not a credit union short code' }
    ],
    correct_red_flag_ids: ['password_request', 'no_bank_asks_password'],
    explanation: { short: 'No bank or credit union ever asks for your password — ever. This is the clearest possible sign of fraud.', tells: ['Banks operate on hashed passwords they cannot read — asking for it proves this is not your bank', 'Replying with your password gives full account access to the scammer immediately', 'Legitimate fraud blocks are handled by freezing transactions, not asking for credentials', 'The STOP reply was used to build trust before the escalating credential request'], safe_move: 'Stop replying immediately. Call your credit union using the number on your card or their official website.', consequence: 'Your banking password is captured and your account is accessed and drained.', behavioral_reinforcement: 'No financial institution ever asks for your password — receiving that request means you are talking to a scammer.' },
    tags: ['bank_fraud', 'credential_harvest', 'account_takeover'], tricks: ['authority_impersonation', 'credential_harvest']
  },
  {
    id: 'thread_sms_bank_004', channel: 'sms', pattern_family: 'bank_fraud_alert', difficulty: 3, ground_truth: 'legit', ai_amplified: false, drill_type: 'thread',
    framing: 'Your bank texted you about a charge.',
    thread: [
      { sender: 'them', body: 'Apex FCU: Did you authorize $890 at Vertex Electronics on card ending 4412? Reply YES or NO.' },
      { sender: 'you', body: 'NO' },
      { sender: 'them', body: 'Card ending 4412 has been blocked. A new card will arrive in 3-5 business days. Call 800-555-0100 if you need immediate assistance.' }
    ],
    message: { from_name: 'Apex FCU', from_handle: '72453', subject: null, body: '[Thread: Fraud check from credit union short code that blocks card without asking for sensitive info]' },
    red_flags: [],
    green_flags: [
      { id: 'short_code', label: 'Sent from a 5-digit short code' },
      { id: 'card_digits', label: 'References your specific card ending in 4412' },
      { id: 'no_link', label: 'No links to click' },
      { id: 'no_credentials_requested', label: 'Never asks for password, SSN, or account number' },
      { id: 'action_taken_automatically', label: 'Card is blocked and replaced — no action needed from you' }
    ],
    correct_red_flag_ids: [],
    explanation: { short: 'Legitimate bank fraud alerts use short codes, reference your specific card, block the card automatically, and never ask for credentials.', tells: ['5-digit short code is how real banks send automated alerts', 'Referencing card ending 4412 proves the bank knows your specific account', 'Real fraud response blocks the card and handles the issue — it does not ask you to do more', 'A callback number for assistance is provided, but no sensitive action is demanded'], safe_move: 'Reply YES or NO as asked. Your card is already protected. Call the number if you need a faster replacement.', consequence: 'Ignoring a real fraud alert allows the unauthorized charge to process and additional fraudulent use to continue.', behavioral_reinforcement: 'Legitimate bank fraud alerts are automated, use short codes, reference specific card digits, and never ask for credentials.' },
    tags: ['bank_fraud', 'legitimate', 'fraud_alert'], tricks: []
  },
  {
    id: 'thread_sms_bank_005', channel: 'sms', pattern_family: 'bank_fraud_alert', difficulty: 3, ground_truth: 'scam', ai_amplified: false, drill_type: 'thread',
    framing: 'A text thread about wire transfer fraud.',
    thread: [
      { sender: 'them', body: 'Horizon Bank: We detected an outgoing wire transfer of $3,200 to an unknown account. If unauthorized, reply CANCEL immediately.' },
      { sender: 'you', body: 'CANCEL' },
      { sender: 'them', body: 'To cancel the wire we need to verify your identity. Please provide your full name, date of birth, and the last 6 digits of your account number.' }
    ],
    message: { from_name: 'Horizon Bank', from_handle: '+1 (213) 555-0183', subject: null, body: '[Thread: Wire transfer alert that escalates to requesting identity details]' },
    red_flags: [
      { id: 'dob_request', label: 'Requests your date of birth via text' },
      { id: 'account_digits_request', label: 'Asks for last 6 digits of account number' },
      { id: 'full_phone_sender', label: 'Sent from full phone number, not a short code' }
    ],
    correct_red_flag_ids: ['dob_request', 'account_digits_request', 'full_phone_sender'],
    explanation: { short: 'Banks cancel wire transfers internally without needing your DOB or account digits — those are being collected for identity fraud.', tells: ['Your bank can cancel outgoing wires without asking you for your own account details', 'DOB plus account digits is enough for identity verification at many institutions — enabling account takeover', 'Real bank fraud teams reach you via your registered contact, not a random number', 'The CANCEL reply confirmed your number is active and responsive'], safe_move: 'Stop the thread and call your bank directly using the number on your card or their official website.', consequence: 'Your DOB and account digits enable the scammer to authenticate as you and take over your account.', behavioral_reinforcement: 'Wire cancellations are handled internally by your bank — they never need you to text them your identity details.' },
    tags: ['bank_fraud', 'wire_fraud', 'smishing'], tricks: ['authority_impersonation', 'credential_harvest', 'urgency']
  },
  {
    id: 'thread_sms_bank_006', channel: 'sms', pattern_family: 'bank_fraud_alert', difficulty: 3, ground_truth: 'legit', ai_amplified: false, drill_type: 'thread',
    framing: 'You got a text from your bank about an international charge.',
    thread: [
      { sender: 'them', body: 'TrustBank: Is this you? $340 charge in Amsterdam on card ending 7821. Reply 1=Yes 2=No.' },
      { sender: 'you', body: '2' },
      { sender: 'them', body: 'Card ending 7821 frozen. Dispute filed automatically. New card ships in 5-7 days. To expedite: call 800-555-0118.' }
    ],
    message: { from_name: 'TrustBank', from_handle: '83291', subject: null, body: '[Thread: Legitimate international fraud check with automated card freeze and no credential requests]' },
    red_flags: [],
    green_flags: [
      { id: 'short_code', label: 'Sent from a verified bank short code' },
      { id: 'specific_card_digits', label: 'References card ending 7821' },
      { id: 'numbered_reply', label: 'Simple numbered reply — no links' },
      { id: 'auto_dispute', label: 'Dispute filed and card frozen automatically' },
      { id: 'no_sensitive_info_requested', label: 'Never asks for credentials, SSN, or full account number' }
    ],
    correct_red_flag_ids: [],
    explanation: { short: 'This is what a real fraud alert looks like — short code, specific card reference, simple reply, automatic action, no credentials requested.', tells: ['Short code sender is the standard for real bank automation', 'Card ending 7821 shows the bank knows exactly which card was used', 'Numbered replies are clear, quick, and require no sensitive input', 'The bank handles the dispute automatically — your only decision is Yes or No'], safe_move: 'Reply 1 or 2 as appropriate. Call the number if you need to expedite the replacement card.', consequence: 'Not responding to a real fraud alert allows unauthorized charges to continue on your account.', behavioral_reinforcement: 'Real fraud alerts are simple — a yes/no question from a short code, with automatic protection once you respond.' },
    tags: ['bank_fraud', 'legitimate', 'fraud_alert'], tricks: []
  },
  {
    id: 'thread_sms_bank_007', channel: 'sms', pattern_family: 'bank_fraud_alert', difficulty: 3, ground_truth: 'scam', ai_amplified: false, drill_type: 'thread',
    framing: 'A text claimed your bank account was accessed from overseas.',
    thread: [
      { sender: 'them', body: 'Ridgeline Bank Security: Your account was accessed from Vietnam. As a precaution we have limited transfers. To restore full access click: ridgelinebank-security.net/verify' },
      { sender: 'you', body: 'I did not do that.' },
      { sender: 'them', body: 'We understand. Please complete verification at ridgelinebank-security.net to restore access within 2 hours or your account will remain limited.' }
    ],
    message: { from_name: 'Ridgeline Bank', from_handle: '+1 (312) 555-0194', subject: null, body: '[Thread: Bank security alert with a phishing link and a 2-hour restoration deadline]' },
    red_flags: [
      { id: 'phishing_link', label: 'Link to ridgelinebank-security.net is not the real bank site' },
      { id: 'two_hour_threat', label: '2-hour threat to force fast action without scrutiny' },
      { id: 'full_phone_sender', label: 'Full phone number instead of bank short code' }
    ],
    correct_red_flag_ids: ['phishing_link', 'two_hour_threat', 'full_phone_sender'],
    explanation: { short: 'Real bank security restrictions are lifted by calling or visiting a branch — not by clicking a link in a text.', tells: ['ridgelinebank-security.net is a phishing domain designed to capture your credentials', 'The 2-hour deadline is artificial — banks do not set time limits for security verification', 'Full phone number senders are suspicious for bank communications', 'Clicking the link leads to a fake login page that captures your credentials'], safe_move: 'Do not click the link. Call Ridgeline Bank directly using the number on your card.', consequence: 'You click the link, enter your banking credentials on a fake site, and your account is taken over.', behavioral_reinforcement: 'Bank account restrictions are resolved by calling — never by clicking a link in a text message.' },
    tags: ['bank_fraud', 'phishing', 'smishing'], tricks: ['authority_impersonation', 'lookalike_domain', 'fear_lockout']
  },

  // ── CREDENTIAL PHISHING THREADS (7) ─────────────────────────────────────
  {
    id: 'thread_email_phish_001', channel: 'email', pattern_family: 'credential_phishing', difficulty: 3, ground_truth: 'scam', ai_amplified: false, drill_type: 'thread',
    framing: 'An email thread about your work account.',
    thread: [
      { sender: 'them', body: 'IT Security Team: We detected unusual sign-in activity on your account from an unrecognized device. Please verify by clicking the link in this email.' },
      { sender: 'you', body: 'I did not sign in from another device.' },
      { sender: 'them', body: 'Thank you for confirming. Click here immediately to lock out the unauthorized session and reset your credentials: corp-it-verify.net/secure' }
    ],
    message: { from_name: 'IT Security', from_handle: 'security@corp-it-verify.net', subject: 'Urgent: Unauthorized Sign-in Detected', body: '[Thread: IT security alert escalating to a phishing link for credential reset]' },
    red_flags: [
      { id: 'phishing_link', label: 'corp-it-verify.net is not the company IT domain' },
      { id: 'external_it_domain', label: 'IT security emails should come from the company domain' },
      { id: 'urgency_lock_out', label: 'Urgency framing to lock out unauthorized session' }
    ],
    correct_red_flag_ids: ['phishing_link', 'external_it_domain'],
    explanation: { short: 'Corporate IT teams send security alerts from company domains — never from external sites.', tells: ['Your real IT team communicates from company email addresses, not external domains', 'corp-it-verify.net is a phishing site designed to capture work credentials', 'Real unauthorized access alerts are handled through your company\'s actual IT portal', 'Work credential phishing is used to gain access to company systems and email'], safe_move: 'Contact your IT department directly through official internal channels to verify the alert.', consequence: 'Your work credentials are captured. Attackers access company systems, email, and potentially customer data.', behavioral_reinforcement: 'IT security emails come from your company domain — external domain IT alerts are always phishing.' },
    tags: ['credential_phishing', 'corporate', 'account_takeover'], tricks: ['authority_impersonation', 'urgency', 'credential_harvest']
  },
  {
    id: 'thread_email_phish_002', channel: 'email', pattern_family: 'credential_phishing', difficulty: 3, ground_truth: 'scam', ai_amplified: false, drill_type: 'thread',
    framing: 'An email about a shared document.',
    thread: [
      { sender: 'them', body: 'Sandra Torres has shared a document with you: "Q4 Budget Review.xlsx". Click to view.' },
      { sender: 'you', body: 'I clicked the link and it is asking me to sign in.' },
      { sender: 'them', body: 'Yes, sign in with your work email to access the shared file. Your credentials are needed to verify you are an authorized viewer.' }
    ],
    message: { from_name: 'Document Share Notification', from_handle: 'share@nexcloud-docs-share.net', subject: 'Sandra Torres shared a file with you', body: '[Thread: Shared document notification that prompts work credential sign-in on a fake page]' },
    red_flags: [
      { id: 'fake_share_link', label: 'Share notification from nexcloud-docs-share.net, not the real service' },
      { id: 'credential_prompt', label: 'Clicking leads to a credential sign-in page' },
      { id: 'unknown_sandra', label: 'Sandra Torres may not be a known colleague' }
    ],
    correct_red_flag_ids: ['fake_share_link', 'credential_prompt'],
    explanation: { short: 'Shared document phishing is one of the most effective attacks because it mimics a normal workflow.', tells: ['The share notification comes from nexcloud-docs-share.net, not the real document platform domain', 'Entering credentials on a third-party site hands them directly to attackers', 'Real document shares come from the platform itself (e.g., the real NexCloud domain)', 'If you do not recognize Sandra Torres, the share is likely unsolicited'], safe_move: 'Do not enter credentials. Contact Sandra Torres directly through a known channel to verify she sent a document.', consequence: 'Your work credentials are captured and used to access company systems and email.', behavioral_reinforcement: 'Verify document shares with the sender through a separate channel before entering any credentials.' },
    tags: ['credential_phishing', 'document_share', 'corporate'], tricks: ['authority_impersonation', 'credential_harvest']
  },
  {
    id: 'thread_email_phish_003', channel: 'email', pattern_family: 'credential_phishing', difficulty: 3, ground_truth: 'legit', ai_amplified: false, drill_type: 'thread',
    framing: 'An IT alert about your password expiry.',
    thread: [
      { sender: 'them', body: 'IT Help Desk (helpdesk@yourcompany.com): Your password expires in 7 days. Log into the employee portal at portal.yourcompany.com to update it before it expires.' },
      { sender: 'you', body: 'Can I do it on my phone?' },
      { sender: 'them', body: 'Yes — go to portal.yourcompany.com on any device. Use your current credentials to log in and follow the prompts. Let us know if you run into issues.' }
    ],
    message: { from_name: 'IT Help Desk', from_handle: 'helpdesk@yourcompany.com', subject: 'Password Expiry Notice - 7 Days Remaining', body: '[Thread: Legitimate IT password expiry notice directing to the real company portal with no urgency or links]' },
    red_flags: [],
    green_flags: [
      { id: 'company_domain_sender', label: 'Email from the real company domain' },
      { id: 'no_link_in_email', label: 'Directs you to type the URL yourself, no clickable link' },
      { id: 'no_credential_request', label: 'Never asks for your current password' },
      { id: 'helpful_response', label: 'Answers follow-up questions through normal IT channel' }
    ],
    correct_red_flag_ids: [],
    explanation: { short: 'Legitimate IT password notices come from the company domain, direct you to the known portal, and never ask for your current password.', tells: ['Sender is from the real company domain, not an external site', 'Directing you to type the URL yourself prevents link-based phishing', 'No urgency — 7 days is reasonable notice without panic pressure', 'IT never asks you to email or text your current password'], safe_move: 'Go to portal.yourcompany.com as directed and update your password.', consequence: 'Ignoring a real password expiry notice locks you out of your account when the password expires.', behavioral_reinforcement: 'Legitimate IT security notices come from your company domain and direct you to portals you already know.' },
    tags: ['credential_phishing', 'legitimate', 'it_security'], tricks: []
  },
  {
    id: 'thread_email_phish_004', channel: 'email', pattern_family: 'credential_phishing', difficulty: 3, ground_truth: 'scam', ai_amplified: false, drill_type: 'thread',
    framing: 'An email about your email storage being full.',
    thread: [
      { sender: 'them', body: 'NexCloud Mail: Your mailbox is 98% full. Undelivered messages are being queued. Click here to upgrade storage or verify your account to receive queued emails.' },
      { sender: 'you', body: 'I do not want to upgrade. How do I just verify?' },
      { sender: 'them', body: 'Click this link to verify and release your queued emails: mailbox-verify.nexcloud-support.net/verify. You will need to sign in with your email credentials.' }
    ],
    message: { from_name: 'NexCloud Mail Team', from_handle: 'storage@nexcloud-support.net', subject: 'Mailbox Almost Full - Undelivered Messages Waiting', body: '[Thread: Mailbox full alert that escalates to a credential phishing link]' },
    red_flags: [
      { id: 'phishing_verify_link', label: 'Verification link goes to nexcloud-support.net, not the real service' },
      { id: 'queued_emails_lure', label: 'Fear of losing emails drives you to comply' },
      { id: 'credential_entry', label: 'Requires sign-in on an external domain' }
    ],
    correct_red_flag_ids: ['phishing_verify_link', 'queued_emails_lure'],
    explanation: { short: 'Mailbox full warnings that require external verification are phishing — real storage management happens in your account settings.', tells: ['Real email storage management is handled in your account settings, not external links', 'The fear of losing queued emails is emotional pressure to comply quickly', 'nexcloud-support.net is an external domain, not the real mail provider', 'Entering credentials on the external site captures them immediately'], safe_move: 'Log into your email account directly and check storage in settings. Do not click verification links in storage warning emails.', consequence: 'Your email credentials are captured, giving attackers access to all your email, password resets, and linked accounts.', behavioral_reinforcement: 'Manage email storage through your account settings directly — never through verification links in storage warning emails.' },
    tags: ['credential_phishing', 'email_account', 'storage_lure'], tricks: ['fear_lockout', 'credential_harvest', 'lookalike_domain']
  },
  {
    id: 'thread_email_phish_005', channel: 'email', pattern_family: 'credential_phishing', difficulty: 3, ground_truth: 'scam', ai_amplified: false, drill_type: 'thread',
    framing: 'An email about your subscription being cancelled.',
    thread: [
      { sender: 'them', body: 'DataVault: Your subscription was cancelled due to a payment issue. To reactivate your account and recover your files, verify your payment method within 48 hours.' },
      { sender: 'you', body: 'I did not cancel. How do I fix this?' },
      { sender: 'them', body: 'Log in here to reactivate: datavault-reactivate.com/login. Enter your credentials and update your payment method to restore access immediately.' }
    ],
    message: { from_name: 'DataVault Billing', from_handle: 'billing@datavault-account-alerts.com', subject: 'Your DataVault Subscription Has Been Cancelled', body: '[Thread: Subscription cancellation notice with a reactivation phishing link]' },
    red_flags: [
      { id: 'reactivation_link', label: 'datavault-reactivate.com is not the real service domain' },
      { id: 'file_loss_threat', label: 'Threat of losing files drives panic compliance' },
      { id: 'external_billing_domain', label: 'Billing email from datavault-account-alerts.com, not real domain' }
    ],
    correct_red_flag_ids: ['reactivation_link', 'external_billing_domain'],
    explanation: { short: 'Subscription cancellation phishing combines fear of data loss with a fake login page to capture credentials.', tells: ['The reactivation link goes to a domain other than the real service', 'File loss threats create emotional urgency that bypasses careful scrutiny', 'The billing sender domain is not the real service domain', 'Real subscription issues are resolved through your account on the official site'], safe_move: 'Go directly to the service website by typing the address yourself and check your account status there.', consequence: 'Your service credentials are captured and the attacker accesses your stored files and linked payment method.', behavioral_reinforcement: 'Resolve subscription issues by logging into the service directly — never through links in cancellation emails.' },
    tags: ['credential_phishing', 'subscription', 'account_takeover'], tricks: ['fear_lockout', 'credential_harvest', 'urgency']
  },
  {
    id: 'thread_email_phish_006', channel: 'email', pattern_family: 'credential_phishing', difficulty: 3, ground_truth: 'legit', ai_amplified: false, drill_type: 'thread',
    framing: 'An email about a suspicious sign-in to your account.',
    thread: [
      { sender: 'them', body: 'DataVault Security (security@datavault.com): A new sign-in was detected from Windows / Chicago, IL. If this was you, no action needed. If not, secure your account at datavault.com/security.' },
      { sender: 'you', body: 'I am in Chicago, so yes that was me.' },
      { sender: 'them', body: 'Great, no further action needed. Your account is secure. If anything changes, we will notify you at this address.' }
    ],
    message: { from_name: 'DataVault Security', from_handle: 'security@datavault.com', subject: 'New Sign-in Detected - DataVault Account', body: '[Thread: Legitimate sign-in notification with no links, no credential requests, and a real company domain]' },
    red_flags: [],
    green_flags: [
      { id: 'real_company_domain', label: 'Email from security@datavault.com — the real service domain' },
      { id: 'no_action_if_you', label: 'If it was you, no action needed — no pressure' },
      { id: 'directs_to_real_site', label: 'Security URL points to datavault.com itself' },
      { id: 'no_credentials_requested', label: 'Never asks for login credentials' }
    ],
    correct_red_flag_ids: [],
    explanation: { short: 'Legitimate sign-in alerts come from the real company domain, require no action if you made the sign-in, and never ask for credentials.', tells: ['security@datavault.com is the authentic sender, not a lookalike domain', 'Real alerts require no action from you if the sign-in was legitimate', 'The security URL points to the real site, not a third-party domain', 'No credentials are requested at any point in the exchange'], safe_move: 'If you recognize the sign-in, no action is needed. If you did not make it, visit datavault.com directly to secure your account.', consequence: 'Ignoring a genuine unauthorized sign-in alert allows the attacker to maintain access to your account.', behavioral_reinforcement: 'Real security alerts come from the actual company domain and require no credentials — just a yes or no from you.' },
    tags: ['credential_phishing', 'legitimate', 'sign_in_alert'], tricks: []
  },
  {
    id: 'thread_email_phish_007', channel: 'email', pattern_family: 'credential_phishing', difficulty: 3, ground_truth: 'scam', ai_amplified: false, drill_type: 'thread',
    framing: 'HR sent you a benefits enrollment reminder.',
    thread: [
      { sender: 'them', body: 'HR Benefits Team: Open enrollment ends Friday. Log into the benefits portal to make your selections: benefits-enrollment-portal.net/login' },
      { sender: 'you', body: 'Is this the same portal I used last year?' },
      { sender: 'them', body: 'Yes, same login. Use your employee ID and password. Deadline is Friday — do not miss out on health coverage.' }
    ],
    message: { from_name: 'HR Benefits', from_handle: 'hr-benefits@company-benefits-portal.net', subject: 'Open Enrollment Closes Friday - Action Required', body: '[Thread: HR benefits enrollment thread with a phishing link mimicking the company portal]' },
    red_flags: [
      { id: 'external_hr_domain', label: 'HR email from company-benefits-portal.net, not the company domain' },
      { id: 'phishing_portal', label: 'benefits-enrollment-portal.net is not the real HR portal' },
      { id: 'credential_prompt', label: 'Directs you to enter employee ID and password on an external site' }
    ],
    correct_red_flag_ids: ['external_hr_domain', 'phishing_portal'],
    explanation: { short: 'Company HR portals are accessed through company-domain links — external domains collecting employee credentials are phishing.', tells: ['HR communications come from the company email domain, not external sites', 'The benefits portal URL is not on the company domain', 'Entering employee credentials on an external site gives attackers access to internal systems', 'The Friday deadline creates urgency that discourages domain scrutiny'], safe_move: 'Contact HR directly through a known internal channel (Slack, internal email, phone) to get the correct portal link.', consequence: 'Your employee credentials are captured. Attackers access company systems, payroll, and HR data.', behavioral_reinforcement: 'Always access company portals through links provided by your IT or HR team through verified internal channels — not email links.' },
    tags: ['credential_phishing', 'hr_fraud', 'corporate'], tricks: ['authority_impersonation', 'urgency', 'credential_harvest']
  },

  // ── TECH SUPPORT THREADS (7) ─────────────────────────────────────────────
  {
    id: 'thread_dm_tech_001', channel: 'dm', pattern_family: 'tech_support', difficulty: 3, ground_truth: 'scam', ai_amplified: false, drill_type: 'thread',
    framing: 'Someone DMed you claiming to be from tech support.',
    thread: [
      { sender: 'them', body: 'NexCloud Support here. We detected unusual API activity on your account. We can help resolve this. Could you confirm your username?' },
      { sender: 'you', body: 'It is user_jsmith. What is the issue?' },
      { sender: 'them', body: 'Thanks. To secure the account we need to verify your current password. This is a one-time process for our security team.' }
    ],
    message: { from_name: 'NexCloud_Support', from_handle: '@nexcloud_support_team', subject: null, body: '[Thread: Tech support DM that escalates to requesting your account password]' },
    red_flags: [
      { id: 'password_request', label: 'Asks for your current password — no support team ever needs this' },
      { id: 'dm_support', label: 'Real support does not initiate contact via social DM' },
      { id: 'username_harvested', label: 'Your username was collected before the password request' }
    ],
    correct_red_flag_ids: ['password_request', 'dm_support'],
    explanation: { short: 'No legitimate support team ever needs your password — they have administrative access and reset tools.', tells: ['Real tech support uses admin tools — they never need your password', 'Proactive DM-based support contact is a hallmark of social engineering', 'Your username was harvested first to make the account feel real and targeted', 'After your password, the attacker changes it and locks you out'], safe_move: 'Never share your password with anyone. Contact support through the official app or website.', consequence: 'Your account password is captured. The attacker logs in, changes credentials, and locks you out of your own account.', behavioral_reinforcement: 'Your password is yours alone — no support person, IT team, or administrator ever legitimately needs it.' },
    tags: ['tech_support_scam', 'credential_harvest', 'account_takeover'], tricks: ['authority_impersonation', 'credential_harvest']
  },
  {
    id: 'thread_dm_tech_002', channel: 'dm', pattern_family: 'tech_support', difficulty: 3, ground_truth: 'scam', ai_amplified: false, drill_type: 'thread',
    framing: 'A tech support agent contacted you about a virus.',
    thread: [
      { sender: 'them', body: 'SignalOne Tech Support: Our system flagged your device sending unusual network traffic. We can run a remote scan to check for malware. Would you like to proceed?' },
      { sender: 'you', body: 'Sure, how do we do that?' },
      { sender: 'them', body: 'Download RemoteAssist Pro at remote-assist-pro.net and share the session code with me. I will connect and run the scan in about 10 minutes.' }
    ],
    message: { from_name: 'SignalOne_Support', from_handle: '@signalone_tech_help', subject: null, body: '[Thread: Tech support contact leading to remote access software installation]' },
    red_flags: [
      { id: 'remote_access_software', label: 'Asks you to install remote access software' },
      { id: 'unknown_download_site', label: 'remote-assist-pro.net is not a known legitimate remote tool' },
      { id: 'proactive_contact', label: 'Telecom provider does not monitor your device traffic and DM you' }
    ],
    correct_red_flag_ids: ['remote_access_software', 'proactive_contact'],
    explanation: { short: 'Your carrier does not monitor individual device traffic and will never DM you to offer a remote scan.', tells: ['Telecom providers do not analyze individual device traffic in real time and contact customers by DM', 'Downloading software from a third-party site and granting remote access gives the attacker full computer control', 'Remote access in this context is used to steal files, passwords, and install persistent malware', 'Legitimate remote support uses established tools like TeamViewer or AnyDesk through official vendor channels'], safe_move: 'Do not download anything. If concerned about your device, run your own antivirus scan or contact your carrier through their official support line.', consequence: 'The remote session gives the scammer full control. Files, passwords, and banking credentials are accessed.', behavioral_reinforcement: 'Never install remote access software for someone who contacted you unsolicited — that is always a scam.' },
    tags: ['tech_support_scam', 'remote_access', 'malware'], tricks: ['authority_impersonation', 'remote_access']
  },
  {
    id: 'thread_dm_tech_003', channel: 'dm', pattern_family: 'tech_support', difficulty: 3, ground_truth: 'legit', ai_amplified: false, drill_type: 'thread',
    framing: 'You submitted a tech support ticket and this DM followed.',
    thread: [
      { sender: 'them', body: 'Hi, this is Alex from DataVault support. I see you opened ticket #DV-84421 about syncing issues. Can you confirm the email address on the account so I can pull it up?' },
      { sender: 'you', body: 'Yes, it is jsmith@email.com.' },
      { sender: 'them', body: 'Got it. I can see your account and the sync error. This is a known issue on our end — I am pushing a fix to your account now. You should see it resolve within 30 minutes. No action needed from you.' }
    ],
    message: { from_name: 'DataVault_Support', from_handle: '@datavault_official_support', subject: null, body: '[Thread: Legitimate tech support follow-up on a ticket you opened, resolving without credential requests]' },
    red_flags: [],
    green_flags: [
      { id: 'ticket_reference', label: 'References a ticket number you actually created' },
      { id: 'confirms_email_only', label: 'Only asks for email address to pull up account — not password' },
      { id: 'resolves_server_side', label: 'Fix applied on their end — no action needed from you' },
      { id: 'no_credentials_requested', label: 'Never requests password, SSN, or payment info' }
    ],
    correct_red_flag_ids: [],
    explanation: { short: 'Legitimate support follows up on tickets you opened, asks only for account-identifying info like email, and never needs your password.', tells: ['The agent references a specific ticket number you created — proving they have context', 'Email address is sufficient for account lookup — no password or sensitive details needed', 'The fix is applied server-side with no action required from you', 'Real support closes tickets without requesting credentials'], safe_move: 'This appears to be a legitimate support response. Allow the 30 minutes and verify the fix resolved the issue.', consequence: 'Ignoring legitimate support responses delays resolution of your actual technical issue.', behavioral_reinforcement: 'Real tech support references your ticket, asks only for identifying info like email, and resolves issues without your password.' },
    tags: ['tech_support', 'legitimate', 'ticket_follow_up'], tricks: []
  },
  {
    id: 'thread_dm_tech_004', channel: 'dm', pattern_family: 'tech_support', difficulty: 3, ground_truth: 'scam', ai_amplified: false, drill_type: 'thread',
    framing: 'A tech support agent wants to help you with a billing issue.',
    thread: [
      { sender: 'them', body: 'NovaMart Plus Support: We noticed a billing discrepancy on your account. To process a refund of $34.00, we need to verify your identity. Can you confirm your name and address?' },
      { sender: 'you', body: 'Sure, it is Jane Smith, 123 Oak Street.' },
      { sender: 'them', body: 'Thank you Jane. To complete the refund, I need your bank account number to process the transfer. We cannot use the card on file for refunds.' }
    ],
    message: { from_name: 'NovaMart_Plus_Support', from_handle: '@novamart_plus_help', subject: null, body: '[Thread: Refund offer that escalates to requesting bank account number]' },
    red_flags: [
      { id: 'bank_account_for_refund', label: 'Requests bank account number to process a refund' },
      { id: 'refund_method_excuse', label: 'Cannot use the card on file excuse is false — all refunds go to original payment method' },
      { id: 'name_address_harvested', label: 'Name and address collected before the escalating request' }
    ],
    correct_red_flag_ids: ['bank_account_for_refund', 'refund_method_excuse'],
    explanation: { short: 'Refunds always go to the original payment method — any service claiming otherwise and asking for your bank account is committing fraud.', tells: ['Every legitimate refund goes back to the original card or payment method used — always', 'No real company collects bank account numbers via social DM to process refunds', 'Your name and address were collected to build a profile before the financial request', 'The $34 refund is plausible enough to make you cooperate with the bank account request'], safe_move: 'Do not provide your bank account number. Contact the company through their official website to verify any real refund.', consequence: 'Your bank account number is used for unauthorized withdrawals — far more than $34.', behavioral_reinforcement: 'Refunds go to your original payment method — anyone asking for a bank account number to process a refund is stealing from you.' },
    tags: ['tech_support_scam', 'refund_fraud', 'credential_harvest'], tricks: ['authority_impersonation', 'small_dollar_bait', 'credential_harvest']
  },
  {
    id: 'thread_dm_tech_005', channel: 'dm', pattern_family: 'tech_support', difficulty: 3, ground_truth: 'scam', ai_amplified: false, drill_type: 'thread',
    framing: 'Tech support reached out about your account being hacked.',
    thread: [
      { sender: 'them', body: 'NexCoin Support: Your wallet was accessed by an unauthorized IP address. We need to lock it down immediately. Are you available to resolve this now?' },
      { sender: 'you', body: 'Yes, what do I need to do?' },
      { sender: 'them', body: 'To lock the unauthorized session, you need to temporarily transfer your balance to our secure holding wallet: nvlt9x8k3mQ2...wallet-address. You can transfer back in 24 hours once we clear the session.' }
    ],
    message: { from_name: 'NexCoin_Official', from_handle: '@nexcoin_wallet_support', subject: null, body: '[Thread: Crypto wallet support contact leading to a request to transfer funds to a holding wallet]' },
    red_flags: [
      { id: 'transfer_to_their_wallet', label: 'Asks you to transfer crypto to their wallet address' },
      { id: 'holding_wallet_fiction', label: 'Holding wallets are not a real security mechanism' },
      { id: 'proactive_dm_support', label: 'Real crypto platforms do not DM you proactively about hacks' }
    ],
    correct_red_flag_ids: ['transfer_to_their_wallet', 'holding_wallet_fiction'],
    explanation: { short: 'No legitimate crypto service will ever ask you to transfer your funds to a holding wallet — that is theft dressed as security.', tells: ['Legitimate security measures lock your account — they do not ask you to move funds', 'The wallet address given belongs to the scammer', 'Crypto transfers are irreversible — once sent, the funds are permanently gone', 'Real platforms handle account security server-side without requiring fund transfers from users'], safe_move: 'Do not transfer anything. Secure your wallet by changing your password and enabling two-factor authentication on the official platform.', consequence: 'Your crypto balance is transferred to the scammer wallet. It is irreversible and unrecoverable.', behavioral_reinforcement: 'No security team ever asks you to transfer your crypto to a holding address — that is always theft.' },
    tags: ['crypto', 'tech_support_scam', 'wallet_drain'], tricks: ['authority_impersonation', 'urgency', 'payment_redirect']
  },
  {
    id: 'thread_dm_tech_006', channel: 'dm', pattern_family: 'tech_support', difficulty: 3, ground_truth: 'legit', ai_amplified: false, drill_type: 'thread',
    framing: 'You reported a bug and got this DM back.',
    thread: [
      { sender: 'them', body: 'Hi! I am from the NexCloud dev team. I saw your bug report (#4421) about the upload failure. Can you tell me what file type and size you were uploading when it failed?' },
      { sender: 'you', body: 'It was a 2GB MP4 file.' },
      { sender: 'them', body: 'That explains it — we have a file size cap issue in the current build. Fix is in the next release, expected Friday. Thanks for the report! No action needed on your end.' }
    ],
    message: { from_name: 'NexCloud_Dev', from_handle: '@nexcloud_dev_team', subject: null, body: '[Thread: Legitimate bug follow-up asking for technical details to reproduce the issue]' },
    red_flags: [],
    green_flags: [
      { id: 'bug_report_reference', label: 'References the specific bug report number you submitted' },
      { id: 'technical_question_only', label: 'Asks only for technical details to reproduce the issue' },
      { id: 'no_credentials', label: 'Never asks for credentials or personal information' },
      { id: 'actionable_resolution', label: 'Gives a clear timeline and resolution without requiring anything from you' }
    ],
    correct_red_flag_ids: [],
    explanation: { short: 'Legitimate developer support asks for technical details to reproduce a bug — never credentials or personal information.', tells: ['Bug report number reference proves they have your actual submission', 'Questions about file type and size are technical — not personal or financial', 'Resolution is communicated without requiring any action from you', 'Real developers fix bugs on their end — they do not need your account access'], safe_move: 'Engage with the technical questions as needed. This is normal bug triage.', consequence: 'Ignoring legitimate bug follow-up slows down resolution of an issue that may affect others too.', behavioral_reinforcement: 'Legitimate tech support asks technical questions about your issue — not credentials or personal information.' },
    tags: ['tech_support', 'legitimate', 'bug_report'], tricks: []
  },
  {
    id: 'thread_dm_tech_007', channel: 'dm', pattern_family: 'tech_support', difficulty: 3, ground_truth: 'scam', ai_amplified: false, drill_type: 'thread',
    framing: 'Someone claiming to be tech support offered to help.',
    thread: [
      { sender: 'them', body: 'Hi, I noticed you posted about having trouble with your NexCloud account. I am from the support team. I can help resolve this quickly if you share your 2FA backup code.' },
      { sender: 'you', body: 'Really? How did you find my post?' },
      { sender: 'them', body: 'We monitor mentions of our service to help users. The backup code lets us verify your identity without your password. It is just for verification.' }
    ],
    message: { from_name: 'NexCloud_Help', from_handle: '@nexcloud_help_desk_2', subject: null, body: '[Thread: Support agent finds your public post and requests your 2FA backup code]' },
    red_flags: [
      { id: 'backup_code_request', label: 'Requests your 2FA backup code' },
      { id: 'social_monitoring_excuse', label: 'Monitors your posts to offer help — not how real support works' },
      { id: 'unofficial_handle', label: 'Handle is @nexcloud_help_desk_2 — numbered handles are often fake' }
    ],
    correct_red_flag_ids: ['backup_code_request', 'unofficial_handle'],
    explanation: { short: 'Your 2FA backup code bypasses all two-factor authentication — sharing it gives complete account access to whoever has it.', tells: ['A 2FA backup code is the emergency key to your account — it bypasses your authenticator app entirely', 'Real support verifies identity through your registered email, not backup codes', 'The numbered handle (@nexcloud_help_desk_2) suggests a fake account mimicking the real support handle', 'Legitimate companies do not monitor social posts and cold-DM users to offer account help'], safe_move: 'Do not share your backup code. Report the account. Contact support through the official platform only.', consequence: 'Your backup code gives the attacker full account access, bypassing your password and authenticator entirely.', behavioral_reinforcement: 'Your 2FA backup code is as powerful as your password — guard it absolutely and share it with no one.' },
    tags: ['tech_support_scam', '2fa_bypass', 'account_takeover'], tricks: ['authority_impersonation', 'credential_harvest']
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
