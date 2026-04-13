const fs = require('fs');
const drills = JSON.parse(fs.readFileSync('data/drills.json', 'utf-8'));

const newDrills = [
  {
    id: 'spot_email_job_001',
    channel: 'email',
    pattern_family: 'job_seeker',
    difficulty: 3,
    ground_truth: 'scam',
    ai_amplified: false,
    drill_type: 'spot_flag',
    framing: 'You applied to a few jobs last week. This just arrived.',
    spot_flag_options: [
      { id: 'gmail_sender', label: 'Recruiter uses a Gmail address' },
      { id: 'no_company_site', label: 'No company website mentioned' },
      { id: 'fee_required', label: 'Asks for a fee to proceed' },
      { id: 'fast_hire', label: 'Hired without an interview' }
    ],
    spot_flag_correct_id: 'fee_required',
    message: {
      from_name: 'Daniel Moss | Apex Staffing Group',
      from_handle: 'dmoss.apexstaffing@gmail.com',
      subject: 'Offer Letter - Remote Data Entry Specialist ($24/hr)',
      body: 'Hi there,\n\nCongratulations! After reviewing your profile on Indeed, we would like to offer you the Remote Data Entry Specialist role at $24/hr starting immediately.\n\nTo activate your onboarding, please submit a $49 equipment deposit via Zelle to: onboarding@apexstaffinggroup.net\n\nYour laptop will ship within 2 business days. Welcome to the team!\n\nDaniel Moss\nApex Staffing Group'
    },
    red_flags: [
      { id: 'fee_required', label: 'Asks for upfront fee/deposit' },
      { id: 'gmail_sender', label: 'Recruiter uses Gmail, not a company domain' },
      { id: 'no_interview', label: 'Job offered without an interview' },
      { id: 'zelle_payment', label: 'Payment via Zelle to a random email' }
    ],
    correct_red_flag_ids: ['fee_required', 'gmail_sender', 'no_interview', 'zelle_payment'],
    explanation: {
      short: 'Legitimate employers never charge fees to onboard you. This is a classic advance-fee job scam.',
      tells: [
        'No legitimate company charges an equipment deposit before you start',
        'Recruiter email is Gmail, not a company domain',
        'Job offered with no interview — real hiring takes time',
        'Zelle payments are irreversible and a favorite of scammers'
      ],
      safe_move: 'Never pay to get a job. Search the company directly and contact HR through their official website.',
      consequence: 'You lose the $49 deposit and never receive any equipment or job.',
      behavioral_reinforcement: 'Any job that requires upfront payment is a scam — no exceptions.'
    },
    tags: ['advance_fee', 'job_scam', 'zelle'],
    tricks: ['advance_fee', 'authority_impersonation']
  },
  {
    id: 'spot_email_job_002',
    channel: 'email',
    pattern_family: 'job_seeker',
    difficulty: 3,
    ground_truth: 'scam',
    ai_amplified: false,
    drill_type: 'spot_flag',
    framing: 'A recruiter reached out about a remote position.',
    spot_flag_options: [
      { id: 'lookalike_domain', label: 'Email domain is slightly off' },
      { id: 'high_salary', label: 'Salary seems very high for the role' },
      { id: 'urgency', label: 'Deadline pressure to accept' },
      { id: 'ssn_request', label: 'Asks for SSN before any interview' }
    ],
    spot_flag_correct_id: 'ssn_request',
    message: {
      from_name: 'Karen Lyle | PulseShop HR',
      from_handle: 'karen.lyle@pulseshop-careers.net',
      subject: 'Remote Customer Success Role - Action Required by Friday',
      body: 'Hello,\n\nWe found your resume on LinkedIn and you are a great match for our Remote Customer Success Manager role ($72,000/yr).\n\nTo hold your spot before we open applications publicly, please reply with:\n- Full legal name\n- Date of birth\n- Social Security Number (for background screening)\n- Current address\n\nOffer expires Friday. Looking forward to working with you!\n\nKaren Lyle\nPulseShop Human Resources'
    },
    red_flags: [
      { id: 'ssn_request', label: 'Asks for SSN before any interview' },
      { id: 'lookalike_domain', label: 'pulseshop-careers.net is not pulseshop.com' },
      { id: 'urgency', label: 'Artificial Friday deadline' },
      { id: 'pii_upfront', label: 'Requests DOB and address before hiring' }
    ],
    correct_red_flag_ids: ['ssn_request', 'lookalike_domain', 'urgency', 'pii_upfront'],
    explanation: {
      short: 'No employer needs your SSN before you have even interviewed — this is identity theft disguised as hiring.',
      tells: [
        'Legitimate employers run background checks after a job offer, not before an interview',
        'The domain is pulseshop-careers.net, not the official company domain',
        'Collecting SSN, DOB, and address together enables identity theft',
        'Artificial deadline is designed to prevent you from thinking clearly'
      ],
      safe_move: 'Never share your SSN by email. Verify any recruiter through the company official website.',
      consequence: 'Your SSN, DOB, and address are enough to open fraudulent credit accounts in your name.',
      behavioral_reinforcement: 'SSN requests before a job offer are always a red flag — real background checks happen post-offer through vetted services.'
    },
    tags: ['identity_theft', 'job_scam', 'pii'],
    tricks: ['urgency', 'credential_harvest', 'authority_impersonation']
  },
  {
    id: 'spot_email_job_003',
    channel: 'email',
    pattern_family: 'job_seeker',
    difficulty: 3,
    ground_truth: 'scam',
    ai_amplified: false,
    drill_type: 'spot_flag',
    framing: 'You got this after uploading your resume to a job board.',
    spot_flag_options: [
      { id: 'check_scam', label: 'Mentions sending you a check to buy supplies' },
      { id: 'work_from_home', label: 'Work-from-home role' },
      { id: 'vague_duties', label: 'Job duties are vague' },
      { id: 'no_experience', label: 'No experience required' }
    ],
    spot_flag_correct_id: 'check_scam',
    message: {
      from_name: 'Hiring Team | LinkMobile',
      from_handle: 'jobs@linkmobile-hiring.org',
      subject: 'Personal Assistant Position - Work From Home $800/week',
      body: 'Hi,\n\nWe are hiring a Personal Assistant to help our executive team with scheduling and errands. $800/week, fully remote, no experience needed.\n\nTo get started, we will mail you a check for $1,200 to purchase your home office supplies from our approved vendor. Please deposit it and send $950 to the vendor via money order.\n\nReply to confirm your interest!\n\nLinkMobile Hiring'
    },
    red_flags: [
      { id: 'check_scam', label: 'Sends a check, asks you to wire money back' },
      { id: 'money_order', label: 'Requests money order payment' },
      { id: 'approved_vendor', label: 'Vague approved vendor you must pay' },
      { id: 'overpay_scheme', label: 'Check amount exceeds what you need to spend' }
    ],
    correct_red_flag_ids: ['check_scam', 'money_order', 'approved_vendor', 'overpay_scheme'],
    explanation: {
      short: 'This is a classic fake check scam — the check will bounce after you have already sent real money.',
      tells: [
        'Sending a check and asking you to forward money is the textbook fake check scam',
        'The check will appear to clear initially but bounce days later',
        'Money orders are irreversible — you lose the cash permanently',
        'Legitimate employers do not ask employees to handle cash transfers'
      ],
      safe_move: 'Never deposit a check from a stranger and send money elsewhere. Report and ignore.',
      consequence: 'The check bounces after several days. You have already sent $950 in money orders — that money is gone.',
      behavioral_reinforcement: 'Any job that sends you a check and asks you to forward money is always a scam.'
    },
    tags: ['fake_check', 'job_scam', 'money_order'],
    tricks: ['advance_fee', 'payment_redirect']
  },
  {
    id: 'spot_email_job_004',
    channel: 'email',
    pattern_family: 'job_seeker',
    difficulty: 3,
    ground_truth: 'scam',
    ai_amplified: false,
    drill_type: 'spot_flag',
    framing: 'This arrived after you posted your resume online.',
    spot_flag_options: [
      { id: 'interview_chat_app', label: 'Interview conducted via chat app, not video' },
      { id: 'remote_role', label: 'Position is fully remote' },
      { id: 'quick_response', label: 'They responded within hours' },
      { id: 'benefits_listed', label: 'Benefits package described in detail' }
    ],
    spot_flag_correct_id: 'interview_chat_app',
    message: {
      from_name: 'Sandra Wei | Summit Analytics',
      from_handle: 'recruiting@summit-analytics-hr.com',
      subject: 'Interview Invitation - Business Operations Analyst',
      body: 'Dear Applicant,\n\nThank you for your interest in the Business Operations Analyst position at Summit Analytics.\n\nWe would like to schedule your interview for this Thursday. Our interview process is conducted entirely via Telegram chat — please add our hiring manager at @summitanalytics_hr to begin.\n\nThe role offers $68,000/yr, health benefits, and 15 days PTO.\n\nWe look forward to speaking with you.\n\nSummit Analytics Recruiting'
    },
    red_flags: [
      { id: 'interview_chat_app', label: 'Interview via Telegram, not video or phone' },
      { id: 'lookalike_domain', label: 'Domain is summit-analytics-hr.com not the real site' },
      { id: 'unofficial_handle', label: 'Directs to a personal Telegram handle' },
      { id: 'no_job_posting', label: 'No reference to original job posting' }
    ],
    correct_red_flag_ids: ['interview_chat_app', 'lookalike_domain', 'unofficial_handle'],
    explanation: {
      short: 'Legitimate companies do not conduct job interviews over Telegram. This is a setup to extract personal information or fees.',
      tells: [
        'Real interviews use video calls, phone, or in-person — not anonymous chat apps',
        'Directing you to a personal Telegram handle bypasses any company accountability',
        'The domain uses a hyphenated variation, not the real company site',
        'Scammers use chat apps because conversations are hard to trace or report'
      ],
      safe_move: 'Search the company directly and contact their real HR department to verify the opportunity.',
      consequence: 'The interview leads to requests for personal information, fees, or banking details.',
      behavioral_reinforcement: 'If an interview is not on video or phone with a verified company rep, it is not a real interview.'
    },
    tags: ['job_scam', 'telegram', 'lookalike_domain'],
    tricks: ['authority_impersonation', 'credential_harvest']
  },
  {
    id: 'spot_email_job_005',
    channel: 'email',
    pattern_family: 'job_seeker',
    difficulty: 3,
    ground_truth: 'scam',
    ai_amplified: false,
    drill_type: 'spot_flag',
    framing: 'A recruiter found you on a professional networking site.',
    spot_flag_options: [
      { id: 'crypto_pay', label: 'Salary paid in cryptocurrency' },
      { id: 'international_company', label: 'Company is based internationally' },
      { id: 'high_pay', label: 'Pay is unusually high' },
      { id: 'flexible_hours', label: 'Hours are fully flexible' }
    ],
    spot_flag_correct_id: 'crypto_pay',
    message: {
      from_name: 'James Okafor | VaultChain Global',
      from_handle: 'jokafor@vaultchain-global.io',
      subject: 'Remote Compliance Analyst - $95K/yr + crypto bonus',
      body: 'Hi,\n\nVaultChain Global is expanding and we are looking for a Remote Compliance Analyst. Your profile stood out to us.\n\nCompensation: $95,000/yr paid in USDC stablecoin, plus a quarterly crypto performance bonus.\n\nNo experience in crypto required — we provide training. Fully flexible hours. Start immediately.\n\nInterested? Reply with your full name, location, and a government-issued ID photo to begin onboarding.\n\nJames Okafor | Recruitment Lead'
    },
    red_flags: [
      { id: 'crypto_pay', label: 'Salary paid in cryptocurrency' },
      { id: 'id_photo_request', label: 'Asks for government ID photo upfront' },
      { id: 'no_interview', label: 'No interview — reply to start immediately' },
      { id: 'unknown_company', label: 'Company has no verifiable presence' }
    ],
    correct_red_flag_ids: ['crypto_pay', 'id_photo_request', 'no_interview'],
    explanation: {
      short: 'Crypto-paid salaries and upfront ID requests are hallmarks of a job scam designed to steal your identity.',
      tells: [
        'Legitimate employers pay in fiat currency — crypto salaries are a major red flag',
        'Asking for a government ID photo before any interview is identity theft setup',
        'No interview process means there is no real job',
        'Crypto payments are irreversible and untraceable'
      ],
      safe_move: 'Never send a photo of your ID to a stranger. Verify any employer through official channels.',
      consequence: 'Your government ID is used to open fraudulent financial accounts or sold on dark web markets.',
      behavioral_reinforcement: 'Crypto salaries and upfront ID requests are always scam signals — real jobs do not work this way.'
    },
    tags: ['identity_theft', 'job_scam', 'crypto'],
    tricks: ['credential_harvest', 'advance_fee']
  },
  {
    id: 'spot_email_job_006',
    channel: 'email',
    pattern_family: 'job_seeker',
    difficulty: 3,
    ground_truth: 'scam',
    ai_amplified: false,
    drill_type: 'spot_flag',
    framing: 'This came in while you were actively job hunting.',
    spot_flag_options: [
      { id: 'generic_greeting', label: 'No personalization — generic greeting' },
      { id: 'wrong_name', label: 'Gets your name wrong' },
      { id: 'training_fee', label: 'Requires payment for mandatory training' },
      { id: 'short_contract', label: 'Short-term contract role' }
    ],
    spot_flag_correct_id: 'training_fee',
    message: {
      from_name: 'Onboarding | NovaMart Fulfillment',
      from_handle: 'onboarding@novamart-fulfillment-center.com',
      subject: 'Welcome! Next Step: Complete Your Training',
      body: 'Dear New Team Member,\n\nCongratulations on your selection for the NovaMart Fulfillment Associate role!\n\nBefore your start date, you are required to complete our online safety certification. The fee is $75, payable via prepaid Visa card to access the training portal.\n\nOnce completed, this fee is fully reimbursed in your first paycheck.\n\nComplete your training at: novamart-fulfillment-center.com/training\n\nNovaMart Onboarding Team'
    },
    red_flags: [
      { id: 'training_fee', label: 'Charges a fee for mandatory training' },
      { id: 'prepaid_card', label: 'Payment via prepaid Visa card' },
      { id: 'reimbursement_promise', label: 'Promises reimbursement that never comes' },
      { id: 'lookalike_domain', label: 'Domain adds words to mimic a real company' }
    ],
    correct_red_flag_ids: ['training_fee', 'prepaid_card', 'reimbursement_promise', 'lookalike_domain'],
    explanation: {
      short: 'Employers do not charge for mandatory training. The reimbursement promise is a lure — you will never see it.',
      tells: [
        'No legitimate employer charges fees before your first day',
        'Prepaid cards are untraceable — a scammer preferred payment method',
        'Reimbursement promises are designed to make the fee feel temporary',
        'The domain has extra words added to mimic a real company'
      ],
      safe_move: 'Contact the real company through their official website to verify whether you were actually hired.',
      consequence: 'You pay $75 and never hear from them again — there is no job and no reimbursement.',
      behavioral_reinforcement: 'Any employer asking for upfront payment — even with a reimbursement promise — is running a scam.'
    },
    tags: ['advance_fee', 'job_scam', 'prepaid_card'],
    tricks: ['advance_fee', 'authority_impersonation']
  },
  {
    id: 'spot_email_job_007',
    channel: 'email',
    pattern_family: 'job_seeker',
    difficulty: 3,
    ground_truth: 'scam',
    ai_amplified: false,
    drill_type: 'spot_flag',
    framing: 'You got this after applying on a job board.',
    spot_flag_options: [
      { id: 'whatsapp_interview', label: 'Interview scheduled over WhatsApp' },
      { id: 'multiple_openings', label: 'Multiple positions available' },
      { id: 'benefits_mentioned', label: 'Health benefits are offered' },
      { id: 'start_date_given', label: 'Specific start date is provided' }
    ],
    spot_flag_correct_id: 'whatsapp_interview',
    message: {
      from_name: 'Talent Team | Grainger Supply Co.',
      from_handle: 'talent@grainger-supply-careers.com',
      subject: 'Interview Scheduled - Warehouse Coordinator',
      body: 'Hello,\n\nWe reviewed your application and would like to move forward with an interview for our Warehouse Coordinator opening.\n\nYour interview is scheduled for Tuesday at 10am. Please save our hiring manager WhatsApp number to connect: +1 (646) 555-0193\n\nCompensation: $22/hr + benefits. Start date: May 1st.\n\nThank you,\nGrainger Supply Co. Talent Team'
    },
    red_flags: [
      { id: 'whatsapp_interview', label: 'Interview via WhatsApp personal number' },
      { id: 'lookalike_domain', label: 'grainger-supply-careers.com is not the real site' },
      { id: 'personal_number', label: 'Gives personal phone number for company interview' },
      { id: 'no_confirmation_link', label: 'No calendar invite or official confirmation' }
    ],
    correct_red_flag_ids: ['whatsapp_interview', 'lookalike_domain', 'personal_number'],
    explanation: {
      short: 'Real companies schedule interviews through official systems — not personal WhatsApp numbers.',
      tells: [
        'WhatsApp interviews are used to stay off company records and avoid accountability',
        'The domain adds hyphens and words to a company name — a classic lookalike tactic',
        'A personal phone number for a corporate interview is always suspicious',
        'Legitimate interview invites come with calendar links and company email confirmation'
      ],
      safe_move: 'Look up the company real HR contact through their official website and verify directly.',
      consequence: 'The WhatsApp contact will conduct a fake interview then ask for personal information or fees.',
      behavioral_reinforcement: 'Legitimate job interviews never happen over WhatsApp with personal numbers.'
    },
    tags: ['job_scam', 'whatsapp', 'lookalike_domain'],
    tricks: ['authority_impersonation', 'credential_harvest']
  },
  {
    id: 'spot_email_job_008',
    channel: 'email',
    pattern_family: 'job_seeker',
    difficulty: 3,
    ground_truth: 'scam',
    ai_amplified: false,
    drill_type: 'spot_flag',
    framing: 'You have been applying to remote jobs for a few weeks.',
    spot_flag_options: [
      { id: 'bank_info_request', label: 'Asks for bank account info to set up payroll' },
      { id: 'direct_deposit', label: 'Mentions direct deposit' },
      { id: 'w4_mentioned', label: 'References a W-4 form' },
      { id: 'start_next_week', label: 'Start date is next week' }
    ],
    spot_flag_correct_id: 'bank_info_request',
    message: {
      from_name: 'HR Department | TrueVine Market',
      from_handle: 'hr@truevine-market-onboarding.com',
      subject: 'Payroll Setup Required - Start Date Confirmed',
      body: 'Hi,\n\nYour start date of next Monday has been confirmed for the Remote Inventory Specialist role.\n\nTo ensure your first paycheck is processed on time, please reply with your:\n- Bank name\n- Routing number\n- Account number\n\nWe will also need a completed W-4 attached. Welcome to TrueVine Market!\n\nHR Department'
    },
    red_flags: [
      { id: 'bank_info_request', label: 'Asks for routing and account number by email' },
      { id: 'lookalike_domain', label: 'Domain is truevine-market-onboarding.com not the real site' },
      { id: 'no_prior_contact', label: 'First contact skips straight to payroll setup' },
      { id: 'email_banking', label: 'Sending bank info via unencrypted email is unsafe' }
    ],
    correct_red_flag_ids: ['bank_info_request', 'lookalike_domain', 'no_prior_contact'],
    explanation: {
      short: 'Legitimate payroll setup never happens over email — and never before you have actually started working.',
      tells: [
        'No real employer collects banking info through an email reply',
        'Payroll setup uses secure portals like ADP or Workday — not plain email',
        'The domain adds words to a brand name to appear official',
        'Jumping straight to banking details before day one is a major red flag'
      ],
      safe_move: 'Contact the company through their official website to verify the onboarding process before sharing any financial information.',
      consequence: 'Your routing and account numbers allow direct withdrawal from your bank account.',
      behavioral_reinforcement: 'Payroll banking info is always submitted through a secure HR portal — never by email reply.'
    },
    tags: ['banking', 'job_scam', 'credential_harvest'],
    tricks: ['credential_harvest', 'authority_impersonation']
  }
];

const REAL_BRANDS = ['Amazon', 'Google', 'Apple', 'Microsoft', 'PayPal', 'Chase', 'Wells Fargo', 'Coinbase', 'Facebook', 'Instagram', 'Netflix', 'UPS', 'FedEx', 'DHL', 'St. Jude', 'Walmart', 'eBay'];
let issues = [];
newDrills.forEach(d => {
  const text = JSON.stringify(d);
  REAL_BRANDS.forEach(b => { if (text.includes(b)) issues.push(d.id + ': ' + b); });
});
if (issues.length) { console.error('BRAND ISSUES:', issues); process.exit(1); }

const existingIds = new Set(drills.map(d => d.id));
newDrills.forEach(d => { if (existingIds.has(d.id)) { console.error('DUPLICATE ID:', d.id); process.exit(1); } });

const updated = [...drills, ...newDrills];
fs.writeFileSync('data/drills.json', JSON.stringify(updated, null, 2));
console.log('Added', newDrills.length, 'drills. Total:', updated.length);
