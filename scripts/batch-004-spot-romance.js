const fs = require('fs');
const drills = JSON.parse(fs.readFileSync('data/drills.json', 'utf-8'));
const REAL_BRANDS = ['Amazon','Google','Apple','Microsoft','PayPal','Chase','Wells Fargo','Coinbase','Facebook','Instagram','Netflix','UPS','FedEx','DHL','Venmo','Zelle','Cash App','WhatsApp','Telegram','LinkedIn','Indeed','Twitter','Snapchat'];

const newDrills = [
  {
    id: 'spot_dm_romance_001',
    channel: 'dm',
    pattern_family: 'romance_social',
    difficulty: 3,
    ground_truth: 'scam',
    ai_amplified: false,
    drill_type: 'spot_flag',
    framing: 'Someone new matched with you on a dating app.',
    spot_flag_options: [
      { id: 'investment_pivot', label: 'Quickly pivots to discussing crypto investments' },
      { id: 'attractive_photos', label: 'Profile photos look model-quality' },
      { id: 'overseas_job', label: 'Claims to work abroad' },
      { id: 'fast_attachment', label: 'Expresses strong feelings very quickly' }
    ],
    spot_flag_correct_id: 'investment_pivot',
    message: { from_name: 'Elena_V', from_handle: '@elena.v.travels', subject: null, body: 'Hi! I love your profile. I am actually a financial analyst based in Singapore right now. The markets here are incredible — I have been making great returns on a crypto platform my mentor showed me. I think you would do well too. Want me to show you how it works? I made $4,200 last week alone.' },
    red_flags: [
      { id: 'investment_pivot', label: 'Quickly pivots to a crypto investment opportunity' },
      { id: 'overseas_location', label: 'Conveniently located overseas and unavailable in person' },
      { id: 'specific_earnings', label: 'Quotes specific large earnings to build credibility' },
      { id: 'mentor_reference', label: 'Mentions a mysterious mentor who taught them' }
    ],
    correct_red_flag_ids: ['investment_pivot', 'overseas_location', 'specific_earnings'],
    explanation: {
      short: 'This is a pig butchering scam — build trust first, then lure into a fake investment platform.',
      tells: ['Pivoting from romance to investment talk within the first few messages is the pig butchering playbook', 'The platform will show fake gains to encourage larger deposits', 'When you try to withdraw, fees and taxes appear that must be paid first', 'No one in a genuine relationship opens with investment advice'],
      safe_move: 'Do not engage with investment suggestions from people you have only met online. Block and report.',
      consequence: 'You deposit money into a fake platform that shows fake gains. When you try to withdraw, the platform disappears.',
      behavioral_reinforcement: 'Any new online contact who pivots to investment opportunities is running a pig butchering scam.'
    },
    tags: ['pig_butchering', 'romance_scam', 'crypto'],
    tricks: ['trust_then_pivot', 'emotional_leverage', 'advance_fee']
  },
  {
    id: 'spot_dm_romance_002',
    channel: 'dm',
    pattern_family: 'romance_social',
    difficulty: 3,
    ground_truth: 'scam',
    ai_amplified: false,
    drill_type: 'spot_flag',
    framing: 'You have been chatting with someone online for two weeks.',
    spot_flag_options: [
      { id: 'emergency_money', label: 'Sudden emergency requiring money transfer' },
      { id: 'future_plans', label: 'Making lots of future plans together' },
      { id: 'avoids_video', label: 'Has always avoided video calls' },
      { id: 'different_timezone', label: 'In a different time zone' }
    ],
    spot_flag_correct_id: 'avoids_video',
    message: { from_name: 'David_Marine', from_handle: '@d.harris.engineer', subject: null, body: 'I am so sorry I keep missing our video call times — the connection on the rig is terrible. I have shown you my photos, you know my face! I feel so close to you already. I cannot wait to meet when I get back. Speaking of which — I need a small favor. My bank account is frozen internationally. Could you send $300 to help me get my documents processed? I will pay it back double.' },
    red_flags: [
      { id: 'avoids_video', label: 'Consistently avoids video calls with excuses' },
      { id: 'money_request', label: 'Asks for money after building emotional connection' },
      { id: 'double_repayment', label: 'Promises to repay double' },
      { id: 'frozen_account_excuse', label: 'Claims bank account is frozen internationally' }
    ],
    correct_red_flag_ids: ['avoids_video', 'money_request', 'double_repayment'],
    explanation: {
      short: 'Someone who consistently avoids video after weeks of contact is almost certainly using fake photos.',
      tells: ['Real people can manage at least one video call in two weeks', 'Offshore/rig job is a classic cover to explain no in-person meeting', 'The double repayment promise is a manipulation tactic', 'Once you send money the requests escalate — this is never a one-time ask'],
      safe_move: 'Insist on a live video call. If they refuse with any excuse, stop contact immediately.',
      consequence: 'The $300 is gone. Follow-up requests will escalate to thousands of dollars over time.',
      behavioral_reinforcement: 'Anyone who cannot do a single live video call after weeks of contact is using a fake identity.'
    },
    tags: ['romance_scam', 'catfishing', 'money_request'],
    tricks: ['emotional_leverage', 'trust_then_pivot', 'advance_fee']
  },
  {
    id: 'spot_dm_romance_003',
    channel: 'dm',
    pattern_family: 'romance_social',
    difficulty: 3,
    ground_truth: 'scam',
    ai_amplified: false,
    drill_type: 'spot_flag',
    framing: 'Someone reached out on a social platform after seeing your post.',
    spot_flag_options: [
      { id: 'moves_off_platform', label: 'Immediately wants to move to a different app' },
      { id: 'compliments_quickly', label: 'Compliments your appearance right away' },
      { id: 'shares_personal_info', label: 'Shares a lot of personal info immediately' },
      { id: 'common_interests', label: 'Claims to share all your interests' }
    ],
    spot_flag_correct_id: 'moves_off_platform',
    message: { from_name: 'James_NYC', from_handle: '@james.nyc.photo', subject: null, body: 'Hey! I saw your post and you seem like an amazing person. I do not use this app much — can we move to ChatMe? My username is james_nyc_real. I prefer it for private conversations.' },
    red_flags: [
      { id: 'moves_off_platform', label: 'Immediately wants to move to ChatMe or another app' },
      { id: 'privacy_excuse', label: 'Frames the move as wanting privacy' },
      { id: 'no_history', label: 'New account with no post history' },
      { id: 'unsolicited_contact', label: 'Contacted you out of nowhere' }
    ],
    correct_red_flag_ids: ['moves_off_platform', 'no_history', 'unsolicited_contact'],
    explanation: {
      short: 'Moving off platform immediately removes the scammer from any reporting or accountability mechanisms.',
      tells: ['Scammers move to chat apps because they cannot be reported there as easily', 'A real person interested in you would engage on the platform where they found you', 'New accounts with no history are often freshly created for scamming', 'Privacy framing makes the request seem reasonable when it is not'],
      safe_move: 'Stay on the original platform. If they insist on moving, disengage.',
      consequence: 'On ChatMe, they build rapport and eventually request money, gift cards, or compromising photos.',
      behavioral_reinforcement: 'Anyone who immediately asks to move off-platform is trying to escape accountability — do not follow.'
    },
    tags: ['romance_scam', 'platform_pivot', 'catfishing'],
    tricks: ['trust_then_pivot', 'secrecy']
  },
  {
    id: 'spot_dm_romance_004',
    channel: 'dm',
    pattern_family: 'romance_social',
    difficulty: 3,
    ground_truth: 'scam',
    ai_amplified: false,
    drill_type: 'spot_flag',
    framing: 'You have been talking with someone online for a month.',
    spot_flag_options: [
      { id: 'package_customs', label: 'Asks you to pay customs fees for a package they sent' },
      { id: 'gift_mentioned', label: 'Mentions sending you a gift' },
      { id: 'long_distance', label: 'Relationship is long distance' },
      { id: 'planning_visit', label: 'Planning to visit soon' }
    ],
    spot_flag_correct_id: 'package_customs',
    message: { from_name: 'Sophia_Milan', from_handle: '@sophia.m.designer', subject: null, body: 'I sent you a surprise gift — jewelry and some chocolates. The courier just called me saying it is held at customs and needs a $180 release fee to be delivered. I am so embarrassed to ask but could you pay it? I will send you the money back the moment I can access my international account.' },
    red_flags: [
      { id: 'package_customs', label: 'Asks you to pay a customs fee for their gift to you' },
      { id: 'international_account_excuse', label: 'Cannot pay themselves due to international account issues' },
      { id: 'emotional_embarrassment', label: 'Uses embarrassment framing to lower your guard' },
      { id: 'repayment_promise', label: 'Promises to repay once account is accessible' }
    ],
    correct_red_flag_ids: ['package_customs', 'international_account_excuse', 'repayment_promise'],
    explanation: {
      short: 'The customs fee scam creates a gift as a pretext to get money from you — there is no package.',
      tells: ['No real gift-sender asks the recipient to pay customs fees', 'The international account excuse is a recurring theme in romance scams', 'Customs fees are never collected by random couriers calling your contact', 'The gift creates emotional obligation that makes the fee request feel reasonable'],
      safe_move: 'Do not pay any fee. Real packages held in customs notify the recipient directly via official channels.',
      consequence: 'You pay $180 and no package ever arrives. The scammer may repeat this with new gift stories.',
      behavioral_reinforcement: 'You are never responsible for paying customs fees on a gift someone else sent you — that request is always a scam.'
    },
    tags: ['romance_scam', 'customs_scam', 'advance_fee'],
    tricks: ['emotional_leverage', 'advance_fee']
  },
  {
    id: 'spot_dm_romance_005',
    channel: 'dm',
    pattern_family: 'romance_social',
    difficulty: 3,
    ground_truth: 'scam',
    ai_amplified: false,
    drill_type: 'spot_flag',
    framing: 'You matched with someone and have been texting for a week.',
    spot_flag_options: [
      { id: 'sextortion_setup', label: 'Quickly escalates to exchanging intimate photos' },
      { id: 'shares_photos_first', label: 'Shares their own photos first unprompted' },
      { id: 'very_attractive', label: 'Person is exceptionally attractive' },
      { id: 'flattering', label: 'Very flattering and attentive' }
    ],
    spot_flag_correct_id: 'sextortion_setup',
    message: { from_name: 'Ashley_R', from_handle: '@ashley.r.fitness', subject: null, body: 'I feel so comfortable with you already. I am not usually this forward but I want to share something personal with you. I sent you a photo — I hope that is ok. Would you want to share one back? I promise it stays between us.' },
    red_flags: [
      { id: 'sextortion_setup', label: 'Pushes for intimate photo exchange after one week' },
      { id: 'promise_of_privacy', label: 'Promises it stays private — a false guarantee' },
      { id: 'fast_intimacy', label: 'Escalates intimacy unusually fast' },
      { id: 'initiates_first', label: 'Sends photo first to lower your inhibitions' }
    ],
    correct_red_flag_ids: ['sextortion_setup', 'promise_of_privacy', 'fast_intimacy'],
    explanation: {
      short: 'This is a sextortion setup — the photo they sent is fake, and yours will be used as leverage to extort money.',
      tells: ['Escalating to intimate content within a week of meeting online is a major red flag', 'The promise of privacy is meaningless — you have no way to enforce it', 'Sending a photo first lowers your guard and creates a sense of reciprocity', 'After you send, they reveal they have screenshotted and threaten to share unless you pay'],
      safe_move: 'Never share intimate photos with someone you have not met in person and established real trust with.',
      consequence: 'Your photo is used to extort money. Threats to send it to your contacts, employer, or family follow.',
      behavioral_reinforcement: 'Once an intimate photo leaves your device, you lose all control over it — never send one to an online stranger.'
    },
    tags: ['sextortion', 'romance_scam', 'extortion'],
    tricks: ['emotional_leverage', 'trust_then_pivot']
  },
  {
    id: 'spot_dm_romance_006',
    channel: 'dm',
    pattern_family: 'romance_social',
    difficulty: 3,
    ground_truth: 'scam',
    ai_amplified: false,
    drill_type: 'spot_flag',
    framing: 'You have been chatting with someone for three weeks.',
    spot_flag_options: [
      { id: 'visa_fee', label: 'Asks you to pay for their visa to visit' },
      { id: 'visiting_soon', label: 'Has been saying they will visit soon' },
      { id: 'exciting_relationship', label: 'Relationship has been going well' },
      { id: 'different_country', label: 'Lives in another country' }
    ],
    spot_flag_correct_id: 'visa_fee',
    message: { from_name: 'Carlos_B', from_handle: '@carlos.b.architect', subject: null, body: 'I have been saving to come see you. I finally booked the flight! But the visa office here is asking for a $420 processing deposit that I need to pay by tomorrow or lose my slot. My savings account takes 5 days to clear. Could you send it via QuickSend? I will pay you back as soon as I land.' },
    red_flags: [
      { id: 'visa_fee', label: 'Asks for money to pay a visa fee' },
      { id: 'tomorrow_deadline', label: 'Artificial tomorrow deadline to prevent scrutiny' },
      { id: 'quicksend_request', label: 'Requests irreversible transfer via QuickSend' },
      { id: 'account_timing_excuse', label: 'Savings account clearing time is a convenient excuse' }
    ],
    correct_red_flag_ids: ['visa_fee', 'tomorrow_deadline', 'quicksend_request'],
    explanation: {
      short: 'The visit fee scam creates anticipation of finally meeting, then monetizes your excitement.',
      tells: ['Governments collect visa fees directly — not through personal transfers from third parties', 'The deadline is artificial and designed to prevent you from researching', 'QuickSend is irreversible and preferred by scammers for that reason', 'The visit never happens — the scammer will have a new emergency after you pay'],
      safe_move: 'Never send money to fund a stranger\'s travel to visit you. If the relationship is real, the visit will happen without your financial help.',
      consequence: 'You send $420 and the visit is cancelled with a new excuse. More fee requests follow.',
      behavioral_reinforcement: 'Visa fees are paid directly to governments — anyone asking you to fund their travel expenses is running a scam.'
    },
    tags: ['romance_scam', 'travel_scam', 'advance_fee'],
    tricks: ['emotional_leverage', 'urgency', 'advance_fee']
  },
  {
    id: 'spot_dm_romance_007',
    channel: 'dm',
    pattern_family: 'romance_social',
    difficulty: 3,
    ground_truth: 'scam',
    ai_amplified: false,
    drill_type: 'spot_flag',
    framing: 'You are on a dating app and received this opening message.',
    spot_flag_options: [
      { id: 'too_perfect', label: 'Profile story is suspiciously perfect and detailed' },
      { id: 'no_mutual_connections', label: 'No mutual friends or connections' },
      { id: 'generic_opener', label: 'Opening message could apply to anyone' },
      { id: 'profile_recently_joined', label: 'Account was created very recently' }
    ],
    spot_flag_correct_id: 'generic_opener',
    message: { from_name: 'Michael_T', from_handle: '@michael.t.professional', subject: null, body: 'Hi! I came across your profile and you really caught my attention. You seem like such an interesting and genuine person. I am a widower with one daughter, working as a petroleum engineer. I believe in real connection. Would love to get to know you better.' },
    red_flags: [
      { id: 'generic_opener', label: 'Opening message is generic and could apply to anyone' },
      { id: 'widower_engineer', label: 'Widower petroleum engineer is a common romance scam profile type' },
      { id: 'real_connection_language', label: 'Emphasis on genuine connection is a manipulation setup' },
      { id: 'no_specific_reference', label: 'Nothing in the message references your actual profile' }
    ],
    correct_red_flag_ids: ['generic_opener', 'widower_engineer', 'no_specific_reference'],
    explanation: {
      short: 'Generic openers sent to many targets, combined with a widower engineer story, are classic romance scam profile patterns.',
      tells: ['The message contains nothing specific to your profile — it is copy-pasted to many people', 'Widower petroleum engineer is one of the most common romance scam personas', 'Emphasizing genuine connection early is emotional priming before the eventual ask', 'A real interested person would mention something specific they noticed about you'],
      safe_move: 'Ask something specific that requires knowledge of your profile. Scammers cannot answer naturally.',
      consequence: 'Extended emotional grooming leads to a money request weeks or months later.',
      behavioral_reinforcement: 'A message that could have been sent to anyone was sent to everyone — it is a scam template.'
    },
    tags: ['romance_scam', 'catfishing', 'template_message'],
    tricks: ['emotional_leverage', 'trust_then_pivot']
  },
  {
    id: 'spot_dm_romance_008',
    channel: 'dm',
    pattern_family: 'romance_social',
    difficulty: 3,
    ground_truth: 'scam',
    ai_amplified: false,
    drill_type: 'spot_flag',
    framing: 'You have been in an online relationship for two months.',
    spot_flag_options: [
      { id: 'medical_emergency', label: 'Sudden medical emergency requiring money' },
      { id: 'hospital_abroad', label: 'Hospitalized in a foreign country' },
      { id: 'family_member_ill', label: 'Family member is also sick' },
      { id: 'insurance_gap', label: 'Insurance does not cover the treatment' }
    ],
    spot_flag_correct_id: 'medical_emergency',
    message: { from_name: 'Grace_O', from_handle: '@grace.o.nurse', subject: null, body: 'I am so scared. I collapsed on my way to work and I am in the hospital here in Dubai. They are saying I need emergency surgery but require a $2,500 deposit before they will operate. I have no family here. You are the only one I trust. Please help me — I do not know what to do.' },
    red_flags: [
      { id: 'medical_emergency', label: 'Sudden medical emergency requiring urgent payment' },
      { id: 'abroad_and_alone', label: 'Stranded abroad with no family or support' },
      { id: 'surgery_deposit', label: 'Hospital demanding a deposit before surgery' },
      { id: 'only_person_trusted', label: 'You are the only person they can turn to' }
    ],
    correct_red_flag_ids: ['medical_emergency', 'abroad_and_alone', 'only_person_trusted'],
    explanation: {
      short: 'The medical emergency abroad is one of the most emotionally powerful romance scam tactics — hospitals do not withhold emergency surgery for deposits.',
      tells: ['Hospitals in most countries cannot legally withhold emergency surgery for payment', 'The isolation framing makes you feel uniquely responsible', 'The large specific amount creates urgency and legitimacy', 'After you pay, recovery leads to another emergency or the contact disappears'],
      safe_move: 'Contact the hospital directly using a number you find independently to verify. Do not send money based on this message alone.',
      consequence: '$2,500 sent and the emergency resolves — until the next one, or the contact vanishes entirely.',
      behavioral_reinforcement: 'No hospital withholds emergency surgery for an upfront deposit — that claim is always false.'
    },
    tags: ['romance_scam', 'medical_emergency', 'advance_fee'],
    tricks: ['emotional_leverage', 'urgency', 'advance_fee']
  }
];

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
