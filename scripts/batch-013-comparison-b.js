const fs = require('fs');
const drills = JSON.parse(fs.readFileSync('data/drills.json', 'utf-8'));
const REAL_BRANDS = ['Amazon','Google','Apple','Microsoft','PayPal','Chase','Wells Fargo','Coinbase','Facebook','Instagram','Netflix','UPS','FedEx','DHL','Venmo','Zelle','Cash App','WhatsApp','Telegram','LinkedIn','Indeed','Twitter','Snapchat','TikTok'];

const newDrills = [
  {
    id: 'comp_email_invoice_bec_vs_legit_002', channel: 'email', pattern_family: 'invoice_vendor', difficulty: 4, ground_truth: 'scam', ai_amplified: true, drill_type: 'comparison',
    framing: 'Two emails from vendors arrive the same afternoon. Which one is the scam?',
    messages: [
      { label: 'A', from_handle: 'invoices@cleanspaceservices.com', from_name: 'CleanSpace Services', subject: 'Invoice #CS-1210 — November Services', body: 'Hi Team,\n\nInvoice #CS-1210 for November cleaning services — $420.00, due December 15. Pay by check or ACH to account on file.\n\nCleanSpace Services, (555) 203-4410' },
      { label: 'B', from_handle: 'billing@officesupply-direct-invoices.com', from_name: 'OfficeSupply Direct', subject: 'Invoice #INV-2024-7741 — Payment Due in 5 Days', body: 'Invoice #INV-2024-7741 — $3,847.00 for October supplies. Payment via wire transfer to the account attached. Overdue fees apply after 5 days.\n\nOfficeSupply Direct Accounts Receivable' }
    ],
    scam_label: 'B',
    red_flags: [
      { id: 'b_lookalike_vendor_domain', label: 'B: officesupply-direct-invoices.com adds "invoices" — not the real vendor domain' },
      { id: 'b_wire_transfer_payment', label: 'B: Requests wire transfer — irreversible and preferred by scammers' },
      { id: 'b_large_amount_no_po', label: 'B: $3,847 with no verifiable purchase order reference' },
      { id: 'a_standard_invoice', label: 'A: Matching domain, standard payment terms, verifiable phone number' }
    ],
    correct_red_flag_ids: ['b_lookalike_vendor_domain', 'b_wire_transfer_payment', 'b_large_amount_no_po'],
    explanation: { short: 'A is a normal recurring service invoice. B uses a lookalike vendor domain and requests wire transfer for a large unverified amount.', tells: ['Vendor domains with extra words like "invoices" appended are a BEC red flag', 'Wire transfers are preferred by scammers because they are irreversible', 'Verify all invoices against purchase orders before payment'], safe_move: 'Pay A through normal accounts payable. Verify B by calling the real vendor using a number from your own records before paying.', consequence: 'Wiring B\'s payment sends funds directly to the scammer\'s account. Wire transfers cannot be recalled.', behavioral_reinforcement: 'Verify large wire transfer invoices by phone before payment.' },
    tags: ['bec', 'invoice_scam', 'comparison'], tricks: ['lookalike_domain', 'wire_fraud', 'fake_invoice']
  },
  {
    id: 'comp_sms_package_vs_legit_001', channel: 'sms', pattern_family: 'delivery_toll', difficulty: 2, ground_truth: 'scam', ai_amplified: false, drill_type: 'comparison',
    framing: 'Two package tracking texts arrive. Which one is the scam?',
    messages: [
      { label: 'A', from_handle: '48773', from_name: null, body: 'ShipTrack: Your package is out for delivery. Estimated arrival: today by 8pm. Track: shiptrack.com/NSP-440192. Reply STOP to opt out.' },
      { label: 'B', from_handle: '+1 (657) 555-0143', from_name: 'NexShip', body: 'NexShip: Your package is held due to incomplete address. Pay $2.49 at nexship-delivery-update.com/pay to release your delivery today.' }
    ],
    scam_label: 'B',
    red_flags: [
      { id: 'b_fee_to_release_package', label: 'B: Shipping carriers never charge fees to release packages' },
      { id: 'b_full_number_sender', label: 'B: Carrier delivery texts use short codes, not full phone numbers' },
      { id: 'b_lookalike_carrier_domain', label: 'B: nexship-delivery-update.com is not a real carrier website' },
      { id: 'a_short_code_real_tracking', label: 'A: Short code sender with a real tracking number and service domain' }
    ],
    correct_red_flag_ids: ['b_fee_to_release_package', 'b_full_number_sender', 'b_lookalike_carrier_domain'],
    explanation: { short: 'A is a standard delivery notification from a short code. B charges a fee to release a package — which no carrier ever does.', tells: ['No shipping carrier charges fees to release packages for address issues', 'Real carrier texts use short codes and their real domain', 'The small fee is a pretext to capture your card for larger charges'], safe_move: 'Track your package via A\'s link. Ignore B.', consequence: 'Paying B\'s fee captures your card details for larger unauthorized charges.', behavioral_reinforcement: 'No carrier charges delivery release fees — any text doing so is a scam.' },
    tags: ['delivery_scam', 'smishing', 'comparison'], tricks: ['fee_harvesting', 'lookalike_domain']
  },
  {
    id: 'comp_dm_romance_vs_legit_001', channel: 'dm', pattern_family: 'romance_social', difficulty: 3, ground_truth: 'scam', ai_amplified: false, drill_type: 'comparison',
    framing: 'Two people you matched with online send you messages. Which one is the scammer?',
    messages: [
      { label: 'A', from_handle: '@lisa.chen.chi', from_name: 'Lisa C', body: 'Hey! I saw you also like hiking — did you do the lakefront trail last weekend? I was there Saturday morning. Also, are you free for coffee sometime this week?' },
      { label: 'B', from_handle: '@col.james.harris.usa', from_name: 'James Harris', body: 'I feel such a strong connection with you already. I am stationed overseas and my savings are in a frozen military account. Could you help with my transport home — $680 ticket? I\'ll repay you immediately when I land.' }
    ],
    scam_label: 'B',
    red_flags: [
      { id: 'b_military_overseas_persona', label: 'B: Military overseas persona is the most common romance scam archetype' },
      { id: 'b_frozen_funds_story', label: 'B: Frozen military funds is a scripted setup for a loan request' },
      { id: 'b_money_before_meeting', label: 'B: Requests money before any in-person contact' },
      { id: 'a_local_in_person_interest', label: 'A: References a real local activity and proposes in-person meeting' }
    ],
    correct_red_flag_ids: ['b_military_overseas_persona', 'b_money_before_meeting', 'b_frozen_funds_story'],
    explanation: { short: 'A wants to meet in person — normal. B asks for money before meeting and uses the military-overseas-frozen-funds script.', tells: ['Military overseas romance scams follow a predictable script', 'Any money request before in-person meeting is a romance scam indicator', 'Real romantic connections progress toward meeting — scam connections progress toward money'], safe_move: 'Coffee with A is fine. Never send money to B — end contact.', consequence: 'Sending B $680 leads to more requests. The person never arrives.', behavioral_reinforcement: 'Never send money to an online romantic interest before meeting in person.' },
    tags: ['romance_scam', 'comparison', 'military_impersonation'], tricks: ['emotional_bond', 'advance_fee', 'military_persona']
  },
  {
    id: 'comp_email_tax_vs_legit_001', channel: 'email', pattern_family: 'government_impersonation', difficulty: 3, ground_truth: 'scam', ai_amplified: false, drill_type: 'comparison',
    framing: 'Two tax-related emails arrive in the same week. Which one is the scam?',
    messages: [
      { label: 'A', from_handle: 'noreply@irs.gov', from_name: 'IRS', subject: 'Notice CP12 — Changes to your return', body: 'We made a change to your 2023 tax return. Review the details and respond if needed at irs.gov/account. If you agree with our change, no response is needed.\n\nInternal Revenue Service' },
      { label: 'B', from_handle: 'refunds@fedtax-refund-portal.com', from_name: 'Federal Tax Refund Office', subject: '$847 refund expiring — provide banking details', body: 'Your $847 refund from 2023 expires in 72 hours. Provide your routing and account number at federal-payment-verify.com to receive your funds.\n\nFederal Tax Refund Office' }
    ],
    scam_label: 'B',
    red_flags: [
      { id: 'b_non_gov_domain', label: 'B: fedtax-refund-portal.com is not a .gov domain — all real IRS communications use .gov' },
      { id: 'b_banking_details_by_email', label: 'B: IRS never requests banking details by email' },
      { id: 'b_refund_expiry', label: 'B: Tax refunds do not expire — fabricated urgency' },
      { id: 'a_irs_gov_no_action', label: 'A: Comes from irs.gov, no action needed if you agree, directs to real account portal' }
    ],
    correct_red_flag_ids: ['b_non_gov_domain', 'b_banking_details_by_email', 'b_refund_expiry'],
    explanation: { short: 'A is from irs.gov and requires no action if you agree. B uses a non-.gov domain and requests banking details for a refund that does not expire.', tells: ['All IRS communication uses .gov domains only', 'The IRS never requests banking details by email — refunds use information already on file', 'Tax refunds do not expire with a 72-hour deadline'], safe_move: 'Verify A at irs.gov/account. Ignore B completely.', consequence: 'Providing banking details to B enables direct ACH withdrawal from your account.', behavioral_reinforcement: 'IRS communications only come from .gov domains — anything else is a scam.' },
    tags: ['government_scam', 'comparison', 'phishing'], tricks: ['lookalike_domain', 'urgency', 'pii_harvest']
  },
  {
    id: 'comp_email_crypto_invest_vs_legit_001', channel: 'dm', pattern_family: 'crypto_investment', difficulty: 4, ground_truth: 'scam', ai_amplified: true, drill_type: 'comparison',
    framing: 'Two messages about investment opportunities arrive. Which one is the scam?',
    messages: [
      { label: 'A', from_handle: '@coinvault_promos_2024', from_name: 'CoinVault Promotions', body: 'Congratulations! You\'ve been selected for our user appreciation giveaway — 0.05 BTC. To receive it, send 0.001 BTC to our verification address to confirm your wallet is active. Full prize sent immediately after.' },
      { label: 'B', from_handle: '@lin.y.invest', from_name: 'Lin Y', body: 'I\'ve been doing really well with CoinHarvest Pro — my uncle in Hong Kong taught me the strategy. I started with $500 and made $3,200 in three weeks. Want me to walk you through it?' }
    ],
    scam_label: 'A',
    red_flags: [
      { id: 'a_send_to_receive_more', label: 'A: Send crypto to receive more crypto — 100% always a scam' },
      { id: 'a_impersonator_account', label: 'A: Account name mimics a brand but is unverified' },
      { id: 'b_pig_butchering_setup', label: 'B: Romantic/friendly contact introducing investment opportunity is pig butchering' },
      { id: 'b_unverifiable_platform', label: 'B: CoinHarvest Pro cannot be verified as a legitimate regulated exchange' }
    ],
    correct_red_flag_ids: ['a_send_to_receive_more', 'a_impersonator_account'],
    explanation: { short: 'A is an obvious crypto giveaway scam — send to receive more is 100% fraudulent. B is subtler but is the setup for a pig butchering investment scam.', tells: ['Crypto giveaways requiring verification sends are universally fraudulent', 'B\'s friendly investment introduction is the pig butchering entry point — you will be guided to deposit on a fake platform', 'Both are scams, but A is more immediately obvious — B operates over weeks or months before the extraction'], safe_move: 'Ignore both. Never send crypto to receive more. Do not invest on platforms introduced through social contacts.', consequence: 'A drains whatever you send immediately. B will eventually ask for a withdrawal fee on fictitious profits.', behavioral_reinforcement: 'Any crypto giveaway requiring you to send first is a scam. Investment opportunities from online contacts are almost always fraud.' },
    tags: ['crypto_scam', 'comparison', 'pig_butchering'], tricks: ['send_to_receive', 'pig_butchering', 'impersonation']
  },
  {
    id: 'comp_sms_account_vs_legit_002', channel: 'sms', pattern_family: 'account_verification', difficulty: 3, ground_truth: 'scam', ai_amplified: false, drill_type: 'comparison',
    framing: 'Two texts arrive about your financial account. Which one is the scam?',
    messages: [
      { label: 'A', from_handle: '22799', from_name: null, body: 'TrustBank: $45.00 purchase at GrocerMart approved. Balance: $1,247.83. Reply STOP to opt out.' },
      { label: 'B', from_handle: '+1 (877) 555-0191', from_name: 'TrustBank Alert', body: 'Your TrustBank account shows unauthorized access. Click trustbank-verify-identity.com NOW to verify or your account will be frozen within 1 hour.' }
    ],
    scam_label: 'B',
    red_flags: [
      { id: 'b_full_phone_number', label: 'B: Banks use short codes for alerts — full phone numbers are a red flag' },
      { id: 'b_lookalike_bank_domain', label: 'B: trustbank-verify-identity.com is not the real bank website' },
      { id: 'b_one_hour_freeze', label: 'B: 1-hour freeze threat creates maximum urgency' },
      { id: 'a_short_code_routine', label: 'A: Short code sender with routine transaction confirmation — standard bank alert' }
    ],
    correct_red_flag_ids: ['b_full_phone_number', 'b_lookalike_bank_domain', 'b_one_hour_freeze'],
    explanation: { short: 'A is a routine transaction confirmation from a bank short code. B uses a full phone number, lookalike domain, and 1-hour freeze threat — all scam indicators.', tells: ['Bank alerts always come from 5-6 digit short codes', 'One-hour freeze threats are used to prevent you from calling the real bank', 'Lookalike bank domains are the most targeted phishing category'], safe_move: 'Note A as normal. Ignore B — if concerned, call the number on the back of your bank card.', consequence: 'Clicking B leads to a fake bank login page. Your credentials are captured and account accessed.', behavioral_reinforcement: 'Bank fraud alerts use short codes and ask yes/no questions — links with urgency are always scams.' },
    tags: ['bank_fraud', 'smishing', 'comparison'], tricks: ['lookalike_domain', 'urgency', 'fear_lockout']
  },
  {
    id: 'comp_email_charity_verify_vs_legit_001', channel: 'email', pattern_family: 'charity_fraud', difficulty: 2, ground_truth: 'scam', ai_amplified: false, drill_type: 'comparison',
    framing: 'You donated to two charities last month. Which donation receipt is from a scam organization?',
    messages: [
      { label: 'A', from_handle: 'receipts@brighthoperescue.org', from_name: 'Bright Hope Animal Rescue', subject: 'Tax receipt for your donation — #BHR-4412', body: 'Thank you for your $50 donation on October 22. This serves as your official tax receipt.\n\nBright Hope Animal Rescue\n501(c)(3) EIN: 47-1234567\nDonation #BHR-4412' },
      { label: 'B', from_handle: 'giving@brighthope-children-fund.com', from_name: 'Bright Hope Children\'s Fund', subject: 'Thank you for helping Marcus', body: 'Your donation is making a difference for Marcus. Thank you for your generosity. Our work continues — please consider donating again to help children like Marcus.\n\nBright Hope Children\'s Fund' }
    ],
    scam_label: 'B',
    red_flags: [
      { id: 'b_no_ein_in_receipt', label: 'B: Receipt has no EIN — required for tax deductibility claims' },
      { id: 'b_immediately_asks_again', label: 'B: Receipt immediately asks for another donation' },
      { id: 'b_lookalike_charity_name', label: 'B: Name mimics A\'s legitimate charity but is a different organization' },
      { id: 'a_provides_ein_and_receipt_number', label: 'A: Provides EIN, receipt number, and date — all required for legitimate tax receipts' }
    ],
    correct_red_flag_ids: ['b_no_ein_in_receipt', 'b_immediately_asks_again', 'b_lookalike_charity_name'],
    explanation: { short: 'A is a proper donation receipt with a verifiable EIN. B has no EIN, no receipt number, and immediately solicits another donation.', tells: ['Legitimate donation receipts include EIN, receipt number, and donation date for tax purposes', 'Missing EIN means the organization may not be a registered nonprofit', 'Immediately soliciting another donation in a receipt is a pressure tactic used by fraud operations', 'Both organizations have similar names — scammers copy legitimate charity names to borrow credibility'], safe_move: 'Keep A\'s receipt for taxes. Verify B at Charity Navigator before any further donations.', consequence: 'B is collecting donations but not registered as a nonprofit — your donation may not be tax deductible and funds may not go to any charitable purpose.', behavioral_reinforcement: 'Donation receipts must include an EIN — no EIN means no verified nonprofit status.' },
    tags: ['charity_scam', 'comparison'], tricks: ['name_spoofing', 'emotional_appeal']
  },
  {
    id: 'comp_email_gov_grant_vs_legit_001', channel: 'email', pattern_family: 'government_impersonation', difficulty: 3, ground_truth: 'scam', ai_amplified: false, drill_type: 'comparison',
    framing: 'Two emails about government money arrive. Which one is legitimate?',
    messages: [
      { label: 'A', from_handle: 'grants@federal-relief-grants.com', from_name: 'Federal Grant Relief Office', subject: 'You\'ve been selected — $8,500 Federal Relief Grant', body: 'You\'ve been selected for an $8,500 federal relief grant based on your tax profile. A $99 processing fee is required to claim within 48 hours.\n\nfederal-grant-process.com/fee' },
      { label: 'B', from_handle: 'noreply@irs.gov', from_name: 'IRS', subject: 'Your 2023 refund has been processed', body: 'Your 2023 federal tax refund of $312 was processed and will arrive by direct deposit within 5 business days to the account on file.\n\nIRS.gov' }
    ],
    scam_label: 'A',
    red_flags: [
      { id: 'a_fee_to_claim_grant', label: 'A: Government grants never require upfront processing fees' },
      { id: 'a_non_gov_domain', label: 'A: federal-relief-grants.com is not a .gov domain' },
      { id: 'a_unsolicited_selection', label: 'A: Government grants require applications — unsolicited selections do not exist' },
      { id: 'b_irs_gov_automatic', label: 'B: IRS .gov domain, refund processed automatically to account on file — no action needed' }
    ],
    correct_red_flag_ids: ['a_fee_to_claim_grant', 'a_non_gov_domain', 'a_unsolicited_selection'],
    explanation: { short: 'A requires a fee and uses a non-.gov domain — neither is possible for a legitimate government grant. B is a routine IRS refund notification from irs.gov.', tells: ['Government grants are always free to receive — fees are the scam', 'Official government sites use .gov exclusively', 'Refunds from the IRS are processed automatically to accounts on file — no action needed'], safe_move: 'Expect B\'s refund within 5 days. Ignore A entirely.', consequence: 'Paying A\'s $99 fee results in more fee requests. No grant is received.', behavioral_reinforcement: 'Government grants never have processing fees — .gov domain is the only legitimate source.' },
    tags: ['government_scam', 'comparison', 'advance_fee'], tricks: ['advance_fee', 'lookalike_domain', 'authority_impersonation']
  },
  {
    id: 'comp_email_job_recruiter_vs_legit_001', channel: 'email', pattern_family: 'job_seeker', difficulty: 3, ground_truth: 'scam', ai_amplified: true, drill_type: 'comparison',
    framing: 'Two recruiters reach out about your resume. Which one is the scam?',
    messages: [
      { label: 'A', from_handle: 'sarah.m@skylinestaffing.com', from_name: 'Sarah M — Skyline Staffing', subject: 'Opportunity match — Project Manager role', body: 'Hi! I came across your profile and think you\'d be a strong fit for a Project Manager position with one of our clients. Would you have 15 minutes for a quick call this week?\n\nSarah M., Skyline Staffing' },
      { label: 'B', from_handle: 'placement@global-staffing-partners.net', from_name: 'Global Staffing Partners', subject: 'Immediate Remote Role — $28/hr — Apply Today', body: 'We reviewed your resume and have a remote data entry role at $28/hr. No experience needed. A $49 background check fee is required to proceed.\n\nApply at bgcheck-portal.com/apply' }
    ],
    scam_label: 'B',
    red_flags: [
      { id: 'b_candidate_pays_fee', label: 'B: Candidates never pay for background checks — employers do' },
      { id: 'b_separate_application_site', label: 'B: Application goes to bgcheck-portal.com — unrelated to the staffing company domain' },
      { id: 'b_high_pay_no_experience', label: 'B: $28/hr for zero-experience remote work is unrealistically high' },
      { id: 'a_only_requests_call', label: 'A: Only asks for 15 minutes of your time — no fees or documents' }
    ],
    correct_red_flag_ids: ['b_candidate_pays_fee', 'b_separate_application_site', 'b_high_pay_no_experience'],
    explanation: { short: 'A is a standard recruiter outreach asking only for your time. B requires a fee and sends you to a separate domain — both are scam indicators.', tells: ['No legitimate recruiter ever charges candidates to proceed', 'Separate application domains from the recruiting company are a red flag', 'Unrealistically high pay for no experience is a lure, not a real opportunity'], safe_move: 'Take A\'s call if you are interested. Ignore and report B.', consequence: 'Paying B\'s $49 fee results in no job. Your card may be used for additional charges.', behavioral_reinforcement: 'Legitimate recruiters ask for your time, not your money.' },
    tags: ['job_scam', 'comparison', 'fee_harvesting'], tricks: ['advance_fee', 'separate_domain', 'fake_offer']
  },
  {
    id: 'comp_sms_prize_legit_vs_scam_002', channel: 'sms', pattern_family: 'prize_lottery', difficulty: 3, ground_truth: 'scam', ai_amplified: false, drill_type: 'comparison',
    framing: 'Two texts about winning something. Which one is the scam?',
    messages: [
      { label: 'A', from_handle: '33281', from_name: null, body: 'NovaMart: Your in-store raffle ticket #NM-4412 was selected. Visit any NovaMart location to claim your $25 gift card. No expiration.' },
      { label: 'B', from_handle: '+1 (888) 555-0149', from_name: 'NovaMart Rewards', body: 'You\'ve won a $1,000 NovaMart gift card! Claim at novamart-prizes.com/shipping — a $15 S&H fee applies. Prize forfeited after 48 hours.' }
    ],
    scam_label: 'B',
    red_flags: [
      { id: 'b_shipping_fee_prize', label: 'B: Shipping fee to receive a prize is an advance fee scam' },
      { id: 'b_lookalike_domain', label: 'B: novamart-prizes.com is not the real store website' },
      { id: 'b_forty_eight_hour_forfeiture', label: 'B: 48-hour forfeiture deadline is fabricated urgency' },
      { id: 'a_in_person_no_fee', label: 'A: In-store pickup of a verified raffle prize with no fee' }
    ],
    correct_red_flag_ids: ['b_shipping_fee_prize', 'b_lookalike_domain', 'b_forty_eight_hour_forfeiture'],
    explanation: { short: 'A is a real raffle win with in-person pickup. B requires a shipping fee and uses a lookalike domain — the fee is the scam.', tells: ['Real prizes are claimed without fees', 'Short code sender vs full phone number is the sender pattern difference', 'Lookalike brand domains for prize claims are phishing sites'], safe_move: 'Pick up A\'s prize in-store. Ignore B.', consequence: 'Paying B\'s $15 fee captures your card for larger unauthorized charges.', behavioral_reinforcement: 'Any prize that requires payment to receive is a scam.' },
    tags: ['prize_scam', 'smishing', 'comparison'], tricks: ['advance_fee', 'lookalike_domain', 'urgency']
  },
  {
    id: 'comp_email_tech_support_vs_legit_002', channel: 'email', pattern_family: 'tech_support', difficulty: 3, ground_truth: 'scam', ai_amplified: false, drill_type: 'comparison',
    framing: 'Two emails about software and device security. Which one is the scam?',
    messages: [
      { label: 'A', from_handle: 'security@shieldguard.com', from_name: 'ShieldGuard', subject: 'Scheduled scan complete — no threats found', body: 'Your weekly ShieldGuard security scan completed on November 7. No threats were found. Your device is protected.\n\nNo action needed. ShieldGuard' },
      { label: 'B', from_handle: 'security@nexcloud-device-alert.com', from_name: 'NexCloud Security Team', subject: 'Critical Malware Alert — Remote Removal Needed', body: 'Malicious software was detected on your device accessing your NexCloud account. Call 1-855-555-0167 to allow our team to connect remotely and remove it. Do not restart your computer.' }
    ],
    scam_label: 'B',
    red_flags: [
      { id: 'b_remote_access_request', label: 'B: Requests remote access to your computer — grants scammer full control' },
      { id: 'b_cloud_detects_local_malware', label: 'B: Cloud services cannot detect malware on your local device' },
      { id: 'b_dont_restart_control', label: 'B: Do not restart creates dependency and escalates fear' },
      { id: 'a_no_action_needed', label: 'A: Scan result requiring no action — standard antivirus notification' }
    ],
    correct_red_flag_ids: ['b_remote_access_request', 'b_cloud_detects_local_malware', 'b_dont_restart_control'],
    explanation: { short: 'A is a routine scan completion from real antivirus software — no action needed. B requests remote access using an impossible claim (cloud detecting local malware).', tells: ['Cloud services have no visibility into your local device files', 'Remote access grants the scammer complete control of your computer', 'Do not restart creates artificial urgency and dependency on the scammer\'s help'], safe_move: 'Note A and do nothing further. Ignore B — run your real antivirus if concerned.', consequence: 'Calling B grants remote access. Scammer installs persistent malware, steals banking credentials, and may demand payment to remove the access.', behavioral_reinforcement: 'Cloud services cannot see local malware — any such claim is a tech support scam.' },
    tags: ['tech_support_scam', 'comparison', 'remote_access'], tricks: ['remote_access', 'false_authority', 'fear_malware']
  },
  {
    id: 'comp_email_rental_vs_legit_002', channel: 'email', pattern_family: 'rental_housing', difficulty: 4, ground_truth: 'scam', ai_amplified: true, drill_type: 'comparison',
    framing: 'You apply for housing assistance and receive two responses. Which one is the scam?',
    messages: [
      { label: 'A', from_handle: 'housing@affordable-homes-assistance.com', from_name: 'Affordable Homes Program', subject: 'Pre-approved — Housing Assistance — Act in 48 Hours', body: 'You have been pre-approved for our housing assistance program covering 80% of rent. Complete enrollment by paying a $75 application fee at affordable-homes-apply.com/fee within 48 hours.' },
      { label: 'B', from_handle: 'housing@cityhousing.gov', from_name: 'City Housing Authority', subject: 'Your application is in queue — Reference #CH-4412', body: 'Thank you for your housing assistance application. Your application (Reference #CH-4412) is being reviewed. Processing takes 4-6 weeks. We will contact you by mail with updates.\n\nCity Housing Authority, (555) 301-5400' }
    ],
    scam_label: 'A',
    red_flags: [
      { id: 'a_fee_for_housing_assistance', label: 'A: Housing assistance programs never charge enrollment fees' },
      { id: 'a_non_gov_domain', label: 'A: affordable-homes-assistance.com is not a government .gov domain' },
      { id: 'a_pre_approved_without_application', label: 'A: Pre-approved for a program you never applied to' },
      { id: 'b_gov_domain_mail_followup', label: 'B: .gov domain, realistic timeline, communication by mail — standard government process' }
    ],
    correct_red_flag_ids: ['a_fee_for_housing_assistance', 'a_non_gov_domain', 'a_pre_approved_without_application'],
    explanation: { short: 'A charges a fee for free housing assistance from a non-.gov domain. B is a legitimate government housing authority with a realistic timeline and .gov domain.', tells: ['Government housing programs are always free to apply to — fees are a scam', '.gov is the exclusive domain for US government agencies', 'Realistic 4-6 week timelines and mail follow-up are consistent with real housing programs'], safe_move: 'Wait for B\'s process to proceed. Ignore A — contact your local housing authority using their official .gov contact if you need information.', consequence: 'Paying A\'s $75 fee results in no housing assistance. The scammer targets people in vulnerable situations.', behavioral_reinforcement: 'Government housing assistance is always free to apply to — any fee is a scam.' },
    tags: ['government_scam', 'comparison', 'rental_housing_scam'], tricks: ['advance_fee', 'lookalike_domain', 'urgency']
  },
  {
    id: 'comp_dm_marketplace_escrow_vs_legit_001', channel: 'dm', pattern_family: 'marketplace', difficulty: 4, ground_truth: 'scam', ai_amplified: false, drill_type: 'comparison',
    framing: 'You are selling electronics online. Two buyers offer to purchase. Which is the scammer?',
    messages: [
      { label: 'A', from_handle: '@photo_buyer_kate', from_name: 'Kate M', body: 'Hi! I\'m interested in the laptop. I\'m local — could we meet at the library Saturday afternoon? I\'ll bring cash. Does $380 work for you?' },
      { label: 'B', from_handle: 'buyer.david.k@outlook.com', from_name: 'David K', body: 'I\'ll pay your full asking price. I use QuickSend Business Escrow for seller protection — you\'ll get a confirmation email. Ship after you receive it. I\'ll cover shipping.' }
    ],
    scam_label: 'B',
    red_flags: [
      { id: 'b_fake_escrow_email', label: 'B: QuickSend Business Escrow is not a real service — the confirmation email will be fake' },
      { id: 'b_ship_before_funds_verified', label: 'B: Ship after receiving an email — not after verifying funds in your real account' },
      { id: 'b_full_price_no_negotiation', label: 'B: Immediate full price acceptance with no questions is a scammer pattern' },
      { id: 'a_in_person_cash', label: 'A: Local, in person, cash — the safest transaction type' }
    ],
    correct_red_flag_ids: ['b_fake_escrow_email', 'b_ship_before_funds_verified', 'b_full_price_no_negotiation'],
    explanation: { short: 'A wants to meet in person with cash — ideal. B uses a fake escrow service and wants you to ship based on a spoofed confirmation email.', tells: ['Payment app escrow is not a real feature — scammers create the term to sound legitimate', 'Always verify payment by logging into your own account, not by checking an email', 'Buyers who accept full price immediately and want to ship remotely are almost always scammers'], safe_move: 'Meet A at the library. Decline B or require in-person transaction only.', consequence: 'You ship the laptop based on the fake escrow email. No payment ever arrives.', behavioral_reinforcement: 'Verify payment by logging into your account — never based on an email confirmation alone.' },
    tags: ['marketplace_scam', 'fake_escrow', 'comparison'], tricks: ['fake_escrow', 'spoofed_email']
  },
  {
    id: 'comp_email_sub_refund_vs_legit_001', channel: 'email', pattern_family: 'subscription_renewal', difficulty: 3, ground_truth: 'scam', ai_amplified: false, drill_type: 'comparison',
    framing: 'You see two emails about subscription charges in your inbox. Which one is the scam?',
    messages: [
      { label: 'A', from_handle: 'billing@taskflow.io', from_name: 'TaskFlow', subject: 'Your TaskFlow subscription renewed — $89.00', body: 'Your TaskFlow Business plan renewed today for $89.00. To manage your subscription, visit taskflow.io/billing.\n\nTaskFlow Billing' },
      { label: 'B', from_handle: 'billing@shieldguard-renewal-center.com', from_name: 'ShieldGuard Antivirus', subject: 'ShieldGuard renewed — $349.99 charged', body: 'Your ShieldGuard Antivirus subscription renewed for $349.99. If you did not authorize this, call 1-888-555-0148 immediately for a full refund within 24 hours.' }
    ],
    scam_label: 'B',
    red_flags: [
      { id: 'b_lookalike_antivirus_domain', label: 'B: shieldguard-renewal-center.com is not the real software domain' },
      { id: 'b_inflated_amount', label: 'B: $349.99 is inflated to create alarm and urgency to call' },
      { id: 'b_call_to_cancel', label: 'B: Callback to cancel connects to a scammer doing a fake refund operation' },
      { id: 'a_expected_renewal', label: 'A: Expected renewal amount from the real service domain — no action required' }
    ],
    correct_red_flag_ids: ['b_lookalike_antivirus_domain', 'b_inflated_amount', 'b_call_to_cancel'],
    explanation: { short: 'A is your expected monthly subscription renewal from the real domain. B is a fake renewal notification designed to make you call a scammer.', tells: ['Check your card statement — B\'s $349.99 charge likely does not appear', 'Real antivirus renewals come from the software\'s own domain', 'Calling B connects you to a tech support scam operation'], safe_move: 'Manage A at taskflow.io/billing. Check your real card statement before calling anyone about B.', consequence: 'Calling B connects you to a scammer who requests remote access to process your refund.', behavioral_reinforcement: 'Check your actual card statement before acting on any unexpected charge notification.' },
    tags: ['subscription_scam', 'comparison', 'refund_scam'], tricks: ['fake_charge', 'callback_number', 'lookalike_domain']
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
