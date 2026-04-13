// spot_flag: charity(8) + crypto(4) + qr(4) + subscription(4) + government(4) + rental(4) = 28 drills
const fs = require('fs');
const drills = JSON.parse(fs.readFileSync('data/drills.json', 'utf-8'));
const REAL_BRANDS = ['Amazon','Google','Apple','Microsoft','PayPal','Chase','Wells Fargo','Coinbase','Facebook','Instagram','Netflix','UPS','FedEx','DHL','Venmo','Zelle','Cash App','WhatsApp','Telegram','LinkedIn','Indeed','Twitter','Snapchat','TikTok'];

const newDrills = [
  // ── CHARITY (8) ──────────────────────────────────────────────────────────
  {
    id: 'spot_email_charity_001', channel: 'email', pattern_family: 'charity_fraud', difficulty: 3, ground_truth: 'scam', ai_amplified: false, drill_type: 'spot_flag',
    framing: 'You donated to a disaster relief fund last year. This arrived.',
    spot_flag_options: [
      { id: 'generic_charity_name', label: 'Charity name is vague and generic' },
      { id: 'gift_card_ask', label: 'Requests donation via gift cards' },
      { id: 'tax_receipt_promised', label: 'Promises a tax receipt' },
      { id: 'recent_disaster', label: 'References a recent news event' }
    ],
    spot_flag_correct_id: 'gift_card_ask',
    message: { from_name: 'American Relief Fund', from_handle: 'donate@american-relief-fund.org', subject: 'Urgent: Help Flood Victims Today', body: 'Dear Friend,\n\nFloods in the Southeast have left thousands homeless. Your gift of $50 can provide emergency shelter for a family tonight.\n\nFor fastest processing, please donate using a NovaMart or Target gift card — just scratch the back and email us the code. 100% goes directly to victims.\n\nAmerican Relief Fund' },
    red_flags: [
      { id: 'gift_card_ask', label: 'Requests donation via gift card codes' },
      { id: 'generic_charity_name', label: 'Vague charity name with no verifiable history' },
      { id: 'email_code', label: 'Asks you to email gift card codes' },
      { id: 'urgency', label: 'Tonight urgency to bypass scrutiny' }
    ],
    correct_red_flag_ids: ['gift_card_ask', 'generic_charity_name', 'email_code'],
    explanation: { short: 'No legitimate charity accepts gift card codes as donations — this is a gift card scam using a disaster as cover.', tells: ['Legitimate charities accept credit cards or checks — never gift card codes', 'Gift card codes emailed to a stranger are instantly redeemable and unrecoverable', 'The charity name is generic enough to seem real but has no public record', 'Real charities are listed on Charity Navigator or GuideStar'], safe_move: 'Donate only through verified charities found on Charity Navigator or GuideStar. Never use gift cards.', consequence: 'The gift card codes are redeemed immediately. Your money is gone and no donation reaches any victim.', behavioral_reinforcement: 'Gift card donation requests are always scams — legitimate charities never ask for them.' },
    tags: ['charity_scam', 'gift_card', 'disaster_relief'], tricks: ['urgency', 'emotional_leverage']
  },
  {
    id: 'spot_email_charity_002', channel: 'email', pattern_family: 'charity_fraud', difficulty: 3, ground_truth: 'scam', ai_amplified: false, drill_type: 'spot_flag',
    framing: 'You received this around the holidays.',
    spot_flag_options: [
      { id: 'lookalike_name', label: 'Charity name closely mimics a well-known organization' },
      { id: 'emotional_story', label: 'Uses a heartbreaking personal story' },
      { id: 'small_ask', label: 'Asks for a small amount' },
      { id: 'year_end_tax', label: 'Mentions year-end tax deduction' }
    ],
    spot_flag_correct_id: 'lookalike_name',
    message: { from_name: 'Childrens Cancer Care Fund', from_handle: 'giving@childrens-cancer-care-fund.com', subject: 'Give Hope This Holiday Season', body: 'This holiday season, 7-year-old Maya is fighting leukemia without health insurance. A gift of just $25 provides a week of treatment supplies.\n\nYour donation is tax-deductible before December 31st. Give at: childrens-cancer-care-fund.com/donate\n\nChildrens Cancer Care Fund' },
    red_flags: [
      { id: 'lookalike_name', label: 'Name mimics real cancer charities but is unverifiable' },
      { id: 'no_ein', label: 'No EIN or 501c3 number provided' },
      { id: 'unverified_site', label: 'Donation site has no connection to a known charity' },
      { id: 'individual_story', label: 'Uses a named child story that cannot be verified' }
    ],
    correct_red_flag_ids: ['lookalike_name', 'no_ein', 'unverified_site'],
    explanation: { short: 'Fake charities mimic real ones close enough that donors do not check — always verify before giving.', tells: ['Legitimate charities always include their EIN on donation requests', 'The organization name is close to real charities but has no public IRS registration', 'Real charities have years of public financial records on GuideStar', 'Emotional child stories are the most effective lever for bypassing scrutiny'], safe_move: 'Search the charity name on Charity Navigator or the IRS Tax Exempt Organization Search before donating.', consequence: 'Your donation goes to scammers, not sick children. The story and the child are fabricated.', behavioral_reinforcement: 'Always look up a charity on Charity Navigator before giving — a 30-second check protects your donation.' },
    tags: ['charity_scam', 'lookalike', 'holiday_scam'], tricks: ['emotional_leverage', 'authority_impersonation']
  },
  {
    id: 'spot_dm_charity_003', channel: 'dm', pattern_family: 'charity_fraud', difficulty: 3, ground_truth: 'scam', ai_amplified: false, drill_type: 'spot_flag',
    framing: 'A stranger messaged you on social media.',
    spot_flag_options: [
      { id: 'personal_collection', label: 'Person collecting donations personally, not through a charity' },
      { id: 'shares_photos', label: 'Shares photos of people in need' },
      { id: 'local_cause', label: 'Claims to be helping a local community' },
      { id: 'quick_response', label: 'Responds very quickly to your questions' }
    ],
    spot_flag_correct_id: 'personal_collection',
    message: { from_name: 'Marcus_Helps', from_handle: '@marcus.community.help', subject: null, body: 'Hi, I am organizing food boxes for families in our neighborhood who lost jobs. We have 40 families this week and I am $200 short of our goal. If you can send anything to my PeerSend @marcus_helps it would mean the world. Every dollar counts!' },
    red_flags: [
      { id: 'personal_collection', label: 'Collecting donations into a personal payment account' },
      { id: 'no_organization', label: 'No registered charity or organization backing the effort' },
      { id: 'unverifiable_claim', label: 'Cannot verify the 40 families or the need' },
      { id: 'peersend_to_individual', label: 'Sends money to a personal handle, not an org' }
    ],
    correct_red_flag_ids: ['personal_collection', 'no_organization', 'unverifiable_claim'],
    explanation: { short: 'Collecting charity donations into a personal payment account is unaccountable — there is no way to verify the money reaches anyone in need.', tells: ['Legitimate community drives collect through verified platforms like GoFundMe or 501c3 accounts', 'Sending to a personal PeerSend handle gives you no receipt and no accountability', 'The specific $200 shortfall creates a feeling that your gift will complete the goal', 'Real community organizations have names, websites, and transparent records'], safe_move: 'If you want to help, find a verified local food bank and donate through their official channel.', consequence: 'Your money goes to the individual with no evidence it ever reaches any families.', behavioral_reinforcement: 'Charitable giving through personal payment accounts has no accountability — always use verified organizations.' },
    tags: ['charity_scam', 'personal_collection', 'social_engineering'], tricks: ['emotional_leverage', 'social_proof']
  },
  {
    id: 'spot_email_charity_004', channel: 'email', pattern_family: 'charity_fraud', difficulty: 3, ground_truth: 'scam', ai_amplified: false, drill_type: 'spot_flag',
    framing: 'You got this after a major earthquake was in the news.',
    spot_flag_options: [
      { id: 'newly_created', label: 'Charity appears to have been just created' },
      { id: 'news_reference', label: 'References a recent disaster in the news' },
      { id: 'urgent_deadline', label: 'Donations needed within 48 hours' },
      { id: 'crypto_donation', label: 'Accepts cryptocurrency donations' }
    ],
    spot_flag_correct_id: 'crypto_donation',
    message: { from_name: 'Global Earthquake Relief', from_handle: 'help@global-eq-relief.org', subject: 'URGENT: 48-Hour Matching Drive for Earthquake Victims', body: 'A generous donor is MATCHING all gifts in the next 48 hours. Send your donation now to maximize impact:\n\nCredit card: global-eq-relief.org/donate\nBitcoin: bc1q9k4m7x2p...\nCoinVault: cvault_relief_fund\n\nEvery hour counts. Please share widely.\n\nGlobal Earthquake Relief' },
    red_flags: [
      { id: 'crypto_donation', label: 'Accepts crypto donations — untraceable and irrecoverable' },
      { id: 'matching_urgency', label: 'Matching drive urgency to bypass verification' },
      { id: 'newly_registered_domain', label: 'Domain was likely registered after the disaster' },
      { id: 'no_org_details', label: 'No EIN, address, or leadership listed' }
    ],
    correct_red_flag_ids: ['crypto_donation', 'matching_urgency', 'no_org_details'],
    explanation: { short: 'Disaster relief scams launch within hours of news events — the matching drive urgency is designed to prevent you from researching the organization.', tells: ['Crypto donations to charities are irrecoverable if the org is fake', 'Real matching drives are run by established foundations with public records', 'Disaster-named charities are often registered hours after news breaks', 'No EIN means there is no tax deduction and no IRS accountability'], safe_move: 'Donate to established disaster relief organizations through their known official websites, not links in emails.', consequence: 'Your crypto donation is irreversible. The domain disappears after the matching window.', behavioral_reinforcement: 'Stick to established disaster relief organizations — new ones that appear immediately after disasters are usually scams.' },
    tags: ['charity_scam', 'disaster_relief', 'crypto'], tricks: ['urgency', 'emotional_leverage']
  },
  {
    id: 'spot_email_charity_005', channel: 'email', pattern_family: 'charity_fraud', difficulty: 3, ground_truth: 'scam', ai_amplified: false, drill_type: 'spot_flag',
    framing: 'This came from a veterans organization.',
    spot_flag_options: [
      { id: 'overhead_claim', label: 'Claims 100% of donations go directly to veterans' },
      { id: 'military_imagery', label: 'Uses military imagery and patriotic language' },
      { id: 'recurring_ask', label: 'Asks for a monthly recurring gift' },
      { id: 'named_veteran', label: 'Features a named veteran story' }
    ],
    spot_flag_correct_id: 'overhead_claim',
    message: { from_name: 'American Veterans Support Alliance', from_handle: 'give@avsa-donate.org', subject: '100% of Your Gift Goes Directly to Veterans', body: 'Unlike other charities, we have ZERO overhead. Every penny you give goes straight to veterans in need — no admin fees, no fundraising costs.\n\nGive $30 a month and provide a homeless veteran with meals for an entire month.\n\nDonate: avsa-donate.org\n\nAmerican Veterans Support Alliance' },
    red_flags: [
      { id: 'overhead_claim', label: '100% to veterans claim is financially impossible for any real org' },
      { id: 'unverifiable_org', label: 'No EIN or public IRS registration' },
      { id: 'lookalike_name', label: 'Name designed to sound official and established' },
      { id: 'competitor_attack', label: 'Disparages other charities to seem more legitimate' }
    ],
    correct_red_flag_ids: ['overhead_claim', 'unverifiable_org', 'lookalike_name'],
    explanation: { short: '100% overhead-free claims are mathematically impossible — all organizations have operational costs. This claim signals a scam.', tells: ['No legitimate charity has zero overhead — staff, banking, and compliance all cost money', 'The 100% claim is designed to make you feel other charities are wasteful by comparison', 'The name sounds official but has no history in IRS nonprofit records', 'Real veterans charities like DAV and VFW have decades of public financial disclosures'], safe_move: 'Search the organization on Charity Navigator. Reputable veterans charities have ratings and financial disclosures.', consequence: 'Your recurring donation goes to scammers indefinitely until you cancel.', behavioral_reinforcement: 'Any charity claiming 100% goes to the cause is lying — real orgs have overhead, and transparency about it is the sign of legitimacy.' },
    tags: ['charity_scam', 'veterans', 'false_claim'], tricks: ['social_proof', 'emotional_leverage']
  },
  {
    id: 'spot_email_charity_006', channel: 'email', pattern_family: 'charity_fraud', difficulty: 3, ground_truth: 'scam', ai_amplified: false, drill_type: 'spot_flag',
    framing: 'A charity you donated to last year sent this update.',
    spot_flag_options: [
      { id: 'wire_transfer_ask', label: 'Requests donation via wire transfer' },
      { id: 'impact_report', label: 'Includes an impact report with statistics' },
      { id: 'year_end_push', label: 'Year-end giving campaign' },
      { id: 'board_member_named', label: 'Names a board member' }
    ],
    spot_flag_correct_id: 'wire_transfer_ask',
    message: { from_name: 'Bright Hope Foundation', from_handle: 'updates@brighthopegiving-annual.com', subject: 'Year-End Impact + Special Giving Opportunity', body: 'Dear Supporter,\n\nThanks to donors like you, we served 12,000 children this year. As we close the books on 2025, a board member has offered to match large gifts of $500 or more — wired directly to our new account for tax efficiency.\n\nRouting: 026009593 | Account: 8812334409\n\nPlease wire by December 30th to qualify for the match.\n\nBright Hope Foundation' },
    red_flags: [
      { id: 'wire_transfer_ask', label: 'Requests wire transfer directly to a bank account' },
      { id: 'new_account', label: 'New bank account provided for this special gift' },
      { id: 'lookalike_domain', label: 'Domain is brighthopegiving-annual.com, not the real org site' },
      { id: 'tax_efficiency_excuse', label: 'Tax efficiency framing for wiring directly is false' }
    ],
    correct_red_flag_ids: ['wire_transfer_ask', 'new_account', 'lookalike_domain'],
    explanation: { short: 'Legitimate charities never ask donors to wire directly to a bank account — that bypasses all donation processing and oversight.', tells: ['Charitable donations go through payment processors, not direct wires', 'Tax receipts require donations go through the charity\'s official accounts', 'The domain has been slightly modified from the real organization', 'Large gift matching requests via wire are a business email compromise tactic applied to charities'], safe_move: 'Donate only through the charity\'s official website, which you find by searching directly — not through email links.', consequence: 'Your wire transfer reaches a fraudulent account. No matching gift, no tax receipt, no donation to the cause.', behavioral_reinforcement: 'Charitable donations never go by wire transfer to a bank account — always use the official donation page.' },
    tags: ['charity_scam', 'wire_fraud', 'bec'], tricks: ['authority_impersonation', 'urgency', 'lookalike_domain']
  },
  {
    id: 'spot_email_charity_007', channel: 'email', pattern_family: 'charity_fraud', difficulty: 3, ground_truth: 'scam', ai_amplified: false, drill_type: 'spot_flag',
    framing: 'You got this email from what looks like a school fundraiser.',
    spot_flag_options: [
      { id: 'personal_venmo', label: 'Directs to a personal payment account' },
      { id: 'school_name_used', label: 'Uses a local school name' },
      { id: 'small_amount', label: 'Asks for a small, reasonable amount' },
      { id: 'student_benefit', label: 'Claims to benefit students directly' }
    ],
    spot_flag_correct_id: 'personal_venmo',
    message: { from_name: 'Eastview Elementary PTA', from_handle: 'pta.eastview2025@gmail.com', subject: 'Spring Book Fair Fundraiser - Help Us Reach Our Goal!', body: 'Hi families!\n\nWe are $340 from our book fair goal. If every family gives just $10 we can give every student a free book!\n\nPlease send to our treasurer Sarah at PeerSend @sarah.pta.eastview by Friday. Thank you!\n\nEastview PTA' },
    red_flags: [
      { id: 'personal_venmo', label: 'Directs donations to a personal PeerSend account' },
      { id: 'gmail_sender', label: 'PTA using a Gmail, not a school district email' },
      { id: 'no_school_verification', label: 'No way to verify this is the real PTA' },
      { id: 'individual_treasurer', label: 'Money goes to a named individual, not an org account' }
    ],
    correct_red_flag_ids: ['personal_venmo', 'gmail_sender', 'no_school_verification'],
    explanation: { short: 'Real school PTAs collect through official school payment systems — not personal payment apps sent via Gmail.', tells: ['School fundraisers use platforms like MySchoolBucks, SchoolPay, or official PTA accounts', 'A Gmail address is easy for anyone to create with any school name', 'Sending money to an individual\'s personal account has no accountability', 'Call the school directly to verify any fundraising activity before giving'], safe_move: 'Call the school office to verify the fundraiser is real before sending any money.', consequence: 'Your $10 goes to a stranger. There is no book fair goal, no PTA, and no books for students.', behavioral_reinforcement: 'Verify school fundraisers by calling the school directly — never send money to personal payment accounts based on an email.' },
    tags: ['charity_scam', 'school_fundraiser', 'personal_collection'], tricks: ['social_proof', 'small_dollar_bait', 'authority_impersonation']
  },
  {
    id: 'spot_email_charity_008', channel: 'email', pattern_family: 'charity_fraud', difficulty: 3, ground_truth: 'scam', ai_amplified: false, drill_type: 'spot_flag',
    framing: 'You got a thank-you email from a charity you supposedly donated to.',
    spot_flag_options: [
      { id: 'no_memory_of_donating', label: 'You have no memory of donating to this organization' },
      { id: 'thank_you_email', label: 'It is a thank-you for a past donation' },
      { id: 'tax_receipt_attached', label: 'Includes a tax receipt attachment' },
      { id: 'asks_for_more', label: 'Asks for an additional gift' }
    ],
    spot_flag_correct_id: 'no_memory_of_donating',
    message: { from_name: 'Hope Kids Foundation', from_handle: 'receipts@hopekids-foundation.net', subject: 'Thank You for Your $75 Gift + Year-End Giving Opportunity', body: 'Dear Friend,\n\nThank you for your generous $75 donation to Hope Kids Foundation last quarter. Your gift helped provide school supplies to 3 children.\n\nAs we enter our year-end campaign, would you consider doubling your impact with another gift?\n\nDonate: hopekids-foundation.net/give\n\nWith gratitude,\nHope Kids Foundation' },
    red_flags: [
      { id: 'no_memory_of_donating', label: 'No record of ever donating to this organization' },
      { id: 'fake_receipt', label: 'Tax receipt for a donation you never made' },
      { id: 'psychological_commitment', label: 'Prior donation framing creates sense of existing relationship' },
      { id: 'unverifiable_impact', label: 'Specific impact claim (3 children) cannot be verified' }
    ],
    correct_red_flag_ids: ['no_memory_of_donating', 'fake_receipt', 'psychological_commitment'],
    explanation: { short: 'Fake thank-you emails exploit the psychological principle of consistency — if you already gave, you are more likely to give again.', tells: ['You would remember a $75 donation — if you have no record of it, the email is fabricated', 'The prior gift framing is designed to create a sense of existing relationship and obligation', 'Scammers send these broadly hoping some recipients will assume they forgot donating', 'A real receipt would come from your payment processor at time of donation'], safe_move: 'Check your bank or credit card records. If there is no $75 charge from this org, do not engage.', consequence: 'You make an additional donation based on a fake prior gift — your money goes to scammers.', behavioral_reinforcement: 'Check your records before acting on any thank-you for a donation you do not remember making.' },
    tags: ['charity_scam', 'psychological_manipulation', 'fake_receipt'], tricks: ['social_proof', 'overconfidence_trap']
  },

  // ── CRYPTO SPOT_FLAG (4) ──────────────────────────────────────────────────
  {
    id: 'spot_dm_crypto_001', channel: 'dm', pattern_family: 'crypto_wallet', difficulty: 4, ground_truth: 'scam', ai_amplified: false, drill_type: 'spot_flag',
    framing: 'You got a DM from a crypto wallet service.',
    spot_flag_options: [
      { id: 'seed_phrase_request', label: 'Asks for your wallet seed phrase' },
      { id: 'support_account', label: 'Claims to be official support' },
      { id: 'account_suspended', label: 'Says your account is suspended' },
      { id: 'verification_needed', label: 'Says verification is required' }
    ],
    spot_flag_correct_id: 'seed_phrase_request',
    message: { from_name: 'CoinVault_Support', from_handle: '@coinvault_help_desk', subject: null, body: 'Your CoinVault wallet has been flagged for suspicious activity. To restore access, you must verify ownership by providing your 12-word recovery phrase at: coinvault-verify-wallet.com. Failure to verify within 2 hours will result in permanent wallet lock.' },
    red_flags: [
      { id: 'seed_phrase_request', label: 'Asks for your 12-word seed phrase' },
      { id: 'fake_support', label: 'Support via DM, not through official app' },
      { id: 'lookalike_domain', label: 'coinvault-verify-wallet.com is not the real site' },
      { id: 'two_hour_threat', label: '2-hour lock threat is artificial pressure' }
    ],
    correct_red_flag_ids: ['seed_phrase_request', 'fake_support', 'lookalike_domain'],
    explanation: { short: 'Your seed phrase is the master key to your entire wallet — no legitimate service ever needs it.', tells: ['Your seed phrase gives complete control over your wallet to whoever has it', 'No legitimate crypto service requests your seed phrase for any reason', 'Real wallet support happens through the official app, never via social DM', 'The domain is a phishing site designed to capture your phrase'], safe_move: 'Never enter your seed phrase anywhere except when recovering your wallet locally. Close this tab immediately.', consequence: 'Entering your seed phrase gives the attacker full control. All funds are drained within minutes.', behavioral_reinforcement: 'Your seed phrase is like a master password and bank PIN combined — guard it absolutely and share it with no one.' },
    tags: ['crypto', 'seed_phrase', 'wallet_drain'], tricks: ['authority_impersonation', 'fear_lockout', 'credential_harvest']
  },
  {
    id: 'spot_dm_crypto_002', channel: 'dm', pattern_family: 'crypto_wallet', difficulty: 4, ground_truth: 'scam', ai_amplified: false, drill_type: 'spot_flag',
    framing: 'A stranger DMed you about a crypto opportunity.',
    spot_flag_options: [
      { id: 'guaranteed_returns', label: 'Promises guaranteed high returns' },
      { id: 'referral_bonus', label: 'Offers a referral bonus' },
      { id: 'platform_fee', label: 'Requires a fee to withdraw earnings' },
      { id: 'celebrity_endorsed', label: 'Claims celebrity endorsement' }
    ],
    spot_flag_correct_id: 'guaranteed_returns',
    message: { from_name: 'NexCoin_Official', from_handle: '@nexcoin_invest_team', subject: null, body: 'Hi! Join our VaultChain liquidity mining program. Guaranteed 15% weekly returns on your deposit. Minimum $500 to start. Over 8,000 members already earning. Withdraw anytime — no lock-up period. DM for invite link.' },
    red_flags: [
      { id: 'guaranteed_returns', label: 'Guarantees 15% weekly returns — impossible legitimately' },
      { id: 'withdrawal_trap', label: 'Withdraw anytime promise that will later have fees' },
      { id: 'social_proof', label: '8,000 members claim cannot be verified' },
      { id: 'dm_invite', label: 'Invite-only via DM adds artificial exclusivity' }
    ],
    correct_red_flag_ids: ['guaranteed_returns', 'withdrawal_trap', 'social_proof'],
    explanation: { short: 'No investment legitimately guarantees 15% weekly returns — that is 780% annually, which no real asset produces.', tells: ['Guaranteed returns in any investment are a scam signal — all real investments carry risk', '15% weekly is mathematically unsustainable for any legitimate platform', 'Withdraw anytime promises disappear when you try — fees and taxes appear first', 'Unverifiable member counts are used to create social proof from nothing'], safe_move: 'Block and ignore. Report the account to the platform.', consequence: 'You deposit $500 and see fake gains on a dashboard. When you try to withdraw, new fees appear that you must pay first. The platform eventually disappears.', behavioral_reinforcement: 'Guaranteed investment returns do not exist — any promise of them is a scam.' },
    tags: ['crypto', 'pig_butchering', 'fake_investment'], tricks: ['social_proof', 'trust_then_pivot', 'advance_fee']
  },
  {
    id: 'spot_email_crypto_003', channel: 'email', pattern_family: 'crypto_wallet', difficulty: 4, ground_truth: 'scam', ai_amplified: false, drill_type: 'spot_flag',
    framing: 'You got this email about unclaimed crypto.',
    spot_flag_options: [
      { id: 'unclaimed_funds', label: 'Claims you have unclaimed cryptocurrency' },
      { id: 'fee_to_claim', label: 'Requires a fee to release the funds' },
      { id: 'time_limited', label: 'Funds expire soon' },
      { id: 'large_amount', label: 'Amount is very large' }
    ],
    spot_flag_correct_id: 'fee_to_claim',
    message: { from_name: 'NexCoin Asset Recovery', from_handle: 'recovery@nexcoin-assets.net', subject: 'Unclaimed Bitcoin: $4,200 Awaiting Your Claim', body: 'Our records show $4,200 in Bitcoin linked to your email address from an inactive wallet. To claim and transfer to your wallet:\n\n1. Verify identity at nexcoin-assets.net/claim\n2. Pay the $89 processing fee via gift card\n3. Receive your $4,200 within 24 hours\n\nThis offer expires in 72 hours.\n\nNexCoin Asset Recovery' },
    red_flags: [
      { id: 'fee_to_claim', label: 'Requires a fee to receive funds — advance fee fraud' },
      { id: 'gift_card_fee', label: 'Fee must be paid via gift card' },
      { id: 'unclaimed_funds_fiction', label: 'No mechanism exists to link Bitcoin to email addresses' },
      { id: 'lookalike_domain', label: 'nexcoin-assets.net is not a real exchange' }
    ],
    correct_red_flag_ids: ['fee_to_claim', 'gift_card_fee', 'unclaimed_funds_fiction'],
    explanation: { short: 'Bitcoin is not linked to email addresses — this unclaimed funds story is entirely fictional, and the fee is the actual theft.', tells: ['Bitcoin wallets are identified by cryptographic addresses, not email addresses', 'Paying a fee to receive money is the advance fee fraud pattern', 'Gift card fees are untraceable and the preferred method of scammers', 'The 72-hour expiry creates urgency to prevent you from researching'], safe_move: 'Ignore and delete. There is no unclaimed Bitcoin. Report to the FTC at reportfraud.ftc.gov.', consequence: 'You pay $89 in gift cards and receive nothing. No Bitcoin exists — it was fabricated to justify the fee.', behavioral_reinforcement: 'You never pay fees to receive money — any request to do so is advance fee fraud.' },
    tags: ['crypto', 'advance_fee', 'unclaimed_funds'], tricks: ['advance_fee', 'urgency']
  },
  {
    id: 'spot_dm_crypto_004', channel: 'dm', pattern_family: 'crypto_wallet', difficulty: 4, ground_truth: 'scam', ai_amplified: false, drill_type: 'spot_flag',
    framing: 'Someone who seems to be a crypto expert reached out.',
    spot_flag_options: [
      { id: 'private_group_invite', label: 'Invites you to a private trading group' },
      { id: 'track_record_shown', label: 'Shows a track record of past wins' },
      { id: 'small_initial_investment', label: 'Starts with a small suggested investment' },
      { id: 'mentor_framing', label: 'Positions themselves as a mentor' }
    ],
    spot_flag_correct_id: 'private_group_invite',
    message: { from_name: 'TraderKing_Rex', from_handle: '@rex.traderking', subject: null, body: 'Hey, I noticed you follow some crypto pages. I run a private VIP signal group — we are up 340% this year. I share my exact trades. First month is free. Just $150 to join after. Here are my recent wins [screenshot]. DM me if you want in before I close the group this week.' },
    red_flags: [
      { id: 'private_group_invite', label: 'Paid private signal group with entry fee' },
      { id: 'fabricated_screenshot', label: 'Trade screenshots can be fabricated easily' },
      { id: 'closing_soon_pressure', label: 'Closing group this week creates fake scarcity' },
      { id: 'unrealistic_returns', label: '340% annual returns are not credible for signal groups' }
    ],
    correct_red_flag_ids: ['private_group_invite', 'fabricated_screenshot', 'closing_soon_pressure'],
    explanation: { short: 'Paid signal groups profit from membership fees, not trading — screenshots of gains are trivially easy to fabricate.', tells: ['Trade performance screenshots can be edited in minutes', 'If the strategy actually worked, the group would not need your $150 membership fee', 'Closing the group this week is a recurring tactic — the deadline always resets', 'Real traders do not cold-DM strangers to share their edge'], safe_move: 'Do not pay. Real trading education comes from established, regulated sources — not social DM groups.', consequence: 'You pay $150. The signals are low quality or nonexistent. The group eventually vanishes or the fee increases.', behavioral_reinforcement: 'Paid signal groups are a fee collection business, not a trading business — the only consistent winner is the group owner.' },
    tags: ['crypto', 'signal_group', 'scam'], tricks: ['social_proof', 'urgency', 'advance_fee']
  },

  // ── QR CODE SPOT_FLAG (4) ────────────────────────────────────────────────
  {
    id: 'spot_email_qr_001', channel: 'email', pattern_family: 'qr_code', difficulty: 4, ground_truth: 'scam', ai_amplified: false, drill_type: 'spot_flag',
    framing: 'You got this from your bank in an email.',
    spot_flag_options: [
      { id: 'qr_in_email', label: 'Bank sends a QR code in email to verify account' },
      { id: 'urgent_verification', label: 'Account verification required urgently' },
      { id: 'bank_logo_present', label: 'Email includes the bank logo' },
      { id: 'customer_service_number', label: 'Includes a customer service number' }
    ],
    spot_flag_correct_id: 'qr_in_email',
    message: { from_name: 'Horizon Bank Security', from_handle: 'security@horizonbank-verify.com', subject: 'Action Required: Verify Your Account Within 24 Hours', body: 'Dear Customer,\n\nWe have detected unusual access to your account. To prevent unauthorized activity, please scan the QR code below to verify your identity.\n\n[QR CODE IMAGE]\n\nThis link expires in 24 hours. Failure to verify may result in account restriction.\n\nHorizon Bank Security' },
    red_flags: [
      { id: 'qr_in_email', label: 'Banks do not send QR codes in email for account verification' },
      { id: 'lookalike_domain', label: 'horizonbank-verify.com is not the real bank domain' },
      { id: 'qr_destination_unknown', label: 'QR code destination cannot be previewed before scanning' },
      { id: 'urgency', label: '24-hour threat to force quick action' }
    ],
    correct_red_flag_ids: ['qr_in_email', 'lookalike_domain', 'urgency'],
    explanation: { short: 'Banks do not use QR codes in emails for account verification — QR codes in emails hide their destination until scanned.', tells: ['A QR code hides its URL, making it a perfect tool for sending you to a phishing site', 'Real bank security alerts direct you to log in through the official app or website', 'The sender domain is horizonbank-verify.com, not the real bank', 'Once you scan and enter credentials, the phishing site captures them'], safe_move: 'Do not scan. Log into your bank account directly through the app or by typing the URL you already know.', consequence: 'The QR code leads to a fake login page. Your credentials are captured and the account is accessed.', behavioral_reinforcement: 'Verify account alerts by logging into your bank directly — never by scanning a QR code from an email.' },
    tags: ['qr_code', 'phishing', 'bank_fraud'], tricks: ['qr_redirect', 'authority_impersonation', 'fear_lockout']
  },
  {
    id: 'spot_email_qr_002', channel: 'email', pattern_family: 'qr_code', difficulty: 4, ground_truth: 'scam', ai_amplified: false, drill_type: 'spot_flag',
    framing: 'A parking ticket notice arrived by email.',
    spot_flag_options: [
      { id: 'qr_to_pay_fine', label: 'QR code is the only way provided to pay the fine' },
      { id: 'government_sender', label: 'Claims to be from the city or government' },
      { id: 'fine_amount', label: 'Fine amount seems plausible' },
      { id: 'deadline_stated', label: 'Deadline stated for payment' }
    ],
    spot_flag_correct_id: 'qr_to_pay_fine',
    message: { from_name: 'City of Maplewood Parking Enforcement', from_handle: 'parking@maplewood-city-fines.com', subject: 'Parking Violation Notice - Pay Before Penalty Doubles', body: 'A parking citation has been issued for your vehicle.\n\nCitation #: MPW-2024-8841\nFine Amount: $65.00\nDue Date: Within 14 days (doubles after)\n\nScan the QR code below to pay securely:\n\n[QR CODE]\n\nCity of Maplewood Parking Enforcement' },
    red_flags: [
      { id: 'qr_to_pay_fine', label: 'Government fine payable only via QR code' },
      { id: 'unofficial_domain', label: 'maplewood-city-fines.com is not an official .gov domain' },
      { id: 'email_delivery', label: 'Real parking violations come by mail, not email' },
      { id: 'no_plate_or_location', label: 'No license plate number or violation location given' }
    ],
    correct_red_flag_ids: ['qr_to_pay_fine', 'unofficial_domain', 'email_delivery'],
    explanation: { short: 'Government agencies do not issue parking citations by email with QR codes — real notices come by physical mail with .gov payment portals.', tells: ['Parking tickets are mailed physically — an email version is always suspicious', 'Government payment sites use .gov domains, not .com domains with city names', 'No plate number or violation location means this was sent to many people at random', 'The doubled penalty deadline is urgency pressure to skip verification'], safe_move: 'Check your city\'s official .gov website for any actual violations on your vehicle.', consequence: 'The QR code leads to a fake payment page that captures your card number. No violation is cleared.', behavioral_reinforcement: 'Government fines arrive by physical mail and are paid through official .gov portals — never via email QR codes.' },
    tags: ['qr_code', 'government_impersonation', 'fake_fine'], tricks: ['qr_redirect', 'authority_impersonation', 'urgency']
  },
  {
    id: 'spot_email_qr_003', channel: 'email', pattern_family: 'qr_code', difficulty: 4, ground_truth: 'scam', ai_amplified: false, drill_type: 'spot_flag',
    framing: 'A package delivery update arrived.',
    spot_flag_options: [
      { id: 'qr_to_reschedule', label: 'Scan QR code to reschedule delivery' },
      { id: 'tracking_number', label: 'Includes a tracking number' },
      { id: 'carrier_name', label: 'Names a shipping carrier' },
      { id: 'delivery_address', label: 'Mentions your address' }
    ],
    spot_flag_correct_id: 'qr_to_reschedule',
    message: { from_name: 'SwiftShip Delivery', from_handle: 'notifications@swiftship-deliveries.net', subject: 'Delivery Attempt Failed - Action Required', body: 'We attempted to deliver your package today but no one was home.\n\nTracking: SS-449182-US\n\nTo reschedule your delivery, scan the QR code below. You will be prompted to confirm your address and pay a $2.99 redelivery fee.\n\n[QR CODE]\n\nSwiftShip Logistics' },
    red_flags: [
      { id: 'qr_to_reschedule', label: 'QR code required to reschedule — hides the destination URL' },
      { id: 'redelivery_fee', label: 'Carriers do not charge redelivery fees' },
      { id: 'lookalike_domain', label: 'swiftship-deliveries.net is not the real carrier site' },
      { id: 'address_confirmation', label: 'Asks you to confirm your address on an unknown site' }
    ],
    correct_red_flag_ids: ['qr_to_reschedule', 'redelivery_fee', 'lookalike_domain'],
    explanation: { short: 'Real carriers do not charge redelivery fees or use QR codes to reschedule — this is a credential and payment harvesting scam.', tells: ['Legitimate carriers let you reschedule on their official website using the tracking number', 'No major carrier charges a fee to redeliver a package', 'QR codes hide the destination — you do not know where you are going until after you scan', 'The $2.99 fee is low enough to seem plausible but is just the entry point for card capture'], safe_move: 'Go directly to the carrier\'s official website and enter the tracking number there to manage delivery.', consequence: 'The QR code leads to a fake carrier page that collects your card number and address. The $2.99 charge opens the door to larger unauthorized charges.', behavioral_reinforcement: 'Rescheduling deliveries never requires a fee or QR code — always manage packages on the carrier\'s own website.' },
    tags: ['qr_code', 'delivery_scam', 'fee_harvesting'], tricks: ['qr_redirect', 'small_dollar_bait', 'lookalike_domain']
  },
  {
    id: 'spot_email_qr_004', channel: 'email', pattern_family: 'qr_code', difficulty: 4, ground_truth: 'scam', ai_amplified: false, drill_type: 'spot_flag',
    framing: 'You got this from your office building management.',
    spot_flag_options: [
      { id: 'credential_harvest_qr', label: 'QR code asks for work email login credentials' },
      { id: 'building_management', label: 'Claims to be from building management' },
      { id: 'system_update', label: 'References a system or app update' },
      { id: 'all_tenants', label: 'Sent to all tenants or employees' }
    ],
    spot_flag_correct_id: 'credential_harvest_qr',
    message: { from_name: 'Building Management | Nexus Tower', from_handle: 'mgmt@nexus-tower-portal.net', subject: 'Tenant Portal Update - Action Required by Friday', body: 'Dear Tenant,\n\nWe have updated our building access portal. All tenants must re-authenticate by Friday to maintain keycard access.\n\nScan the QR code to log in and verify your credentials:\n\n[QR CODE]\n\nNexus Building Management' },
    red_flags: [
      { id: 'credential_harvest_qr', label: 'QR code asks you to enter login credentials' },
      { id: 'lookalike_domain', label: 'nexus-tower-portal.net may not be the real building site' },
      { id: 'keycard_threat', label: 'Losing keycard access is a real threat that creates urgency' },
      { id: 'friday_deadline', label: 'Artificial deadline to prevent verification' }
    ],
    correct_red_flag_ids: ['credential_harvest_qr', 'lookalike_domain', 'keycard_threat'],
    explanation: { short: 'Phishing attacks increasingly use QR codes to bypass email link scanners — the destination is always hidden until scanned.', tells: ['Building portals update through their existing login page, not QR codes in emails', 'The threat of losing keycard access triggers compliance without scrutiny', 'QR codes in corporate phishing evade many email security filters', 'Verifying credentials through an unknown QR destination hands your login to attackers'], safe_move: 'Contact building management directly using the number or email you have on file to verify before scanning anything.', consequence: 'Your work credentials are captured. Attackers access your company systems using your login.', behavioral_reinforcement: 'Verify IT or building management requests by contacting them through channels you already have — not through links or QR codes in emails.' },
    tags: ['qr_code', 'corporate_phishing', 'credential_harvest'], tricks: ['qr_redirect', 'authority_impersonation', 'fear_lockout']
  },

  // ── SUBSCRIPTION SPOT_FLAG (4) ───────────────────────────────────────────
  {
    id: 'spot_email_subscription_001', channel: 'email', pattern_family: 'subscription_renewal', difficulty: 3, ground_truth: 'scam', ai_amplified: false, drill_type: 'spot_flag',
    framing: 'A renewal notice arrived for streaming software.',
    spot_flag_options: [
      { id: 'call_to_cancel', label: 'Must call a phone number to cancel' },
      { id: 'high_renewal_price', label: 'Renewal price is much higher than usual' },
      { id: 'auto_renewal_mentioned', label: 'References auto-renewal policy' },
      { id: 'expires_soon', label: 'Subscription expires soon' }
    ],
    spot_flag_correct_id: 'call_to_cancel',
    message: { from_name: 'NexCloud Billing', from_handle: 'renew@nexcloud-billing-center.com', subject: 'Your NexCloud Annual Plan Renews Tomorrow - $299', body: 'Your NexCloud Annual Plan renews tomorrow for $299. If you did not authorize this, call us immediately to cancel:\n\n1-844-555-0129\n\nOur agents are available 24/7. Failure to call before midnight will result in the charge being processed.\n\nNexCloud Billing Center' },
    red_flags: [
      { id: 'call_to_cancel', label: 'Must call to cancel — callback trap setup' },
      { id: 'lookalike_domain', label: 'nexcloud-billing-center.com is not the real service site' },
      { id: 'midnight_pressure', label: 'Midnight deadline creates extreme urgency' },
      { id: 'high_amount', label: '$299 is high enough to trigger a call' }
    ],
    correct_red_flag_ids: ['call_to_cancel', 'lookalike_domain', 'midnight_pressure'],
    explanation: { short: 'The phone number connects to a scammer posing as billing support who will ask for payment information or remote computer access.', tells: ['Real services let you cancel through your account — never by calling a number in an email', 'The billing domain is not the real service provider', 'Midnight pressure forces panic over careful thinking', 'The agent will request card info or push remote access software to process your cancellation'], safe_move: 'Log into your actual account at the real service URL to check your subscription status.', consequence: 'You call the number and are asked for payment details to process the refund. Your card is then charged repeatedly.', behavioral_reinforcement: 'Cancel subscriptions through your account dashboard — never by calling a number in an unsolicited email.' },
    tags: ['callback_trap', 'subscription_scam', 'billing_fraud'], tricks: ['callback_trap', 'urgency', 'fear_lockout']
  },
  {
    id: 'spot_email_subscription_002', channel: 'email', pattern_family: 'subscription_renewal', difficulty: 3, ground_truth: 'scam', ai_amplified: false, drill_type: 'spot_flag',
    framing: 'A renewal notice for antivirus software arrived.',
    spot_flag_options: [
      { id: 'refund_if_unneeded', label: 'Offers a refund if you call within 24 hours' },
      { id: 'protection_active', label: 'Says your device is currently protected' },
      { id: 'already_charged', label: 'Claims you have already been charged' },
      { id: 'support_link', label: 'Provides a support link' }
    ],
    spot_flag_correct_id: 'already_charged',
    message: { from_name: 'SecureShield Support', from_handle: 'billing@secureshield-support.net', subject: 'Receipt: $399 SecureShield Renewal Processed', body: 'Your SecureShield Ultimate subscription has been renewed for $399. Your device is now protected for another year.\n\nIf you did not authorize this charge, call 1-866-555-0188 within 24 hours for a full refund.\n\nOrder ID: SSH-2024-88812\n\nSecureShield Billing' },
    red_flags: [
      { id: 'already_charged', label: 'Claims charge is already processed — creates urgency to call' },
      { id: 'refund_hook', label: 'Refund offer gets you on the phone with a scammer' },
      { id: 'not_a_real_service', label: 'No real antivirus subscription you recognize' },
      { id: 'lookalike_domain', label: 'secureshield-support.net is not a real software site' }
    ],
    correct_red_flag_ids: ['already_charged', 'refund_hook', 'not_a_real_service'],
    explanation: { short: 'The fake charge creates panic, the refund offer gets you on the phone, and the agent then takes your payment info or installs remote access software.', tells: ['The charge is fake — check your actual bank statement before calling anyone', 'The refund hook is designed to get you talking to a scammer posing as support', 'Real antivirus companies send renewal notices before charging, not receipts out of nowhere', 'The agent will request remote access to your computer to process the refund'], safe_move: 'Check your bank statement first. If no charge appears, it is a scam. If a charge does appear, dispute it through your bank directly.', consequence: 'You call and grant remote access. The agent steals passwords, installs malware, or makes additional charges.', behavioral_reinforcement: 'Verify charges on your actual bank statement before calling any number in an email about a charge.' },
    tags: ['callback_trap', 'tech_support_scam', 'fake_charge'], tricks: ['fear_lockout', 'callback_trap', 'remote_access']
  },
  {
    id: 'spot_email_subscription_003', channel: 'email', pattern_family: 'subscription_renewal', difficulty: 3, ground_truth: 'scam', ai_amplified: false, drill_type: 'spot_flag',
    framing: 'You got a notice about a streaming service you use.',
    spot_flag_options: [
      { id: 'update_payment_link', label: 'Asks you to update payment via a link' },
      { id: 'service_familiar', label: 'Service name seems familiar' },
      { id: 'correct_pricing', label: 'Price matches what you pay' },
      { id: 'account_info_shown', label: 'Partially shows account information' }
    ],
    spot_flag_correct_id: 'update_payment_link',
    message: { from_name: 'NovaMart Plus Billing', from_handle: 'billing@novamart-plus-account.com', subject: 'Payment Method Needs Updating - Service Pausing Soon', body: 'We were unable to process your NovaMart Plus renewal. To continue your membership without interruption, please update your payment method:\n\n[Update Payment Method]\n\nIf not updated within 3 days, your membership will pause and you will lose your saved lists and preferences.\n\nNovaMart Plus Team' },
    red_flags: [
      { id: 'update_payment_link', label: 'Update payment via a link in email — phishing setup' },
      { id: 'lookalike_domain', label: 'novamart-plus-account.com is not the real service domain' },
      { id: 'saved_data_threat', label: 'Threatens loss of preferences to add emotional stakes' },
      { id: 'no_account_specifics', label: 'No last four digits or account username shown' }
    ],
    correct_red_flag_ids: ['update_payment_link', 'lookalike_domain', 'no_account_specifics'],
    explanation: { short: 'Payment update links in emails lead to fake login pages — always update payment through the service\'s official app or website.', tells: ['Real services direct you to log in and update payment on their own platform', 'The domain novamart-plus-account.com is not the real service site', 'A legitimate payment failure notice always includes your account username or partial card', 'The preferences loss threat adds emotional pressure to act without scrutinizing the link'], safe_move: 'Go directly to the service website by typing it yourself and update payment there.', consequence: 'The link captures your login credentials or card number on a fake site.', behavioral_reinforcement: 'Update payment information by opening the service app yourself — never through a link in an email.' },
    tags: ['phishing', 'subscription_scam', 'credential_harvest'], tricks: ['lookalike_domain', 'fear_lockout', 'credential_harvest']
  },
  {
    id: 'spot_email_subscription_004', channel: 'email', pattern_family: 'subscription_renewal', difficulty: 3, ground_truth: 'scam', ai_amplified: false, drill_type: 'spot_flag',
    framing: 'A large renewal charge notice arrived this morning.',
    spot_flag_options: [
      { id: 'order_id_format', label: 'Order ID format looks generic or inconsistent' },
      { id: 'large_amount', label: 'Renewal amount is very large' },
      { id: 'phone_number_provided', label: 'Phone number to dispute the charge' },
      { id: 'product_name', label: 'Product name sounds official' }
    ],
    spot_flag_correct_id: 'phone_number_provided',
    message: { from_name: 'DataVault Support', from_handle: 'receipt@datavault-customer-billing.com', subject: 'Receipt Confirmation: $549 DataVault Pro Renewal', body: 'Thank you for your DataVault Pro renewal.\n\nOrder ID: DV-2025-110293\nAmount: $549.00\nDate: Today\n\nQuestions or to cancel within 48 hours: 1-877-555-0234\n\nDataVault Customer Billing' },
    red_flags: [
      { id: 'phone_number_provided', label: 'Prominently provides phone number to dispute — callback trap' },
      { id: 'unrecognized_charge', label: 'You have no DataVault subscription' },
      { id: 'lookalike_domain', label: 'datavault-customer-billing.com is not the real vendor' },
      { id: 'large_panic_amount', label: '$549 is large enough to create alarm and prompt a call' }
    ],
    correct_red_flag_ids: ['phone_number_provided', 'unrecognized_charge', 'lookalike_domain'],
    explanation: { short: 'The large fake charge is designed to make you call the number in a panic — that call goes to a scammer who will ask for your card to process the refund.', tells: ['Check your actual bank account — if no $549 charge appears, the email is a scam', 'Calling the provided number connects you with a fraud operation, not a real company', 'The 48-hour window creates urgency to call before thinking clearly', 'Real billing emails come from the actual service domain, not a hyphenated variant'], safe_move: 'Check your bank statement first. If no charge appears, ignore the email. If a charge does appear, call your bank directly using the number on your card.', consequence: 'You call and give your card number to reverse the charge. Your card is then used for actual fraudulent purchases.', behavioral_reinforcement: 'Always verify unexpected charges on your real bank statement before calling any number in an email.' },
    tags: ['callback_trap', 'fake_charge', 'billing_fraud'], tricks: ['callback_trap', 'urgency', 'fear_lockout']
  },

  // ── GOVERNMENT IMPERSONATION SPOT_FLAG (4) ──────────────────────────────
  {
    id: 'spot_sms_gov_001', channel: 'sms', pattern_family: 'government_impersonation', difficulty: 4, ground_truth: 'scam', ai_amplified: false, drill_type: 'spot_flag',
    framing: 'You got this text claiming to be from the IRS.',
    spot_flag_options: [
      { id: 'irs_texts_link', label: 'IRS sends you a text with a link' },
      { id: 'tax_refund_mentioned', label: 'Mentions a tax refund' },
      { id: 'amount_specific', label: 'Mentions a specific dollar amount' },
      { id: 'claim_deadline', label: 'Gives a deadline to claim' }
    ],
    spot_flag_correct_id: 'irs_texts_link',
    message: { from_name: 'IRS Refund Dept', from_handle: '+1 (202) 555-0183', subject: null, body: 'IRS ALERT: A refund of $1,240 is pending for your SSN. Claim at: irs-refund-secure.com within 72 hours or forfeit. Ref: IRS-2025-440' },
    red_flags: [
      { id: 'irs_texts_link', label: 'The IRS never contacts taxpayers by text message' },
      { id: 'lookalike_domain', label: 'irs-refund-secure.com is not irs.gov' },
      { id: 'ssn_reference', label: 'References your SSN to create authenticity feeling' },
      { id: 'forfeit_threat', label: 'Forfeit threat if you do not claim in 72 hours' }
    ],
    correct_red_flag_ids: ['irs_texts_link', 'lookalike_domain', 'forfeit_threat'],
    explanation: { short: 'The IRS never contacts taxpayers by text, email, or social media — only by physical mail.', tells: ['All legitimate IRS contact begins with a letter sent to your address on file', 'irs-refund-secure.com is a phishing site — the real site is irs.gov', 'Real refunds are deposited automatically or mailed as checks — they do not require you to claim them via a link', 'Tax refunds do not expire if you do not click a link'], safe_move: 'Ignore and delete. Check your real refund status at irs.gov directly.', consequence: 'The site captures your SSN, bank account, and personal details for identity theft and tax fraud.', behavioral_reinforcement: 'The IRS contacts you only by mail — any text or email claiming to be the IRS is always a scam.' },
    tags: ['irs', 'government_impersonation', 'tax_scam'], tricks: ['authority_impersonation', 'urgency', 'fear_lockout']
  },
  {
    id: 'spot_sms_gov_002', channel: 'sms', pattern_family: 'government_impersonation', difficulty: 4, ground_truth: 'scam', ai_amplified: false, drill_type: 'spot_flag',
    framing: 'A text arrived claiming to be from Social Security.',
    spot_flag_options: [
      { id: 'ssn_suspended', label: 'Claims your Social Security number is suspended' },
      { id: 'government_agency_named', label: 'Names a real government agency' },
      { id: 'call_required', label: 'Requires you to call a number immediately' },
      { id: 'legal_action_threatened', label: 'Threatens arrest or legal action' }
    ],
    spot_flag_correct_id: 'ssn_suspended',
    message: { from_name: 'SSA Office', from_handle: '+1 (800) 555-0291', subject: null, body: 'URGENT: Your Social Security Number has been suspended due to suspicious activity. An arrest warrant has been issued. Call 1-800-555-0291 immediately to resolve this matter and avoid legal action.' },
    red_flags: [
      { id: 'ssn_suspended', label: 'SSNs cannot be suspended — this is a fabricated threat' },
      { id: 'arrest_warrant_claim', label: 'Threat of arrest via text is always a scam' },
      { id: 'call_this_number', label: 'Directs you to call their number rather than SSA official line' },
      { id: 'urgency_and_fear', label: 'Combines legal threat with time pressure' }
    ],
    correct_red_flag_ids: ['ssn_suspended', 'arrest_warrant_claim', 'call_this_number'],
    explanation: { short: 'Social Security numbers cannot be suspended, and the SSA does not threaten arrest by text message — this is pure fear-based fraud.', tells: ['The SSA does not suspend Social Security numbers', 'Government agencies issue warrants through courts, not phone calls or texts', 'The SSA never threatens immediate arrest as a collection tactic', 'The callback number routes to a scammer posing as a government agent'], safe_move: 'Hang up or delete. If concerned, call the SSA directly at 1-800-772-1213.', consequence: 'Calling the number leads to a fake agent who demands gift cards or wire transfers to clear the warrant.', behavioral_reinforcement: 'Government agencies do not threaten arrest by text or phone — those calls are always scams.' },
    tags: ['ssa', 'government_impersonation', 'fear_tactic'], tricks: ['authority_impersonation', 'fear_lockout', 'urgency']
  },
  {
    id: 'spot_sms_gov_003', channel: 'sms', pattern_family: 'government_impersonation', difficulty: 4, ground_truth: 'scam', ai_amplified: false, drill_type: 'spot_flag',
    framing: 'You got this text about a toll balance.',
    spot_flag_options: [
      { id: 'toll_text_link', label: 'Toll authority sends a text with a payment link' },
      { id: 'small_amount', label: 'Amount owed is small and plausible' },
      { id: 'state_name_used', label: 'References your state name' },
      { id: 'late_fee_warning', label: 'Warns of a late fee' }
    ],
    spot_flag_correct_id: 'toll_text_link',
    message: { from_name: 'State Toll Services', from_handle: '+1 (312) 555-0177', subject: null, body: 'State Toll Services: You have an unpaid toll balance of $4.35. Pay now to avoid a $35 late fee: statetoll-payment.com/pay. Ref: TL-2024-91044' },
    red_flags: [
      { id: 'toll_text_link', label: 'Real toll authorities do not send texts with payment links' },
      { id: 'lookalike_domain', label: 'statetoll-payment.com is not a real toll authority site' },
      { id: 'small_bait_amount', label: 'Small $4.35 amount makes you less likely to scrutinize' },
      { id: 'large_penalty', label: '$35 late fee on $4.35 creates disproportionate urgency' }
    ],
    correct_red_flag_ids: ['toll_text_link', 'lookalike_domain', 'small_bait_amount'],
    explanation: { short: 'Toll authorities mail paper notices — they do not send texts with payment links to random phone numbers.', tells: ['Real toll notices arrive by mail or through your registered E-ZPass or toll account', 'The $4.35 bait amount is small enough you would not hesitate to pay without checking', 'The site captures your card number, not a $4.35 toll payment', 'Toll authorities use official state .gov domains for any online payments'], safe_move: 'Check your state toll authority\'s official website directly for any balance owed.', consequence: 'Your card number is captured. Small initial charge is followed by larger unauthorized transactions.', behavioral_reinforcement: 'Real toll balances are managed through your official toll account — never pay via a link in an unsolicited text.' },
    tags: ['toll_scam', 'government_impersonation', 'smishing'], tricks: ['small_dollar_bait', 'authority_impersonation', 'lookalike_domain']
  },
  {
    id: 'spot_email_gov_004', channel: 'email', pattern_family: 'government_impersonation', difficulty: 4, ground_truth: 'scam', ai_amplified: false, drill_type: 'spot_flag',
    framing: 'An email arrived claiming to be from USPS.',
    spot_flag_options: [
      { id: 'customs_fee_email', label: 'USPS emails you a customs fee to pay online' },
      { id: 'package_reference', label: 'References a package' },
      { id: 'tracking_number', label: 'Includes a tracking number' },
      { id: 'amount_small', label: 'Amount owed is under $5' }
    ],
    spot_flag_correct_id: 'customs_fee_email',
    message: { from_name: 'USPS Customs Notification', from_handle: 'customs@usps-customs-hold.com', subject: 'Package Held - Customs Fee Required: $2.99', body: 'Your international package has been held at customs. A fee of $2.99 is required for release.\n\nTracking: US9400111899223479\nPay at: usps-customs-hold.com/release\n\nPackage will be returned after 5 business days if fee is not paid.' },
    red_flags: [
      { id: 'customs_fee_email', label: 'USPS does not email customs fee requests with payment links' },
      { id: 'lookalike_domain', label: 'usps-customs-hold.com is not usps.com' },
      { id: 'small_bait_fee', label: '$2.99 bait fee — card capture is the real goal' },
      { id: 'return_threat', label: 'Return threat creates urgency to pay' }
    ],
    correct_red_flag_ids: ['customs_fee_email', 'lookalike_domain', 'small_bait_fee'],
    explanation: { short: 'USPS customs fees are handled through official USPS systems, not payment links in unsolicited emails.', tells: ['Real customs holds generate official USPS notices, not unsolicited emails', 'The domain usps-customs-hold.com is not affiliated with the US Postal Service', 'The $2.99 fee is designed to be low enough to pay without scrutiny while capturing your full card details', 'USPS tracking numbers follow specific formats — this one may be fabricated'], safe_move: 'Check usps.com directly using your actual tracking number if you are expecting a package.', consequence: 'Your card details are captured. The $2.99 charge is just the first of many unauthorized transactions.', behavioral_reinforcement: 'Manage all USPS deliveries through usps.com — never pay fees through links in emails.' },
    tags: ['usps', 'government_impersonation', 'delivery_scam'], tricks: ['authority_impersonation', 'small_dollar_bait', 'lookalike_domain']
  },

  // ── RENTAL HOUSING SPOT_FLAG (4) ─────────────────────────────────────────
  {
    id: 'spot_email_rental_001', channel: 'email', pattern_family: 'rental_housing', difficulty: 3, ground_truth: 'scam', ai_amplified: false, drill_type: 'spot_flag',
    framing: 'You are apartment hunting and found a great listing.',
    spot_flag_options: [
      { id: 'wire_deposit', label: 'Asks for a wire transfer deposit before viewing' },
      { id: 'below_market', label: 'Rent is significantly below market rate' },
      { id: 'landlord_overseas', label: 'Landlord is currently abroad' },
      { id: 'nice_photos', label: 'Listing has professional-quality photos' }
    ],
    spot_flag_correct_id: 'wire_deposit',
    message: { from_name: 'James Harrington', from_handle: 'j.harrington.property@gmail.com', subject: 'Re: 2BR Apartment Listing - $950/mo', body: 'Hello,\n\nThank you for your interest in the apartment. I am currently on a mission trip in Ghana and cannot show the property in person. I will mail you the keys once I receive the first month and deposit via wire transfer.\n\nBank: Granite Credit Union\nRouting: 021000089\nAccount: 4481009922\n\nPlease wire $1,900 and keys will arrive within 3 days.' },
    red_flags: [
      { id: 'wire_deposit', label: 'Requires wire transfer deposit before any viewing' },
      { id: 'landlord_overseas', label: 'Landlord is conveniently overseas and unavailable' },
      { id: 'keys_by_mail', label: 'Promises to mail keys after payment' },
      { id: 'gmail_landlord', label: 'Property owner using Gmail for a rental property' }
    ],
    correct_red_flag_ids: ['wire_deposit', 'landlord_overseas', 'keys_by_mail'],
    explanation: { short: 'Legitimate landlords never ask for a wire transfer deposit before you have visited the property.', tells: ['Scammers copy real listings and pose as absent landlords to collect deposits on properties they do not own', 'Wired money is gone immediately — there is no recourse once sent', 'No legitimate rental process involves mailing keys after a wire transfer from a stranger', 'The overseas mission story is a recurring pattern designed to explain the remote arrangement'], safe_move: 'Never pay a deposit without physically visiting the property and verifying the landlord owns it.', consequence: 'You wire $1,900. No keys arrive. The property either belongs to someone else or does not exist at the listed price.', behavioral_reinforcement: 'Never pay a rental deposit before visiting the property and verifying ownership — no exceptions.' },
    tags: ['rental_scam', 'wire_fraud', 'advance_fee'], tricks: ['advance_fee', 'authority_impersonation']
  },
  {
    id: 'spot_email_rental_002', channel: 'email', pattern_family: 'rental_housing', difficulty: 3, ground_truth: 'scam', ai_amplified: false, drill_type: 'spot_flag',
    framing: 'You inquired about a rental listing.',
    spot_flag_options: [
      { id: 'application_fee_upfront', label: 'Charges a large application fee before any interaction' },
      { id: 'multiple_applicants', label: 'Mentions many other applicants' },
      { id: 'quick_availability', label: 'Unit is available immediately' },
      { id: 'flexible_terms', label: 'Offers flexible lease terms' }
    ],
    spot_flag_correct_id: 'application_fee_upfront',
    message: { from_name: 'Westview Properties', from_handle: 'rentals@westview-properties-mgmt.net', subject: 'Application for Unit 4B - $150 Processing Fee Required', body: 'Thank you for your interest in Unit 4B. Due to high demand, we require a non-refundable $150 application processing fee to hold your spot in the queue before we can proceed.\n\nPay via CashLink to $westviewrentals. Once received, we will schedule your viewing.\n\nWestview Property Management' },
    red_flags: [
      { id: 'application_fee_upfront', label: 'Large non-refundable fee before you have even seen the unit' },
      { id: 'cashlink_payment', label: 'Rental application fee via CashLink — no accountability' },
      { id: 'viewing_after_payment', label: 'Viewing is scheduled after you pay, not before' },
      { id: 'non_refundable_framing', label: 'Non-refundable framing means you lose the money no matter what' }
    ],
    correct_red_flag_ids: ['application_fee_upfront', 'cashlink_payment', 'viewing_after_payment'],
    explanation: { short: 'Application fees for rentals you have never seen, paid via peer payment apps, are almost always scams.', tells: ['Legitimate application fees are charged after you tour the property and decide to apply', 'Real property managers use professional platforms — not personal CashLink accounts', 'A non-refundable fee before viewing means you have zero recourse if the unit does not exist', 'The high-demand framing creates artificial competition to pressure fast payment'], safe_move: 'Never pay a rental fee before visiting the property. Verify the management company through independent searches.', consequence: 'You pay $150 and either no viewing is ever scheduled, or the unit turns out to be unavailable.', behavioral_reinforcement: 'Tour first, pay fees after — any rental that requires payment before viewing is a scam.' },
    tags: ['rental_scam', 'application_fee', 'advance_fee'], tricks: ['advance_fee', 'urgency', 'social_proof']
  },
  {
    id: 'spot_email_rental_003', channel: 'email', pattern_family: 'rental_housing', difficulty: 3, ground_truth: 'scam', ai_amplified: false, drill_type: 'spot_flag',
    framing: 'A rental inquiry turned into this exchange.',
    spot_flag_options: [
      { id: 'listing_too_perfect', label: 'Listing is significantly nicer than anything in the price range' },
      { id: 'no_lease_mentioned', label: 'No mention of a formal lease' },
      { id: 'contact_by_text_only', label: 'Landlord only communicates by text' },
      { id: 'pet_friendly', label: 'Unit is described as pet friendly' }
    ],
    spot_flag_correct_id: 'listing_too_perfect',
    message: { from_name: 'Maria G.', from_handle: 'maria.g.rentals@gmail.com', subject: 'Re: Studio Rental $700/mo - Downtown', body: 'Hi! Yes the studio is still available. It is 650sqft, fully renovated kitchen and bath, in-unit laundry, rooftop access, and parking included — all for $700/mo. I just want a good tenant. No lease necessary for the first month, just pay and move in. When can you start?' },
    red_flags: [
      { id: 'listing_too_perfect', label: 'Luxury amenities at an impossibly low price' },
      { id: 'no_lease_mentioned', label: 'No lease for first month removes legal protection' },
      { id: 'pay_and_move_in', label: 'Pay and move in without any formal process' },
      { id: 'gmail_landlord', label: 'Property manager using Gmail with no business credentials' }
    ],
    correct_red_flag_ids: ['listing_too_perfect', 'no_lease_mentioned', 'pay_and_move_in'],
    explanation: { short: 'If a rental is dramatically underpriced with luxury features, it almost certainly does not exist at that price — the listing is stolen.', tells: ['Scammers copy photos from real listings and post them at below-market prices', 'No lease means no legal recourse when the property turns out to be unavailable', 'The willingness to skip formal process is designed to make you feel like a trusted tenant', 'You arrive to move in and find the property belongs to someone else or is already occupied'], safe_move: 'Search the listing photos using reverse image search. Visit the property before paying anything.', consequence: 'You pay first and last month\'s rent. The property is not available, and the person who took your money is unreachable.', behavioral_reinforcement: 'Prices that seem too good to be true are too good to be true — always reverse image search rental photos.' },
    tags: ['rental_scam', 'listing_fraud', 'advance_fee'], tricks: ['advance_fee', 'trust_then_pivot']
  },
  {
    id: 'spot_email_rental_004', channel: 'email', pattern_family: 'rental_housing', difficulty: 3, ground_truth: 'scam', ai_amplified: false, drill_type: 'spot_flag',
    framing: 'A property manager sent you lease documents.',
    spot_flag_options: [
      { id: 'e_sign_credential_harvest', label: 'Signing link requires creating an account with personal details' },
      { id: 'lease_attached', label: 'Lease is sent as an attachment' },
      { id: 'move_in_date_set', label: 'Move-in date is confirmed' },
      { id: 'deposit_amount_stated', label: 'Deposit amount is spelled out' }
    ],
    spot_flag_correct_id: 'e_sign_credential_harvest',
    message: { from_name: 'Lakeview Rentals', from_handle: 'leasing@lakeview-rentals-portal.com', subject: 'Your Lease is Ready to Sign - Unit 12C', body: 'Congratulations! Your application has been approved for Unit 12C.\n\nPlease sign your lease at the link below. You will need to create an account using your SSN and bank account number for identity verification before signing.\n\nlakeview-rentals-portal.com/sign\n\nLakeview Rentals Leasing Team' },
    red_flags: [
      { id: 'e_sign_credential_harvest', label: 'Lease signing requires SSN and bank account upfront' },
      { id: 'ssn_for_esign', label: 'Real e-sign platforms do not require your SSN to sign' },
      { id: 'bank_account_for_esign', label: 'Bank account number is not needed to sign a digital document' },
      { id: 'lookalike_domain', label: 'lakeview-rentals-portal.com may not be the real property site' }
    ],
    correct_red_flag_ids: ['e_sign_credential_harvest', 'ssn_for_esign', 'bank_account_for_esign'],
    explanation: { short: 'Lease signing platforms like DocuSign require only your name and email — never your SSN or bank account number.', tells: ['Legitimate e-signature platforms identify signers by email, not SSN', 'Collecting SSN and bank details under the guise of identity verification is identity theft', 'Real property portals use established e-sign services, not custom portals', 'Once submitted, your SSN and account number enable immediate identity and financial fraud'], safe_move: 'Contact the real property management company through a number you find independently to verify the signing process.', consequence: 'Your SSN and bank account number are used to open fraudulent credit accounts and drain your bank.', behavioral_reinforcement: 'E-signature platforms only need your email — never provide your SSN or bank account to sign a document online.' },
    tags: ['rental_scam', 'identity_theft', 'credential_harvest'], tricks: ['credential_harvest', 'authority_impersonation']
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
