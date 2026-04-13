const fs = require('fs');
const drills = JSON.parse(fs.readFileSync('data/drills.json', 'utf-8'));
const REAL_BRANDS = ['Amazon','Google','Apple','Microsoft','PayPal','Chase','Wells Fargo','Coinbase','Facebook','Instagram','Netflix','UPS','FedEx','DHL','Venmo','Zelle','Cash App','WhatsApp','Telegram','LinkedIn','Indeed','Twitter','Snapchat','TikTok'];

const newDrills = [
  {
    id: 'spot_sms_delivery_003', channel: 'sms', pattern_family: 'delivery_toll', difficulty: 2, ground_truth: 'scam', ai_amplified: false, drill_type: 'spot_flag',
    framing: 'You got this text about a package.',
    spot_flag_options: [
      { id: 'fee_to_release', label: 'Requires a small fee to release your package' },
      { id: 'carrier_named', label: 'Names a shipping carrier' },
      { id: 'tracking_number', label: 'Includes a tracking number' },
      { id: 'address_update', label: 'Asks you to update your address' }
    ],
    spot_flag_correct_id: 'fee_to_release',
    message: { from_name: null, from_handle: '+1 (657) 555-0143', subject: null, body: 'NexShip: Package held due to incomplete address. Pay $1.79 release fee at nexship-delivery-update.com/pay to receive today. Tracking: NSP-440192' },
    red_flags: [
      { id: 'fee_to_release', label: 'Carriers do not charge fees to release held packages' },
      { id: 'lookalike_domain', label: 'nexship-delivery-update.com is not a real carrier site' },
      { id: 'random_number', label: 'Sent from a random full phone number, not a short code' },
      { id: 'small_bait_fee', label: '$1.79 bait fee captures your full card details' }
    ],
    correct_red_flag_ids: ['fee_to_release', 'lookalike_domain', 'random_number'],
    explanation: { short: 'Real carriers do not charge fees to deliver packages — the fee is a pretext to capture your card number.', tells: ['No shipping carrier charges a release fee for an address issue — they contact the sender', 'The domain is not affiliated with any real carrier', 'Legitimate carrier texts come from 5-6 digit short codes, not full phone numbers', 'The $1.79 feels trivial but your card is then used for larger unauthorized charges'], safe_move: 'Track any expected packages on the carrier official website using a tracking number you already have.', consequence: 'Your card details are captured and used for larger unauthorized charges.', behavioral_reinforcement: 'Package release fees do not exist — any text charging one is a scam.' },
    tags: ['delivery_scam', 'smishing', 'fee_harvesting'], tricks: ['small_dollar_bait', 'lookalike_domain']
  },
  {
    id: 'spot_email_tech_004', channel: 'email', pattern_family: 'tech_support', difficulty: 3, ground_truth: 'scam', ai_amplified: false, drill_type: 'spot_flag',
    framing: 'You got this email about your computer.',
    spot_flag_options: [
      { id: 'remote_access_request', label: 'Asks you to install remote access software' },
      { id: 'virus_detected', label: 'Claims a virus was detected on your device' },
      { id: 'support_phone_number', label: 'Provides a support phone number' },
      { id: 'urgent_action', label: 'Requests immediate action' }
    ],
    spot_flag_correct_id: 'remote_access_request',
    message: { from_name: 'NexCloud Security Team', from_handle: 'security@nexcloud-device-alert.com', subject: 'Critical: Malware Detected on Your Device', body: 'Our systems have detected malicious software on your device that is attempting to access your NexCloud account.\n\nTo remove it immediately, please call our security team at 1-855-555-0167 and allow them to connect remotely to your device to run our removal tool.\n\nDo not restart your computer until this is resolved.\n\nNexCloud Security' },
    red_flags: [
      { id: 'remote_access_request', label: 'Asks you to allow remote access to your computer' },
      { id: 'lookalike_domain', label: 'nexcloud-device-alert.com is not the real service domain' },
      { id: 'unsolicited_virus_alert', label: 'Software companies do not proactively scan your device' },
      { id: 'dont_restart_instruction', label: 'Do not restart instruction creates dependency on their help' }
    ],
    correct_red_flag_ids: ['remote_access_request', 'lookalike_domain', 'unsolicited_virus_alert'],
    explanation: { short: 'No legitimate software company remotely monitors your device and calls you to fix viruses — that call grants scammers full control of your computer.', tells: ['Cloud services do not scan your local device for malware', 'Remote access gives the scammer complete control — they can steal files, install malware, and access banking', 'The do not restart instruction creates urgency and dependency', 'Real security alerts direct you to your account dashboard, not a phone call'], safe_move: 'Ignore and delete. Run your own antivirus scan if concerned. Never grant remote access to an unsolicited caller.', consequence: 'The remote session gives scammers full computer control. They access banking, steal files, and often install persistent malware.', behavioral_reinforcement: 'Never grant remote computer access to someone who contacts you unsolicited — legitimate support does not work that way.' },
    tags: ['tech_support_scam', 'remote_access', 'malware'], tricks: ['fear_lockout', 'remote_access', 'authority_impersonation']
  },
  {
    id: 'spot_sms_account_004', channel: 'sms', pattern_family: 'account_verification', difficulty: 3, ground_truth: 'scam', ai_amplified: false, drill_type: 'spot_flag',
    framing: 'You got this text about your account.',
    spot_flag_options: [
      { id: 'otp_request', label: 'Asks you to share a one-time code you just received' },
      { id: 'account_locked', label: 'Claims your account is locked' },
      { id: 'reply_to_verify', label: 'Asks you to reply with a code' },
      { id: 'support_team', label: 'Claims to be from the support team' }
    ],
    spot_flag_correct_id: 'otp_request',
    message: { from_name: 'TrustBank Support', from_handle: '+1 (415) 555-0198', subject: null, body: 'TrustBank: We detected a login attempt. A verification code was sent to your phone. Reply with the code to confirm it was you and restore access.' },
    red_flags: [
      { id: 'otp_request', label: 'Asks you to share a verification code via text' },
      { id: 'code_you_just_got', label: 'The code being requested was just triggered by the scammer' },
      { id: 'full_number', label: 'Sent from a full phone number, not a bank short code' },
      { id: 'reply_mechanism', label: 'Asking you to reply with a code is not how banks verify' }
    ],
    correct_red_flag_ids: ['otp_request', 'code_you_just_got', 'full_number'],
    explanation: { short: 'The scammer triggered a real login attempt on your account — the code they want is the one protecting you from them.', tells: ['The verification code was sent because someone tried to log into your account', 'Sharing that code hands the scammer the key to bypass your authentication', 'Real banks never ask you to reply with your verification code via SMS', 'Banks use short codes for alerts — a full phone number sender is suspicious'], safe_move: 'Never share a verification code with anyone. If you receive an unexpected code, someone is trying to access your account — log in directly and change your password.', consequence: 'You reply with the code. The scammer uses it to log into your account and lock you out.', behavioral_reinforcement: 'A verification code is your lock — anyone asking for it is trying to pick it.' },
    tags: ['account_takeover', 'otp_theft', 'smishing'], tricks: ['credential_harvest', 'authority_impersonation']
  },
  {
    id: 'spot_email_phish_004', channel: 'email', pattern_family: 'credential_phishing', difficulty: 3, ground_truth: 'scam', ai_amplified: false, drill_type: 'spot_flag',
    framing: 'An urgent password reset email arrived.',
    spot_flag_options: [
      { id: 'unsolicited_reset', label: 'You did not request a password reset' },
      { id: 'link_in_email', label: 'Email contains a link to reset password' },
      { id: 'expires_soon', label: 'Link expires in 30 minutes' },
      { id: 'service_named', label: 'Names a service you use' }
    ],
    spot_flag_correct_id: 'unsolicited_reset',
    message: { from_name: 'DataVault Security', from_handle: 'noreply@datavault-security-alerts.com', subject: 'Password Reset Requested - Act Within 30 Minutes', body: 'A password reset was requested for your DataVault account. Click below to set a new password:\n\n[Reset My Password]\n\nThis link expires in 30 minutes. If you did not request this, your account may be compromised — still click the link to secure your account.\n\nDataVault Security Team' },
    red_flags: [
      { id: 'unsolicited_reset', label: 'You never requested this password reset' },
      { id: 'click_even_if_not_you', label: 'Tells you to click even if you did not request it — dangerous instruction' },
      { id: 'lookalike_domain', label: 'datavault-security-alerts.com is not the real service domain' },
      { id: 'thirty_min_urgency', label: '30-minute expiry creates panic-driven clicks' }
    ],
    correct_red_flag_ids: ['unsolicited_reset', 'click_even_if_not_you', 'lookalike_domain'],
    explanation: { short: 'Telling you to click even if you did not request the reset is the key tell — legitimate services say to ignore emails you did not request.', tells: ['Real password reset emails say to ignore if you did not request it — not click anyway', 'The click-even-if-not-you instruction is designed to capture credentials regardless', 'The sender domain is a variant, not the real service', 'If you did not request the reset, simply ignore the email — your account is fine'], safe_move: 'If you did not request a reset, ignore the email. If concerned, log into the service directly by typing the URL yourself.', consequence: 'The reset link leads to a fake login page. Your credentials are captured and your account is taken over.', behavioral_reinforcement: 'If you did not request a password reset, do not click anything in the email — just ignore it.' },
    tags: ['phishing', 'credential_harvest', 'account_takeover'], tricks: ['urgency', 'credential_harvest', 'fear_lockout']
  },
  {
    id: 'spot_sms_prize_001', channel: 'sms', pattern_family: 'prize_lottery', difficulty: 2, ground_truth: 'scam', ai_amplified: false, drill_type: 'spot_flag',
    framing: 'You got this text out of nowhere.',
    spot_flag_options: [
      { id: 'fee_to_claim_prize', label: 'Must pay a fee to claim your prize' },
      { id: 'prize_amount_large', label: 'Prize amount is very large' },
      { id: 'contest_not_entered', label: 'You never entered this contest' },
      { id: 'claim_deadline', label: 'Prize must be claimed within 24 hours' }
    ],
    spot_flag_correct_id: 'contest_not_entered',
    message: { from_name: null, from_handle: '+1 (914) 555-0127', subject: null, body: 'Congrats! Your number was selected in the NovaMart Weekly Giveaway. You have won $500 in gift cards. Claim at novamart-winners.net/claim before midnight. Ref: NVM-WIN-2024-8812' },
    red_flags: [
      { id: 'contest_not_entered', label: 'You never entered any NovaMart giveaway' },
      { id: 'lookalike_domain', label: 'novamart-winners.net is not the real company site' },
      { id: 'random_number_sender', label: 'Sent from a random full phone number' },
      { id: 'midnight_urgency', label: 'Midnight claim deadline creates pressure' }
    ],
    correct_red_flag_ids: ['contest_not_entered', 'lookalike_domain', 'random_number_sender'],
    explanation: { short: 'You cannot win a contest you never entered — this prize is fabricated to get you to a phishing site.', tells: ['Legitimate sweepstakes require entry — you cannot win one you never joined', 'The claim site is a phishing page that will request personal or payment information', 'Real company giveaways are announced through official company channels, not random texts', 'The midnight deadline is pressure to act before you think clearly'], safe_move: 'Ignore and delete. You did not win anything.', consequence: 'The claim site requests personal information and payment details to receive your prize, which never arrives.', behavioral_reinforcement: 'You cannot win a contest you never entered — unsolicited prize notifications are always scams.' },
    tags: ['prize_scam', 'smishing', 'phishing'], tricks: ['urgency', 'lookalike_domain']
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
