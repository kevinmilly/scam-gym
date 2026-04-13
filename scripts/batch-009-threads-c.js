const fs = require('fs');
const drills = JSON.parse(fs.readFileSync('data/drills.json', 'utf-8'));
const REAL_BRANDS = ['Amazon','Google','Apple','Microsoft','PayPal','Chase','Wells Fargo','Coinbase','Facebook','Instagram','Netflix','UPS','FedEx','DHL','Venmo','Zelle','Cash App','WhatsApp','Telegram','LinkedIn','Indeed','Twitter','Snapchat','TikTok'];

const newDrills = [
  // MARKETPLACE THREADS (5 new — 4 already exist)
  {
    id: 'thread_mkt_bike_001', channel: 'dm', pattern_family: 'marketplace', difficulty: 3, ground_truth: 'scam', ai_amplified: false, drill_type: 'thread',
    framing: 'You are selling a bicycle and receive these messages from a buyer.',
    thread: [
      { from_handle: '@buyer_mark92', from_name: 'Mark B', body: 'Hi! I\'m very interested in the bike. Is it still available? I can offer your full asking price. I\'m out of town but can arrange shipping.' },
      { from_handle: '@buyer_mark92', from_name: 'Mark B', body: 'Great! I\'ll pay via QuickSend. My cousin can pick it up and ship it for me. Can you ship it once I pay? I\'ll send extra for shipping costs.' },
      { from_handle: '@buyer_mark92', from_name: 'Mark B', body: 'I sent $380 — your asking price plus $80 for shipping. Once you get the funds, just send $80 to my cousin\'s QuickSend so he can arrange pickup. Thank you!' }
    ],
    red_flags: [
      { id: 'overpayment_refund_request', label: 'Pays more than asking price and asks you to send back the difference' },
      { id: 'remote_buyer_shipping', label: 'Buyer is always out of town and cannot meet in person' },
      { id: 'third_party_cousin', label: 'Uses a third party cousin to create a reason for extra payment' },
      { id: 'payment_before_pickup', label: 'Wants you to ship before you have confirmed funds' }
    ],
    correct_red_flag_ids: ['overpayment_refund_request', 'remote_buyer_shipping', 'third_party_cousin'],
    explanation: { short: 'The overpayment plus send-back request is a classic scam — the original payment will be reversed, leaving you liable for the amount you forwarded.', tells: ['Overpayment with a refund request is the defining pattern of check/payment fraud', 'Legitimate buyers either meet in person or use escrow services', 'The "cousin pickup" is a fiction to justify the extra payment', 'Payment app funds can be reversed via fraud dispute, leaving you out the forwarded amount'], safe_move: 'Only sell in person with cash or verified payment. Never send money back to a buyer before funds fully clear.', consequence: 'The original payment is reversed. You have forwarded $80 of your own money to the scammer.', behavioral_reinforcement: 'Any buyer who overpays and asks for money back is running a scam — walk away immediately.' },
    tags: ['marketplace_scam', 'overpayment_scam', 'social_media_scam'], tricks: ['overpayment', 'remote_buyer', 'third_party_payment']
  },
  {
    id: 'thread_mkt_electronics_001', channel: 'email', pattern_family: 'marketplace', difficulty: 3, ground_truth: 'scam', ai_amplified: true, drill_type: 'thread',
    framing: 'You are selling a laptop online and get these emails from a buyer.',
    thread: [
      { from_handle: 'buyer.david.k@outlook.com', from_name: 'David K', body: 'Hello, I saw your laptop listing. I am interested in buying it. Is it still available? I will pay your asking price plus shipping. I am a serious buyer.' },
      { from_handle: 'buyer.david.k@outlook.com', from_name: 'David K', body: 'Perfect. I will pay via QuickSend Business which holds funds in escrow for seller protection. You will receive a payment confirmation email. Once you get it, ship the item.' },
      { from_handle: 'noreply@quicksend-escrow-protection.com', from_name: 'QuickSend Escrow', body: 'Payment Confirmation: David K has sent $450 for your laptop. Funds are held in escrow. To release payment to your account, first ship the item and send the tracking number to: release@quicksend-escrow-protection.com' }
    ],
    red_flags: [
      { id: 'fake_escrow_service', label: 'quicksend-escrow-protection.com is not a real escrow or payment service' },
      { id: 'ship_first_to_release_funds', label: 'Requires shipping before payment is released — you risk losing the item' },
      { id: 'spoofed_payment_confirmation', label: 'The payment confirmation email is fake — no funds exist' },
      { id: 'buyer_creates_escrow_terms', label: 'Buyer chooses the payment method to control how you are deceived' }
    ],
    correct_red_flag_ids: ['fake_escrow_service', 'ship_first_to_release_funds', 'spoofed_payment_confirmation'],
    explanation: { short: 'Fake escrow confirmation emails are sent to trick you into shipping — the funds do not exist and you lose the item.', tells: ['Real escrow services are established companies, not custom domains set up for one transaction', 'Payment app escrow is not a real feature of standard payment apps', 'Once you ship, you lose all leverage — the "escrow" disappears', 'Verify any payment by logging into your actual payment account, not by checking an email'], safe_move: 'Verify funds in your actual payment account before shipping anything. Never ship based on an email confirmation alone.', consequence: 'You ship the laptop. The escrow email was fake. You have no item and no payment.', behavioral_reinforcement: 'Always verify payment in your actual account before shipping — email confirmations can be faked.' },
    tags: ['marketplace_scam', 'fake_escrow', 'advance_fee'], tricks: ['fake_escrow', 'spoofed_email', 'urgency']
  },
  {
    id: 'thread_mkt_furniture_001', channel: 'dm', pattern_family: 'marketplace', difficulty: 2, ground_truth: 'scam', ai_amplified: false, drill_type: 'thread',
    framing: 'You are buying furniture from a marketplace listing and message the seller.',
    thread: [
      { from_handle: '@sells_furniture_clt', from_name: 'Sarah - Furniture', body: 'Hi! Yes the sectional is still available, $400. Beautiful condition, barely used. I need to sell quickly because I\'m moving next week.' },
      { from_handle: '@sells_furniture_clt', from_name: 'Sarah - Furniture', body: 'I can hold it for you with a $100 deposit via PeerSend. Just to make sure you\'re serious. The rest is cash on pickup. Does that work?' },
      { from_handle: '@sells_furniture_clt', from_name: 'Sarah - Furniture', body: 'A few others are interested but I\'d rather sell to someone local. Send the $100 deposit today and I\'ll take it off the market. Moving truck comes Saturday.' }
    ],
    red_flags: [
      { id: 'deposit_before_viewing', label: 'Requests deposit before you have seen the item in person' },
      { id: 'moving_urgency', label: 'Moving deadline creates pressure to pay quickly' },
      { id: 'competing_buyer_pressure', label: 'Claims other interested buyers to pressure your decision' },
      { id: 'payment_app_deposit', label: 'Payment app deposits for marketplace items are not recoverable if item does not exist' }
    ],
    correct_red_flag_ids: ['deposit_before_viewing', 'payment_app_deposit', 'competing_buyer_pressure'],
    explanation: { short: 'Marketplace deposits via payment apps before seeing an item are not recoverable if the seller disappears.', tells: ['See any item in person before paying any amount', 'Moving deadlines and competing buyers are common pressure tactics in marketplace scams', 'Payment app transactions are treated as voluntary and are difficult to reverse', 'Legitimate sellers accept payment at pickup, not before'], safe_move: 'Arrange a viewing first. Only pay at the time of pickup when you have the item in hand.', consequence: 'You send $100 and the seller stops responding. The listing disappears.', behavioral_reinforcement: 'Never send a marketplace deposit before seeing an item — pay at pickup only.' },
    tags: ['marketplace_scam', 'advance_fee', 'social_media_scam'], tricks: ['advance_fee', 'urgency', 'competing_buyer']
  },
  {
    id: 'thread_mkt_ticket_001', channel: 'dm', pattern_family: 'marketplace', difficulty: 3, ground_truth: 'scam', ai_amplified: false, drill_type: 'thread',
    framing: 'You are trying to buy concert tickets from someone online.',
    thread: [
      { from_handle: '@ticket_reseller_2024', from_name: 'Tickets4Sale', body: 'Yes I have 2 floor tickets for the show on the 22nd. Paid $220 each, selling for $180 each. They\'re digital tickets so I can transfer them instantly.' },
      { from_handle: '@ticket_reseller_2024', from_name: 'Tickets4Sale', body: 'I\'ll transfer the tickets as soon as I receive payment. Pay $360 to my CashLink and I\'ll send the transfer immediately after. I have great feedback, been doing this a long time.' },
      { from_handle: '@ticket_reseller_2024', from_name: 'Tickets4Sale', body: 'The show is almost sold out everywhere. This is your best bet for floor seats. Send payment now and I\'ll get the tickets to you within minutes.' }
    ],
    red_flags: [
      { id: 'pay_before_ticket_transfer', label: 'Requires full payment before transferring tickets' },
      { id: 'payment_app_for_tickets', label: 'Payment app transactions for tickets from strangers are not recoverable' },
      { id: 'self_claimed_feedback', label: 'Claims good feedback but provides no verifiable proof' },
      { id: 'sold_out_urgency', label: 'Show being sold out creates pressure to skip verification' }
    ],
    correct_red_flag_ids: ['pay_before_ticket_transfer', 'payment_app_for_tickets', 'self_claimed_feedback'],
    explanation: { short: 'Digital tickets should be transferred first or simultaneously — paying first to a stranger for tickets often results in fakes or no delivery.', tells: ['Legitimate ticket resellers use established platforms with buyer protection', 'Payment before ticket transfer leaves you with no recourse if tickets never arrive', 'Self-reported feedback from a stranger is not verifiable', 'Sold-out urgency is designed to prevent you from checking verified resale platforms'], safe_move: 'Buy tickets through verified resale platforms with buyer guarantees. Never pay a stranger via payment app for tickets.', consequence: 'You send $360 and receive no tickets, or receive fake tickets rejected at the door.', behavioral_reinforcement: 'Buy event tickets only through verified platforms with buyer protection — never via payment app to a stranger.' },
    tags: ['marketplace_scam', 'ticket_fraud', 'social_media_scam'], tricks: ['advance_fee', 'urgency', 'fake_credibility']
  },
  {
    id: 'thread_mkt_pet_001', channel: 'dm', pattern_family: 'marketplace', difficulty: 3, ground_truth: 'scam', ai_amplified: true, drill_type: 'thread',
    framing: 'You are inquiring about a puppy for sale.',
    thread: [
      { from_handle: '@golden_pups_breeder', from_name: 'Golden Pups Breeder', body: 'Yes we have 2 golden retriever puppies available, 8 weeks old, fully vaccinated, AKC registered. $800 each. We can ship to your area safely.' },
      { from_handle: '@golden_pups_breeder', from_name: 'Golden Pups Breeder', body: 'To reserve your puppy, we need a $200 deposit via wire transfer. The balance and shipping ($150) are due when the puppy ships. We\'ll send photos and vet records once you\'re confirmed.' },
      { from_handle: '@golden_pups_breeder', from_name: 'Golden Pups Breeder', body: 'We have another family also interested in the same puppy. To hold her for you, please send the deposit today. She is adorable and won\'t last long.' }
    ],
    red_flags: [
      { id: 'ship_pet_deposit', label: 'Requests wire transfer deposit to ship a pet you have never seen in person' },
      { id: 'records_after_payment', label: 'Vet records and photos only provided after deposit is received' },
      { id: 'competing_family_pressure', label: 'Another family is interested creates pressure to pay before verifying' },
      { id: 'no_in_person_viewing', label: 'No option to visit and see the puppy before purchasing' }
    ],
    correct_red_flag_ids: ['ship_pet_deposit', 'records_after_payment', 'no_in_person_viewing'],
    explanation: { short: 'Pet shipping scams use emotional appeals and fake puppies to collect deposits and shipping fees that are never refunded.', tells: ['Reputable breeders allow visits — always see a pet in person before purchasing', 'Vet records should be provided upfront, not after payment', 'Wire transfer deposits for pets are non-recoverable', 'Additional shipping fees are a secondary extraction after the initial deposit'], safe_move: 'Only buy pets from breeders you can visit in person. Require all documentation before any payment.', consequence: 'You pay the deposit and possibly the shipping fee. No puppy arrives. The scammer is unreachable.', behavioral_reinforcement: 'Never pay to ship a pet you have not seen in person — visit the breeder first.' },
    tags: ['marketplace_scam', 'pet_scam', 'advance_fee'], tricks: ['advance_fee', 'emotional_appeal', 'competing_buyer']
  },

  // ROMANCE/SOCIAL THREADS (4 more — to reach target)
  {
    id: 'thread_romance_military_001', channel: 'dm', pattern_family: 'romance_social', difficulty: 3, ground_truth: 'scam', ai_amplified: false, drill_type: 'thread',
    framing: 'You matched with someone on a dating app who says they are a soldier overseas.',
    thread: [
      { from_handle: '@col.james.harris.usa', from_name: 'James Harris', body: 'Hello. I know this is sudden but I came across your profile and felt I had to reach out. I\'m a colonel stationed in Germany. It gets very lonely here. Would you be open to talking?' },
      { from_handle: '@col.james.harris.usa', from_name: 'James Harris', body: 'I feel such a connection with you already. I\'ve been thinking about what life looks like after I return. I have savings but they\'re frozen in a military account until I\'m stateside. It can be frustrating.' },
      { from_handle: '@col.james.harris.usa', from_name: 'James Harris', body: 'My transport leave was approved but I need to pay a small processing fee to get my funds released and buy my ticket home. Is there any way you could help? I would pay you back within days of landing.' }
    ],
    red_flags: [
      { id: 'military_overseas_romance', label: 'Claims to be military overseas — a very common romance scam persona' },
      { id: 'frozen_funds_story', label: 'Mentions frozen funds that will be released soon to prime a loan request' },
      { id: 'repay_when_home_promise', label: 'Promises quick repayment once back in the country' },
      { id: 'rapid_emotional_bond', label: 'Builds strong emotional connection quickly before making a financial ask' }
    ],
    correct_red_flag_ids: ['military_overseas_romance', 'frozen_funds_story', 'rapid_emotional_bond'],
    explanation: { short: 'Military romance scams follow a script: soldier overseas, frozen funds, small loan to come home — the soldier and the return never materialize.', tells: ['Active duty soldiers do not pay for their own leave transport', 'Military accounts are not frozen — this story is a fabricated setup for a loan request', 'Building intense emotional connection quickly before asking for money is the core romance scam pattern', 'Reverse image search the profile photos — they are typically stolen from real people'], safe_move: 'Never send money to someone you have only met online, regardless of how real the connection feels. Reverse image search their photos.', consequence: 'You send money for the ticket. More requests follow — medical bills, customs fees, more transport costs. The person never arrives.', behavioral_reinforcement: 'Never send money to an online romantic interest, no matter how real the connection feels.' },
    tags: ['romance_scam', 'military_impersonation', 'advance_fee'], tricks: ['emotional_bond', 'military_persona', 'advance_fee']
  },
  {
    id: 'thread_romance_widow_001', channel: 'email', pattern_family: 'romance_social', difficulty: 3, ground_truth: 'scam', ai_amplified: true, drill_type: 'thread',
    framing: 'You have been emailing someone from a faith-based dating site for several weeks.',
    thread: [
      { from_handle: 'margaret.s.1962@gmail.com', from_name: 'Margaret S', body: 'I feel so comfortable sharing with you. Since losing my husband three years ago, I have not felt this kind of warmth with anyone. You remind me so much of him — patient, kind, faithful.' },
      { from_handle: 'margaret.s.1962@gmail.com', from_name: 'Margaret S', body: 'I have been planning to visit my daughter in the UK and I thought — what if I came to see you first? I have the flights priced and I am so excited. This feels like something real.' },
      { from_handle: 'margaret.s.1962@gmail.com', from_name: 'Margaret S', body: 'I am devastated — my card was frozen due to fraud on the account, just days before my flight. I hate asking this. Could you help cover the ticket ($680)? I will transfer everything back the moment I arrive.' }
    ],
    red_flags: [
      { id: 'last_minute_card_frozen', label: 'Card is conveniently frozen just before a planned visit' },
      { id: 'never_met_in_person', label: 'Has never met you in person despite strong expressed feelings' },
      { id: 'pay_me_back_on_arrival', label: 'Promises to repay immediately upon arrival — arrival never happens' },
      { id: 'emotional_investment_before_ask', label: 'Weeks of emotional investment before the financial request' }
    ],
    correct_red_flag_ids: ['last_minute_card_frozen', 'never_met_in_person', 'emotional_investment_before_ask'],
    explanation: { short: 'Weeks of emotional connection followed by a last-minute emergency financial ask is the defining pattern of romance fraud.', tells: ['The timing of the card freeze — just before visiting — is not coincidence, it is the script', 'Romance scammers invest weeks or months building trust before the ask', 'The visit will always be prevented by a new emergency even if you pay', 'The identity being presented is fabricated using stolen photos and borrowed life stories'], safe_move: 'Do not send money. If you want to continue the relationship, insist on a verified video call before any financial discussion.', consequence: 'You send $680 for the flight. A new emergency prevents the visit. More requests follow.', behavioral_reinforcement: 'Never send money to someone you have only met online — the emergency timing is always intentional.' },
    tags: ['romance_scam', 'advance_fee', 'emotional_manipulation'], tricks: ['emotional_bond', 'emergency_pretext', 'advance_fee']
  },
  {
    id: 'thread_romance_crypto_001', channel: 'dm', pattern_family: 'romance_social', difficulty: 4, ground_truth: 'scam', ai_amplified: true, drill_type: 'thread',
    framing: 'You have been chatting with someone you met through social media who talks about investing.',
    thread: [
      { from_handle: '@lin.y.invest', from_name: 'Lin Y', body: 'It\'s so nice connecting with someone who appreciates real conversation. I have been doing really well with my investments lately — my uncle teaches finance in Hong Kong and shared a strategy with me.' },
      { from_handle: '@lin.y.invest', from_name: 'Lin Y', body: 'I don\'t share this with many people but I trust you. The platform is called CoinHarvest Pro — I started with $500 and made $3,200 in three weeks. I can walk you through it if you want.' },
      { from_handle: '@lin.y.invest', from_name: 'Lin Y', body: 'Your account shows a great return! But to withdraw, the platform requires a 15% tax deposit first. It\'s standard. I had to do it too. Once you pay, everything releases immediately.' }
    ],
    red_flags: [
      { id: 'withdrawal_tax_fee', label: 'Requires upfront tax payment to withdraw your investment profits' },
      { id: 'romantic_investment_intro', label: 'Romantic contact introduces an investment opportunity — pig butchering pattern' },
      { id: 'uncle_expert_source', label: 'Cites a family expert abroad as the source of the strategy' },
      { id: 'platform_not_verifiable', label: 'CoinHarvest Pro cannot be verified as a legitimate regulated platform' }
    ],
    correct_red_flag_ids: ['withdrawal_tax_fee', 'romantic_investment_intro', 'platform_not_verifiable'],
    explanation: { short: 'This is pig butchering: a romantic connection grooms you to invest on a fake platform, then blocks withdrawals unless you pay a fabricated tax.', tells: ['Building romance then introducing investments is called pig butchering — one of the most financially devastating scam types', 'The platform\'s profits are fictional numbers on a fake dashboard', 'Withdrawal tax fees are the final extraction — you cannot withdraw because the money was never real', 'The family expert abroad is a stock element of this script'], safe_move: 'Stop all contact and do not send any additional funds. Report to the FTC and your financial institution immediately.', consequence: 'Victims lose tens of thousands of dollars paying fees to "withdraw" profits that were always fictitious.', behavioral_reinforcement: 'Any romantic contact who introduces investment opportunities is running the pig butchering scam.' },
    tags: ['romance_scam', 'crypto_scam', 'pig_butchering'], tricks: ['emotional_bond', 'fake_investment', 'advance_fee']
  },
  {
    id: 'thread_romance_social_friend_001', channel: 'dm', pattern_family: 'romance_social', difficulty: 3, ground_truth: 'scam', ai_amplified: false, drill_type: 'thread',
    framing: 'Someone reaches out after seeing you comment in a community group.',
    thread: [
      { from_handle: '@david.p.realtor', from_name: 'David P', body: 'Hi! I saw your comment in the neighborhood group and had to reach out. You seem like a genuinely thoughtful person. Not trying to be weird, just rare to find good conversation these days.' },
      { from_handle: '@david.p.realtor', from_name: 'David P', body: 'I\'ve been going through a rough patch — my business partner cleaned out our joint account and I\'m in a legal battle. Meanwhile I have a closing next week worth $40K but my attorney\'s retainer is due Friday.' },
      { from_handle: '@david.p.realtor', from_name: 'David P', body: 'I have no one to ask. I know this is a lot to put on a new friend. Even $500 as a short-term loan would get me through this. I would repay you the moment the closing funds clear.' }
    ],
    red_flags: [
      { id: 'rapid_friendship_money_ask', label: 'Builds brief rapport then quickly asks for money' },
      { id: 'elaborate_hardship_story', label: 'Detailed hardship story designed to seem credible and evoke sympathy' },
      { id: 'big_payday_soon', label: 'Claims a large payoff is coming soon to justify repayment' },
      { id: 'isolation_appeal', label: 'Claims to have no one else to ask — creates obligation to help' }
    ],
    correct_red_flag_ids: ['rapid_friendship_money_ask', 'elaborate_hardship_story', 'isolation_appeal'],
    explanation: { short: 'Detailed hardship stories with an imminent payoff and no one else to ask are engineered to make lending money feel both urgent and safe.', tells: ['The entire interaction exists to build enough rapport for the loan request', 'The impending $40K closing is fabricated to make repayment feel certain', 'No one to ask isolates you as the solution to a manufactured crisis', 'This pattern works especially well in community groups where people already have a sense of shared trust'], safe_move: 'Do not send money to anyone you have only met online, regardless of how credible their story sounds.', consequence: 'You send $500. The closing never happens. Contact stops immediately after payment.', behavioral_reinforcement: 'A financial ask from someone you just met online — regardless of their story — is almost always a scam.' },
    tags: ['romance_scam', 'social_engineering', 'advance_fee'], tricks: ['emotional_bond', 'elaborate_story', 'advance_fee']
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
