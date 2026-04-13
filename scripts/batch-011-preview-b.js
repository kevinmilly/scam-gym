const fs = require('fs');
const drills = JSON.parse(fs.readFileSync('data/drills.json', 'utf-8'));
const REAL_BRANDS = ['Amazon','Google','Apple','Microsoft','PayPal','Chase','Wells Fargo','Coinbase','Facebook','Instagram','Netflix','UPS','FedEx','DHL','Venmo','Zelle','Cash App','WhatsApp','Telegram','LinkedIn','Indeed','Twitter','Snapchat','TikTok'];

const newDrills = [
  // PREVIEW — subscription_renewal (6)
  {
    id: 'preview_email_sub_001', channel: 'email', pattern_family: 'subscription_renewal', difficulty: 2, ground_truth: 'scam', ai_amplified: false, drill_type: 'preview',
    framing: 'You get this email about an antivirus subscription.',
    preview_focus: 'sender',
    message: { from_name: 'ShieldGuard Antivirus', from_handle: 'billing@shieldguard-renewal-center.com', subject: 'Your ShieldGuard Subscription Renewed — $349.99 Charged', body: 'Thank you for your continued protection. Your ShieldGuard Antivirus subscription has been automatically renewed for $349.99.\n\nIf you did not authorize this charge, call 1-888-555-0148 immediately to cancel and receive a full refund.\n\nOrder #: SG-2024-88012\nShieldGuard Billing' },
    ground_truth: 'scam',
    red_flags: [
      { id: 'callback_to_cancel', label: 'Provides phone number to cancel — calling connects you to a scammer' },
      { id: 'lookalike_domain', label: 'shieldguard-renewal-center.com is not the real software domain' },
      { id: 'inflated_renewal_amount', label: '$349.99 is inflated to create alarm and urgency to call' },
      { id: 'refund_call_setup', label: 'Refund call is a pretext to get remote access or banking details' }
    ],
    correct_red_flag_ids: ['callback_to_cancel', 'lookalike_domain', 'inflated_renewal_amount'],
    explanation: { short: 'These fake renewal notices are designed to make you call — the call is where the real scam happens (remote access, fake refunds, banking details).', tells: ['Check your actual card statements — if no charge appeared, the renewal is fake', 'Calling the provided number connects you to a tech support scam operation', 'Real software subscriptions are managed through the software itself or the vendor website', 'Inflated amounts create urgency to call before you think clearly'], safe_move: 'Check your real card statement. If no charge appeared, delete the email. If unsure, check the software vendor\'s real website.', consequence: 'You call and are guided through "refund" steps that actually grant remote access or collect banking details.', behavioral_reinforcement: 'Check your actual card statement before calling any refund number — fake charges are often the entire setup.' },
    tags: ['tech_support_scam', 'refund_scam', 'phishing'], tricks: ['callback_number', 'fake_charge', 'urgency']
  },
  {
    id: 'preview_email_sub_002', channel: 'email', pattern_family: 'subscription_renewal', difficulty: 3, ground_truth: 'scam', ai_amplified: true, drill_type: 'preview',
    framing: 'You receive this email about a streaming service charge.',
    preview_focus: 'body',
    message: { from_name: 'StreamNow Billing', from_handle: 'billing@streamnow-billing-support.net', subject: 'Payment Failed — Update Billing to Keep Access', body: 'Your StreamNow subscription payment of $14.99 failed. Your account will be suspended in 48 hours unless you update your billing details.\n\n[Update Payment Method]\n\nTo avoid interruption of service, please click the link above and enter your current payment information.\n\nStreamNow Billing' },
    ground_truth: 'scam',
    red_flags: [
      { id: 'lookalike_billing_domain', label: 'streamnow-billing-support.net is not the real service domain' },
      { id: 'click_to_update_billing', label: 'Update billing link leads to a phishing page for card details' },
      { id: 'forty_eight_hour_deadline', label: '48-hour suspension threat creates urgency' },
      { id: 'net_tld_not_service_domain', label: '.net domain differs from real service domain pattern' }
    ],
    correct_red_flag_ids: ['lookalike_billing_domain', 'click_to_update_billing', 'forty_eight_hour_deadline'],
    explanation: { short: 'Payment failure emails from subscription services always direct you to log into the actual service — never to click a link to an external billing site.', tells: ['Real payment failure notices come from the service\'s actual domain', 'Update billing links in emails lead to phishing pages — go to the service directly', 'Log into the streaming service directly to check your actual payment status', '48-hour suspension threats create urgency that overrides careful domain checking'], safe_move: 'Log into the streaming service directly using your bookmark. Check payment settings there.', consequence: 'Card details entered on the phishing page are captured and used for unauthorized charges.', behavioral_reinforcement: 'Always update billing by logging into the service directly — never via a link in an email.' },
    tags: ['phishing', 'credential_harvest', 'subscription_scam'], tricks: ['urgency', 'lookalike_domain', 'fear_lockout']
  },
  {
    id: 'preview_email_sub_003', channel: 'email', pattern_family: 'subscription_renewal', difficulty: 2, ground_truth: 'legit', ai_amplified: false, drill_type: 'preview',
    framing: 'You receive this email from a cloud storage service.',
    preview_focus: 'sender',
    message: { from_name: 'CloudDrive', from_handle: 'noreply@clouddrive.com', subject: 'Your CloudDrive plan renews in 7 days — $9.99', body: 'Hi,\n\nYour CloudDrive Plus plan renews in 7 days for $9.99. Your card on file will be charged automatically.\n\nTo manage your subscription, visit clouddrive.com/account.\n\nQuestions? Contact us at support@clouddrive.com.\n\nCloudDrive' },
    ground_truth: 'legit',
    red_flags: [],
    correct_red_flag_ids: [],
    explanation: { short: 'This is a legitimate renewal notice — 7 days advance notice, matching domain, automatic charge, and directs you to the real website.', tells: ['Domain matches the service (clouddrive.com)', '7 days notice is ample time to verify or cancel', 'No urgent action required — charge is automatic as expected', 'Directs you to the real website path to manage your subscription'], safe_move: 'No action needed unless you want to cancel. Verify at clouddrive.com/account if desired.', consequence: 'No scam — a model subscription renewal notice.', behavioral_reinforcement: 'Legitimate renewal emails give advance notice, use the real domain, and don\'t require urgent action.' },
    tags: ['legit', 'subscription', 'billing'], tricks: []
  },
  {
    id: 'preview_sms_sub_004', channel: 'sms', pattern_family: 'subscription_renewal', difficulty: 3, ground_truth: 'scam', ai_amplified: false, drill_type: 'preview',
    framing: 'You get this text while watching TV.',
    preview_focus: 'body',
    message: { from_name: null, from_handle: '+1 (312) 555-0177', subject: null, body: 'StreamNow: Your subscription was charged $99.99 today. If this was not authorized, call 1-888-555-0122 to dispute. Reference: SN-2024-44812.' },
    ground_truth: 'scam',
    red_flags: [
      { id: 'inflated_charge_amount', label: '$99.99 charge is significantly higher than typical streaming prices' },
      { id: 'callback_number_sms', label: 'Provides a dispute phone number in the text — calling connects you to the scammer' },
      { id: 'full_phone_number_sender', label: 'Real service alerts come from short codes, not full phone numbers' },
      { id: 'dispute_call_pretext', label: 'Dispute call is a pretext for collecting banking details or granting remote access' }
    ],
    correct_red_flag_ids: ['inflated_charge_amount', 'callback_number_sms', 'full_phone_number_sender'],
    explanation: { short: 'Check your actual card statement — if no charge appeared, this text is entirely fabricated to get you to call a scammer.', tells: ['Check your bank app — if no charge appears, the text is fraudulent', 'Real streaming services use short codes and direct you to the app or website', 'Calling the number connects you to a scammer who will ask for card details to process a refund', 'Inflated amounts ($99.99 vs typical $15) are designed to alarm you into calling immediately'], safe_move: 'Check your actual bank statement. If no charge appears, delete the text. Never call numbers from unsolicited texts.', consequence: 'You call the number. The scammer asks for your card or banking details to process the refund, then charges your account.', behavioral_reinforcement: 'Always check your actual bank statement before calling any number from a text about a charge.' },
    tags: ['smishing', 'refund_scam', 'tech_support_scam'], tricks: ['fake_charge', 'callback_number', 'urgency']
  },
  {
    id: 'preview_email_sub_005', channel: 'email', pattern_family: 'subscription_renewal', difficulty: 3, ground_truth: 'scam', ai_amplified: true, drill_type: 'preview',
    framing: 'You receive this email about a VPN subscription you do not remember signing up for.',
    preview_focus: 'sender',
    message: { from_name: 'SecureNet VPN', from_handle: 'orders@securenet-vpn-confirm.com', subject: 'Order Confirmation — SecureNet VPN 2-Year Plan ($189.00)', body: 'Thank you for your purchase! Your 2-year SecureNet VPN plan has been activated.\n\nOrder: SN-88772\nCharge: $189.00 to card ending 4821\n\nIf you did not authorize this charge, contact us at 1-888-555-0131 or orders@securenet-vpn-confirm.com within 24 hours to request a refund.\n\nSecureNet VPN Team' },
    ground_truth: 'scam',
    red_flags: [
      { id: 'order_you_did_not_place', label: 'You did not purchase any VPN — this order is fabricated' },
      { id: 'lookalike_domain', label: 'securenet-vpn-confirm.com is not the real vendor domain' },
      { id: 'twenty_four_hour_refund_window', label: '24-hour refund window creates urgency to contact the scammer' },
      { id: 'partial_card_number_false_legitimacy', label: 'Showing a partial card number creates a false sense of legitimacy' }
    ],
    correct_red_flag_ids: ['order_you_did_not_place', 'lookalike_domain', 'twenty_four_hour_refund_window'],
    explanation: { short: 'Fake order confirmations with refund windows are designed to make you contact the scammer — check your real card statement first.', tells: ['The partial card number may be guessed or from a previous breach — it does not confirm the charge is real', 'Check your real card statement — if no $189 charge appears, this email is entirely fake', 'Contacting the provided number/email connects you to the scammer, not a real company', 'Real VPN order confirmations come from the vendor\'s actual domain'], safe_move: 'Check your actual card statement. If no charge appears, delete the email. If a charge did appear, contact your bank.', consequence: 'You contact the scammer\'s number or email. They request remote access or card details to process your refund.', behavioral_reinforcement: 'Check your real card statement before acting on any unexpected order confirmation.' },
    tags: ['refund_scam', 'tech_support_scam', 'phishing'], tricks: ['fake_charge', 'urgency', 'false_legitimacy']
  },
  {
    id: 'preview_email_sub_006', channel: 'email', pattern_family: 'subscription_renewal', difficulty: 4, ground_truth: 'legit', ai_amplified: false, drill_type: 'preview',
    framing: 'You get this email from a password manager you have used for two years.',
    preview_focus: 'body',
    message: { from_name: 'KeySafe', from_handle: 'billing@keysafe.io', subject: 'Your KeySafe Premium plan renews tomorrow — $35.88', body: 'Hi,\n\nA quick reminder that your KeySafe Premium annual plan renews tomorrow for $35.88. Your card on file will be charged automatically.\n\nIf you\'d like to update your payment method or cancel, you can do so at keysafe.io/account/billing.\n\nThank you for being a KeySafe member.\n\nKeySafe Billing' },
    ground_truth: 'legit',
    red_flags: [],
    correct_red_flag_ids: [],
    explanation: { short: 'This is a legitimate renewal notice — it comes from the real domain, is for the expected amount, and directs you to the real website to manage your account.', tells: ['Domain matches the service (keysafe.io)', 'Annual renewal amount ($35.88) is consistent with typical password manager pricing', 'No urgent action required — auto-charge is normal for annual plans', 'Directs you to a specific account page on the real domain, not an external link'], safe_move: 'No action needed. If you want to cancel, go to keysafe.io/account/billing using your bookmark.', consequence: 'No scam — a legitimate renewal notice for an expected annual charge.', behavioral_reinforcement: 'Legitimate renewal emails match the expected service, amount, and direct you to the real domain.' },
    tags: ['legit', 'subscription', 'billing'], tricks: []
  },

  // PREVIEW — qr_code (5)
  {
    id: 'preview_qr_parking_001', channel: 'sms', pattern_family: 'qr_code', difficulty: 3, ground_truth: 'scam', ai_amplified: false, drill_type: 'preview',
    framing: 'You parked your car and found a flyer with this QR code information, then received this text.',
    preview_focus: 'body',
    message: { from_name: null, from_handle: '+1 (424) 555-0166', subject: null, body: 'ParkEasy: Your parking session at Lot C begins now. To avoid a $75 fine, complete payment by scanning the QR code on the meter or at parkeasypay-lot-c.com. Session expires in 30 minutes.' },
    ground_truth: 'scam',
    red_flags: [
      { id: 'fine_threat_for_parking', label: '$75 fine threat creates panic to pay quickly without verifying' },
      { id: 'lookalike_parking_domain', label: 'parkeasypay-lot-c.com is not a legitimate parking payment site' },
      { id: 'qr_phishing_site', label: 'QR codes on meters may be stickers placed by scammers over real ones' },
      { id: 'time_pressure_thirty_min', label: '30-minute session expiry creates urgency' }
    ],
    correct_red_flag_ids: ['fine_threat_for_parking', 'lookalike_parking_domain', 'qr_phishing_site'],
    explanation: { short: 'Scammers place fake QR code stickers over real parking meter codes — always verify the URL before entering payment details.', tells: ['QR stickers on parking meters are a known physical scam — check if the code is a sticker over an original', 'The URL the QR leads to should match the real city or parking service — always check before paying', 'A fine threat creates panic that overrides careful URL inspection', 'Real city parking meters have consistent URL patterns you can verify'], safe_move: 'Before entering card details, verify the URL matches the official city or parking service website. Look for tampering on the meter.', consequence: 'Your card details are captured on the fake payment page. The real parking authority has no record of your payment.', behavioral_reinforcement: 'Always verify the URL a QR code leads to before entering any payment information.' },
    tags: ['qr_scam', 'smishing', 'phishing'], tricks: ['qr_phishing', 'urgency', 'lookalike_domain']
  },
  {
    id: 'preview_qr_restaurant_001', channel: 'dm', pattern_family: 'qr_code', difficulty: 3, ground_truth: 'scam', ai_amplified: true, drill_type: 'preview',
    framing: 'You scan a QR code at a restaurant table and receive this on your phone.',
    preview_focus: 'body',
    message: { from_name: null, from_handle: 'notification', subject: null, body: '[Website prompt]\n\nWelcome to Bistro 44! To view our menu, please verify you are a real customer by entering your email and creating a quick PIN. This helps us prevent bots from accessing our ordering system.\n\n[Email field] [Create PIN]\n\nURL shown: bistro44-menu-verify.com/access' },
    ground_truth: 'scam',
    red_flags: [
      { id: 'email_and_pin_for_menu', label: 'A restaurant menu should not require your email or a PIN to view' },
      { id: 'lookalike_restaurant_domain', label: 'bistro44-menu-verify.com is not the restaurant\'s real website' },
      { id: 'bot_verification_pretext', label: 'Bot verification pretext is used to justify collecting credentials' },
      { id: 'qr_leads_to_unexpected_site', label: 'Restaurant QR codes should go directly to a menu, not a login page' }
    ],
    correct_red_flag_ids: ['email_and_pin_for_menu', 'lookalike_restaurant_domain', 'bot_verification_pretext'],
    explanation: { short: 'Restaurant QR codes lead directly to menus — any QR that asks for credentials first should be treated as a phishing attempt.', tells: ['Real restaurant QR codes open menus immediately — no login or verification needed', 'The domain should match the restaurant\'s real website — check before entering anything', 'Email + PIN collection enables account attacks using your credentials elsewhere', 'A scammer\'s QR sticker may have been placed over the real restaurant\'s code'], safe_move: 'Do not enter any information. Ask the restaurant for the real menu link or a paper menu.', consequence: 'Your email and PIN are collected for credential stuffing attacks on other accounts.', behavioral_reinforcement: 'Restaurant QR menus never require login — any QR asking for credentials is a phishing attempt.' },
    tags: ['qr_scam', 'phishing', 'credential_harvest'], tricks: ['qr_phishing', 'fake_verification', 'credential_harvest']
  },
  {
    id: 'preview_qr_package_001', channel: 'email', pattern_family: 'qr_code', difficulty: 3, ground_truth: 'scam', ai_amplified: false, drill_type: 'preview',
    framing: 'You receive this email with a QR code about a package delivery.',
    preview_focus: 'body',
    message: { from_name: 'NovaMart Delivery', from_handle: 'delivery@novamart-shipping-update.com', subject: 'Action Required: Scan QR to Confirm Delivery Address', body: 'Your NovaMart order is ready to ship but requires address confirmation. Please scan the QR code below or visit the link to update your delivery address within 24 hours.\n\n[QR CODE IMAGE]\n\nURL: novamart-address-confirm.com/update\n\nOrder will be held after 24 hours.\n\nNovaMart Delivery' },
    ground_truth: 'scam',
    red_flags: [
      { id: 'qr_in_email', label: 'QR codes in emails are used to bypass link-scanning security tools' },
      { id: 'lookalike_novamart_domain', label: 'novamart-shipping-update.com and novamart-address-confirm.com are not real' },
      { id: 'address_confirmation_pretext', label: 'Address confirmation is a pretext to collect personal and payment information' },
      { id: 'order_held_threat', label: 'Order being held after 24 hours creates urgency' }
    ],
    correct_red_flag_ids: ['qr_in_email', 'lookalike_novamart_domain', 'address_confirmation_pretext'],
    explanation: { short: 'QR codes in emails are used specifically to evade email security filters — the domains they link to are almost always phishing sites.', tells: ['Legitimate delivery services direct you to your account on their real website, not QR codes in email', 'QR codes in emails hide the destination URL until you have already scanned them', 'Address confirmation is a pretext to collect your real home address and payment details', 'Check your real account on the retailer\'s website to see actual order status'], safe_move: 'Log into your account directly at the real retailer\'s website to check your order. Do not scan the QR code.', consequence: 'The QR code leads to a phishing site collecting your address, card details, or login credentials.', behavioral_reinforcement: 'Never scan QR codes in emails about orders — check your account directly on the real website.' },
    tags: ['qr_scam', 'phishing', 'delivery_scam'], tricks: ['qr_phishing', 'lookalike_domain', 'urgency']
  },
  {
    id: 'preview_qr_charity_001', channel: 'dm', pattern_family: 'qr_code', difficulty: 2, ground_truth: 'scam', ai_amplified: false, drill_type: 'preview',
    framing: 'You receive a social media message with a QR code asking for charity donations.',
    preview_focus: 'body',
    message: { from_name: 'Relief Aid Network', from_handle: '@reliefaidnetwork', subject: null, body: 'We are collecting emergency relief donations for flood victims. Scan the QR below to donate. Every dollar helps displaced families get food and shelter. Donations are tax deductible.\n\n[QR CODE]\n\nDonate at: relief-aid-flood-fund.com' },
    ground_truth: 'scam',
    red_flags: [
      { id: 'unverifiable_qr_charity', label: 'Relief Aid Network cannot be verified as a registered nonprofit' },
      { id: 'qr_code_in_social_dm', label: 'QR codes in social DMs for donations are a high-risk pattern' },
      { id: 'tax_deductible_unregistered', label: 'Claiming tax deductibility for an unregistered organization is false' },
      { id: 'disaster_urgency', label: 'Flood victim urgency exploits compassion to bypass verification' }
    ],
    correct_red_flag_ids: ['unverifiable_qr_charity', 'qr_code_in_social_dm', 'tax_deductible_unregistered'],
    explanation: { short: 'Disaster charity QR codes on social media are a common scam — always verify an organization through charity registries before donating.', tells: ['Only verified nonprofit organizations can offer tax deductibility — unregistered groups cannot', 'Verify any charity at Charity Navigator or GuideStar before donating', 'QR codes bypass URL inspection — the destination is unknown until scanned', 'Disaster relief scams appear within hours of news events'], safe_move: 'Verify the organization at Charity Navigator. If verified, donate through their official website directly.', consequence: 'Your donation goes to the scammer. No disaster victims receive any aid.', behavioral_reinforcement: 'Always verify charity registrations before donating, especially after disaster events.' },
    tags: ['charity_scam', 'qr_scam', 'social_media_scam'], tricks: ['emotional_appeal', 'qr_phishing', 'fake_legitimacy']
  },
  {
    id: 'preview_qr_crypto_001', channel: 'sms', pattern_family: 'qr_code', difficulty: 3, ground_truth: 'scam', ai_amplified: true, drill_type: 'preview',
    framing: 'You get a text with a QR code about verifying a crypto wallet.',
    preview_focus: 'body',
    message: { from_name: null, from_handle: '+1 (702) 555-0141', subject: null, body: 'CoinVault: Security alert. Your wallet requires re-verification due to a system migration. Scan the QR below or visit coinvault-secure-migration.com to complete verification within 48 hours or your funds will be locked.\n\n[QR CODE]' },
    ground_truth: 'scam',
    red_flags: [
      { id: 'wallet_verification_qr', label: 'Crypto wallets do not require re-verification via SMS QR codes' },
      { id: 'lookalike_crypto_domain', label: 'coinvault-secure-migration.com is not the real platform domain' },
      { id: 'funds_locked_threat', label: 'Funds locked threat creates maximum urgency for crypto holders' },
      { id: 'migration_pretext', label: 'System migration pretext is used to make verification seem necessary' }
    ],
    correct_red_flag_ids: ['wallet_verification_qr', 'lookalike_crypto_domain', 'funds_locked_threat'],
    explanation: { short: 'Crypto platforms do not migrate wallets via SMS QR codes — this is designed to steal your seed phrase or credentials.', tells: ['Real platform migrations are announced within the app with no action required from users', 'QR codes from text messages for crypto verification always lead to phishing sites', 'The site collects your seed phrase or login credentials to drain your wallet', 'Log into the real platform through your bookmarked URL to check for any real alerts'], safe_move: 'Log into the crypto platform directly through your bookmark. If no migration alert exists there, this text is fraudulent.', consequence: 'The QR leads to a site that collects your login credentials or seed phrase. Your wallet is drained.', behavioral_reinforcement: 'Never verify a crypto wallet via a QR code from a text — check the real platform directly.' },
    tags: ['qr_scam', 'crypto_scam', 'smishing'], tricks: ['qr_phishing', 'fear_lockout', 'lookalike_domain']
  },

  // PREVIEW — government_impersonation (5)
  {
    id: 'preview_sms_gov_001', channel: 'sms', pattern_family: 'government_impersonation', difficulty: 2, ground_truth: 'scam', ai_amplified: false, drill_type: 'preview',
    framing: 'You get this text from a government-looking number.',
    preview_focus: 'sender',
    message: { from_name: 'DMV Renewals', from_handle: '+1 (916) 555-0143', subject: null, body: 'NOTICE: Your vehicle registration has expired. Pay the $42 renewal fee at dmv-online-renew.com to avoid a $200 fine. Act before Friday.' },
    ground_truth: 'scam',
    red_flags: [
      { id: 'lookalike_gov_domain', label: 'dmv-online-renew.com is not an official state government domain' },
      { id: 'sms_from_dmv', label: 'DMV departments send paper mail, not unsolicited texts' },
      { id: 'fine_threat_urgency', label: '$200 fine threat creates urgency to pay without verifying' },
      { id: 'friday_deadline', label: 'Friday deadline prevents you from calling the real DMV to verify' }
    ],
    correct_red_flag_ids: ['lookalike_gov_domain', 'sms_from_dmv', 'fine_threat_urgency'],
    explanation: { short: 'DMV agencies communicate by postal mail — any text about vehicle registration is a phishing attempt using a lookalike domain.', tells: ['Official government sites for your state use .gov domains', 'DMV notices come by postal mail, not SMS', 'Check your real registration status on your state\'s official .gov DMV website', 'The $200 fine threat creates panic that overrides careful domain inspection'], safe_move: 'Check your registration status on your state\'s official .gov DMV website. Ignore this text.', consequence: 'Your card details are captured on the fake payment site. Your registration remains expired.', behavioral_reinforcement: 'Government agencies use .gov domains — any other domain claiming to be government is a scam.' },
    tags: ['government_scam', 'smishing', 'phishing'], tricks: ['urgency', 'lookalike_domain', 'authority_impersonation']
  },
  {
    id: 'preview_email_gov_002', channel: 'email', pattern_family: 'government_impersonation', difficulty: 3, ground_truth: 'scam', ai_amplified: true, drill_type: 'preview',
    framing: 'You get this email about unclaimed property.',
    preview_focus: 'sender',
    message: { from_name: 'State Treasury — Unclaimed Property', from_handle: 'unclaimed@state-treasury-claims.com', subject: 'You Have Unclaimed Funds — Claim Before Expiry', body: 'Our records show you have $1,847 in unclaimed property registered under your name. Claim your funds at state-treasury-claim.com/verify before the 90-day expiry date.\n\nProvide your full name, date of birth, and Social Security Number to verify your identity and initiate transfer.\n\nState Treasury Office' },
    ground_truth: 'scam',
    red_flags: [
      { id: 'ssn_for_unclaimed_property', label: 'Requests Social Security Number by email to claim funds' },
      { id: 'lookalike_gov_domain', label: 'state-treasury-claims.com and state-treasury-claim.com are not .gov domains' },
      { id: 'expiry_on_unclaimed_property', label: 'Real unclaimed property programs do not expire — this is false pressure' },
      { id: 'pii_required_by_email', label: 'Requests name, DOB, and SSN — complete identity theft package' }
    ],
    correct_red_flag_ids: ['ssn_for_unclaimed_property', 'lookalike_gov_domain', 'pii_required_by_email'],
    explanation: { short: 'Real unclaimed property programs are free to search and never ask for your SSN by email — they use secure portals on .gov domains.', tells: ['Official unclaimed property programs use .gov domains', 'You can search unclaimed property yourself at your state\'s official website for free', 'SSN, name, and DOB submitted by email enables full identity theft', 'Unclaimed property does not expire — the 90-day expiry is fabricated pressure'], safe_move: 'Search for unclaimed property yourself at your state\'s official .gov unclaimed property website. Never provide SSN by email.', consequence: 'Your SSN, DOB, and name are used for identity theft — new accounts, tax fraud, and financial crime.', behavioral_reinforcement: 'Search for unclaimed property yourself on .gov sites — never provide your SSN in response to an email.' },
    tags: ['government_scam', 'identity_theft', 'phishing'], tricks: ['pii_harvest', 'lookalike_domain', 'urgency']
  },
  {
    id: 'preview_sms_gov_003', channel: 'sms', pattern_family: 'government_impersonation', difficulty: 2, ground_truth: 'legit', ai_amplified: false, drill_type: 'preview',
    framing: 'You signed up for text alerts from your state unemployment office and get this.',
    preview_focus: 'sender',
    message: { from_name: null, from_handle: '77311', subject: null, body: 'StateBenefits: Your biweekly certification is due by Sunday. Log into your account at benefits.state.gov to complete it. Reply STOP to opt out.' },
    ground_truth: 'legit',
    red_flags: [],
    correct_red_flag_ids: [],
    explanation: { short: 'This is a legitimate government text — it comes from a short code, links to a .gov domain, and only asks you to log into your real account.', tells: ['Sent from a short code (77311), not a full phone number', 'Links to a .gov domain — official government websites', 'You signed up for these alerts — this is expected and solicited', 'No urgency threat, no fees, no requests for personal information'], safe_move: 'Log into your state benefits account at the official .gov website to complete your certification.', consequence: 'No scam — a legitimate government benefit reminder.', behavioral_reinforcement: 'Legitimate government texts use short codes and only link to .gov domains.' },
    tags: ['legit', 'government', 'benefits'], tricks: []
  },
  {
    id: 'preview_email_gov_004', channel: 'email', pattern_family: 'government_impersonation', difficulty: 3, ground_truth: 'scam', ai_amplified: false, drill_type: 'preview',
    framing: 'You get this email claiming to be about your stimulus payment.',
    preview_focus: 'body',
    message: { from_name: 'Federal Relief Office', from_handle: 'relief@federal-relief-payment.com', subject: 'Your Economic Relief Payment Is Ready', body: 'Dear Citizen,\n\nYour federal economic relief payment of $1,400 has been approved and is ready for disbursement. To receive your payment, verify your banking information at federal-payment-verify.com within 5 business days.\n\nFederal Relief Payment Office' },
    ground_truth: 'scam',
    red_flags: [
      { id: 'bank_details_for_payment', label: 'Requests banking information to disburse a government payment' },
      { id: 'lookalike_gov_domain', label: 'federal-relief-payment.com and federal-payment-verify.com are not .gov domains' },
      { id: 'unsolicited_payment_notice', label: 'You did not apply for or expect this specific payment' },
      { id: 'verify_banking_pretext', label: 'Bank verification is a pretext to capture account details' }
    ],
    correct_red_flag_ids: ['bank_details_for_payment', 'lookalike_gov_domain', 'verify_banking_pretext'],
    explanation: { short: 'Government payments are issued automatically through the IRS using tax records — no agency emails you to verify banking details.', tells: ['Government payments use banking information already on file with the IRS', 'Official government communication uses .gov domains', 'Providing banking details to an unofficial site enables direct ACH withdrawal', 'If you are owed a real payment, it will arrive without any action required'], safe_move: 'Check the status of any real government payments at irs.gov or through your official tax account.', consequence: 'Your banking details are used to initiate fraudulent ACH withdrawals from your account.', behavioral_reinforcement: 'Government payments are issued automatically — no agency emails you to verify banking details.' },
    tags: ['government_scam', 'phishing', 'banking_fraud'], tricks: ['authority_impersonation', 'lookalike_domain', 'pii_harvest']
  },
  {
    id: 'preview_sms_gov_005', channel: 'sms', pattern_family: 'government_impersonation', difficulty: 3, ground_truth: 'scam', ai_amplified: true, drill_type: 'preview',
    framing: 'You get this text claiming your driver\'s license is about to be suspended.',
    preview_focus: 'body',
    message: { from_name: 'State Motor Vehicles', from_handle: '+1 (503) 555-0177', subject: null, body: 'FINAL NOTICE: Your driver\'s license will be suspended in 24 hours due to an unpaid traffic violation. Pay $89 at dmv-violation-pay.com to prevent suspension. Case: MV-2024-77812.' },
    ground_truth: 'scam',
    red_flags: [
      { id: 'license_suspension_sms', label: 'License suspension notices come by postal mail, not unsolicited texts' },
      { id: 'lookalike_dmv_domain', label: 'dmv-violation-pay.com is not an official government domain' },
      { id: 'twenty_four_hour_suspension', label: '24-hour suspension threat is fabricated to create immediate panic' },
      { id: 'full_phone_number_sender', label: 'Government agencies do not send suspension notices from personal phone numbers' }
    ],
    correct_red_flag_ids: ['license_suspension_sms', 'lookalike_dmv_domain', 'twenty_four_hour_suspension'],
    explanation: { short: 'Driver\'s license suspension notices come by certified mail — any text claiming 24-hour suspension is a phishing attempt.', tells: ['DMV suspension notices are sent by certified postal mail with appeal rights', 'Official DMV websites are state .gov domains — not .com domains with DMV in the name', 'A 24-hour deadline on a legal action is legally implausible', 'Verify any real traffic violations through your state\'s official DMV website directly'], safe_move: 'Check your license status on your state\'s official .gov DMV website. Ignore this text.', consequence: 'Card details entered on the fake payment site are captured. No real violation is resolved.', behavioral_reinforcement: 'License suspension notices come by mail — texts about 24-hour suspensions are always scams.' },
    tags: ['government_scam', 'smishing', 'phishing'], tricks: ['fear_lockout', 'lookalike_domain', 'urgency']
  },

  // PREVIEW — prize_lottery (6)
  {
    id: 'preview_sms_prize_001', channel: 'sms', pattern_family: 'prize_lottery', difficulty: 2, ground_truth: 'scam', ai_amplified: false, drill_type: 'preview',
    framing: 'You get this text after shopping at a mall last weekend.',
    preview_focus: 'sender',
    message: { from_name: null, from_handle: '+1 (818) 555-0134', subject: null, body: 'Congratulations! Your receipt from NovaMart entered you in our Spring Giveaway. You won a $500 gift card! Claim at novamart-spring-winners.com before Sunday.' },
    ground_truth: 'scam',
    red_flags: [
      { id: 'lookalike_brand_domain', label: 'novamart-spring-winners.com is not the real store website' },
      { id: 'prize_via_full_number', label: 'Real brand prize notifications use official channels, not random phone numbers' },
      { id: 'sunday_claim_deadline', label: 'Sunday deadline creates pressure to claim before verifying the site' },
      { id: 'phishing_claim_site', label: 'The claim site collects card details to receive your prize' }
    ],
    correct_red_flag_ids: ['lookalike_brand_domain', 'prize_via_full_number', 'sunday_claim_deadline'],
    explanation: { short: 'Real brand giveaways are announced on official websites and social channels — not via text from unknown numbers linking to lookalike domains.', tells: ['Check whether the URL matches the real brand\'s actual domain', 'Real giveaway notifications come through the brand\'s official app, website, or receipt — not random texts', 'Claim sites for prizes always ask for payment details to deliver your reward', 'Search the brand\'s actual website to see if this promotion is listed there'], safe_move: 'Check the brand\'s real website to see if this promotion exists. If it\'s not listed there, it\'s a scam.', consequence: 'The claim site captures your card details to cover a small delivery fee, then charges larger amounts.', behavioral_reinforcement: 'Verify any prize promotion on the brand\'s real website before entering any information.' },
    tags: ['prize_scam', 'smishing', 'phishing'], tricks: ['lookalike_domain', 'urgency', 'fake_prize']
  },
  {
    id: 'preview_email_prize_002', channel: 'email', pattern_family: 'prize_lottery', difficulty: 3, ground_truth: 'scam', ai_amplified: true, drill_type: 'preview',
    framing: 'You receive this email about winning a cash prize.',
    preview_focus: 'sender',
    message: { from_name: 'Winners Circle Foundation', from_handle: 'prizes@winners-circle-foundation.net', subject: 'You Have Won $10,000 — Claim Your Prize', body: 'Dear Winner,\n\nYour email was randomly selected from 2.4 million entries in our Global Generosity Sweepstakes. You have won $10,000 USD.\n\nTo claim, provide your full name, home address, and phone number and pay a $195 release fee at winners-claim.net/verify.\n\nClaim within 72 hours.\n\nWinners Circle Foundation' },
    ground_truth: 'scam',
    red_flags: [
      { id: 'fee_to_claim_cash_prize', label: 'Requires a fee to release cash prize winnings' },
      { id: 'never_entered_sweepstakes', label: 'You never entered this sweepstakes' },
      { id: 'lookalike_domain', label: 'winners-circle-foundation.net and winners-claim.net are not legitimate organizations' },
      { id: 'pii_plus_fee_combo', label: 'Collecting home address, phone, and fee enables both theft and physical targeting' }
    ],
    correct_red_flag_ids: ['fee_to_claim_cash_prize', 'never_entered_sweepstakes', 'pii_plus_fee_combo'],
    explanation: { short: 'You cannot win a sweepstakes you never entered, and real prizes never require release fees.', tells: ['The $195 release fee is the entire scam — no $10,000 exists', 'Collecting home address enables follow-up mail scams and physical targeting', 'Legitimate sweepstakes have verifiable rules, sponsors, and contact information', '72-hour deadlines prevent you from researching whether the organization is real'], safe_move: 'Ignore and delete. You have not won anything.', consequence: 'You pay $195 and provide your home address. Further fees follow. No prize is ever received.', behavioral_reinforcement: 'Any prize that requires an upfront fee is a scam — real prizes never cost you money to receive.' },
    tags: ['prize_scam', 'advance_fee', 'phishing'], tricks: ['advance_fee', 'urgency', 'pii_harvest']
  },
  {
    id: 'preview_sms_prize_003', channel: 'sms', pattern_family: 'prize_lottery', difficulty: 3, ground_truth: 'scam', ai_amplified: false, drill_type: 'preview',
    framing: 'You get a text saying you won a gift card from a survey.',
    preview_focus: 'body',
    message: { from_name: null, from_handle: '+1 (213) 555-0166', subject: null, body: 'You completed a survey last month and won a $250 NovaMart gift card! Visit survey-rewards-hub.com/gift and enter code GIFT250 to claim. Expires in 48 hours.' },
    ground_truth: 'scam',
    red_flags: [
      { id: 'lookalike_reward_domain', label: 'survey-rewards-hub.com is not a real survey company domain' },
      { id: 'survey_you_may_not_remember', label: 'Vague reference to a survey you may or may not have completed' },
      { id: 'gift_card_claim_code', label: 'Claim code creates the illusion of a real prize waiting for you' },
      { id: 'forty_eight_hour_expiry', label: '48-hour expiry prevents research before clicking' }
    ],
    correct_red_flag_ids: ['lookalike_reward_domain', 'survey_you_may_not_remember', 'forty_eight_hour_expiry'],
    explanation: { short: 'Survey reward links in texts almost always lead to phishing sites that harvest card details under the pretense of a small delivery fee.', tells: ['Real survey rewards are fulfilled through the survey platform you used — not random texts', 'The vague survey reference covers the fact that you may never have completed one', 'The claim code creates a false sense that a prize is already assigned to you', 'Claim sites typically ask for card details to cover a small S&H fee to deliver the gift card'], safe_move: 'If you want to verify, check the actual survey platform\'s website you used — not this link.', consequence: 'Your card details are captured to cover a small delivery fee, then used for larger unauthorized charges.', behavioral_reinforcement: 'Survey reward texts are almost always phishing attempts — check the real survey platform instead.' },
    tags: ['prize_scam', 'smishing', 'phishing'], tricks: ['fake_prize', 'urgency', 'lookalike_domain']
  },
  {
    id: 'preview_email_prize_004', channel: 'email', pattern_family: 'prize_lottery', difficulty: 2, ground_truth: 'legit', ai_amplified: false, drill_type: 'preview',
    framing: 'You entered a raffle at a local community event last weekend.',
    preview_focus: 'sender',
    message: { from_name: 'Westside Community Center', from_handle: 'events@westsidecc.org', subject: 'Raffle Winner — Spring Fair 2024', body: 'Congratulations! Your raffle ticket #4412 was drawn as a winner at Saturday\'s Spring Fair. You\'ve won a $50 restaurant gift card.\n\nPlease stop by the community center office at 88 Park Ave between 9am-5pm this week to pick up your prize. Bring this email as confirmation.\n\nWestside Community Center Events Team\n(555) 204-3310' },
    ground_truth: 'legit',
    red_flags: [],
    correct_red_flag_ids: [],
    explanation: { short: 'This is a legitimate prize notification — you actually entered this raffle, it comes from a community org domain, and requires you to pick up the prize in person.', tells: ['You entered this raffle in person at a real event', 'In-person pickup means no card details or fees required', 'Phone number provided for verification', 'No urgency, no fees, no links to enter information'], safe_move: 'Visit the community center during business hours with this email to pick up your prize.', consequence: 'No scam — this is what a legitimate small raffle prize notification looks like.', behavioral_reinforcement: 'Legitimate local prize notices don\'t require card details — you pick up prizes in person.' },
    tags: ['legit', 'prize', 'community'], tricks: []
  },
  {
    id: 'preview_email_prize_005', channel: 'email', pattern_family: 'prize_lottery', difficulty: 3, ground_truth: 'scam', ai_amplified: true, drill_type: 'preview',
    framing: 'You get this email out of the blue.',
    preview_focus: 'body',
    message: { from_name: 'International Lottery Commission', from_handle: 'awards@intl-lottery-commission.org', subject: 'Second Notice: Unclaimed Prize — $50,000', body: 'This is your second and final notice regarding your unclaimed international lottery prize of $50,000 USD. Your ticket number 7-7-2-4-9 was drawn in our quarterly global lottery.\n\nTo claim, contact our claims agent at +44 7911 123456 or claims@intl-claims-office.com. A processing deposit of $450 is required to release your winnings.\n\nInternational Lottery Commission' },
    ground_truth: 'scam',
    red_flags: [
      { id: 'never_entered_international_lottery', label: 'You never entered any international lottery' },
      { id: 'large_processing_deposit', label: '$450 processing deposit to receive $50,000 is a classic advance fee pattern' },
      { id: 'second_notice_urgency', label: 'Second and final notice is fabricated — no first notice was ever sent' },
      { id: 'international_phone_number', label: 'International phone number from a lottery you never entered' }
    ],
    correct_red_flag_ids: ['never_entered_international_lottery', 'large_processing_deposit', 'second_notice_urgency'],
    explanation: { short: 'International lottery scams always require a fee to release the prize — the fee is the scam, and the prize does not exist.', tells: ['You cannot win a lottery you never entered', 'Processing deposits for lottery winnings are always fraudulent', 'Second notices for prizes you never knew about are fabricated urgency', 'Real lotteries deduct taxes from winnings — they do not charge upfront fees'], safe_move: 'Ignore and delete. You have not won anything.', consequence: 'You pay the $450 and are asked for additional fees. No prize is ever received.', behavioral_reinforcement: 'Any lottery prize requiring upfront payment is 100% a scam — real prizes do not cost money to receive.' },
    tags: ['prize_scam', 'advance_fee', 'international_lottery'], tricks: ['advance_fee', 'urgency', 'fake_prize']
  },
  {
    id: 'preview_sms_prize_006', channel: 'sms', pattern_family: 'prize_lottery', difficulty: 2, ground_truth: 'scam', ai_amplified: false, drill_type: 'preview',
    framing: 'You get this text on a Saturday morning.',
    preview_focus: 'body',
    message: { from_name: null, from_handle: '+1 (305) 555-0177', subject: null, body: 'FINAL NOTICE: Your $1,200 reward from the National Consumer Survey is expiring today. Visit consumer-reward-redeem.com/final to claim. This is your last chance.' },
    ground_truth: 'scam',
    red_flags: [
      { id: 'reward_expiring_today', label: 'Today expiration creates maximum urgency before you can think clearly' },
      { id: 'national_survey_vague', label: 'Vague reference to a national consumer survey you cannot verify' },
      { id: 'lookalike_reward_domain', label: 'consumer-reward-redeem.com is not a legitimate survey company' },
      { id: 'final_notice_pressure', label: 'Final notice framing implies prior notices you never received' }
    ],
    correct_red_flag_ids: ['reward_expiring_today', 'lookalike_reward_domain', 'final_notice_pressure'],
    explanation: { short: 'Final notice texts for rewards expiring today are designed to prevent any research or verification before you click and enter your details.', tells: ['Same-day expiration leaves no time to verify the survey company or URL', 'Final notice implies history that does not exist — manufactured pressure', 'The reward claim site will ask for card details to cover a delivery fee', 'Real survey rewards come through the platform used to complete the survey, not random texts'], safe_move: 'Ignore. You have not won a reward.', consequence: 'The claim site captures card details. Your card is used for unauthorized charges.', behavioral_reinforcement: 'Urgency is the enemy of good judgment — same-day prize expiration texts are always scams.' },
    tags: ['prize_scam', 'smishing', 'phishing'], tricks: ['urgency', 'lookalike_domain', 'fake_prize']
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
