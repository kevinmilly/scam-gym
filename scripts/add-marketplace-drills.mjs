#!/usr/bin/env node
import * as fs from "fs";
import * as path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const drillsPath = path.join(__dirname, "../data/drills.json");

const BR = "When a buyer or seller asks you to communicate or pay outside the platform, the marketplace's built-in protections disappear — always transact through the platform's own tools.";

const newDrills = [
  // ─── MARKETPLACE SCAM (13) ───────────────────────────────────────────────
  {
    id: "sms_marketplace_scam_001",
    channel: "sms",
    pattern_family: "marketplace",
    difficulty: 3,
    ground_truth: "scam",
    context: "personal",
    ai_amplified: false,
    message: {
      from_name: "MarketHub Buyer",
      from_handle: "+1 (929) 555-0147",
      subject: null,
      body: "Hi! I want your couch. I'll pay full price + $80 for shipping — sending a check today. Can I get your full name and mailing address so I can send it right away?"
    },
    red_flags: [
      { id: "check_overpayment", label: "Paying by check + extra for shipping" },
      { id: "off_platform_contact", label: "Contact outside the platform" },
      { id: "personal_info_request", label: "Requesting name and home address" }
    ],
    correct_red_flag_ids: ["check_overpayment", "off_platform_contact", "personal_info_request"],
    explanation: {
      short: "The overpayment check scam: the check bounces after you ship, leaving you with nothing.",
      tells: [
        "Offering 'full price + shipping' is the setup — the check will be for more, and they'll ask you to wire back the difference",
        "Real marketplace buyers pay through the platform's checkout, not personal checks",
        "Requesting your name and mailing address outside the platform bypasses all buyer protection",
        "Moving to SMS means no transaction record and no recourse"
      ],
      safe_move: "Direct them to purchase through MarketHub's checkout only. Never accept personal checks.",
      consequence: "The check arrives overpaid. They ask you to wire back the difference. The check bounces 7–10 days later — you've shipped the item and lost the refund money.",
      behavioral_reinforcement: BR
    },
    tags: ["payment", "check_fraud", "social_engineering", "personal_info"]
  },
  {
    id: "sms_marketplace_scam_002",
    channel: "sms",
    pattern_family: "marketplace",
    difficulty: 2,
    ground_truth: "scam",
    context: "personal",
    ai_amplified: false,
    message: {
      from_name: "Unknown",
      from_handle: "+1 (415) 555-0082",
      subject: null,
      body: "Saw your camera on MarketHub. Would you accept PayBridge? I can pay right now if you send me your PayBridge email. MarketHub takes forever."
    },
    red_flags: [
      { id: "off_platform_payment", label: "Requesting off-platform payment" },
      { id: "urgency_bypass", label: "Urgency pretext to skip the platform" },
      { id: "account_handle_request", label: "Asking for your PayBridge email" }
    ],
    correct_red_flag_ids: ["off_platform_payment", "urgency_bypass", "account_handle_request"],
    explanation: {
      short: "Off-platform PayBridge payments can't be disputed — once sent, it's gone.",
      tells: [
        "'MarketHub takes forever' is a pretext to move you to an unprotected channel",
        "Asking for your PayBridge email bypasses the platform's escrow and dispute system",
        "Legitimate buyers use whatever payment method the platform provides",
        "If they 'accidentally' send too much, the overpayment scam follows next"
      ],
      safe_move: "Reply that you only accept payment through MarketHub's checkout. If they decline, they're not a real buyer.",
      consequence: "Off-platform payments have no dispute protection. You ship the item, they file a chargeback claiming unauthorized transaction, and you lose both item and money.",
      behavioral_reinforcement: BR
    },
    tags: ["payment", "off_platform", "social_engineering"]
  },
  {
    id: "email_marketplace_scam_001",
    channel: "email",
    pattern_family: "marketplace",
    difficulty: 3,
    ground_truth: "scam",
    context: "personal",
    ai_amplified: true,
    message: {
      from_name: "MarketHub Trust & Safety",
      from_handle: "noreply@markethub-policy-alerts.com",
      subject: "Action Required: Your listing has been flagged for review",
      body: "Hi there,\n\nOur automated systems have flagged one of your active listings for a potential policy violation. To prevent your listing from being removed and your account from being suspended, please review and confirm your listing details within 24 hours.\n\nClick below to verify your listing and avoid suspension:\n[Review Listing Now]\n\nIf you believe this is in error, you can appeal by signing in to your account.\n\nMarketHub Trust & Safety Team"
    },
    red_flags: [
      { id: "lookalike_domain", label: "Lookalike sender domain" },
      { id: "suspension_threat", label: "Threat of account suspension" },
      { id: "urgency_24hr", label: "24-hour deadline" },
      { id: "credential_phish_link", label: "Link to 'sign in' on suspicious domain" }
    ],
    correct_red_flag_ids: ["lookalike_domain", "suspension_threat", "urgency_24hr", "credential_phish_link"],
    explanation: {
      short: "MarketHub's real domain is markethub.com — 'markethub-policy-alerts.com' is a phishing domain.",
      tells: [
        "Sender domain 'markethub-policy-alerts.com' is not markethub.com — extra words after hyphens signal a fake",
        "Threatening suspension creates panic that bypasses skepticism",
        "No specific listing or violation is named — real notices always reference the exact item",
        "The 'sign in to appeal' link harvests credentials on the attacker's domain"
      ],
      safe_move: "Go to markethub.com directly and check your seller dashboard. Do not click the email link.",
      consequence: "Clicking 'Review Listing Now' loads a fake MarketHub login page. Your credentials are stolen and used to drain your PayBridge balance or post fraudulent listings under your name.",
      behavioral_reinforcement: BR
    },
    tags: ["phishing", "credential_theft", "impersonation", "urgency", "ai_amplified"]
  },
  {
    id: "dm_marketplace_scam_001",
    channel: "dm",
    pattern_family: "marketplace",
    difficulty: 3,
    ground_truth: "scam",
    context: "personal",
    ai_amplified: false,
    message: {
      from_name: "PrismUser_xander",
      from_handle: "@xander_buys_92",
      subject: null,
      body: "Hey! I bought your item on MarketHub but tracking says delivered and it wasn't here. I opened a dispute but they take weeks. Can you refund me $85 via QuickSend? I'll close the dispute the second I get it."
    },
    red_flags: [
      { id: "off_platform_refund", label: "Requesting refund outside the platform" },
      { id: "dispute_leverage", label: "Using open dispute as leverage" },
      { id: "unrelated_platform_dm", label: "Contact through unrelated social platform" }
    ],
    correct_red_flag_ids: ["off_platform_refund", "dispute_leverage", "unrelated_platform_dm"],
    explanation: {
      short: "Bypassing the platform dispute process risks a double-loss: you refund off-platform and they win the dispute too.",
      tells: [
        "A real buyer waits for the official MarketHub dispute — it exists precisely for this",
        "Contacting you via Prism DM bypasses all platform records",
        "The promise to 'close the dispute' after receiving QuickSend money is unenforceable",
        "This is often a double-dip: they get a direct refund and also win the official dispute"
      ],
      safe_move: "Tell them all refund communication must go through MarketHub's dispute system. Do not send anything via QuickSend.",
      consequence: "You send the QuickSend refund. They don't close the dispute. MarketHub sides with the 'buyer' and refunds them again. You pay twice.",
      behavioral_reinforcement: BR
    },
    tags: ["refund_fraud", "off_platform", "double_dip", "social_engineering"]
  },
  {
    id: "sms_marketplace_scam_003",
    channel: "sms",
    pattern_family: "marketplace",
    difficulty: 2,
    ground_truth: "scam",
    context: "small_business",
    ai_amplified: false,
    message: {
      from_name: "MarketHub Shipping",
      from_handle: "+1 (646) 555-0213",
      subject: null,
      body: "A buyer paid for your listing. Use this prepaid label to ship today: http://mhub-shipping-labels.net/label/TX8821. Label valid 24 hrs."
    },
    red_flags: [
      { id: "shipping_link_sms", label: "Shipping label sent via SMS link" },
      { id: "lookalike_domain", label: "Lookalike domain (mhub-shipping-labels.net)" },
      { id: "urgency_24hr", label: "24-hour expiry pressure" },
      { id: "unknown_sender_number", label: "Random phone number, not official short code" }
    ],
    correct_red_flag_ids: ["shipping_link_sms", "lookalike_domain", "urgency_24hr", "unknown_sender_number"],
    explanation: {
      short: "MarketHub sends shipping labels through your seller dashboard, not via SMS links from random numbers.",
      tells: [
        "Marketplace platforms generate labels in your seller portal — they never text you links",
        "'mhub-shipping-labels.net' is not markethub.com",
        "The 24-hour urgency is designed to prevent you from checking your actual dashboard",
        "Real shipping notifications come to your registered email, not from random 10-digit numbers"
      ],
      safe_move: "Log in to your MarketHub seller dashboard directly. All real shipping labels are there.",
      consequence: "Clicking the link installs malware or leads to a fake login page. The buyer doesn't exist — this is a seller-targeted phishing attack.",
      behavioral_reinforcement: BR
    },
    tags: ["phishing", "link", "impersonation", "urgency", "seller_targeted"]
  },
  {
    id: "email_marketplace_scam_002",
    channel: "email",
    pattern_family: "marketplace",
    difficulty: 3,
    ground_truth: "scam",
    context: "small_business",
    ai_amplified: true,
    message: {
      from_name: "MarketHub Seller Support",
      from_handle: "seller-support@markethub-accounts.net",
      subject: "Your seller account has been temporarily restricted",
      body: "Dear Seller,\n\nWe've detected unusual activity on your MarketHub seller account and have applied a temporary restriction. You have pending payouts totaling $847.50 that cannot be released until identity verification is complete.\n\nTo lift the restriction and receive your payout:\n1. Verify your identity at: markethub-accounts.net/verify\n2. Confirm your bank details\n3. Complete within 48 hours to avoid permanent suspension\n\nMarketHub Seller Support"
    },
    red_flags: [
      { id: "lookalike_domain", label: "Lookalike sender domain (.net not .com)" },
      { id: "fake_payout_hold", label: "Fabricated payout amount being held" },
      { id: "bank_details_request", label: "Asking to confirm bank details via email" },
      { id: "urgency_48hr", label: "48-hour permanent suspension threat" }
    ],
    correct_red_flag_ids: ["lookalike_domain", "fake_payout_hold", "bank_details_request", "urgency_48hr"],
    explanation: {
      short: "Fabricating a payout being held creates financial urgency — the real goal is your bank account details.",
      tells: [
        "'markethub-accounts.net' is not markethub.com — the extra domain signals a fake",
        "Real platforms show payout status in your dashboard, not with specific amounts in emails",
        "Asking you to 'confirm bank details' via an emailed link is a credential harvest",
        "Real identity verification happens in-app, not through third-party emailed links"
      ],
      safe_move: "Log in to MarketHub directly and check your seller dashboard. Your real payout status is there.",
      consequence: "The verification page collects your bank account and routing number. The attacker redirects future payouts or uses the details for bank fraud.",
      behavioral_reinforcement: BR
    },
    tags: ["phishing", "bank_details", "seller_targeted", "urgency", "ai_amplified"]
  },
  {
    id: "dm_marketplace_scam_002",
    channel: "dm",
    pattern_family: "marketplace",
    difficulty: 2,
    ground_truth: "scam",
    context: "personal",
    ai_amplified: false,
    message: {
      from_name: "Listings_Mike",
      from_handle: "@mike_listings_official",
      subject: null,
      body: "Hi. I have the iPhone you're looking for — $340. I'm selling because I'm upgrading. Need a $50 QuickSend deposit to hold it for you, then pay the rest on pickup. 100% positive feedback on other platforms."
    },
    red_flags: [
      { id: "advance_deposit_required", label: "Deposit required before seeing the item" },
      { id: "off_platform_sale", label: "Sale happening outside any marketplace" },
      { id: "unverifiable_reputation", label: "Claims feedback from other (unnamed) platforms" }
    ],
    correct_red_flag_ids: ["advance_deposit_required", "off_platform_sale", "unverifiable_reputation"],
    explanation: {
      short: "Deposits via QuickSend for items you haven't seen protect the scammer, not you.",
      tells: [
        "No legitimate private seller requires a deposit to 'hold' an item you haven't verified exists",
        "'100% feedback on other platforms' can't be verified and builds false trust",
        "QuickSend peer-to-peer payments offer no buyer protection",
        "After you send $50, the seller stops responding"
      ],
      safe_move: "Never pay a deposit for an item you haven't inspected. Use platforms with escrow for higher-value purchases.",
      consequence: "You send the $50 deposit. The seller goes silent. The account gets deleted. No item, no refund.",
      behavioral_reinforcement: BR
    },
    tags: ["advance_fee", "off_platform", "payment", "social_engineering"]
  },
  {
    id: "email_marketplace_scam_003",
    channel: "email",
    pattern_family: "marketplace",
    difficulty: 4,
    ground_truth: "scam",
    context: "personal",
    ai_amplified: true,
    message: {
      from_name: "SafeEscrow Marketplace Payments",
      from_handle: "payments@safeescrow-marketplace.com",
      subject: "Your payment of $1,850.00 is ready to release — action required",
      body: "Dear Seller,\n\nA buyer has completed payment of $1,850.00 for your listing. Funds are held in escrow pending shipment confirmation.\n\nTo receive your funds:\n- Ship within 48 hours\n- Upload tracking at safeescrow-marketplace.com/release\n- Funds transfer in 2 business days\n\nNote: For transactions over $500, SafeEscrow requires sellers to make a $150 refundable deposit to verify banking details before release.\n\nSafeEscrow — Trusted by MarketHub Sellers"
    },
    red_flags: [
      { id: "fake_escrow_service", label: "Unknown third-party escrow service" },
      { id: "seller_deposit_required", label: "Seller asked to pay a deposit to receive funds" },
      { id: "lookalike_domain", label: "Lookalike domain (safeescrow-marketplace.com)" }
    ],
    correct_red_flag_ids: ["fake_escrow_service", "seller_deposit_required", "lookalike_domain"],
    explanation: {
      short: "Real escrow services never require sellers to deposit money to receive a payment — that is the scam.",
      tells: [
        "MarketHub has its own payment system and doesn't use third-party 'SafeEscrow' services",
        "Requiring a $150 'refundable deposit' to release your own $1,850 is the entire theft mechanism",
        "'safeescrow-marketplace.com' is not affiliated with markethub.com",
        "Legitimate payment confirmations come from inside the platform, not separate escrow companies"
      ],
      safe_move: "Check your MarketHub seller dashboard for the real order status. This order doesn't exist.",
      consequence: "You pay the $150 deposit. The escrow service and buyer vanish. You've lost $150 and received nothing.",
      behavioral_reinforcement: BR
    },
    tags: ["escrow_fraud", "advance_fee", "phishing", "seller_targeted", "ai_amplified"]
  },
  {
    id: "sms_marketplace_scam_004",
    channel: "sms",
    pattern_family: "marketplace",
    difficulty: 2,
    ground_truth: "scam",
    context: "personal",
    ai_amplified: false,
    message: {
      from_name: "MarketHub",
      from_handle: "+1 (332) 555-0198",
      subject: null,
      body: "Your item sold! Buyer has paid. Log in to print your shipping label and release funds: http://markethub-seller.net/orders/confirm"
    },
    red_flags: [
      { id: "lookalike_domain", label: "Lookalike domain (markethub-seller.net)" },
      { id: "wrong_sender_type", label: "Marketplace uses email, not random phone numbers" },
      { id: "login_link_via_sms", label: "Link to log in sent via SMS" }
    ],
    correct_red_flag_ids: ["lookalike_domain", "wrong_sender_type", "login_link_via_sms"],
    explanation: {
      short: "MarketHub notifies sellers via email to their registered address, not via SMS from random phone numbers.",
      tells: [
        "Sale notifications come to your registered email — not SMS from a 10-digit number",
        "'markethub-seller.net' is not markethub.com",
        "Clicking 'log in' from an SMS link is a classic credential phishing path",
        "If an item really sold, you can verify by opening the MarketHub app directly"
      ],
      safe_move: "Open the MarketHub app or website directly to check your orders. Don't click this link.",
      consequence: "The link leads to a fake MarketHub login page. Your credentials are stolen and used to redirect payouts or post fraudulent listings.",
      behavioral_reinforcement: BR
    },
    tags: ["phishing", "credential_theft", "link", "impersonation"]
  },
  {
    id: "dm_marketplace_scam_003",
    channel: "dm",
    pattern_family: "marketplace",
    difficulty: 4,
    ground_truth: "scam",
    context: "personal",
    ai_amplified: true,
    message: {
      from_name: "ValuedBuyer_Rachel",
      from_handle: "@buyer_rachel_99",
      subject: null,
      body: "Hi, I'd like to buy your vintage lamp at your asking price. For a transaction this size I prefer SignFlow — it protects both parties and I use it for every marketplace purchase. I can send the signing link right now and we can be done today. Are you open to it?"
    },
    red_flags: [
      { id: "off_platform_tool", label: "Using a third-party tool to move off platform" },
      { id: "professional_pretext", label: "Sophisticated rationale for the off-platform request" },
      { id: "incoming_signing_link", label: "Asking you to click an incoming link" }
    ],
    correct_red_flag_ids: ["off_platform_tool", "professional_pretext", "incoming_signing_link"],
    explanation: {
      short: "The 'official document tool' story is social engineering — the signing link goes to a credential phishing page.",
      tells: [
        "Legitimate marketplace buyers don't need document signing for a personal item sale",
        "The polished pitch ('protects both parties') is designed to sound reasonable and bypass skepticism",
        "The 'signing link' will require you to log in — to a page that is not SignFlow",
        "Real protection comes from the platform's built-in buyer/seller guarantee"
      ],
      safe_move: "Decline and insist on completing the transaction through MarketHub's standard checkout. If they refuse, they aren't a real buyer.",
      consequence: "The 'SignFlow link' leads to a phishing page. Entering your email and password surrenders your account. In some variants you authorize an app that posts fraudulent listings under your name.",
      behavioral_reinforcement: BR
    },
    tags: ["social_engineering", "off_platform", "credential_theft", "ai_amplified"]
  },
  {
    id: "email_marketplace_scam_004",
    channel: "email",
    pattern_family: "marketplace",
    difficulty: 3,
    ground_truth: "scam",
    context: "small_business",
    ai_amplified: false,
    message: {
      from_name: "MarketHub Payments",
      from_handle: "payments@markethub-transactions.org",
      subject: "Payment received: $234.00 — Ship now to release funds",
      body: "Hi,\n\nYour buyer has completed payment of $234.00 for 'Bluetooth Speaker X200.' Funds are held pending shipment confirmation.\n\nPlease ship within 24 hours to avoid order cancellation.\n\nOnce shipped, reply to this email with your tracking number to release funds.\n\nMarketHub Payments Team"
    },
    red_flags: [
      { id: "lookalike_domain", label: "Lookalike sender domain (.org not .com)" },
      { id: "ship_before_verifying", label: "Asked to ship before checking your dashboard" },
      { id: "reply_with_tracking", label: "Reply to email with tracking number" }
    ],
    correct_red_flag_ids: ["lookalike_domain", "ship_before_verifying", "reply_with_tracking"],
    explanation: {
      short: "The seller is tricked into shipping for a 'payment' that doesn't exist — verify in the platform, never from an email alone.",
      tells: [
        "'markethub-transactions.org' is not markethub.com — any domain variation is a red flag",
        "Real payment confirmation appears in your seller dashboard, not only in email",
        "Asking you to reply with tracking to 'release funds' is backwards — real platforms use their own system",
        "The 24-hour pressure stops you from checking your actual dashboard"
      ],
      safe_move: "Log into your MarketHub seller dashboard. Confirm the order exists there before shipping anything.",
      consequence: "You ship the item before confirming payment. The order never existed. You've lost the item with no recourse.",
      behavioral_reinforcement: BR
    },
    tags: ["phishing", "ship_first", "impersonation", "seller_targeted"]
  },
  {
    id: "sms_marketplace_scam_005",
    channel: "sms",
    pattern_family: "marketplace",
    difficulty: 3,
    ground_truth: "scam",
    context: "personal",
    ai_amplified: false,
    message: {
      from_name: "Buyer_Tom",
      from_handle: "+1 (718) 555-0064",
      subject: null,
      body: "Hi! I paid for your bike on MarketHub but I accidentally sent $350 instead of $250 — my nephew sent it for me. Can you QuickSend me back $100? I can share the order number to confirm."
    },
    red_flags: [
      { id: "overpayment_refund", label: "Overpayment refund request" },
      { id: "off_platform_refund", label: "Refund requested outside the platform" }
    ],
    correct_red_flag_ids: ["overpayment_refund", "off_platform_refund"],
    explanation: {
      short: "If a buyer genuinely overpaid via MarketHub, the platform handles the refund — not a text asking for QuickSend.",
      tells: [
        "Real overpayments are handled through the platform's refund mechanism, not via text",
        "The 'my nephew sent it' story adds believability, but the refund path is still fraudulent",
        "They may offer the order number, which builds false credibility — but the request is still a scam",
        "After you send $100 via QuickSend, the original payment is chargebacked and you lose both"
      ],
      safe_move: "Tell them any refund must happen through MarketHub's platform. If there was a real overpayment, the platform handles it.",
      consequence: "You send $100 via QuickSend. The original payment is disputed as unauthorized. You lose both the refund and potentially the item.",
      behavioral_reinforcement: BR
    },
    tags: ["refund_fraud", "overpayment", "payment", "social_engineering"]
  },
  {
    id: "dm_marketplace_scam_004",
    channel: "dm",
    pattern_family: "marketplace",
    difficulty: 2,
    ground_truth: "scam",
    context: "personal",
    ai_amplified: false,
    message: {
      from_name: "Prism_User",
      from_handle: "@prism_deals_22",
      subject: null,
      body: "Hey I saw your gaming chair listing. MarketHub charges 10% fees lol. Just give me your PayBridge email and I'll send the full $180 directly — we both save money. Sound good?"
    },
    red_flags: [
      { id: "fee_avoidance_pretext", label: "'Save fees' pretext to move off platform" },
      { id: "off_platform_payment_request", label: "Requesting off-platform payment" }
    ],
    correct_red_flag_ids: ["fee_avoidance_pretext", "off_platform_payment_request"],
    explanation: {
      short: "Marketplace fees fund buyer and seller protection — bypassing them means you lose all recourse.",
      tells: [
        "The 'save fees' argument sounds rational, but fees include fraud protection and dispute resolution",
        "If they pay via PayBridge 'goods and services,' they can chargeback after receiving the item",
        "If they pay 'friends and family,' you have zero recourse if anything goes wrong",
        "Contacting you via Prism DM for a MarketHub listing is itself already off-platform"
      ],
      safe_move: "Insist on MarketHub's checkout. The fee is the cost of protection. If they refuse, they're not a real buyer.",
      consequence: "Payment never arrives after you share your PayBridge email, or a payment arrives and is later disputed after you've already shipped.",
      behavioral_reinforcement: BR
    },
    tags: ["off_platform", "payment", "fee_avoidance", "social_engineering"]
  },

  // ─── MARKETPLACE LEGIT (7) ───────────────────────────────────────────────
  {
    id: "sms_marketplace_legit_001",
    channel: "sms",
    pattern_family: "marketplace",
    difficulty: 2,
    ground_truth: "legit",
    context: "personal",
    ai_amplified: false,
    message: {
      from_name: "MarketHub",
      from_handle: "67824",
      subject: null,
      body: "MarketHub: You have a new message from a buyer about 'Vintage Lamp (Oak Frame).' Log in to reply: markethub.com/messages"
    },
    red_flags: [
      { id: "contains_link", label: "Contains a URL" },
      { id: "short_code_sender", label: "Sent from a short code number" }
    ],
    correct_red_flag_ids: [],
    explanation: {
      short: "A legitimate MarketHub notification — known short code, real domain, no credentials or payment requested.",
      tells: [
        "Short code '67824' is consistent with MarketHub's registered notification service",
        "Link points to markethub.com — not a lookalike",
        "No credentials, payment, or personal information requested — just a message alert",
        "References a specific listing by name, consistent with a real buyer inquiry"
      ],
      safe_move: "Visit markethub.com directly (skip the link if cautious) to read the message.",
      consequence: "This is legitimate. Ignoring it means missing a potential sale.",
      behavioral_reinforcement: BR
    },
    tags: ["legitimate", "notification", "short_code"]
  },
  {
    id: "email_marketplace_legit_001",
    channel: "email",
    pattern_family: "marketplace",
    difficulty: 2,
    ground_truth: "legit",
    context: "small_business",
    ai_amplified: false,
    message: {
      from_name: "MarketHub",
      from_handle: "orders@markethub.com",
      subject: "Order confirmed: Mechanical Keyboard x2 — $98.00",
      body: "Hi Taylor,\n\nYour order has been confirmed.\n\nOrder #MH-004891\nItem: Mechanical Keyboard x2\nTotal: $98.00\nEstimated delivery: 3–5 business days\n\nTrack your order: markethub.com/orders/MH-004891\n\nThanks for shopping on MarketHub."
    },
    red_flags: [
      { id: "contains_link", label: "Contains a link" }
    ],
    correct_red_flag_ids: [],
    explanation: {
      short: "A standard order confirmation from MarketHub's official domain — no requests, no urgency.",
      tells: [
        "Sender is orders@markethub.com — the real domain, no extra words or hyphens",
        "Addressed by name with a specific order number and item — not a generic blast",
        "No action required — confirmation only, no links to 'verify' or 'secure'",
        "The tracking link points to markethub.com itself"
      ],
      safe_move: "This is legitimate. Keep the email for your records.",
      consequence: "This is a real order confirmation. Treat it as any e-commerce receipt.",
      behavioral_reinforcement: BR
    },
    tags: ["legitimate", "order_confirmation", "email"]
  },
  {
    id: "dm_marketplace_legit_001",
    channel: "dm",
    pattern_family: "marketplace",
    difficulty: 1,
    ground_truth: "legit",
    context: "personal",
    ai_amplified: false,
    message: {
      from_name: "Maria K.",
      from_handle: "@maria.k.buys",
      subject: null,
      body: "Hi! Interested in the sofa you posted. Does it have any stains or damage not visible in the photos? Is it still available?"
    },
    red_flags: [
      { id: "dm_about_listing", label: "Contact via DM about a listing" }
    ],
    correct_red_flag_ids: [],
    explanation: {
      short: "A buyer asking about item condition via DM is completely normal marketplace behavior.",
      tells: [
        "No payment requests, no links, no unusual asks",
        "Asking about condition is standard due diligence before a purchase",
        "No requests to move to a different payment method or platform"
      ],
      safe_move: "Answer honestly and direct them to complete the purchase through the marketplace platform.",
      consequence: "Legitimate inquiry. Normal follow-up to a listing.",
      behavioral_reinforcement: BR
    },
    tags: ["legitimate", "buyer_inquiry", "dm"]
  },
  {
    id: "email_marketplace_legit_002",
    channel: "email",
    pattern_family: "marketplace",
    difficulty: 2,
    ground_truth: "legit",
    context: "personal",
    ai_amplified: false,
    message: {
      from_name: "MarketHub Payments",
      from_handle: "payments@markethub.com",
      subject: "You've been paid — $75.00 for Vintage Lamp",
      body: "Great news, Jordan!\n\nYour buyer has completed payment of $75.00 for 'Vintage Lamp (Oak Frame).' Funds will be deposited after delivery confirmation.\n\nShip within 3 days to keep the transaction on track.\n\nView order: markethub.com/selling\n\nMarketHub Payments"
    },
    red_flags: [
      { id: "payment_link", label: "Contains a link" },
      { id: "ship_deadline", label: "Shipping deadline mentioned" }
    ],
    correct_red_flag_ids: [],
    explanation: {
      short: "Real payment confirmation from MarketHub: correct domain, named recipient, specific item, no credential request.",
      tells: [
        "Sender is payments@markethub.com — real domain",
        "Addressed by name with specific item name — not generic",
        "No credential request, no third-party escrow, no 'verify now'",
        "The dashboard link goes to markethub.com itself"
      ],
      safe_move: "This is legitimate. Log in at markethub.com to view the order details.",
      consequence: "Real payment notification. Proceed with shipping per the platform's normal process.",
      behavioral_reinforcement: BR
    },
    tags: ["legitimate", "payment_notification", "seller"]
  },
  {
    id: "sms_marketplace_legit_002",
    channel: "sms",
    pattern_family: "marketplace",
    difficulty: 1,
    ground_truth: "legit",
    context: "personal",
    ai_amplified: false,
    message: {
      from_name: "MarketHub",
      from_handle: "67824",
      subject: null,
      body: "MarketHub: Your buyer left a 5-star review for 'Acoustic Guitar Stand.' View and respond: markethub.com"
    },
    red_flags: [
      { id: "contains_url", label: "Contains a URL" }
    ],
    correct_red_flag_ids: [],
    explanation: {
      short: "A post-sale feedback notification from MarketHub's known short code — no requests, just an update.",
      tells: [
        "Short code 67824 is MarketHub's registered notification number",
        "References a specific completed sale",
        "Link points to markethub.com, not a lookalike",
        "No action required, no urgency, no credential request"
      ],
      safe_move: "Legitimate notification. View feedback at markethub.com directly if cautious about clicking.",
      consequence: "This is a real feedback alert. No risk.",
      behavioral_reinforcement: BR
    },
    tags: ["legitimate", "feedback", "notification", "short_code"]
  },
  {
    id: "dm_marketplace_legit_002",
    channel: "dm",
    pattern_family: "marketplace",
    difficulty: 1,
    ground_truth: "legit",
    context: "personal",
    ai_amplified: false,
    message: {
      from_name: "DeviceHunter_Sam",
      from_handle: "@device_hunter_sam",
      subject: null,
      body: "Hi, I'm interested in the iPad mini you have listed. Could you send a couple more photos showing the corners and the screen? Want to make sure there's no cracking before I commit."
    },
    red_flags: [
      { id: "photo_request", label: "Requesting additional photos" }
    ],
    correct_red_flag_ids: [],
    explanation: {
      short: "Requesting more photos before committing is normal, cautious buyer behavior.",
      tells: [
        "Specific, reasonable request consistent with evaluating used electronics",
        "No mention of payment outside the platform",
        "No links, no urgency, no unusual requests"
      ],
      safe_move: "Share photos through the marketplace's built-in messaging, not via external platforms.",
      consequence: "Legitimate buyer inquiry. More photos can help close the sale.",
      behavioral_reinforcement: BR
    },
    tags: ["legitimate", "buyer_inquiry", "photos"]
  },
  {
    id: "email_marketplace_legit_003",
    channel: "email",
    pattern_family: "marketplace",
    difficulty: 2,
    ground_truth: "legit",
    context: "small_business",
    ai_amplified: false,
    message: {
      from_name: "MarketHub",
      from_handle: "listings@markethub.com",
      subject: "Your listing 'Office Chair (Ergonomic)' expires in 3 days",
      body: "Hi Alex,\n\nYour listing 'Office Chair (Ergonomic)' is set to expire in 3 days.\n\nTo renew for another 30 days, visit your seller dashboard: markethub.com/selling\n\nNo action needed if you'd prefer to let it expire.\n\nMarketHub"
    },
    red_flags: [
      { id: "renewal_link", label: "Contains a renewal link" },
      { id: "expiry_deadline", label: "Deadline mentioned" }
    ],
    correct_red_flag_ids: [],
    explanation: {
      short: "A standard listing expiry reminder from MarketHub's real domain — no urgency, no credential request, renewal is optional.",
      tells: [
        "Sender is listings@markethub.com — the real domain",
        "No threat or urgency — explicitly states 'no action needed' if you prefer expiry",
        "Specific listing name matches real inventory",
        "Renewal link points to markethub.com/selling, not a third-party"
      ],
      safe_move: "Navigate to markethub.com/selling directly to manage your listings.",
      consequence: "Legitimate reminder. Renew via the dashboard if you want to keep the listing active.",
      behavioral_reinforcement: BR
    },
    tags: ["legitimate", "listing_reminder", "seller"]
  }
];

// Load existing drills, append, write back
const existing = JSON.parse(fs.readFileSync(drillsPath, "utf-8"));
const combined = [...existing, ...newDrills];
fs.writeFileSync(drillsPath, JSON.stringify(combined, null, 2));
console.log(`✅ Added ${newDrills.length} marketplace drills. Total: ${combined.length}`);
