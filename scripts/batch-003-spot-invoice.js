const fs = require('fs');
const drills = JSON.parse(fs.readFileSync('data/drills.json', 'utf-8'));

const newDrills = [
  {
    id: 'spot_email_invoice_001',
    channel: 'email',
    pattern_family: 'invoice_vendor',
    difficulty: 4,
    ground_truth: 'scam',
    ai_amplified: false,
    drill_type: 'spot_flag',
    framing: 'You work in accounting. This invoice just hit your inbox.',
    spot_flag_options: [
      { id: 'new_bank_account', label: 'Vendor requests payment to a new bank account' },
      { id: 'large_amount', label: 'Invoice amount is unusually large' },
      { id: 'due_soon', label: 'Payment is due within 24 hours' },
      { id: 'pdf_attached', label: 'Invoice is a PDF attachment' }
    ],
    spot_flag_correct_id: 'new_bank_account',
    message: {
      from_name: 'Rachel Voss | Grainger Supply Co.',
      from_handle: 'rvoss@grainger-supply.co',
      subject: 'UPDATED: Invoice #GS-4491 - New Payment Instructions',
      body: 'Hi,\n\nPlease note we have updated our banking details effective immediately. All outstanding invoices should be paid to our new account:\n\nBank: Apex Federal Credit Union\nRouting: 021000089\nAccount: 7734901122\n\nInvoice #GS-4491 for $14,300 is due by end of week. Please confirm receipt of these new instructions.\n\nRachel Voss\nAccounts Receivable, Grainger Supply Co.'
    },
    red_flags: [
      { id: 'new_bank_account', label: 'Vendor requests payment to a new bank account' },
      { id: 'lookalike_domain', label: 'grainger-supply.co is not the real vendor domain' },
      { id: 'urgency', label: 'End of week deadline creates pressure' },
      { id: 'unsolicited_change', label: 'Banking change sent via email with no prior notice' }
    ],
    correct_red_flag_ids: ['new_bank_account', 'lookalike_domain', 'unsolicited_change'],
    explanation: {
      short: 'Legitimate vendors change banking details through verified channels — never via a single unsolicited email.',
      tells: [
        'Fraudsters intercept vendor email threads and swap in their own account details',
        'The domain grainger-supply.co differs from the real vendor domain',
        'Real banking changes require phone verification with a known contact',
        'Any urgent payment change request via email should be treated as suspicious'
      ],
      safe_move: 'Call the vendor using a phone number from your existing records — not one in this email — to verify the change.',
      consequence: '$14,300 is wired to the scammer. By the time the real vendor reports non-payment, the money is gone.',
      behavioral_reinforcement: 'Always verify payment detail changes by phone using a number you already have on file — never trust an emailed banking change.'
    },
    tags: ['bec', 'invoice_fraud', 'wire_fraud'],
    tricks: ['authority_impersonation', 'lookalike_domain', 'urgency']
  },
  {
    id: 'spot_email_invoice_002',
    channel: 'email',
    pattern_family: 'invoice_vendor',
    difficulty: 4,
    ground_truth: 'scam',
    ai_amplified: false,
    drill_type: 'spot_flag',
    framing: 'An invoice arrived for software your company uses.',
    spot_flag_options: [
      { id: 'no_prior_relationship', label: 'Your company never ordered this service' },
      { id: 'high_amount', label: 'Invoice amount is higher than usual' },
      { id: 'auto_renew', label: 'References an auto-renewal policy' },
      { id: 'pdf_format', label: 'Sent as a PDF attachment' }
    ],
    spot_flag_correct_id: 'no_prior_relationship',
    message: {
      from_name: 'Billing | DataVault Pro',
      from_handle: 'billing@datavault-pro-invoicing.com',
      subject: 'Annual Renewal Invoice - DataVault Pro Business - $4,800',
      body: 'Dear Valued Customer,\n\nThis is your annual renewal notice for DataVault Pro Business (5 seats, Enterprise tier).\n\nAmount due: $4,800.00\nDue date: Within 10 business days\n\nPer your service agreement, failure to pay by the due date will result in data deletion. To pay or dispute, visit: datavault-pro-invoicing.com/renew\n\nDataVault Pro Billing'
    },
    red_flags: [
      { id: 'no_prior_relationship', label: 'No record of subscribing to this service' },
      { id: 'data_deletion_threat', label: 'Threatens data deletion to create fear' },
      { id: 'lookalike_domain', label: 'datavault-pro-invoicing.com is not a real vendor site' },
      { id: 'generic_greeting', label: 'No account details or named contact' }
    ],
    correct_red_flag_ids: ['no_prior_relationship', 'data_deletion_threat', 'lookalike_domain'],
    explanation: {
      short: 'Phantom invoice scams bill for services you never ordered, counting on finance teams to pay without checking.',
      tells: [
        'If you have no record of the service, the invoice is fraudulent',
        'Threatening data deletion is a fear tactic to pressure immediate payment',
        'The billing domain is not affiliated with any real software company',
        'Legitimate SaaS renewals include account IDs and named contacts'
      ],
      safe_move: 'Search your company records for any contract with this vendor. If none exists, do not pay and report the email.',
      consequence: '$4,800 paid to a company you never contracted with — recovery is unlikely.',
      behavioral_reinforcement: 'Always verify invoices against purchase orders or signed contracts before authorizing payment.'
    },
    tags: ['phantom_invoice', 'invoice_fraud', 'fear_tactic'],
    tricks: ['fear_lockout', 'authority_impersonation', 'lookalike_domain']
  },
  {
    id: 'spot_email_invoice_003',
    channel: 'email',
    pattern_family: 'invoice_vendor',
    difficulty: 4,
    ground_truth: 'scam',
    ai_amplified: false,
    drill_type: 'spot_flag',
    framing: 'Your CEO just forwarded you this with "Please process ASAP."',
    spot_flag_options: [
      { id: 'ceo_pressure', label: 'CEO is pressuring an urgent wire transfer' },
      { id: 'weekend_timing', label: 'Request comes on a Friday afternoon' },
      { id: 'vendor_not_recognized', label: 'Vendor name is unfamiliar' },
      { id: 'large_wire', label: 'Wire amount is unusually large' }
    ],
    spot_flag_correct_id: 'ceo_pressure',
    message: {
      from_name: 'Marcus Diallo (CEO)',
      from_handle: 'mdiallo@vertex-electronics-corp.net',
      subject: 'Fwd: Wire Needed Today - Confidential',
      body: 'Please handle this wire today. New strategic partner — keeping quiet until announcement next week. Wire $38,500 to:\n\nBeneficiary: NexCoin Holdings Ltd\nBank: Offshore Trust Bank, Cayman Islands\nAccount: 0049112233\n\nDo not discuss with anyone until I give the go-ahead. I am in meetings all day.\n\n- Marcus'
    },
    red_flags: [
      { id: 'ceo_pressure', label: 'CEO demands urgent wire with secrecy instruction' },
      { id: 'offshore_account', label: 'Wire destination is an offshore Cayman Islands account' },
      { id: 'secrecy_request', label: 'Told not to discuss with anyone' },
      { id: 'lookalike_domain', label: 'CEO email domain does not match company domain' }
    ],
    correct_red_flag_ids: ['ceo_pressure', 'offshore_account', 'secrecy_request', 'lookalike_domain'],
    explanation: {
      short: 'This is a Business Email Compromise (BEC) scam — the CEO email is spoofed and the secrecy demand prevents verification.',
      tells: [
        'Real executives do not demand secrecy around legitimate wire transfers',
        'Offshore Cayman accounts are a major red flag for fraudulent wires',
        'The CEO email domain is vertex-electronics-corp.net, not the real company domain',
        'BEC scams frequently use Friday timing when staff are rushed and less likely to verify'
      ],
      safe_move: 'Call the CEO directly on a known phone number to verify. Never wire money based solely on an email instruction.',
      consequence: '$38,500 is wired offshore and is unrecoverable. BEC scams cost businesses billions annually.',
      behavioral_reinforcement: 'Any wire transfer request with secrecy instructions is a red flag — always verify by phone with a number from your own records.'
    },
    tags: ['bec', 'ceo_fraud', 'wire_fraud'],
    tricks: ['authority_impersonation', 'secrecy', 'urgency']
  },
  {
    id: 'spot_email_invoice_004',
    channel: 'email',
    pattern_family: 'invoice_vendor',
    difficulty: 4,
    ground_truth: 'scam',
    ai_amplified: false,
    drill_type: 'spot_flag',
    framing: 'You manage vendor payments. This came in this morning.',
    spot_flag_options: [
      { id: 'reply_to_different', label: 'Reply-to address differs from sender address' },
      { id: 'attached_invoice', label: 'Invoice is attached as a file' },
      { id: 'new_contact', label: 'Email is from someone new at the vendor' },
      { id: 'amount_change', label: 'Amount differs slightly from usual' }
    ],
    spot_flag_correct_id: 'reply_to_different',
    message: {
      from_name: 'Sandra Osei | Summit Analytics',
      from_handle: 'sosei@summit-analytics.com',
      subject: 'Invoice #SA-7742 - Q1 Consulting Services',
      body: 'Hi,\n\nPlease find attached Invoice #SA-7742 for Q1 consulting services totaling $9,200.\n\nKindly process payment at your earliest convenience. If you have any questions, just reply to this email.\n\nThank you,\nSandra Osei\nSummit Analytics Accounts'
    },
    red_flags: [
      { id: 'reply_to_different', label: 'Reply-to routes to a different address than the sender' },
      { id: 'new_contact', label: 'Sandra Osei is not a known contact at this vendor' },
      { id: 'no_po_reference', label: 'No purchase order number referenced' },
      { id: 'vague_services', label: 'Q1 consulting is vague with no detail' }
    ],
    correct_red_flag_ids: ['reply_to_different', 'new_contact', 'no_po_reference'],
    explanation: {
      short: 'A mismatched reply-to address is a classic email interception technique — replies and payments go to the scammer, not the vendor.',
      tells: [
        'Scammers set the reply-to field to their own address while spoofing the from field',
        'You would not notice unless you carefully check both the from and reply-to headers',
        'A new contact name you cannot verify at a known vendor is suspicious',
        'Legitimate invoices always reference a purchase order or contract number'
      ],
      safe_move: 'Check your email headers for the reply-to address. Verify the invoice by calling the vendor on their main line.',
      consequence: 'Payment is processed and your reply confirms receipt — to the scammer, who now knows the account is active.',
      behavioral_reinforcement: 'Always check that the reply-to address matches the sender before acting on any invoice.'
    },
    tags: ['bec', 'reply_to_attack', 'invoice_fraud'],
    tricks: ['authority_impersonation', 'lookalike_domain']
  },
  {
    id: 'spot_email_invoice_005',
    channel: 'email',
    pattern_family: 'invoice_vendor',
    difficulty: 4,
    ground_truth: 'scam',
    ai_amplified: false,
    drill_type: 'spot_flag',
    framing: 'A subscription renewal notice for office software just arrived.',
    spot_flag_options: [
      { id: 'call_to_cancel', label: 'Asks you to call a phone number to cancel' },
      { id: 'large_renewal', label: 'Renewal amount is higher than expected' },
      { id: 'auto_charged', label: 'Says your card will be auto-charged' },
      { id: 'no_account_number', label: 'No account number or username referenced' }
    ],
    spot_flag_correct_id: 'call_to_cancel',
    message: {
      from_name: 'NexCloud Billing',
      from_handle: 'billing@nexcloud-renewal-center.com',
      subject: 'Your NexCloud Business Plan Renews in 24 Hours - $899.00',
      body: 'Dear Customer,\n\nYour NexCloud Business Plan will automatically renew tomorrow for $899.00.\n\nIf you did not authorize this renewal or wish to cancel, please call our billing team immediately:\n\n1-888-555-0147\n\nFailure to call within 24 hours will result in the charge being processed.\n\nNexCloud Billing Department'
    },
    red_flags: [
      { id: 'call_to_cancel', label: 'Asks you to call a number to cancel — callback trap' },
      { id: 'lookalike_domain', label: 'nexcloud-renewal-center.com is not nexcloud.com' },
      { id: 'urgency', label: '24-hour pressure to act' },
      { id: 'no_account_details', label: 'No account number or login details referenced' }
    ],
    correct_red_flag_ids: ['call_to_cancel', 'lookalike_domain', 'urgency'],
    explanation: {
      short: 'The callback trap gets you on the phone with a scammer posing as billing support who then asks for payment or remote access.',
      tells: [
        'Real software companies let you cancel through your account dashboard — not a phone call',
        'The domain nexcloud-renewal-center.com is not affiliated with the real service',
        '24-hour urgency is designed to prevent you from checking your actual account',
        'No legitimate billing notice omits your account number or username'
      ],
      safe_move: 'Log into your actual account at the real domain and check your subscription status there.',
      consequence: 'Calling the number connects you with a scammer who will ask for payment info or remote access to process your cancellation.',
      behavioral_reinforcement: 'Manage subscriptions through your account dashboard — never by calling a number in an unsolicited email.'
    },
    tags: ['callback_trap', 'invoice_fraud', 'tech_support'],
    tricks: ['callback_trap', 'urgency', 'fear_lockout']
  },
  {
    id: 'spot_email_invoice_006',
    channel: 'email',
    pattern_family: 'invoice_vendor',
    difficulty: 4,
    ground_truth: 'scam',
    ai_amplified: false,
    drill_type: 'spot_flag',
    framing: 'Your company uses a cleaning service. This invoice arrived.',
    spot_flag_options: [
      { id: 'inflated_amount', label: 'Amount is double what was agreed' },
      { id: 'new_sender', label: 'Email is from a new contact' },
      { id: 'pay_by_wire', label: 'Requests wire transfer instead of usual check' },
      { id: 'past_due_notice', label: 'Claims the invoice is past due' }
    ],
    spot_flag_correct_id: 'pay_by_wire',
    message: {
      from_name: 'Maria Santos | CleanPro Services',
      from_handle: 'msantos@cleanpro-svcs.net',
      subject: 'Invoice #CP-1183 - March Services - PAST DUE',
      body: 'Hello,\n\nOur records show Invoice #CP-1183 for March cleaning services ($1,450) remains unpaid and is now 14 days past due.\n\nTo avoid a service interruption, please remit payment via wire transfer to our new banking account:\n\nBank: Granite Credit Union\nRouting: 031100209\nAccount: 5529003341\n\nWe have updated our payment method and no longer accept checks.\n\nThank you,\nMaria Santos\nCleanPro Services'
    },
    red_flags: [
      { id: 'pay_by_wire', label: 'Suddenly requires wire transfer instead of check' },
      { id: 'new_account', label: 'New banking account provided via email' },
      { id: 'past_due_pressure', label: 'Past due notice creates urgency to pay quickly' },
      { id: 'lookalike_domain', label: 'cleanpro-svcs.net may differ from real vendor domain' }
    ],
    correct_red_flag_ids: ['pay_by_wire', 'new_account', 'past_due_pressure'],
    explanation: {
      short: 'Switching to wire-only payment with new banking details via email is a hallmark of vendor impersonation fraud.',
      tells: [
        'Legitimate vendors do not suddenly stop accepting checks by email notice',
        'New banking details sent via email without phone verification are always suspicious',
        'Past due notices create pressure to pay quickly without double-checking',
        'Wire transfers are irreversible and preferred by fraudsters for this reason'
      ],
      safe_move: 'Call your regular contact at the cleaning service using the number you have on file to verify the payment change.',
      consequence: '$1,450 is wired to a fraudulent account. The real vendor calls weeks later asking about non-payment.',
      behavioral_reinforcement: 'Verify any payment method change by phone before processing — never trust a banking change sent only by email.'
    },
    tags: ['vendor_fraud', 'wire_fraud', 'invoice_fraud'],
    tricks: ['authority_impersonation', 'urgency', 'payment_redirect']
  },
  {
    id: 'spot_email_invoice_007',
    channel: 'email',
    pattern_family: 'invoice_vendor',
    difficulty: 4,
    ground_truth: 'scam',
    ai_amplified: false,
    drill_type: 'spot_flag',
    framing: 'Your small business got this from a legal services firm.',
    spot_flag_options: [
      { id: 'unsolicited_legal', label: 'You never hired this law firm' },
      { id: 'threatening_language', label: 'Uses legal threat language' },
      { id: 'vague_services', label: 'Services billed are vague' },
      { id: 'small_amount', label: 'Amount is small enough to pay without scrutiny' }
    ],
    spot_flag_correct_id: 'unsolicited_legal',
    message: {
      from_name: 'Billing | Whitmore Legal Group',
      from_handle: 'billing@whitmorelegal-billing.com',
      subject: 'Outstanding Balance - Legal Services - $340.00',
      body: 'Dear Business Owner,\n\nOur records indicate an outstanding balance of $340.00 for legal consultation services rendered in Q4.\n\nThis balance must be paid within 5 business days to avoid referral to collections and potential impact to your business credit.\n\nPay online: whitmorelegal-billing.com/pay\n\nWhitmore Legal Group\nBilling Department'
    },
    red_flags: [
      { id: 'unsolicited_legal', label: 'No record of hiring this firm' },
      { id: 'collections_threat', label: 'Threatens collections to pressure payment' },
      { id: 'lookalike_domain', label: 'whitmorelegal-billing.com is a separate payment site' },
      { id: 'generic_greeting', label: 'Addressed to Dear Business Owner, not by name' }
    ],
    correct_red_flag_ids: ['unsolicited_legal', 'collections_threat', 'lookalike_domain'],
    explanation: {
      short: 'Phantom legal bills exploit fear of collections and business credit damage to get small payments without scrutiny.',
      tells: [
        'You would know if you hired a law firm — if you did not, the invoice is fraudulent',
        'Collections threats for a $340 bill from a firm you never hired is a pressure tactic',
        'The payment site is a separate domain from any real law firm',
        'Real legal invoices include matter numbers, attorney names, and itemized services'
      ],
      safe_move: 'Search your records for any engagement with this firm. If none exists, do not pay and report to the FTC.',
      consequence: '$340 paid to fraudsters — small enough that most businesses pay without investigating.',
      behavioral_reinforcement: 'Always match invoices to signed contracts or purchase orders — if there is no record, do not pay.'
    },
    tags: ['phantom_invoice', 'legal_threat', 'small_dollar_bait'],
    tricks: ['fear_lockout', 'small_dollar_bait', 'authority_impersonation']
  },
  {
    id: 'spot_email_invoice_008',
    channel: 'email',
    pattern_family: 'invoice_vendor',
    difficulty: 4,
    ground_truth: 'scam',
    ai_amplified: false,
    drill_type: 'spot_flag',
    framing: 'You handle accounts payable. This came from a known vendor.',
    spot_flag_options: [
      { id: 'malicious_attachment', label: 'Invoice attachment is an executable or macro file' },
      { id: 'different_amount', label: 'Amount is higher than usual' },
      { id: 'new_email', label: 'Sent from a slightly different email address' },
      { id: 'rushed_request', label: 'Marked urgent for quick payment' }
    ],
    spot_flag_correct_id: 'malicious_attachment',
    message: {
      from_name: 'Tom Reeves | Vertex Electronics',
      from_handle: 'treeves@vertex-electronics.co',
      subject: 'Invoice Q1-2026 - Please Review and Approve',
      body: 'Hi,\n\nAttached is our Q1 invoice for your review and approval. Please open the file to verify line items before processing.\n\nTotal: $7,600\n\nLet me know if you have any questions.\n\nTom Reeves\nVertex Electronics'
    },
    red_flags: [
      { id: 'malicious_attachment', label: 'Invoice file could contain malware macros' },
      { id: 'lookalike_domain', label: 'vertex-electronics.co differs from real vendor domain' },
      { id: 'opens_file_request', label: 'Specifically asks you to open and interact with the file' },
      { id: 'new_email', label: 'Email address slightly different from known contact' }
    ],
    correct_red_flag_ids: ['malicious_attachment', 'lookalike_domain', 'opens_file_request'],
    explanation: {
      short: 'Invoice attachments from spoofed vendor addresses are a common malware delivery vector — opening the file can compromise your system.',
      tells: [
        'Scammers spoof known vendor names to get recipients to open attachments without suspicion',
        'The domain vertex-electronics.co differs subtly from the real vendor domain',
        'Malicious invoice files often contain macros that install malware when enabled',
        'Real invoices from established vendors rarely change their sending domain suddenly'
      ],
      safe_move: 'Contact Tom directly on a known phone number to verify the invoice before opening any attachment.',
      consequence: 'Opening the file enables a macro that installs ransomware or a keylogger on your system.',
      behavioral_reinforcement: 'Verify unexpected invoice attachments by phone before opening — especially if the sender domain looks slightly different.'
    },
    tags: ['malware', 'invoice_fraud', 'bec'],
    tricks: ['authority_impersonation', 'lookalike_domain', 'credential_harvest']
  }
];

const REAL_BRANDS = ['Amazon','Google','Apple','Microsoft','PayPal','Chase','Wells Fargo','Coinbase','Facebook','Instagram','Netflix','UPS','FedEx','DHL','St. Jude','Walmart','eBay','Venmo','Zelle','Cash App','WhatsApp','Telegram','LinkedIn','Indeed'];
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
