const fs = require('fs');
const drills = JSON.parse(fs.readFileSync('data/drills.json', 'utf-8'));
const REAL_BRANDS = ['Amazon','Google','Apple','Microsoft','PayPal','Chase','Wells Fargo','Coinbase','Facebook','Instagram','Netflix','UPS','FedEx','DHL','Venmo','Zelle','Cash App','WhatsApp','Telegram','LinkedIn','Indeed','Twitter','Snapchat','TikTok'];

const newDrills = [
  // GOVERNMENT IMPERSONATION THREADS (7)
  {
    id: 'thread_gov_irs_001', channel: 'sms', pattern_family: 'government_impersonation', difficulty: 3, ground_truth: 'scam', ai_amplified: false, drill_type: 'thread',
    framing: 'You receive a series of texts claiming to be from a tax agency.',
    thread: [
      { from_handle: '+1 (202) 555-0181', from_name: 'FedTax Office', body: 'URGENT: Federal Tax Authority has flagged your account for underpayment of $1,247 for tax year 2023. Failure to respond within 48 hours will result in wage garnishment.' },
      { from_handle: '+1 (202) 555-0181', from_name: 'FedTax Office', body: 'A warrant for your arrest has been authorized pending payment. To avoid escalation, call 1-888-555-0142 immediately to speak with a resolution officer.' },
      { from_handle: '+1 (202) 555-0181', from_name: 'FedTax Office', body: 'Your case number is FTA-2024-88234. Payment must be completed via gift cards or wire transfer to suspend the warrant. Act NOW.' }
    ],
    red_flags: [
      { id: 'arrest_warrant_threat', label: 'Threatens arrest warrant over a tax debt' },
      { id: 'gift_card_payment', label: 'Requests payment via gift cards or wire transfer' },
      { id: 'sms_from_tax_agency', label: 'Real tax agencies do not initiate contact by text message' },
      { id: 'escalating_pressure', label: 'Each message escalates fear to prevent rational thinking' }
    ],
    correct_red_flag_ids: ['arrest_warrant_threat', 'gift_card_payment', 'sms_from_tax_agency'],
    explanation: { short: 'Tax agencies send paper mail first and never demand gift card payments or threaten arrest by text.', tells: ['Tax authorities contact you by postal mail, not SMS', 'No government agency accepts gift cards or wire transfers for tax debts', 'Arrest warrant threats are a scare tactic — tax debt is civil, not criminal', 'Legitimate case numbers can be verified on the official agency website'], safe_move: 'Hang up or ignore. Look up the real tax authority number on the official government website and call it yourself if you have concerns.', consequence: 'Victims buy hundreds of dollars in gift cards and read the numbers aloud, which is immediately drained by the scammer.', behavioral_reinforcement: 'Gift card payment requests from any government agency are always scams — no exceptions.' },
    tags: ['government_scam', 'irs_impersonation', 'smishing'], tricks: ['fear_arrest', 'urgency', 'authority_impersonation']
  },
  {
    id: 'thread_gov_irs_002', channel: 'email', pattern_family: 'government_impersonation', difficulty: 3, ground_truth: 'scam', ai_amplified: true, drill_type: 'thread',
    framing: 'You get a series of emails claiming you are owed a tax refund.',
    thread: [
      { from_handle: 'refunds@fedtax-refund-portal.com', from_name: 'Federal Tax Refund Office', body: 'Subject: Tax Refund Notice — $847 Pending\n\nOur records show you are owed a refund of $847.00 from the previous tax year. To receive your refund, you must verify your identity at the link below within 72 hours.\n\n[Verify and Claim Refund]\n\nFederal Tax Refund Office' },
      { from_handle: 'refunds@fedtax-refund-portal.com', from_name: 'Federal Tax Refund Office', body: 'Reminder: Your refund of $847.00 expires in 24 hours. Provide your bank routing number and account number for direct deposit to complete the claim.\n\n[Complete Your Refund]' },
      { from_handle: 'refunds@fedtax-refund-portal.com', from_name: 'Federal Tax Refund Office', body: 'Final notice: Your unclaimed refund will be forfeited at midnight. Complete your bank verification now to receive your funds.\n\n[Claim $847 Now]' }
    ],
    red_flags: [
      { id: 'bank_details_for_refund', label: 'Requests bank routing and account number to process refund' },
      { id: 'lookalike_domain', label: 'fedtax-refund-portal.com is not an official government domain' },
      { id: 'expires_refund', label: 'Tax refunds do not expire or get forfeited if unclaimed' },
      { id: 'escalating_urgency', label: 'Each email adds more urgency to prevent skepticism' }
    ],
    correct_red_flag_ids: ['bank_details_for_refund', 'lookalike_domain', 'expires_refund'],
    explanation: { short: 'Tax refunds are issued automatically — no agency emails you to claim them or asks for your bank details by email.', tells: ['Official government sites use .gov domains — no exceptions', 'Refunds are issued by paper check or direct deposit on file — not claimed via email', 'Expiring refund deadlines do not exist — this is fabricated pressure', 'Providing bank details hands scammers access to drain your account'], safe_move: 'Check your real tax account status on the official .gov website. Never provide bank details in response to an email.', consequence: 'Your bank account details are used to initiate ACH withdrawals, draining your account.', behavioral_reinforcement: 'Official government agencies only use .gov domains — any other domain in a government email is a scam.' },
    tags: ['government_scam', 'phishing', 'credential_harvest'], tricks: ['urgency', 'lookalike_domain', 'authority_impersonation']
  },
  {
    id: 'thread_gov_ssa_001', channel: 'sms', pattern_family: 'government_impersonation', difficulty: 3, ground_truth: 'scam', ai_amplified: false, drill_type: 'thread',
    framing: 'You get texts claiming your social benefits account is suspended.',
    thread: [
      { from_handle: '+1 (800) 555-0193', from_name: 'Benefits Office', body: 'ALERT: Your federal benefits account has been suspended due to suspicious activity. Call 1-888-555-0177 within 24 hours to reactivate.' },
      { from_handle: '+1 (800) 555-0193', from_name: 'Benefits Office', body: 'A temporary hold has been placed on your monthly payments. To restore access, provide your full name, date of birth, and benefits ID number when you call.' },
      { from_handle: '+1 (800) 555-0193', from_name: 'Benefits Office', body: 'Failure to call will result in permanent suspension and forfeiture of benefits. This is your final notice.' }
    ],
    red_flags: [
      { id: 'benefits_suspended_sms', label: 'Benefits agencies do not text about account suspensions' },
      { id: 'pii_request', label: 'Requests your name, date of birth, and ID number' },
      { id: 'permanent_suspension_threat', label: 'Threatens permanent loss of benefits to create panic' },
      { id: 'callback_number', label: 'Provides a callback number you did not initiate' }
    ],
    correct_red_flag_ids: ['benefits_suspended_sms', 'pii_request', 'permanent_suspension_threat'],
    explanation: { short: 'Government benefits offices send paper letters — they do not text about suspensions or request PII by phone.', tells: ['Benefits agencies communicate via postal mail for account issues', 'Providing your name, DOB, and ID number enables identity theft', 'No benefits program permanently suspends with 24 hours notice via text', 'Always call the number on your official benefits card or letter, never a number from a text'], safe_move: 'Do not call the number in the text. Find the official contact number on your benefits documents or the official government website.', consequence: 'Your personal information is used to redirect your benefit payments to the scammer\'s account.', behavioral_reinforcement: 'Benefits offices use postal mail — any text about a suspended benefits account is a scam.' },
    tags: ['government_scam', 'smishing', 'identity_theft'], tricks: ['fear_lockout', 'pii_harvest', 'authority_impersonation']
  },
  {
    id: 'thread_gov_customs_001', channel: 'email', pattern_family: 'government_impersonation', difficulty: 3, ground_truth: 'scam', ai_amplified: true, drill_type: 'thread',
    framing: 'You get emails claiming a customs package is being held.',
    thread: [
      { from_handle: 'customs@national-customs-clearance.com', from_name: 'National Customs Office', body: 'Subject: Package Detention Notice — Action Required\n\nA package addressed to you has been detained by customs pending duty payment and documentation review. Reference: NCO-2024-448812.' },
      { from_handle: 'customs@national-customs-clearance.com', from_name: 'National Customs Office', body: 'To release your package, a customs duty fee of $38.50 is required along with a copy of your government-issued ID to verify ownership. Upload your ID at: customs-verify-id.com/upload' },
      { from_handle: 'customs@national-customs-clearance.com', from_name: 'National Customs Office', body: 'Final notice: Your detained package will be destroyed in 48 hours if duties are not paid. Complete payment and ID verification immediately.' }
    ],
    red_flags: [
      { id: 'id_upload_request', label: 'Requests you upload a government-issued ID to a website' },
      { id: 'customs_fee_by_email', label: 'Customs duties are not collected via email payment links' },
      { id: 'lookalike_domain', label: 'national-customs-clearance.com is not an official government domain' },
      { id: 'destroy_threat', label: 'Package destruction threat is fabricated to create panic' }
    ],
    correct_red_flag_ids: ['id_upload_request', 'lookalike_domain', 'customs_fee_by_email'],
    explanation: { short: 'Uploading your government ID to an unofficial site enables identity theft — real customs agencies use official .gov portals.', tells: ['Official customs communications use .gov domains', 'Real customs fees are handled through official carrier or government portals, not email links', 'Uploading your ID to an unofficial site gives scammers everything needed for identity theft', 'Package destruction in 48 hours is fabricated pressure'], safe_move: 'If you believe a package is genuinely held, contact the shipping carrier directly using their official website.', consequence: 'Your ID photo is used for identity theft — new accounts, loans, and fraud conducted in your name.', behavioral_reinforcement: 'Never upload your government ID in response to an email — only to verified official government portals you navigate to yourself.' },
    tags: ['government_scam', 'identity_theft', 'phishing'], tricks: ['urgency', 'lookalike_domain', 'pii_harvest']
  },
  {
    id: 'thread_gov_warrant_001', channel: 'sms', pattern_family: 'government_impersonation', difficulty: 4, ground_truth: 'scam', ai_amplified: true, drill_type: 'thread',
    framing: 'You get escalating texts claiming police have a warrant for your arrest.',
    thread: [
      { from_handle: '+1 (571) 555-0144', from_name: 'County Sheriff Office', body: 'NOTICE: An arrest warrant has been issued in your name for failure to appear for jury duty. Case #: JD-2024-55610.' },
      { from_handle: '+1 (571) 555-0144', from_name: 'County Sheriff Office', body: 'You have the option to pay a $350 fine to clear the warrant before officers are dispatched to your address. Call 1-888-555-0161 immediately.' },
      { from_handle: '+1 (571) 555-0144', from_name: 'County Sheriff Office', body: 'Payment can be made via gift cards or prepaid debit card. Have the card numbers ready when you call. Officers will be dispatched in 2 hours if unpaid.' }
    ],
    red_flags: [
      { id: 'gift_card_fine_payment', label: 'Requests gift card or prepaid debit payment for a legal fine' },
      { id: 'sheriff_texts_warrant', label: 'Sheriff offices do not text about arrest warrants' },
      { id: 'pay_to_avoid_arrest', label: 'Real warrants cannot be cleared with a phone payment' },
      { id: 'dispatch_countdown', label: '2-hour dispatch countdown is fabricated pressure' }
    ],
    correct_red_flag_ids: ['gift_card_fine_payment', 'sheriff_texts_warrant', 'pay_to_avoid_arrest'],
    explanation: { short: 'No law enforcement agency accepts gift cards or prepaid cards as payment for fines — this is always a scam.', tells: ['Law enforcement serves warrants in person — they do not text about them first', 'Court fines are paid through the court system, not via phone to a sheriff\'s number', 'Gift card payment requests from law enforcement are never legitimate', 'The 2-hour dispatch countdown is pure psychological pressure'], safe_move: 'Hang up. If genuinely concerned about jury duty, call your local court clerk directly using a number from the official court website.', consequence: 'Victims buy hundreds of dollars in gift cards reading numbers to the caller who pockets the funds immediately.', behavioral_reinforcement: 'Gift card payment to law enforcement is impossible — any such request is a scam.' },
    tags: ['government_scam', 'smishing', 'law_enforcement_impersonation'], tricks: ['fear_arrest', 'gift_card_pressure', 'urgency']
  },
  {
    id: 'thread_gov_medicare_001', channel: 'sms', pattern_family: 'government_impersonation', difficulty: 3, ground_truth: 'scam', ai_amplified: false, drill_type: 'thread',
    framing: 'You get texts about a new health benefits card.',
    thread: [
      { from_handle: '+1 (800) 555-0162', from_name: 'Federal Health Benefits', body: 'Important: Your federal health benefits card is expiring. A new card has been issued and requires confirmation before it can be activated.' },
      { from_handle: '+1 (800) 555-0162', from_name: 'Federal Health Benefits', body: 'To receive your new card, confirm your current member ID, date of birth, and last four digits of your Social Security Number.' },
      { from_handle: '+1 (800) 555-0162', from_name: 'Federal Health Benefits', body: 'Without confirmation, your coverage will lapse on the 15th. Reply CONFIRM or call 1-888-555-0143 to complete your update.' }
    ],
    red_flags: [
      { id: 'ssn_digits_request', label: 'Asks for the last four digits of your Social Security Number' },
      { id: 'coverage_lapse_threat', label: 'Threatens coverage lapse to create urgency' },
      { id: 'benefits_card_sms', label: 'Health benefit agencies mail new cards — they do not text to confirm them' },
      { id: 'full_number_sender', label: 'Sent from a regular phone number, not an official short code' }
    ],
    correct_red_flag_ids: ['ssn_digits_request', 'coverage_lapse_threat', 'benefits_card_sms'],
    explanation: { short: 'Sharing even partial Social Security Numbers by text enables identity theft — benefits offices send cards by mail automatically.', tells: ['New benefits cards are mailed automatically — no confirmation call or text is required', 'Providing partial SSN, combined with other info collected, enables identity theft', 'Threatening lapsed coverage creates panic that overrides skepticism', 'Official agencies do not ask for SSN digits by text or inbound phone call'], safe_move: 'Call the number on the back of your current benefits card or on official paperwork if you have concerns about coverage.', consequence: 'Your SSN digits and personal details are used with data from other breaches to open fraudulent accounts.', behavioral_reinforcement: 'Never share any digits of your Social Security Number in response to a text or unsolicited call.' },
    tags: ['government_scam', 'identity_theft', 'smishing'], tricks: ['pii_harvest', 'fear_lockout', 'authority_impersonation']
  },
  {
    id: 'thread_gov_grant_001', channel: 'email', pattern_family: 'government_impersonation', difficulty: 3, ground_truth: 'scam', ai_amplified: true, drill_type: 'thread',
    framing: 'You get emails saying you have been selected for a government grant.',
    thread: [
      { from_handle: 'grants@federal-relief-grants.com', from_name: 'Federal Grant Relief Office', body: 'Subject: You Have Been Selected — $8,500 Federal Relief Grant\n\nCongratulations. Based on your tax records and income profile, you have been selected to receive an $8,500 federal relief grant. No repayment required.' },
      { from_handle: 'grants@federal-relief-grants.com', from_name: 'Federal Grant Relief Office', body: 'To claim your grant, a one-time processing fee of $99 is required to verify your banking information for secure direct deposit. Pay at: federal-grant-process.com/fee' },
      { from_handle: 'grants@federal-relief-grants.com', from_name: 'Federal Grant Relief Office', body: 'Your grant will be canceled if the processing fee is not submitted within 48 hours. This is a one-time opportunity.' }
    ],
    red_flags: [
      { id: 'fee_to_claim_grant', label: 'Requires upfront fee to receive a government grant' },
      { id: 'lookalike_domain', label: 'federal-relief-grants.com is not an official government domain' },
      { id: 'unsolicited_grant', label: 'Government grants require an application — they are not assigned by email' },
      { id: 'grant_cancellation_deadline', label: 'Grant cancellation deadline is fabricated pressure' }
    ],
    correct_red_flag_ids: ['fee_to_claim_grant', 'lookalike_domain', 'unsolicited_grant'],
    explanation: { short: 'Government grants require applications and never charge processing fees — any fee to claim a grant is a scam.', tells: ['You cannot be selected for a grant you never applied for', 'Real government grants never require upfront fees', 'Official grant programs use .gov domains', 'The $99 fee is the actual theft — the $8,500 grant does not exist'], safe_move: 'Ignore and delete. If interested in real grant programs, search only at grants.gov.', consequence: 'You pay the $99 processing fee, which goes directly to the scammer. No grant is ever received.', behavioral_reinforcement: 'Any grant that requires an upfront fee is a scam — real grants are free to receive.' },
    tags: ['government_scam', 'advance_fee', 'phishing'], tricks: ['advance_fee', 'urgency', 'authority_impersonation']
  },

  // CHARITY FRAUD THREADS (7)
  {
    id: 'thread_charity_disaster_001', channel: 'sms', pattern_family: 'charity_fraud', difficulty: 2, ground_truth: 'scam', ai_amplified: false, drill_type: 'thread',
    framing: 'You get texts asking for disaster relief donations after a recent news event.',
    thread: [
      { from_handle: '+1 (312) 555-0177', from_name: 'Disaster Aid Now', body: 'Families left homeless after the flooding in the southeast need your help. Donate to Disaster Aid Now and 100% of your gift goes to survivors.' },
      { from_handle: '+1 (312) 555-0177', from_name: 'Disaster Aid Now', body: 'Donate now at disasteraidnow-giving.com. We accept all major cards and gift cards for immediate disbursement to affected families.' },
      { from_handle: '+1 (312) 555-0177', from_name: 'Disaster Aid Now', body: 'Every hour counts. A matching donor will double your gift if you donate before midnight tonight.' }
    ],
    red_flags: [
      { id: 'gift_cards_accepted', label: 'Accepts gift cards as a donation method' },
      { id: 'unverifiable_charity', label: 'Disaster Aid Now cannot be verified as a registered charity' },
      { id: '100_percent_claim', label: 'No charity can legitimately claim 100% goes to recipients' },
      { id: 'midnight_match_pressure', label: 'Midnight matching donor deadline is a common fake urgency tactic' }
    ],
    correct_red_flag_ids: ['gift_cards_accepted', 'unverifiable_charity', '100_percent_claim'],
    explanation: { short: 'Legitimate charities do not accept gift cards and can always be verified through charity watchdog sites.', tells: ['Gift card donations are a scammer hallmark — real charities do not accept them', '100% to recipients is impossible — all charities have operating costs', 'Disaster-response charities appear within hours of news events, including fake ones', 'Verify any charity at Give.org or Charity Navigator before donating'], safe_move: 'If you want to help with a disaster, donate directly to established organizations you can verify through Charity Navigator or Give.org.', consequence: 'Your donation goes entirely to the scammer — no aid reaches any disaster survivors.', behavioral_reinforcement: 'Verify any charity before donating — especially ones that appear right after news events.' },
    tags: ['charity_scam', 'smishing', 'disaster_fraud'], tricks: ['urgency', 'emotional_appeal', 'fake_match']
  },
  {
    id: 'thread_charity_kids_001', channel: 'email', pattern_family: 'charity_fraud', difficulty: 2, ground_truth: 'scam', ai_amplified: true, drill_type: 'thread',
    framing: 'You get a series of fundraising emails for a children\'s hospital.',
    thread: [
      { from_handle: 'giving@brighthope-children-fund.com', from_name: 'Bright Hope Children\'s Fund', body: 'Subject: A child named Marcus needs your help today\n\nMarcus, 7, was diagnosed with leukemia last month. His family cannot afford treatment. Your gift of just $25 covers one day of his care.' },
      { from_handle: 'giving@brighthope-children-fund.com', from_name: 'Bright Hope Children\'s Fund', body: 'Update on Marcus: His treatment begins Friday. We are still short of our goal. Please donate today — every dollar gets us closer to his recovery.' },
      { from_handle: 'giving@brighthope-children-fund.com', from_name: 'Bright Hope Children\'s Fund', body: 'Final update: We raised enough for Marcus\'s first week of treatment thanks to donors like you. Please give again to continue his care. [Donate Now]' }
    ],
    red_flags: [
      { id: 'unverifiable_child_story', label: 'Individual child stories cannot be independently verified' },
      { id: 'lookalike_charity_name', label: 'Bright Hope Children\'s Fund mimics real charity names but is unregistered' },
      { id: 'ongoing_asks_after_goal', label: 'Claims goal was met but immediately asks for more donations' },
      { id: 'emotional_manipulation', label: 'Uses a specific child\'s story to bypass rational evaluation' }
    ],
    correct_red_flag_ids: ['lookalike_charity_name', 'ongoing_asks_after_goal', 'unverifiable_child_story'],
    explanation: { short: 'Fake charities use emotional child stories because they are difficult to verify and hard to say no to — always check registration first.', tells: ['The goal being met but immediately asking for more is a consistency red flag', 'Real charities are registered and verifiable — search the name at state charity registries', 'Emotional individual stories are a common manipulation technique in charity fraud', 'Verify before giving: Charity Navigator, GuideStar, or your state attorney general\'s charity registry'], safe_move: 'Search the charity name on Charity Navigator or GuideStar. If it does not appear, do not donate.', consequence: 'Donations go entirely to the scammer. No child is being helped.', behavioral_reinforcement: 'Always verify a charity\'s registration before donating — emotional stories are designed to bypass this step.' },
    tags: ['charity_scam', 'phishing', 'emotional_manipulation'], tricks: ['emotional_appeal', 'fake_urgency', 'authority_impersonation']
  },
  {
    id: 'thread_charity_veteran_001', channel: 'sms', pattern_family: 'charity_fraud', difficulty: 3, ground_truth: 'scam', ai_amplified: false, drill_type: 'thread',
    framing: 'You get texts from a veterans support organization.',
    thread: [
      { from_handle: '+1 (703) 555-0134', from_name: 'Veterans Forward Fund', body: 'Our veterans are sleeping on the streets tonight. Veterans Forward Fund provides emergency housing and meals to homeless vets. Can you help with $20?' },
      { from_handle: '+1 (703) 555-0134', from_name: 'Veterans Forward Fund', body: 'Reply YES to have a donation agent call you, or donate directly via gift card — call 1-888-555-0122 to provide the code.' },
      { from_handle: '+1 (703) 555-0134', from_name: 'Veterans Forward Fund', body: 'Your support means a veteran won\'t go hungry tonight. This is your last chance to make a difference before our midnight deadline.' }
    ],
    red_flags: [
      { id: 'gift_card_donation_call', label: 'Asks you to call and provide gift card codes as a donation' },
      { id: 'unverifiable_org', label: 'Veterans Forward Fund cannot be found in charity registries' },
      { id: 'donation_agent_call', label: 'Legitimate charities do not send agents to call you after you text YES' },
      { id: 'midnight_deadline', label: 'Midnight donation deadlines are fabricated pressure' }
    ],
    correct_red_flag_ids: ['gift_card_donation_call', 'unverifiable_org', 'donation_agent_call'],
    explanation: { short: 'Gift card codes as donations are always scams — no registered charity collects donations this way.', tells: ['Real charities accept payments through verified payment processors, not gift card codes over phone', 'Verified veteran charities can be found at charitynavigator.org', 'A donation agent calling you after a text reply is not how any legitimate charity operates', 'Midnight deadlines do not apply to charitable giving'], safe_move: 'If you want to support veterans, donate to verified organizations through their official websites.', consequence: 'Gift card codes are read to the caller and immediately redeemed. No veterans receive any aid.', behavioral_reinforcement: 'Gift card codes as charitable donations are always scams — period.' },
    tags: ['charity_scam', 'veteran_fraud', 'smishing'], tricks: ['emotional_appeal', 'gift_card_pressure', 'urgency']
  },
  {
    id: 'thread_charity_animal_001', channel: 'email', pattern_family: 'charity_fraud', difficulty: 2, ground_truth: 'scam', ai_amplified: true, drill_type: 'thread',
    framing: 'You get fundraising emails for an animal rescue organization.',
    thread: [
      { from_handle: 'rescue@pawsafe-animal-relief.org', from_name: 'PawSafe Animal Relief', body: 'Subject: 47 dogs rescued from a hoarding situation — they need medical care NOW\n\nWe rescued 47 dogs from deplorable conditions. Many need surgery. We\'re overwhelmed. Your $30 covers one dog\'s initial vet exam.' },
      { from_handle: 'rescue@pawsafe-animal-relief.org', from_name: 'PawSafe Animal Relief', body: 'We are almost out of funds. Without your help, we may have to surrender these animals to an underfunded shelter. Help us keep them safe — [Donate Now]' },
      { from_handle: 'rescue@pawsafe-animal-relief.org', from_name: 'PawSafe Animal Relief', body: 'A generous donor will match all gifts dollar-for-dollar until midnight. Your $30 becomes $60 for the rescued dogs. Time is running out.' }
    ],
    red_flags: [
      { id: 'unverifiable_rescue', label: 'PawSafe Animal Relief cannot be verified as a registered organization' },
      { id: 'fake_match_deadline', label: 'Midnight matching donor deadline is a common fake urgency tactic' },
      { id: 'surrender_threat', label: 'Threat of surrendering animals is emotional manipulation' },
      { id: 'no_location_or_contact', label: 'No physical address, phone number, or verifiable contact information' }
    ],
    correct_red_flag_ids: ['unverifiable_rescue', 'fake_match_deadline', 'no_location_or_contact'],
    explanation: { short: 'Real animal rescues have verifiable locations and charity registrations — always check before donating to emotional rescue appeals.', tells: ['Legitimate rescues have physical addresses and verifiable nonprofit status', 'Midnight matching donor deadlines are almost always fabricated', 'Emotional animal rescue stories are commonly exploited by fraud operations', 'Search the organization name and your state\'s charity registry before donating'], safe_move: 'Search for verified local animal rescues or national organizations through Charity Navigator before donating.', consequence: 'Your donation goes to the scammer. No animals are rescued.', behavioral_reinforcement: 'Verify any charity\'s nonprofit registration before donating, especially after emotional rescue appeals.' },
    tags: ['charity_scam', 'phishing', 'animal_rescue_fraud'], tricks: ['emotional_appeal', 'fake_match', 'urgency']
  },
  {
    id: 'thread_charity_cancer_001', channel: 'sms', pattern_family: 'charity_fraud', difficulty: 3, ground_truth: 'scam', ai_amplified: false, drill_type: 'thread',
    framing: 'You get texts from a cancer research fundraiser.',
    thread: [
      { from_handle: '+1 (646) 555-0188', from_name: 'Cancer Hope Alliance', body: 'Hi! I\'m volunteering for Cancer Hope Alliance\'s annual fundraiser. We fund breakthrough research for pediatric cancer patients. Can I count on your support today?' },
      { from_handle: '+1 (646) 555-0188', from_name: 'Cancer Hope Alliance', body: 'Amazing — our researchers are so close to a breakthrough. A $50 gift covers a full day of lab testing. You can donate securely at cancer-hope-give.com or via gift card.' },
      { from_handle: '+1 (646) 555-0188', from_name: 'Cancer Hope Alliance', body: 'Our fundraiser ends tomorrow. Will you help us reach our goal? Even $10 makes a difference. Text GIVE to donate.' }
    ],
    red_flags: [
      { id: 'gift_card_option', label: 'Offers gift cards as a donation method' },
      { id: 'volunteer_solicitation_sms', label: 'Real charity volunteers do not cold-text strangers' },
      { id: 'unregistered_org', label: 'Cancer Hope Alliance is not in recognized charity databases' },
      { id: 'breakthrough_claim', label: 'Vague breakthrough claim is designed to create emotional investment' }
    ],
    correct_red_flag_ids: ['gift_card_option', 'volunteer_solicitation_sms', 'unregistered_org'],
    explanation: { short: 'Real charity volunteers do not cold-text people — and gift card donation options signal a scam, not a charity.', tells: ['Charitable organizations do not solicit donations via unsolicited text messages', 'Gift card donation options are a definitive scam indicator', 'Real cancer research charities have verifiable track records on Charity Navigator', 'Vague research breakthroughs are used to justify donation urgency without accountability'], safe_move: 'Ignore. If you want to support cancer research, donate directly to a verified organization through their official website.', consequence: 'Donations enrich the scammer. No research is being funded.', behavioral_reinforcement: 'Gift card options for charitable giving are always a scam signal.' },
    tags: ['charity_scam', 'smishing', 'cancer_fraud'], tricks: ['emotional_appeal', 'gift_card_pressure', 'impersonation']
  },
  {
    id: 'thread_charity_church_001', channel: 'email', pattern_family: 'charity_fraud', difficulty: 3, ground_truth: 'scam', ai_amplified: true, drill_type: 'thread',
    framing: 'You get emails from someone claiming to be a pastor asking for urgent help.',
    thread: [
      { from_handle: 'pastor.james.worthy@gmail.com', from_name: 'Pastor James Worthy', body: 'Dear friend, I hope this message finds you well. I am reaching out because our congregation is facing a crisis — our church building\'s roof collapsed and families have nowhere to gather.' },
      { from_handle: 'pastor.james.worthy@gmail.com', from_name: 'Pastor James Worthy', body: 'We need to raise $4,000 for emergency repairs by Friday. I am asking trusted members of our community to help. Could you send a gift via wire transfer or gift card? God bless you.' },
      { from_handle: 'pastor.james.worthy@gmail.com', from_name: 'Pastor James Worthy', body: 'Any amount helps. Please keep this between us as we do not want the congregation to worry. I will explain everything when we meet in person. Reply for payment details.' }
    ],
    red_flags: [
      { id: 'keep_secret_request', label: 'Asks you to keep the transaction secret from others' },
      { id: 'gift_card_wire_for_church', label: 'Requests gift cards or wire transfer for a church repair' },
      { id: 'gmail_for_pastor', label: 'A church pastor using a personal Gmail for official financial requests is suspicious' },
      { id: 'urgency_plus_secrecy', label: 'Combination of urgency and secrecy is a social engineering red flag' }
    ],
    correct_red_flag_ids: ['keep_secret_request', 'gift_card_wire_for_church', 'urgency_plus_secrecy'],
    explanation: { short: 'Requests to keep financial transactions secret combined with gift card payments signal manipulation, not genuine need.', tells: ['Secrecy requests are designed to prevent you from getting a second opinion', 'Churches handle funds through transparent processes, not individual wire transfers or gift cards', 'Scammers impersonate trusted community figures to exploit loyalty', 'Verify any urgent financial request with the person directly via a known phone number before sending anything'], safe_move: 'Call the person directly using a phone number you already have — do not use contact info from the email. Verify the request before sending anything.', consequence: 'You send gift cards or wire funds believing it is helping a trusted community figure. The scammer receives the funds.', behavioral_reinforcement: 'Any request for secrecy combined with urgent payment is a social engineering red flag.' },
    tags: ['charity_scam', 'impersonation', 'advance_fee'], tricks: ['authority_impersonation', 'secrecy_pressure', 'urgency']
  },
  {
    id: 'thread_charity_crowdfund_001', channel: 'dm', pattern_family: 'charity_fraud', difficulty: 3, ground_truth: 'scam', ai_amplified: false, drill_type: 'thread',
    framing: 'A social media friend sends you messages asking you to share a fundraiser.',
    thread: [
      { from_handle: '@jessica.r.84', from_name: 'Jessica R', body: 'Hey! I know this is out of nowhere but my nephew was in a car accident and is in the ICU. The family set up a fundraiser. Would you be willing to share it?' },
      { from_handle: '@jessica.r.84', from_name: 'Jessica R', body: 'Here\'s the link: gofundme-relief-help.com/jason-recovery — even sharing helps so much. The family is devastated and insurance won\'t cover everything.' },
      { from_handle: '@jessica.r.84', from_name: 'Jessica R', body: 'If you can donate even $10 that would mean the world. They\'re good people going through the worst time. I wouldn\'t ask if it wasn\'t real.' }
    ],
    red_flags: [
      { id: 'lookalike_crowdfund_url', label: 'gofundme-relief-help.com is not the real crowdfunding platform' },
      { id: 'hacked_account_message', label: 'The account sending the message may be hacked or fake' },
      { id: 'pressure_not_to_question', label: 'I wouldn\'t ask if it wasn\'t real — preemptively deflects skepticism' },
      { id: 'unverifiable_story', label: 'The accident story cannot be independently verified' }
    ],
    correct_red_flag_ids: ['lookalike_crowdfund_url', 'hacked_account_message', 'pressure_not_to_question'],
    explanation: { short: 'Lookalike crowdfunding URLs combined with messages from possibly compromised accounts are a common donation scam setup.', tells: ['The URL mimics a crowdfunding platform but is not the real site', 'Friends\' accounts are frequently hacked to send scam messages to trusted contacts', 'Pre-deflecting skepticism ("I wouldn\'t ask if it wasn\'t real") is a manipulation tactic', 'Verify by calling the friend directly before clicking or donating'], safe_move: 'Text or call the friend directly using a number you already have to verify they actually sent this. Do not click the link.', consequence: 'The link leads to a phishing page or a fake crowdfunding clone that captures card details.', behavioral_reinforcement: 'Verify any financial request from a social media friend by calling them directly — their account may be compromised.' },
    tags: ['charity_scam', 'social_media_scam', 'phishing'], tricks: ['authority_impersonation', 'lookalike_domain', 'emotional_appeal']
  },

  // RENTAL/HOUSING THREADS (7)
  {
    id: 'thread_rental_listing_001', channel: 'email', pattern_family: 'rental_housing', difficulty: 3, ground_truth: 'scam', ai_amplified: false, drill_type: 'thread',
    framing: 'You inquire about an apartment listing and receive these emails.',
    thread: [
      { from_handle: 'mark.dalton.rentals@gmail.com', from_name: 'Mark Dalton', body: 'Hi! Thanks for your interest in the 2BR at 4412 Maple Ave. The rent is $1,100/mo, utilities included. I\'m currently working overseas as a missionary, so I\'ll need to handle this remotely.' },
      { from_handle: 'mark.dalton.rentals@gmail.com', from_name: 'Mark Dalton', body: 'I\'d love to get you moved in quickly. To hold the apartment, I just need a $600 security deposit via wire transfer. I\'ll mail you the keys once I receive it.' },
      { from_handle: 'mark.dalton.rentals@gmail.com', from_name: 'Mark Dalton', body: 'Several other people are very interested. If you want to secure it before the weekend, please send the deposit today. I\'ll send the lease agreement once the transfer clears.' }
    ],
    red_flags: [
      { id: 'overseas_landlord', label: 'Landlord claims to be overseas and cannot show the property' },
      { id: 'wire_deposit_before_lease', label: 'Requests wire transfer deposit before any lease agreement is signed' },
      { id: 'keys_mailed_after_payment', label: 'Promises to mail keys after receiving money — never showing the property' },
      { id: 'competing_applicant_pressure', label: 'Claims other applicants are interested to pressure quick payment' }
    ],
    correct_red_flag_ids: ['overseas_landlord', 'wire_deposit_before_lease', 'keys_mailed_after_payment'],
    explanation: { short: 'Never send a deposit for a property you have not seen in person — overseas landlords who mail keys are always scammers.', tells: ['Legitimate landlords can always arrange a showing or designate a local contact', 'Deposits are paid after signing a lease, not before', 'Wire transfers are irreversible — this is why scammers insist on them', 'Keys are never mailed in exchange for a wire transfer'], safe_move: 'Never pay a deposit without first seeing the property in person and signing a proper lease. Walk away from any listing that cannot be shown.', consequence: 'You wire the deposit and never receive keys. The listing does not exist or belongs to someone else.', behavioral_reinforcement: 'Never send money for a property you have not physically visited.' },
    tags: ['rental_scam', 'advance_fee', 'wire_fraud'], tricks: ['urgency', 'overseas_landlord', 'advance_fee']
  },
  {
    id: 'thread_rental_sublet_001', channel: 'dm', pattern_family: 'rental_housing', difficulty: 3, ground_truth: 'scam', ai_amplified: true, drill_type: 'thread',
    framing: 'You find a sublet listing on social media and message the poster.',
    thread: [
      { from_handle: '@sublet.finder.2024', from_name: 'Lisa M - Sublet', body: 'Hi! Yes the room is still available. $850/mo, furnished, near downtown. I\'m relocating for work next month so I need someone reliable to take over the lease.' },
      { from_handle: '@sublet.finder.2024', from_name: 'Lisa M - Sublet', body: 'I can\'t show it right now since I\'m already in my new city, but I can send you photos and a virtual tour video. The building manager can let you in once we\'ve agreed on terms.' },
      { from_handle: '@sublet.finder.2024', from_name: 'Lisa M - Sublet', body: 'A few others are interested. To take it off the market, I just need a $400 holding fee via PeerSend. I\'ll refund it if the virtual tour doesn\'t meet your expectations.' }
    ],
    red_flags: [
      { id: 'cannot_show_property', label: 'Cannot arrange an in-person showing before payment is required' },
      { id: 'peersend_holding_fee', label: 'Requests payment app deposit before any lease is signed' },
      { id: 'competing_interest_pressure', label: 'Claims other people are interested to pressure quick payment' },
      { id: 'refund_promise', label: 'Promises a refund if you\'re not satisfied — refunds never come' }
    ],
    correct_red_flag_ids: ['cannot_show_property', 'peersend_holding_fee', 'competing_interest_pressure'],
    explanation: { short: 'No legitimate sublet requires payment before an in-person showing — if you cannot see it first, do not pay.', tells: ['A genuine sublettor can always arrange access through the building manager before collecting money', 'Payment app holding fees are non-recoverable and a common advance fee scam technique', 'Competing interest pressure is used to prevent you from thinking clearly', 'Refund promises from strangers on social media are not enforceable'], safe_move: 'Insist on viewing the property in person before any payment. If that is not possible, move on to the next listing.', consequence: 'You send the holding fee and are then told the deal fell through. The scammer keeps your money.', behavioral_reinforcement: 'See any rental property in person before sending any money — no exceptions.' },
    tags: ['rental_scam', 'social_media_scam', 'advance_fee'], tricks: ['urgency', 'advance_fee', 'fake_refund_promise']
  },
  {
    id: 'thread_rental_vacation_001', channel: 'email', pattern_family: 'rental_housing', difficulty: 3, ground_truth: 'scam', ai_amplified: false, drill_type: 'thread',
    framing: 'You inquire about a vacation rental you found online.',
    thread: [
      { from_handle: 'beach.house.rentals.fl@gmail.com', from_name: 'Coastal Rentals', body: 'Thanks for your interest in our beachfront property in Clearwater! $175/night, sleeps 8. Check-in Jul 18-25 is available. Beautiful views, private pool, fully equipped kitchen.' },
      { from_handle: 'beach.house.rentals.fl@gmail.com', from_name: 'Coastal Rentals', body: 'To confirm your reservation, I\'ll need 50% upfront ($612.50) via wire transfer or gift card. The balance is due 7 days before arrival. I\'ll email the check-in details once payment is received.' },
      { from_handle: 'beach.house.rentals.fl@gmail.com', from_name: 'Coastal Rentals', body: 'Several families are looking at the same week. To hold your dates, please transfer today. I can accept Visa gift cards — just call with the numbers.' }
    ],
    red_flags: [
      { id: 'gift_card_vacation_payment', label: 'Requests gift cards for vacation rental payment' },
      { id: 'wire_before_contract', label: 'Requests wire transfer deposit before any rental contract exists' },
      { id: 'gmail_vacation_rental', label: 'Legitimate vacation rentals use established booking platforms, not personal Gmail' },
      { id: 'check_in_info_after_payment', label: 'Will only provide check-in details after payment is received' }
    ],
    correct_red_flag_ids: ['gift_card_vacation_payment', 'wire_before_contract', 'gmail_vacation_rental'],
    explanation: { short: 'Vacation rentals booked outside established platforms via gift card or wire transfer are almost always fake listings.', tells: ['Legitimate vacation rentals are booked through established platforms with fraud protection', 'Gift card payments for vacation rentals are never legitimate', 'No check-in information until after payment means you have no recourse if the property does not exist', 'Personal Gmail for a vacation rental business with no verifiable address is a red flag'], safe_move: 'Book vacation rentals only through established platforms that offer buyer protection. Never pay via gift card or wire transfer.', consequence: 'You arrive at the address to find the property does not exist or belongs to someone else who knows nothing about a rental.', behavioral_reinforcement: 'Book vacation rentals only through established platforms — never via wire transfer or gift card.' },
    tags: ['rental_scam', 'vacation_fraud', 'advance_fee'], tricks: ['advance_fee', 'urgency', 'gift_card_pressure']
  },
  {
    id: 'thread_rental_roommate_001', channel: 'dm', pattern_family: 'rental_housing', difficulty: 4, ground_truth: 'scam', ai_amplified: true, drill_type: 'thread',
    framing: 'You post looking for a roommate and receive these messages.',
    thread: [
      { from_handle: '@tyler.moved.2024', from_name: 'Tyler B', body: 'Hey! I saw your roommate post. I\'m looking for a place starting next month. I\'m a grad student, very clean and quiet. Would love to learn more about the space.' },
      { from_handle: '@tyler.moved.2024', from_name: 'Tyler B', body: 'Sounds great! One thing — I\'m traveling for research right now and can\'t see it in person yet. My aunt offered to PeerSend you my deposit and first month to hold it. Would that work?' },
      { from_handle: '@tyler.moved.2024', from_name: 'Tyler B', body: 'She will actually send you a bit extra by mistake — just send back the difference to her QuickSend once it lands. Really sorry for the inconvenience, she always does this.' }
    ],
    red_flags: [
      { id: 'overpayment_setup', label: 'Sends more than the amount and asks you to send back the difference' },
      { id: 'third_party_payment', label: 'Payment comes from a third party, not the actual applicant' },
      { id: 'cannot_view_in_person', label: 'Cannot view the space in person before committing funds' },
      { id: 'immediate_commitment_ask', label: 'Asks to secure the space with full payment before any lease or meeting' }
    ],
    correct_red_flag_ids: ['overpayment_setup', 'third_party_payment', 'cannot_view_in_person'],
    explanation: { short: 'Overpayment scams send a fake check or payment then ask you to refund the difference — by the time the original bounces, your refund is gone.', tells: ['Overpayment and send-back-the-difference is a classic check fraud / payment scam pattern', 'Payments always come from the person who will live there, not a third party', 'The payment will be reversed after you send the "refund" — leaving you liable', 'No legitimate roommate secures a place without seeing it or meeting you'], safe_move: 'Never accept payment from a third party and never send money back before confirming the original payment fully cleared. Require in-person meeting before any payment.', consequence: 'The initial payment is reversed or bounced. Your refund of the "extra" goes to the scammer and is unrecoverable.', behavioral_reinforcement: 'If someone pays you extra and asks for the difference back — stop. This is always a scam.' },
    tags: ['rental_scam', 'overpayment_scam', 'check_fraud'], tricks: ['overpayment', 'urgency', 'third_party_payment']
  },
  {
    id: 'thread_rental_deposit_001', channel: 'sms', pattern_family: 'rental_housing', difficulty: 3, ground_truth: 'scam', ai_amplified: false, drill_type: 'thread',
    framing: 'You get texts from a landlord you applied to work with.',
    thread: [
      { from_handle: '+1 (407) 555-0162', from_name: 'Property Mgmt Group', body: 'Congratulations! Your application for the unit at 229 Birchwood Ct has been approved. We just need your security deposit of $1,400 to finalize your move-in date.' },
      { from_handle: '+1 (407) 555-0162', from_name: 'Property Mgmt Group', body: 'To process quickly, please send the deposit via wire transfer to the account we will provide, or purchase gift cards and call us with the numbers. Deadline is Friday.' },
      { from_handle: '+1 (407) 555-0162', from_name: 'Property Mgmt Group', body: 'We have other applicants on the waitlist. If we do not receive the deposit by Friday, we will proceed with the next applicant. Please confirm your intent today.' }
    ],
    red_flags: [
      { id: 'gift_card_security_deposit', label: 'Requests gift cards for a security deposit' },
      { id: 'wire_for_deposit', label: 'Requests wire transfer for a security deposit before move-in' },
      { id: 'waitlist_pressure', label: 'Claims waitlist will take your unit to pressure immediate payment' },
      { id: 'no_lease_first', label: 'Requests deposit payment before providing a signed lease' }
    ],
    correct_red_flag_ids: ['gift_card_security_deposit', 'wire_for_deposit', 'no_lease_first'],
    explanation: { short: 'Security deposits are paid via traceable methods after signing a lease — never by gift card or wire to an unknown account.', tells: ['Legitimate property management companies accept checks or traceable electronic payments', 'Security deposits are collected when you sign the lease, not before', 'Gift card deposit requests are always fraudulent', 'Verify any property management company\'s address and reviews before sending money'], safe_move: 'Request a lease before any payment. Deposits should always be paid via check or established payment platforms with receipts.', consequence: 'You send the deposit and the scammer disappears. You have no lease and no recourse.', behavioral_reinforcement: 'Never pay a deposit before you have a signed lease in your hands.' },
    tags: ['rental_scam', 'advance_fee', 'smishing'], tricks: ['advance_fee', 'urgency', 'gift_card_pressure']
  },
  {
    id: 'thread_rental_section8_001', channel: 'email', pattern_family: 'rental_housing', difficulty: 4, ground_truth: 'scam', ai_amplified: true, drill_type: 'thread',
    framing: 'You get emails from a housing assistance program.',
    thread: [
      { from_handle: 'housing@affordable-homes-assistance.com', from_name: 'Affordable Homes Program', body: 'Subject: Housing Assistance Approval — Action Required\n\nYou have been pre-approved for our housing assistance program that covers up to 80% of rent for qualifying applicants. Units are available in your area.' },
      { from_handle: 'housing@affordable-homes-assistance.com', from_name: 'Affordable Homes Program', body: 'To complete your enrollment, a $75 background check and application processing fee is required. Pay at affordable-homes-apply.com/fee. Approval is not final until the fee is received.' },
      { from_handle: 'housing@affordable-homes-assistance.com', from_name: 'Affordable Homes Program', body: 'Your pre-approval expires in 48 hours. If we do not receive your fee by then, your slot will be reassigned to the next applicant. Complete enrollment now.' }
    ],
    red_flags: [
      { id: 'fee_for_housing_assistance', label: 'Legitimate housing assistance programs do not charge application fees' },
      { id: 'lookalike_domain', label: 'affordable-homes-assistance.com is not an official government housing site' },
      { id: 'unsolicited_approval', label: 'You were pre-approved for a program you never applied to' },
      { id: 'slot_expiry_pressure', label: 'Pre-approval expiry creates artificial pressure' }
    ],
    correct_red_flag_ids: ['fee_for_housing_assistance', 'lookalike_domain', 'unsolicited_approval'],
    explanation: { short: 'Real government housing assistance programs are free — any program charging an upfront fee is a scam targeting people who need help most.', tells: ['Government housing programs never charge fees to apply or enroll', 'You cannot be pre-approved for a program you never applied to', 'Official housing programs use .gov domains', 'The fee is the scam — no housing assistance follows'], safe_move: 'Contact your local housing authority directly using contact information from your local government website. Real programs are free to apply to.', consequence: 'You pay the $75 fee and receive nothing. The scammer targets people in vulnerable housing situations.', behavioral_reinforcement: 'Any housing assistance program that charges a fee is a scam — real programs are always free to apply to.' },
    tags: ['rental_scam', 'government_impersonation', 'advance_fee'], tricks: ['advance_fee', 'urgency', 'authority_impersonation']
  },
  {
    id: 'thread_rental_craigslist_001', channel: 'email', pattern_family: 'rental_housing', difficulty: 2, ground_truth: 'scam', ai_amplified: false, drill_type: 'thread',
    framing: 'You email about a rental listing and receive these replies.',
    thread: [
      { from_handle: 'james.whitmore.realty@outlook.com', from_name: 'James Whitmore', body: 'Thank you for your interest. The 3BR home is available immediately at $1,350/mo. I am currently on a mission trip and my property manager has moved to another state, so I am handling this directly.' },
      { from_handle: 'james.whitmore.realty@outlook.com', from_name: 'James Whitmore', body: 'I will arrange for a lockbox with the key so you can do a self-tour. To receive the lockbox code, I just need the first and last month\'s rent ($2,700) to confirm you are serious.' },
      { from_handle: 'james.whitmore.realty@outlook.com', from_name: 'James Whitmore', body: 'Once funds clear, I will text you the lockbox code. If the home does not match the listing, I will personally refund every dollar. I am a man of faith and my word is my bond.' }
    ],
    red_flags: [
      { id: 'payment_before_lockbox_code', label: 'Requires payment before providing access to view the property' },
      { id: 'overseas_unavailable_landlord', label: 'Landlord is overseas and unavailable to show the property' },
      { id: 'faith_trust_appeal', label: 'Appeals to religious identity to establish trust' },
      { id: 'full_payment_upfront', label: 'Requests full first and last month upfront before lease or showing' }
    ],
    correct_red_flag_ids: ['payment_before_lockbox_code', 'overseas_unavailable_landlord', 'full_payment_upfront'],
    explanation: { short: 'Paying for a lockbox code before seeing a property is paying for nothing — the code never comes or opens an empty unit.', tells: ['Legitimate landlords arrange showings before collecting any money', 'The overseas mission trip is a common fiction used in rental scams', 'Religious trust appeals are used to lower your guard, not a sign of legitimacy', 'No lease, no background check, and full payment upfront are all red flags'], safe_move: 'Never pay to receive access to view a property. If a landlord cannot show it before payment, move on.', consequence: 'You send $2,700 and never receive a lockbox code. The property owner has no idea their listing is being used by a scammer.', behavioral_reinforcement: 'You should view a property before paying anything — including a deposit to see it.' },
    tags: ['rental_scam', 'advance_fee', 'wire_fraud'], tricks: ['advance_fee', 'trust_building', 'overseas_landlord']
  },

  // PRIZE/LOTTERY THREADS (7)
  {
    id: 'thread_prize_lottery_001', channel: 'email', pattern_family: 'prize_lottery', difficulty: 2, ground_truth: 'scam', ai_amplified: false, drill_type: 'thread',
    framing: 'You get a series of emails claiming you won an international lottery.',
    thread: [
      { from_handle: 'notifications@global-winners-foundation.com', from_name: 'Global Winners Foundation', body: 'Subject: Congratulations — You Have Won $450,000\n\nYour email address was randomly selected in our annual Global Prosperity Lottery. You are entitled to $450,000 USD. Claim reference: GWF-2024-77412.' },
      { from_handle: 'notifications@global-winners-foundation.com', from_name: 'Global Winners Foundation', body: 'To release your winnings, a transfer facilitation fee of $285 is required to cover international banking clearance. Pay at global-winners-claim.com/fee to initiate your transfer.' },
      { from_handle: 'notifications@global-winners-foundation.com', from_name: 'Global Winners Foundation', body: 'Your prize is being held in escrow. Unclaimed funds expire after 10 days. Complete your fee payment to avoid forfeiture of your $450,000 award.' }
    ],
    red_flags: [
      { id: 'fee_to_claim_prize', label: 'Requires upfront fee to release lottery winnings' },
      { id: 'never_entered_lottery', label: 'You never entered any lottery or contest' },
      { id: 'lookalike_domain', label: 'global-winners-foundation.com is not a real organization' },
      { id: 'expiry_pressure', label: 'Unclaimed fund expiry creates pressure to pay the fee quickly' }
    ],
    correct_red_flag_ids: ['fee_to_claim_prize', 'never_entered_lottery', 'lookalike_domain'],
    explanation: { short: 'You cannot win a lottery you never entered, and real winnings are never released in exchange for upfront fees.', tells: ['Legitimate lotteries never charge fees to release winnings', 'You cannot win a contest you did not enter', 'The fee is the scam — no $450,000 exists', 'Escalating emails with deadlines are used to collect fees before skepticism sets in'], safe_move: 'Ignore and delete. You have not won anything.', consequence: 'You pay the $285 fee and are then asked for additional fees. No prize is ever received.', behavioral_reinforcement: 'Any prize that requires upfront payment is a scam — real winnings do not come with fees.' },
    tags: ['prize_scam', 'advance_fee', 'phishing'], tricks: ['advance_fee', 'urgency', 'fake_prize']
  },
  {
    id: 'thread_prize_sweepstakes_001', channel: 'sms', pattern_family: 'prize_lottery', difficulty: 2, ground_truth: 'scam', ai_amplified: false, drill_type: 'thread',
    framing: 'You get texts claiming you won a sweepstakes.',
    thread: [
      { from_handle: '+1 (888) 555-0149', from_name: 'NovaMart Rewards', body: 'NovaMart: You\'ve been selected as our weekly sweepstakes winner! Your prize: a $1,000 NovaMart gift card. Reply YES to claim.' },
      { from_handle: '+1 (888) 555-0149', from_name: 'NovaMart Rewards', body: 'Congrats! To receive your gift card, a $15 shipping and handling fee applies. Pay at novamart-prizes.com/shipping. Card will arrive within 5-7 business days.' },
      { from_handle: '+1 (888) 555-0149', from_name: 'NovaMart Rewards', body: 'Your gift card is ready to ship! Complete your $15 payment today — unclaimed prizes are forfeited after 48 hours.' }
    ],
    red_flags: [
      { id: 'shipping_fee_for_prize', label: 'Requires payment of a shipping fee to receive a prize' },
      { id: 'prize_via_sms', label: 'Legitimate sweepstakes do not notify winners by unsolicited text' },
      { id: 'lookalike_domain', label: 'novamart-prizes.com is not the real company\'s domain' },
      { id: 'forfeiture_deadline', label: '48-hour forfeiture deadline creates pressure to pay' }
    ],
    correct_red_flag_ids: ['shipping_fee_for_prize', 'prize_via_sms', 'lookalike_domain'],
    explanation: { short: 'Shipping fees to receive prizes are always a scam — real prizes are delivered without extra charges to winners.', tells: ['Real sweepstakes winners are notified via official company channels, not random texts', 'Shipping fees to claim a prize are a classic advance fee scam variant', 'The $15 fee is the actual theft — no gift card will arrive', 'Verify any sweepstakes claim through the company\'s official website'], safe_move: 'Ignore. Real sweepstakes do not require payment to receive your prize.', consequence: 'You pay the $15 fee and never receive a gift card. Your card details may also be used for future charges.', behavioral_reinforcement: 'Real prizes never require shipping fees or processing payments — any such request is a scam.' },
    tags: ['prize_scam', 'smishing', 'advance_fee'], tricks: ['advance_fee', 'urgency', 'lookalike_domain']
  },
  {
    id: 'thread_prize_car_001', channel: 'email', pattern_family: 'prize_lottery', difficulty: 3, ground_truth: 'scam', ai_amplified: true, drill_type: 'thread',
    framing: 'You get emails claiming you won a car in a raffle.',
    thread: [
      { from_handle: 'prizes@luxury-auto-raffle.com', from_name: 'Luxury Auto Prize Center', body: 'Subject: You Are Our Grand Prize Winner — 2024 Luxury SUV\n\nCongratulations! Your raffle ticket #LX-2024-48812 was drawn as our grand prize winner. You have won a 2024 luxury SUV valued at $67,000.' },
      { from_handle: 'prizes@luxury-auto-raffle.com', from_name: 'Luxury Auto Prize Center', body: 'To claim your vehicle, a prize transfer tax of $1,450 must be paid upfront, as required by federal prize regulations. Provide your bank details at: auto-prize-claim.com/transfer' },
      { from_handle: 'prizes@luxury-auto-raffle.com', from_name: 'Luxury Auto Prize Center', body: 'Failure to pay the transfer tax within 72 hours will result in forfeiture of your prize and reassignment to the alternate winner. Complete your claim now.' }
    ],
    red_flags: [
      { id: 'upfront_tax_for_prize', label: 'Requires upfront payment of prize taxes before receiving the prize' },
      { id: 'lookalike_domain', label: 'luxury-auto-raffle.com and auto-prize-claim.com are not legitimate organizations' },
      { id: 'raffle_not_entered', label: 'You never purchased a ticket for this raffle' },
      { id: 'federal_regulation_claim', label: 'Federal prize tax regulations do not require upfront payment to the prize giver' }
    ],
    correct_red_flag_ids: ['upfront_tax_for_prize', 'raffle_not_entered', 'federal_regulation_claim'],
    explanation: { short: 'Prize taxes on real winnings are paid to the IRS after receiving the prize — not upfront to the prize organization.', tells: ['Real prize taxes are settled with the IRS, not paid upfront to the prize giver', 'You cannot win a raffle you never entered', 'The $1,450 fee is the scam — no car exists', 'Federal regulations do not require winners to prepay taxes to claim prizes'], safe_move: 'Ignore and delete. You have not won a car.', consequence: 'You pay the $1,450 and are often asked for additional fees. No vehicle is ever received.', behavioral_reinforcement: 'Prize taxes on legitimate winnings are paid to the IRS — never upfront to the prize giver.' },
    tags: ['prize_scam', 'advance_fee', 'phishing'], tricks: ['advance_fee', 'authority_impersonation', 'fake_prize']
  },
  {
    id: 'thread_prize_social_001', channel: 'dm', pattern_family: 'prize_lottery', difficulty: 2, ground_truth: 'scam', ai_amplified: false, drill_type: 'thread',
    framing: 'A social media account DMs you claiming you won a giveaway.',
    thread: [
      { from_handle: '@nova_mart_giveaways', from_name: 'NovaMart Giveaways', body: 'Congratulations! You were randomly selected from followers who liked our post last week. You\'ve won a $500 NovaMart shopping spree! DM us to claim.' },
      { from_handle: '@nova_mart_giveaways', from_name: 'NovaMart Giveaways', body: 'To send your prize, we just need your full name, mailing address, and email. Also, a $10 gift card processing fee is required to activate your reward code.' },
      { from_handle: '@nova_mart_giveaways', from_name: 'NovaMart Giveaways', body: 'We have multiple winners to process today. Please send the processing fee and your info within 2 hours or your prize will go to our backup winner.' }
    ],
    red_flags: [
      { id: 'processing_fee_for_prize', label: 'Requires a processing fee to activate a prize' },
      { id: 'impersonator_account', label: 'The account has a handle that mimics a real brand but is not verified' },
      { id: 'pii_request', label: 'Requests full name, mailing address, and email for a prize' },
      { id: 'two_hour_deadline', label: '2-hour deadline creates pressure before you can verify the account' }
    ],
    correct_red_flag_ids: ['processing_fee_for_prize', 'impersonator_account', 'pii_request'],
    explanation: { short: 'Real brand giveaways are posted from verified accounts and never require fees or personal details via DM.', tells: ['Real company giveaway accounts are verified — check for the verification badge', 'Processing fees to activate prizes are always scams', 'Providing your home address to an unverified account enables further targeting', 'Real giveaway winners are announced publicly, not via DM'], safe_move: 'Check if the account is actually the official verified brand account. If in doubt, navigate to the brand\'s real social profile and check their actual giveaway posts.', consequence: 'Your home address and personal details are collected for targeting. The $10 fee is stolen. No prize arrives.', behavioral_reinforcement: 'Real brand giveaways never require fees or your home address via DM — look for the verified badge.' },
    tags: ['prize_scam', 'social_media_scam', 'impersonation'], tricks: ['advance_fee', 'impersonation', 'pii_harvest']
  },
  {
    id: 'thread_prize_scratch_001', channel: 'sms', pattern_family: 'prize_lottery', difficulty: 3, ground_truth: 'scam', ai_amplified: false, drill_type: 'thread',
    framing: 'You get texts about a mailer scratch card you recently received.',
    thread: [
      { from_handle: '+1 (800) 555-0167', from_name: 'Winner Verification Center', body: 'Congratulations! Our records show you scratched a winning ticket from our recent mailing. Your prize: $2,500 or a vacation package. Call 1-888-555-0131 to verify.' },
      { from_handle: '+1 (800) 555-0167', from_name: 'Winner Verification Center', body: 'Your prize number 4-7-2 shows a $2,500 cash win. To receive your check, a $50 processing and verification fee is required. Provide a credit card number when you call.' },
      { from_handle: '+1 (800) 555-0167', from_name: 'Winner Verification Center', body: 'This is your final notification. Processing fees not received by end of day will result in prize forfeiture. Call now to claim your $2,500.' }
    ],
    red_flags: [
      { id: 'fee_to_claim_scratch_prize', label: 'Requires credit card for a fee to claim a scratch card prize' },
      { id: 'cold_call_follows_mailer', label: 'Unsolicited mailer followed by text and phone pressure is a known scam pattern' },
      { id: 'two_prize_options', label: 'Cash or vacation package choices are used to make the prize feel certain' },
      { id: 'end_of_day_forfeiture', label: 'End-of-day forfeiture deadline is fabricated pressure' }
    ],
    correct_red_flag_ids: ['fee_to_claim_scratch_prize', 'cold_call_follows_mailer', 'two_prize_options'],
    explanation: { short: 'Everyone who receives these mailers has a "winning" ticket — the prize does not exist, and the fee is the entire point.', tells: ['Mass mailer scratch cards are all "winners" — the prize is contingent on paying the fee', 'Providing credit card details to claim a prize hands the scammer your full card information', 'Two-choice prizes (cash or vacation) create certainty that prevents dismissal', 'Real lottery or sweepstakes prizes never require a fee to be paid via phone'], safe_move: 'Hang up. Throw away the mailer. You have not won anything.', consequence: 'Your credit card details are captured when you call. Charges appear within days.', behavioral_reinforcement: 'Scratch card prize fees are always scams — the fee IS the scam, not a processing formality.' },
    tags: ['prize_scam', 'smishing', 'advance_fee'], tricks: ['advance_fee', 'fake_prize', 'urgency']
  },
  {
    id: 'thread_prize_survey_001', channel: 'email', pattern_family: 'prize_lottery', difficulty: 2, ground_truth: 'scam', ai_amplified: true, drill_type: 'thread',
    framing: 'You get emails about a reward for completing a survey.',
    thread: [
      { from_handle: 'rewards@consumer-survey-rewards.com', from_name: 'Consumer Rewards Center', body: 'Subject: Your $750 Survey Reward Is Ready\n\nThank you for completing a consumer survey last month. Your $750 reward has been approved and is ready for redemption. Click below to claim.' },
      { from_handle: 'rewards@consumer-survey-rewards.com', from_name: 'Consumer Rewards Center', body: 'To receive your reward, select your preferred payout method and provide your shipping address for verification. A $6.97 S&H fee applies for physical reward cards.' },
      { from_handle: 'rewards@consumer-survey-rewards.com', from_name: 'Consumer Rewards Center', body: 'Your reward expires in 24 hours. Enter your card details now to cover the S&H and confirm your delivery address: consumer-reward-claim.com/claim' }
    ],
    red_flags: [
      { id: 'sh_fee_for_reward', label: 'Requires credit card for S&H to claim a survey reward' },
      { id: 'lookalike_domain', label: 'consumer-survey-rewards.com and consumer-reward-claim.com are not legitimate' },
      { id: 'survey_not_completed', label: 'You may not remember completing any such survey' },
      { id: '24_hour_reward_expiry', label: '24-hour expiry creates pressure to enter card details quickly' }
    ],
    correct_red_flag_ids: ['sh_fee_for_reward', 'lookalike_domain', '24_hour_reward_expiry'],
    explanation: { short: 'Survey reward S&H fees are designed to capture your credit card details — the $750 reward does not exist.', tells: ['Shipping fees on rewards are how your card details are captured', 'Legitimate survey rewards are fulfilled without requiring payment', 'The small S&H amount seems trivial but your card is then used for larger charges', 'Real survey reward emails come from verifiable organizations with official domains'], safe_move: 'Ignore and delete. Real survey rewards do not require payment to receive.', consequence: 'Your card details are captured via the "S&H" form and used for larger unauthorized charges.', behavioral_reinforcement: 'Never enter card details to claim a reward — real rewards are sent without fees.' },
    tags: ['prize_scam', 'phishing', 'advance_fee'], tricks: ['advance_fee', 'urgency', 'lookalike_domain']
  },
  {
    id: 'thread_prize_crypto_001', channel: 'dm', pattern_family: 'prize_lottery', difficulty: 3, ground_truth: 'scam', ai_amplified: false, drill_type: 'thread',
    framing: 'A crypto account DMs you about winning a giveaway.',
    thread: [
      { from_handle: '@coinvault_promos_2024', from_name: 'CoinVault Promotions', body: 'Congratulations! You have been selected for our annual CoinVault user appreciation giveaway. Your prize: 0.05 BTC (approx $3,200). To claim, verify your wallet address.' },
      { from_handle: '@coinvault_promos_2024', from_name: 'CoinVault Promotions', body: 'To release your BTC reward, you must first send 0.001 BTC to our verification address to confirm your wallet is active. Your 0.05 BTC will be sent immediately after.' },
      { from_handle: '@coinvault_promos_2024', from_name: 'CoinVault Promotions', body: 'This giveaway ends in 4 hours. Unclaimed BTC rewards will be reallocated. Send your verification amount now to receive your full prize.' }
    ],
    red_flags: [
      { id: 'send_crypto_to_receive_crypto', label: 'Requires sending cryptocurrency to receive a larger crypto prize' },
      { id: 'impersonator_account', label: 'The account name mimics CoinVault but is not the verified official account' },
      { id: 'four_hour_deadline', label: '4-hour deadline prevents you from researching the account' },
      { id: 'verification_send_pretext', label: 'Verification amount is a pretext to steal crypto with no prize sent back' }
    ],
    correct_red_flag_ids: ['send_crypto_to_receive_crypto', 'impersonator_account', 'verification_send_pretext'],
    explanation: { short: 'Any crypto giveaway that requires you to send crypto first to receive more is always a scam — you send, they keep, nothing returns.', tells: ['Send-to-receive crypto giveaways have zero legitimate examples — 100% of them are scams', 'Real crypto platforms never require a verification send to release a prize', 'Impersonator accounts are created to look like official brand accounts', 'Crypto transactions are irreversible — once sent, the funds are gone'], safe_move: 'Ignore. Never send cryptocurrency to receive a larger amount. Navigate to the real platform directly to check for any legitimate promotions.', consequence: 'You send the verification BTC and receive nothing. Crypto transactions cannot be reversed.', behavioral_reinforcement: 'Any crypto giveaway requiring you to send funds first is 100% a scam — always.' },
    tags: ['prize_scam', 'crypto_scam', 'social_media_scam'], tricks: ['advance_fee', 'impersonation', 'urgency']
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
