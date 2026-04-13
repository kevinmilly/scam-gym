const fs = require('fs');
const drills = JSON.parse(fs.readFileSync('data/drills.json', 'utf-8'));

const newDrills = [
  {
    id: 'spot_dm_marketplace_001',
    channel: 'dm',
    pattern_family: 'marketplace',
    difficulty: 2,
    ground_truth: 'scam',
    ai_amplified: false,
    drill_type: 'spot_flag',
    framing: 'You listed a couch for sale online. This DM just came in.',
    spot_flag_options: [
      { id: 'overpayment', label: 'Offers to pay more than asking price' },
      { id: 'busy_schedule', label: 'Says they are too busy to pick up in person' },
      { id: 'ships_item', label: 'Wants to arrange shipping' },
      { id: 'quick_deal', label: 'Wants to close the deal today' }
    ],
    spot_flag_correct_id: 'overpayment',
    message: {
      from_name: 'Brian K.',
      from_handle: '@brian.k.buyer22',
      subject: null,
      body: 'Hi! Is the couch still available? I want it for my son who just moved. I can send $350 right now — I know you said $280, but I want to make sure you hold it. My mover will come pick it up tomorrow. Can you send me your Venmo?'
    },
    red_flags: [
      { id: 'overpayment', label: 'Offers more than asking price' },
      { id: 'third_party_pickup', label: 'Sends someone else to pick it up' },
      { id: 'venmo_request', label: 'Asks for your payment handle immediately' },
      { id: 'no_in_person', label: 'Never wants to meet you directly' }
    ],
    correct_red_flag_ids: ['overpayment', 'third_party_pickup', 'venmo_request'],
    explanation: {
      short: 'Overpaying is a classic setup — they send a fake payment, then ask you to refund the difference.',
      tells: [
        'Offering over the asking price is the hallmark of an overpayment scam',
        'Sending a third party to pick up keeps them anonymous',
        'Requesting your Venmo before any agreement is made is a data collection tactic',
        'Real buyers negotiate down, not up'
      ],
      safe_move: 'Only accept cash in person or use a verified payment platform with buyer/seller protection. Never refund a difference.',
      consequence: 'They send a fake Venmo screenshot or reversible payment, then ask you to send back the overage. You ship the item or hand it off and the payment reverses.',
      behavioral_reinforcement: 'Any buyer who offers more than you asked is running a scam — the overpayment is fake.'
    },
    tags: ['marketplace', 'overpayment', 'venmo'],
    tricks: ['overpayment', 'payment_redirect']
  },
  {
    id: 'spot_dm_marketplace_002',
    channel: 'dm',
    pattern_family: 'marketplace',
    difficulty: 2,
    ground_truth: 'scam',
    ai_amplified: false,
    drill_type: 'spot_flag',
    framing: 'You are selling a used laptop online. This message came in.',
    spot_flag_options: [
      { id: 'payment_link', label: 'Sends a link to collect your payment info' },
      { id: 'out_of_state', label: 'Buyer is out of state' },
      { id: 'shipping_offer', label: 'Willing to pay for shipping' },
      { id: 'cash_app', label: 'Wants to use Cash App' }
    ],
    spot_flag_correct_id: 'payment_link',
    message: {
      from_name: 'Rachel T.',
      from_handle: '@rachel.t.shop',
      subject: null,
      body: 'Hey, I am really interested in the laptop! I am out of state but can pay right now. Click this to receive payment: pay-direct-transfer.com/receive/rt8821. Takes 2 minutes. Then I will arrange shipping at my cost!'
    },
    red_flags: [
      { id: 'payment_link', label: 'Sends a suspicious link to receive payment' },
      { id: 'lookalike_site', label: 'pay-direct-transfer.com is not a real payment service' },
      { id: 'urgency', label: 'Wants to pay immediately' },
      { id: 'out_of_state', label: 'Buyer conveniently cannot meet in person' }
    ],
    correct_red_flag_ids: ['payment_link', 'lookalike_site', 'urgency'],
    explanation: {
      short: 'Legitimate payment apps do not send links to sellers — that link is a phishing page to steal your banking info.',
      tells: [
        'No real payment platform sends a link for the seller to click to receive money',
        'pay-direct-transfer.com is not affiliated with any legitimate service',
        'Out-of-state buyers who cannot meet are trying to force remote payment methods',
        'Real Cash App or Venmo transactions are initiated by the buyer in their own app — never via a link'
      ],
      safe_move: 'Only accept payment through official apps you open yourself — never click a link someone else sends to receive money.',
      consequence: 'The link collects your banking credentials or installs malware. You lose the laptop and your account access.',
      behavioral_reinforcement: 'To receive money, you open the app yourself — you never click a link the buyer sends.'
    },
    tags: ['marketplace', 'phishing_link', 'payment_scam'],
    tricks: ['lookalike_domain', 'credential_harvest']
  },
  {
    id: 'spot_dm_marketplace_003',
    channel: 'dm',
    pattern_family: 'marketplace',
    difficulty: 2,
    ground_truth: 'scam',
    ai_amplified: false,
    drill_type: 'spot_flag',
    framing: 'You are buying concert tickets from someone online.',
    spot_flag_options: [
      { id: 'no_transfer', label: 'Cannot transfer tickets through official platform' },
      { id: 'price_below_market', label: 'Tickets are priced well below market' },
      { id: 'quick_sale', label: 'Seller is in a hurry to sell' },
      { id: 'zelle_only', label: 'Only accepts Zelle or Cash App' }
    ],
    spot_flag_correct_id: 'zelle_only',
    message: {
      from_name: 'Tyler M.',
      from_handle: '@tyler.m.tix',
      subject: null,
      body: 'Hey! Still have 2 floor tickets for Saturday. $85 each (face value). My app is glitching so I cannot transfer on the platform. Send via Zelle and I will screenshot you the barcodes. Fast sale — got another person interested.'
    },
    red_flags: [
      { id: 'zelle_only', label: 'Only accepts Zelle — no buyer protection' },
      { id: 'no_transfer', label: 'Convenient excuse for not using official transfer' },
      { id: 'barcode_screenshot', label: 'Offers screenshots of barcodes instead of real transfer' },
      { id: 'urgency', label: 'Fake competing buyer pressure' }
    ],
    correct_red_flag_ids: ['zelle_only', 'no_transfer', 'barcode_screenshot'],
    explanation: {
      short: 'Zelle has no buyer protection — once sent, money cannot be recovered. The "barcodes" will be fake or already used.',
      tells: [
        'Zelle is irreversible — scammers insist on it because you cannot dispute the charge',
        'The "app glitch" excuse is standard to avoid traceable official transfers',
        'Ticket barcodes can be reused, screenshot to multiple buyers, or simply fake',
        'Urgency with a competing buyer is a pressure tactic to prevent you from thinking'
      ],
      safe_move: 'Only buy tickets through official platforms with buyer protection. Never pay via Zelle for tickets.',
      consequence: 'You send the money and receive fake or already-used barcodes. Zelle will not refund you.',
      behavioral_reinforcement: 'Ticket sellers who cannot use the official platform transfer are always suspicious — Zelle is not a safe way to buy tickets from strangers.'
    },
    tags: ['marketplace', 'ticket_scam', 'zelle'],
    tricks: ['urgency', 'payment_redirect']
  },
  {
    id: 'spot_dm_marketplace_004',
    channel: 'dm',
    pattern_family: 'marketplace',
    difficulty: 2,
    ground_truth: 'scam',
    ai_amplified: false,
    drill_type: 'spot_flag',
    framing: 'You posted a rental listing. This message came in.',
    spot_flag_options: [
      { id: 'wire_transfer', label: 'Asks you to wire the deposit' },
      { id: 'overseas_applicant', label: 'Applicant is currently overseas' },
      { id: 'references_offered', label: 'Offers to send references immediately' },
      { id: 'quick_move_in', label: 'Wants to move in very quickly' }
    ],
    spot_flag_correct_id: 'wire_transfer',
    message: {
      from_name: 'Mohammed A.',
      from_handle: '@m.a.relocating2024',
      subject: null,
      body: 'Hello, I am relocating from abroad for work and your property looks perfect. I am ready to pay 3 months upfront. My employer will send a cashiers check for the full amount. Please wire back the extra once received. Can we proceed?'
    },
    red_flags: [
      { id: 'wire_transfer', label: 'Asks you to wire back money after receiving a check' },
      { id: 'fake_check', label: 'Employer sends a cashiers check — classic fake check setup' },
      { id: 'overseas_excuse', label: 'Cannot view the property in person' },
      { id: 'overpayment', label: 'Paying more than needed, expecting wire back' }
    ],
    correct_red_flag_ids: ['wire_transfer', 'fake_check', 'overpayment'],
    explanation: {
      short: 'This is a fake check scam — the cashier check will bounce, but you have already wired real money.',
      tells: [
        'Wiring money back after receiving a check is the fake check playbook',
        'Cashier checks can be forged and take days to bounce after appearing cleared',
        'Overseas applicants who cannot view property are a signature rental scam setup',
        'No legitimate tenant has their employer overpay and ask for a refund'
      ],
      safe_move: 'Only accept verified electronic bank transfers. Wait 10+ business days for any check to fully clear before releasing any funds.',
      consequence: 'The check bounces a week later. You have already wired thousands of dollars that cannot be recovered.',
      behavioral_reinforcement: 'Never wire money back after receiving a check from a stranger — the check will always eventually bounce.'
    },
    tags: ['rental_scam', 'fake_check', 'wire_transfer'],
    tricks: ['advance_fee', 'payment_redirect']
  },
  {
    id: 'spot_dm_marketplace_005',
    channel: 'dm',
    pattern_family: 'marketplace',
    difficulty: 2,
    ground_truth: 'scam',
    ai_amplified: false,
    drill_type: 'spot_flag',
    framing: 'You are selling a phone on a resale app.',
    spot_flag_options: [
      { id: 'qr_code_payment', label: 'Buyer sends a QR code to complete payment' },
      { id: 'local_pickup', label: 'Wants local pickup' },
      { id: 'asks_for_photos', label: 'Asks for more photos of the device' },
      { id: 'negotiates_price', label: 'Tries to negotiate the price down' }
    ],
    spot_flag_correct_id: 'qr_code_payment',
    message: {
      from_name: 'Nina R.',
      from_handle: '@nina.r.buys',
      subject: null,
      body: 'Hi! Love the phone. I will pay your full asking price. I use VaultPay — scan this QR code and enter your account info to receive the $320. [QR code image attached]'
    },
    red_flags: [
      { id: 'qr_code_payment', label: 'Buyer sends QR code for seller to scan' },
      { id: 'unknown_app', label: 'VaultPay is not a recognized payment platform' },
      { id: 'enter_account_info', label: 'Requires you to enter account info to receive money' },
      { id: 'no_negotiation', label: 'Pays full price immediately without any questions' }
    ],
    correct_red_flag_ids: ['qr_code_payment', 'unknown_app', 'enter_account_info'],
    explanation: {
      short: 'QR codes that require you to enter banking info to receive money are always phishing — you should never need to enter account info to get paid.',
      tells: [
        'Scanning a QR code to receive money never requires entering your account information',
        'VaultPay does not exist as a legitimate payment service',
        'Phishing QR codes redirect you to fake pages that steal credentials',
        'Paying full price with no questions is a sign the buyer does not care about the item — only your info'
      ],
      safe_move: 'Use only known payment apps opened directly by you — never scan a QR code from a buyer to receive payment.',
      consequence: 'The QR code leads to a credential-harvesting page. Your banking login is captured and your account is drained.',
      behavioral_reinforcement: 'You never need to enter your account info to receive money — if a payment requires that, it is a scam.'
    },
    tags: ['marketplace', 'qr_phishing', 'credential_harvest'],
    tricks: ['qr_redirect', 'credential_harvest']
  },
  {
    id: 'spot_dm_marketplace_006',
    channel: 'dm',
    pattern_family: 'marketplace',
    difficulty: 2,
    ground_truth: 'scam',
    ai_amplified: false,
    drill_type: 'spot_flag',
    framing: 'Someone is responding to your garage sale post.',
    spot_flag_options: [
      { id: 'shipping_label_scam', label: 'Sends a prepaid label and asks you to cover a fee' },
      { id: 'multiple_items', label: 'Wants to buy several items at once' },
      { id: 'pickup_friend', label: 'Sends a friend to pick up' },
      { id: 'paypal_mentioned', label: 'Mentions using an online payment service' }
    ],
    spot_flag_correct_id: 'shipping_label_scam',
    message: {
      from_name: 'Dave S.',
      from_handle: '@daves.finds',
      subject: null,
      body: 'Interested in the table, chairs, and the lamp — take all three for $200? I can send a prepaid shipping label. I just need you to pay the $15 label activation fee to ShipNow first, then I will Venmo you $200 right after.'
    },
    red_flags: [
      { id: 'shipping_label_scam', label: 'Asks you to pay a fee to activate a prepaid label' },
      { id: 'fee_before_payment', label: 'Your money goes out before their payment comes in' },
      { id: 'fake_label', label: 'No real carrier charges a label activation fee' },
      { id: 'venmo_after', label: 'Payment promised only after you spend money first' }
    ],
    correct_red_flag_ids: ['shipping_label_scam', 'fee_before_payment', 'fake_label'],
    explanation: {
      short: 'Prepaid labels do not have activation fees — this fee goes straight to the scammer, and the Venmo never arrives.',
      tells: [
        'No legitimate shipping carrier charges a fee to activate a prepaid label',
        'Requiring you to pay first before receiving payment is always a red flag',
        'Garage sale items are usually picked up in person — remote buyers add friction for a reason',
        'Once you pay the $15 fee, the buyer disappears'
      ],
      safe_move: 'For large items, insist on cash at pickup. Never pay any fee before receiving payment.',
      consequence: 'You pay $15 and the buyer goes silent. No Venmo arrives. The $15 is gone.',
      behavioral_reinforcement: 'Prepaid labels never require fees from the recipient — any label fee request is a scam.'
    },
    tags: ['marketplace', 'shipping_scam', 'advance_fee'],
    tricks: ['advance_fee', 'payment_redirect']
  },
  {
    id: 'spot_dm_marketplace_007',
    channel: 'dm',
    pattern_family: 'marketplace',
    difficulty: 2,
    ground_truth: 'scam',
    ai_amplified: false,
    drill_type: 'spot_flag',
    framing: 'You listed a bicycle for $180. This came in.',
    spot_flag_options: [
      { id: 'gift_card_payment', label: 'Wants to pay with gift cards' },
      { id: 'fair_offer', label: 'Offers a fair price' },
      { id: 'local_buyer', label: 'Claims to be nearby' },
      { id: 'quick_sale', label: 'Wants to complete the transaction quickly' }
    ],
    spot_flag_correct_id: 'gift_card_payment',
    message: {
      from_name: 'Chris P.',
      from_handle: '@cp.buys.stuff',
      subject: null,
      body: 'Hey, I will take the bike for $180. I only have NovaMart gift cards right now — can I pay you with those? I have two $100 cards. You can use them anywhere.'
    },
    red_flags: [
      { id: 'gift_card_payment', label: 'Wants to pay with gift cards' },
      { id: 'overpayment_setup', label: 'Two $100 cards for a $180 item creates change scam risk' },
      { id: 'gift_card_fraud', label: 'Gift cards may be stolen, drained, or fraudulently obtained' },
      { id: 'no_cash', label: 'Cash or verified app is always possible for local pickup' }
    ],
    correct_red_flag_ids: ['gift_card_payment', 'gift_card_fraud'],
    explanation: {
      short: 'Gift cards are untraceable and frequently stolen or fraudulent — they are not a legitimate payment method between individuals.',
      tells: [
        'No legitimate buyer pays for marketplace items with gift cards',
        'Gift cards may have already been drained or obtained through fraud',
        'If the cards are declined or invalid, you have given away your bike for nothing',
        'Cash or an app like Venmo or Cash App are always available for real local buyers'
      ],
      safe_move: 'Only accept cash or verified app payments for in-person sales. Never accept gift cards.',
      consequence: 'You hand over the bike and the gift cards turn out to be empty or invalid.',
      behavioral_reinforcement: 'Gift cards are for gifts — never for paying strangers for marketplace items.'
    },
    tags: ['marketplace', 'gift_card', 'payment_fraud'],
    tricks: ['payment_redirect']
  },
  {
    id: 'spot_dm_marketplace_008',
    channel: 'dm',
    pattern_family: 'marketplace',
    difficulty: 2,
    ground_truth: 'scam',
    ai_amplified: false,
    drill_type: 'spot_flag',
    framing: 'You are selling furniture online and got this message.',
    spot_flag_options: [
      { id: 'identity_verification', label: 'Asks you to verify your identity to receive payment' },
      { id: 'escrow_mentioned', label: 'Mentions using an escrow service' },
      { id: 'higher_price_offer', label: 'Offers above asking price' },
      { id: 'international_buyer', label: 'Buyer is outside the country' }
    ],
    spot_flag_correct_id: 'identity_verification',
    message: {
      from_name: 'Alicia M.',
      from_handle: '@alicia.m.decor',
      subject: null,
      body: 'Hi, I love your dining set and want to purchase it immediately. I use SecurePay escrow for large purchases — just verify your identity at securepay-seller-verify.com and they will release the $650 to you within the hour.'
    },
    red_flags: [
      { id: 'identity_verification', label: 'Asks you to verify identity on a third-party site' },
      { id: 'fake_escrow', label: 'securepay-seller-verify.com is not a real escrow service' },
      { id: 'lookalike_domain', label: 'Domain designed to look official but is fake' },
      { id: 'urgency', label: 'Payment released within the hour — pressure to act fast' }
    ],
    correct_red_flag_ids: ['identity_verification', 'fake_escrow', 'lookalike_domain'],
    explanation: {
      short: 'Fake escrow services ask for your personal info and banking details under the guise of verifying you to receive payment.',
      tells: [
        'Real escrow services are used for business transactions, not resale marketplace furniture',
        'securepay-seller-verify.com is a phishing site, not a real payment service',
        'Clicking to verify your identity hands over your personal and banking information',
        'Urgency pressure is designed to prevent you from researching the site first'
      ],
      safe_move: 'Insist on cash or verified payment apps for local sales. Never click a link to receive payment.',
      consequence: 'The site collects your personal and banking info. No $650 is ever released.',
      behavioral_reinforcement: 'You never need to verify your identity on a website to receive marketplace payment — that is always a scam.'
    },
    tags: ['marketplace', 'fake_escrow', 'phishing'],
    tricks: ['lookalike_domain', 'credential_harvest', 'authority_impersonation']
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
