#!/usr/bin/env node
import * as fs from "fs";
import * as path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const drillsPath = path.join(__dirname, "../data/drills.json");

const BR = "No exchange, wallet, or blockchain network ever contacts you about claiming rewards, rescuing funds, or fixing wallet errors — any unsolicited crypto contact is a theft attempt.";

const newDrills = [
  // ─── CRYPTO_WALLET SCAM (16) ─────────────────────────────────────────────
  {
    id: "email_crypto_scam_001",
    channel: "email",
    pattern_family: "crypto_wallet",
    difficulty: 3,
    ground_truth: "scam",
    context: "personal",
    ai_amplified: true,
    message: {
      from_name: "VaultX Security",
      from_handle: "security@vaultx-account-alert.com",
      subject: "Urgent: Your VaultX account has been flagged for suspicious activity",
      body: "Dear VaultX Member,\n\nOur security systems have detected unusual login activity on your account. To protect your funds, your account withdrawals have been temporarily suspended.\n\nTo restore full access and verify your identity, please complete verification within 24 hours:\n\n[Verify My Account]\n\nFailure to verify may result in permanent account restriction and forfeiture of funds.\n\nVaultX Security Team"
    },
    red_flags: [
      { id: "lookalike_domain", label: "Lookalike sender domain (vaultx-account-alert.com)" },
      { id: "fund_forfeiture_threat", label: "Threat of fund forfeiture" },
      { id: "urgency_24hr", label: "24-hour verification deadline" },
      { id: "withdrawal_suspension_claim", label: "Fabricated account suspension claim" }
    ],
    correct_red_flag_ids: ["lookalike_domain", "fund_forfeiture_threat", "urgency_24hr", "withdrawal_suspension_claim"],
    explanation: {
      short: "VaultX's real domain is vaultx.com — 'vaultx-account-alert.com' is a phishing domain designed to steal your login credentials.",
      tells: [
        "'vaultx-account-alert.com' is not vaultx.com — extra words after a hyphen signal a fake",
        "Threatening fund forfeiture is designed to override rational skepticism",
        "Real exchange security actions are shown when you attempt to log in — not via email-only notices",
        "The 'Verify My Account' link leads to a fake VaultX login page"
      ],
      safe_move: "Go directly to vaultx.com and log in. If there's a real restriction, you'll see it there. Do not click this email link.",
      consequence: "Entering your credentials on the fake page gives the attacker immediate access to your VaultX account and any crypto holdings.",
      behavioral_reinforcement: BR
    },
    tags: ["phishing", "credential_theft", "impersonation", "urgency", "ai_amplified"]
  },
  {
    id: "dm_crypto_scam_001",
    channel: "dm",
    pattern_family: "crypto_wallet",
    difficulty: 1,
    ground_truth: "scam",
    context: "personal",
    ai_amplified: false,
    message: {
      from_name: "CryptoAlpha_Official",
      from_handle: "@cryptoalpha_returns",
      subject: null,
      body: "Send 0.05 ETH to this address and I'll send back 0.15 ETH within 1 hour. Limited spots — I'm doing this to grow the community. This is 100% real, check my profile."
    },
    red_flags: [
      { id: "guaranteed_return", label: "Guaranteed crypto return (3x)" },
      { id: "send_first", label: "Required to send crypto first" },
      { id: "limited_spots_urgency", label: "False scarcity ('limited spots')" }
    ],
    correct_red_flag_ids: ["guaranteed_return", "send_first"],
    explanation: {
      short: "No one gives away cryptocurrency — 'send crypto to get more back' is the oldest and most common crypto scam.",
      tells: [
        "Any guaranteed return on crypto sent to a stranger is a scam — no exceptions",
        "Crypto transactions are irreversible; once you send, there is no recovery",
        "'Check my profile' is designed to build false credibility — followers can be bought",
        "'Limited spots' creates urgency to prevent you from thinking it through"
      ],
      safe_move: "Ignore and block. Never send crypto to anyone promising to multiply it.",
      consequence: "You send 0.05 ETH. The sender disappears. The transaction is final and unrecoverable.",
      behavioral_reinforcement: BR
    },
    tags: ["crypto_giveaway", "advance_fee", "too_good_to_be_true"]
  },
  {
    id: "sms_crypto_scam_001",
    channel: "sms",
    pattern_family: "crypto_wallet",
    difficulty: 3,
    ground_truth: "scam",
    context: "personal",
    ai_amplified: false,
    message: {
      from_name: "VaultX",
      from_handle: "+1 (888) 555-0134",
      subject: null,
      body: "VaultX: Your 2FA code is 847291. This code was requested from a new device. If this wasn't you, cancel access here: vaultx-secure-auth.net/cancel"
    },
    red_flags: [
      { id: "lookalike_domain", label: "Lookalike domain in 'cancel' link (vaultx-secure-auth.net)" },
      { id: "sms_from_phone_not_shortcode", label: "VaultX sends 2FA via short codes, not random numbers" },
      { id: "action_link_in_2fa_message", label: "Real 2FA codes never include action links" }
    ],
    correct_red_flag_ids: ["lookalike_domain", "action_link_in_2fa_message"],
    explanation: {
      short: "Legitimate 2FA messages contain only the code — they never include links to 'cancel' or 'secure' anything.",
      tells: [
        "Real 2FA SMS messages are only the code — no links, no extra instructions",
        "'vaultx-secure-auth.net' is not vaultx.com",
        "This is a real-time phishing attack: someone is on vaultx.com entering your email, triggering a real 2FA code, and waiting for you to panic-click the cancel link",
        "The attacker uses your panic click on the 'cancel' link to submit the real code themselves"
      ],
      safe_move: "Never click links in 2FA messages. If you didn't initiate a login, change your password at vaultx.com directly.",
      consequence: "Clicking 'cancel' submits the real 2FA code to the attacker's login attempt. They gain access to your account and can immediately transfer your holdings.",
      behavioral_reinforcement: BR
    },
    tags: ["2fa_intercept", "phishing", "real_time_attack", "link"]
  },
  {
    id: "email_crypto_scam_002",
    channel: "email",
    pattern_family: "crypto_wallet",
    difficulty: 2,
    ground_truth: "scam",
    context: "personal",
    ai_amplified: true,
    message: {
      from_name: "VaultX Rewards",
      from_handle: "rewards@vaultx-airdrop-claim.io",
      subject: "You have an unclaimed airdrop: 0.08 BTC — claim before expiry",
      body: "Congratulations!\n\nAs a VaultX account holder, you've been allocated 0.08 BTC ($3,840) as part of our 5th Anniversary Airdrop. This allocation expires in 48 hours.\n\nTo claim your airdrop:\n1. Visit: vaultx-airdrop-claim.io/claim\n2. Connect your wallet\n3. Confirm the transaction\n\nNote: A small network fee of $45 is required to process the claim.\n\nVaultX Rewards Team"
    },
    red_flags: [
      { id: "lookalike_domain", label: "Lookalike domain (vaultx-airdrop-claim.io)" },
      { id: "fee_to_claim_reward", label: "Fee required to claim a reward" },
      { id: "wallet_connection_required", label: "Connecting wallet to unknown site" },
      { id: "urgency_48hr", label: "48-hour expiry on free money" }
    ],
    correct_red_flag_ids: ["lookalike_domain", "fee_to_claim_reward", "wallet_connection_required"],
    explanation: {
      short: "Real airdrops never require a fee to claim — the 'network fee' is the scam mechanism, and 'connecting your wallet' gives attackers access.",
      tells: [
        "'vaultx-airdrop-claim.io' is not vaultx.com — the .io TLD and extra words signal a fake",
        "Legitimate airdrops are distributed automatically — you don't pay to receive free crypto",
        "Connecting your wallet to an unknown site can grant it permission to drain your holdings",
        "The $45 fee is the actual theft — there is no 0.08 BTC"
      ],
      safe_move: "Check your actual VaultX account dashboard. If no airdrop appears there, this email is fake.",
      consequence: "You pay the $45 'network fee' and lose it. Or you connect your wallet and the site executes a malicious transaction draining your holdings.",
      behavioral_reinforcement: BR
    },
    tags: ["airdrop_scam", "fee_to_claim", "wallet_drain", "urgency", "ai_amplified"]
  },
  {
    id: "dm_crypto_scam_002",
    channel: "dm",
    pattern_family: "crypto_wallet",
    difficulty: 3,
    ground_truth: "scam",
    context: "personal",
    ai_amplified: true,
    message: {
      from_name: "Sarah_Crypto",
      from_handle: "@sarah_crypto_trader",
      subject: null,
      body: "Hey! I've been using this trading platform called CoinEdge for 6 months and made $47K. It's not well known yet which is why the returns are so good. I can show you my portfolio if you're interested — I know it sounds too good but I have proof. Just DM me back."
    },
    red_flags: [
      { id: "unsolicited_investment_pitch", label: "Unsolicited high-return investment pitch" },
      { id: "proof_offer", label: "'I have proof' to pre-empt skepticism" },
      { id: "unknown_platform", label: "Platform you've never heard of with unusually high returns" }
    ],
    correct_red_flag_ids: ["unsolicited_investment_pitch", "unknown_platform"],
    explanation: {
      short: "The 'pig butchering' scam: build trust, show fake profits, get you to invest, then take everything.",
      tells: [
        "Unsolicited investment advice from strangers is always a red flag regardless of how casual it sounds",
        "'It's not well known yet' is why the returns are supposedly good — this is how all pig-butchering scams begin",
        "'I have proof' — screenshots of fake dashboards are trivially easy to fabricate",
        "The platform exists to show you impressive fake gains until you've invested enough to steal"
      ],
      safe_move: "Do not engage. Block and report. Legitimate trading platforms don't recruit via cold DMs.",
      consequence: "You invest a small amount, see fake gains, invest more. Eventually you try to withdraw — the platform charges fees you must pay first. Every fee disappears. The platform vanishes.",
      behavioral_reinforcement: BR
    },
    tags: ["pig_butchering", "investment_fraud", "social_engineering", "ai_amplified"]
  },
  {
    id: "email_crypto_scam_003",
    channel: "email",
    pattern_family: "crypto_wallet",
    difficulty: 3,
    ground_truth: "scam",
    context: "personal",
    ai_amplified: false,
    message: {
      from_name: "Wallet Security Alert",
      from_handle: "alert@crypto-wallet-protection.net",
      subject: "Critical: Your wallet has been compromised — download patch immediately",
      body: "URGENT SECURITY NOTICE\n\nOur monitoring systems have detected that your crypto wallet may be vulnerable to a critical exploit currently targeting users.\n\nYou must download and install the WalletGuard patch immediately to protect your funds:\n[Download Security Patch]\n\nDo not access your wallet until the patch is installed. Failure to act within 6 hours may result in complete fund loss.\n\nCrypto Wallet Protection Team"
    },
    red_flags: [
      { id: "third_party_security_alert", label: "Unknown third-party claiming to monitor your wallet" },
      { id: "download_malware", label: "Download requested via emailed link" },
      { id: "urgency_6hr", label: "6-hour fund loss threat" },
      { id: "vague_wallet_reference", label: "No specific wallet or exchange named" }
    ],
    correct_red_flag_ids: ["third_party_security_alert", "download_malware", "urgency_6hr"],
    explanation: {
      short: "No legitimate security team monitors your private wallet — this email is delivering malware disguised as a 'security patch.'",
      tells: [
        "No third party can monitor your private crypto wallet — that's the entire point of self-custody",
        "The sender 'crypto-wallet-protection.net' is not affiliated with any real wallet or exchange",
        "Downloading a 'patch' from an emailed link installs malware designed to steal your wallet keys",
        "The 6-hour threat prevents you from verifying the claim with your actual wallet provider"
      ],
      safe_move: "Delete the email. Check your wallet provider's official website for any real security notices.",
      consequence: "The 'patch' is a keylogger or wallet-draining malware. Once installed, it scans for wallet files and seed phrases, and empties your holdings.",
      behavioral_reinforcement: BR
    },
    tags: ["malware", "fake_security_alert", "urgency", "download"]
  },
  {
    id: "sms_crypto_scam_002",
    channel: "sms",
    pattern_family: "crypto_wallet",
    difficulty: 2,
    ground_truth: "scam",
    context: "personal",
    ai_amplified: false,
    message: {
      from_name: "VaultX",
      from_handle: "+1 (512) 555-0165",
      subject: null,
      body: "URGENT: VaultX has frozen your account due to suspected money laundering. To avoid permanent closure and legal action, verify your identity immediately: vaultx-compliance.net/verify"
    },
    red_flags: [
      { id: "legal_threat", label: "Legal action / money laundering threat" },
      { id: "lookalike_domain", label: "Lookalike domain (vaultx-compliance.net)" },
      { id: "sms_from_phone_not_shortcode", label: "VaultX communicates via registered channels, not random numbers" }
    ],
    correct_red_flag_ids: ["legal_threat", "lookalike_domain"],
    explanation: {
      short: "Legal threats via SMS from unknown numbers are engineered panic — real compliance actions come through verified channels.",
      tells: [
        "Real exchanges communicate compliance issues through your registered email and in-app, not SMS from random numbers",
        "'vaultx-compliance.net' is not vaultx.com",
        "Money laundering accusations are designed to create panic that bypasses rational verification",
        "If VaultX had a real compliance issue with your account, it would appear when you try to log in"
      ],
      safe_move: "Log in to vaultx.com directly. If there's a real restriction, you'll see it there.",
      consequence: "The link harvests your VaultX credentials. The attacker drains your account before you realize the original message was fake.",
      behavioral_reinforcement: BR
    },
    tags: ["legal_threat", "phishing", "impersonation", "urgency"]
  },
  {
    id: "dm_crypto_scam_003",
    channel: "dm",
    pattern_family: "crypto_wallet",
    difficulty: 3,
    ground_truth: "scam",
    context: "personal",
    ai_amplified: true,
    message: {
      from_name: "Blockchain_Help",
      from_handle: "@blockchain_user_4892",
      subject: null,
      body: "Hi, I think I accidentally sent 0.2 ETH to your wallet address. I can share the transaction hash to prove it. I know it's a lot to ask but is there any way you could send it back? I'm happy to cover gas fees. This was money for my daughter's medical bills."
    },
    red_flags: [
      { id: "accidental_send_story", label: "'I accidentally sent you crypto' story" },
      { id: "emotional_manipulation", label: "Medical/family emergency emotional appeal" },
      { id: "send_back_request", label: "Request to send back crypto you allegedly received" }
    ],
    correct_red_flag_ids: ["accidental_send_story", "send_back_request"],
    explanation: {
      short: "The 'accidental crypto send' story is a setup: the transaction hash is fake or from a different address, and any crypto you 'return' goes straight to the scammer.",
      tells: [
        "Check your wallet — you almost certainly received nothing",
        "Transaction hashes can be fabricated screenshots or can show a transfer to a completely different address",
        "The emotional appeal (medical bills) is designed to bypass your skepticism and rush the decision",
        "Even if you did receive something, the 'accidental send' may itself be the lure for a more complex scam"
      ],
      safe_move: "Check your actual wallet transaction history. If nothing arrived, ignore the DM. If something did arrive, consult a crypto security expert before doing anything.",
      consequence: "You send 'back' the amount they claim. They disappear. No refund of your gas fees, no gratitude — just lost crypto.",
      behavioral_reinforcement: BR
    },
    tags: ["social_engineering", "fake_transaction", "emotional_manipulation", "ai_amplified"]
  },
  {
    id: "email_crypto_scam_004",
    channel: "email",
    pattern_family: "crypto_wallet",
    difficulty: 3,
    ground_truth: "scam",
    context: "personal",
    ai_amplified: false,
    message: {
      from_name: "NovaMint NFT Marketplace",
      from_handle: "invite@novamint-nft-launch.com",
      subject: "Exclusive NFT drop invitation — connect your wallet to claim",
      body: "You've been selected for early access to the NovaMint NFT drop. Only 500 spots available.\n\nTo claim your free NFT:\n1. Connect your crypto wallet at novamint-nft-launch.com\n2. Approve the minting transaction\n3. Your NFT will appear in your wallet within minutes\n\nThis invitation expires in 4 hours.\n\nNovaMint Team"
    },
    red_flags: [
      { id: "unsolicited_nft_invitation", label: "Unsolicited NFT claim invitation" },
      { id: "connect_wallet_to_unknown_site", label: "Connect wallet to unfamiliar domain" },
      { id: "approve_transaction", label: "Approve transaction on unknown site" },
      { id: "urgency_4hr", label: "4-hour expiry on 'free' NFT" }
    ],
    correct_red_flag_ids: ["unsolicited_nft_invitation", "connect_wallet_to_unknown_site", "approve_transaction"],
    explanation: {
      short: "Connecting your wallet to an unknown site and approving a 'minting transaction' can grant it permission to drain all your holdings.",
      tells: [
        "You were never signed up for a NovaMint early access list — unsolicited 'selected' emails are always scams",
        "Connecting your wallet to novamint-nft-launch.com exposes it to malicious contracts",
        "The 'approve the minting transaction' step is where you unknowingly sign a transaction draining your wallet",
        "The 4-hour urgency stops you from researching whether NovaMint is legitimate"
      ],
      safe_move: "Never connect your wallet to a site you received via unsolicited email. Research the project independently first.",
      consequence: "The 'approve transaction' step executes a malicious smart contract that transfers all approved tokens from your wallet to the attacker.",
      behavioral_reinforcement: BR
    },
    tags: ["nft_scam", "wallet_drain", "smart_contract", "urgency"]
  },
  {
    id: "dm_crypto_scam_004",
    channel: "dm",
    pattern_family: "crypto_wallet",
    difficulty: 1,
    ground_truth: "scam",
    context: "personal",
    ai_amplified: false,
    message: {
      from_name: "WalletHelper",
      from_handle: "@wallet_recovery_support",
      subject: null,
      body: "Hi, I can see your wallet has an error causing your funds to be locked. I'm a certified blockchain recovery specialist. To fix this I'll need your 12-word seed phrase so I can push the recovery transaction."
    },
    red_flags: [
      { id: "seed_phrase_request", label: "Requesting your seed phrase" },
      { id: "unsolicited_wallet_help", label: "Unsolicited 'wallet recovery specialist'" },
      { id: "fabricated_wallet_error", label: "Claims to detect a wallet error remotely" }
    ],
    correct_red_flag_ids: ["seed_phrase_request", "unsolicited_wallet_help"],
    explanation: {
      short: "Your seed phrase is the master key to your entire wallet. Sharing it with anyone means instant and total loss of everything in it.",
      tells: [
        "No one can see your wallet 'has an error' remotely — that's not how blockchain wallets work",
        "There is no such thing as a 'certified blockchain recovery specialist' who needs your seed phrase",
        "Anyone who asks for your seed phrase, recovery phrase, or private key is attempting to steal your funds",
        "Giving your seed phrase is the same as handing someone all your cash and both keys to your house"
      ],
      safe_move: "Never share your seed phrase with anyone, ever, under any circumstances.",
      consequence: "You share the seed phrase. The attacker imports your wallet on their device and immediately transfers every asset you hold to an address they control.",
      behavioral_reinforcement: BR
    },
    tags: ["seed_phrase", "social_engineering", "wallet_theft", "impersonation"]
  },
  {
    id: "email_crypto_scam_005",
    channel: "email",
    pattern_family: "crypto_wallet",
    difficulty: 4,
    ground_truth: "scam",
    context: "personal",
    ai_amplified: true,
    message: {
      from_name: "CryptoTax Pro",
      from_handle: "compliance@cryptotax-sync.com",
      subject: "Sync your VaultX account for 2025 tax reporting — deadline approaching",
      body: "Hi,\n\nAs crypto tax reporting requirements expand, we're helping VaultX users stay compliant. CryptoTax Pro can automatically generate your tax forms by connecting directly to your VaultX account.\n\nTo sync:\n1. Authorize CryptoTax Pro at cryptotax-sync.com/vaultx\n2. Grant read-only access to your transaction history\n3. Download your pre-filled forms\n\nNote: This is separate from VaultX's native tax tools and provides more detailed reporting.\n\n— CryptoTax Pro Compliance Team"
    },
    red_flags: [
      { id: "lookalike_domain", label: "Lookalike domain (cryptotax-sync.com)" },
      { id: "authorize_vaultx_via_third_party", label: "Authorizing VaultX access through a third-party site" },
      { id: "tax_urgency_hook", label: "Tax deadline used as urgency hook" }
    ],
    correct_red_flag_ids: ["lookalike_domain", "authorize_vaultx_via_third_party"],
    explanation: {
      short: "Legitimate tax tools integrate via VaultX's own API settings page — not via unsolicited emails linking to third-party authorization sites.",
      tells: [
        "'cryptotax-sync.com' is not VaultX's domain — legitimate integrations are set up from within your exchange account",
        "Real crypto tax software (like Koinly or CoinTracker) requires you to connect from within their verified app — not via emailed links",
        "The 'read-only access' framing sounds safe but the authorization endpoint may request broader permissions than stated",
        "Tax deadline urgency is a common hook for crypto phishing around Q1 every year"
      ],
      safe_move: "Use VaultX's built-in tax export tools, or connect verified tax software only from within the official VaultX API settings page.",
      consequence: "Authorizing via the link grants the attacker OAuth-style access to your VaultX transaction history and potentially your account itself.",
      behavioral_reinforcement: BR
    },
    tags: ["phishing", "oauth", "tax_hook", "impersonation", "ai_amplified"]
  },
  {
    id: "sms_crypto_scam_003",
    channel: "sms",
    pattern_family: "crypto_wallet",
    difficulty: 3,
    ground_truth: "scam",
    context: "personal",
    ai_amplified: false,
    message: {
      from_name: "VaultX",
      from_handle: "+1 (949) 555-0112",
      subject: null,
      body: "VaultX: Your withdrawal of 0.15 BTC is on hold. Complete identity verification to release: vaultx-id-verify.net/complete. Expires in 2 hours."
    },
    red_flags: [
      { id: "lookalike_domain", label: "Lookalike domain (vaultx-id-verify.net)" },
      { id: "fabricated_withdrawal_hold", label: "Fabricated pending withdrawal claim" },
      { id: "urgency_2hr", label: "2-hour expiry" },
      { id: "sms_from_random_number", label: "VaultX uses email for account alerts, not random numbers" }
    ],
    correct_red_flag_ids: ["lookalike_domain", "fabricated_withdrawal_hold"],
    explanation: {
      short: "If you have no pending withdrawal, this is a completely fabricated claim to get you to click the link.",
      tells: [
        "Check VaultX directly — if you didn't initiate a withdrawal, there is no hold",
        "'vaultx-id-verify.net' is not vaultx.com",
        "VaultX account alerts go to your registered email, not SMS from random 10-digit numbers",
        "The 2-hour expiry is urgency pressure to prevent verification"
      ],
      safe_move: "Log in to vaultx.com directly. If there's no pending withdrawal, delete this message.",
      consequence: "The link leads to a fake VaultX KYC page that collects your government ID and selfie — or directly harvests your login credentials.",
      behavioral_reinforcement: BR
    },
    tags: ["phishing", "fabricated_hold", "impersonation", "urgency"]
  },
  {
    id: "dm_crypto_scam_005",
    channel: "dm",
    pattern_family: "crypto_wallet",
    difficulty: 2,
    ground_truth: "scam",
    context: "personal",
    ai_amplified: false,
    message: {
      from_name: "CryptoSignals_VIP",
      from_handle: "@crypto_signals_vip",
      subject: null,
      body: "Join our private trading group — verified traders only. Minimum $200 USDT deposit to unlock signals. Our members averaged +340% last month. Limited slots. DM for deposit address."
    },
    red_flags: [
      { id: "deposit_to_join", label: "Deposit required to access trading signals" },
      { id: "guaranteed_returns", label: "Specific guaranteed return claim (+340%)" },
      { id: "dm_for_wallet_address", label: "'DM for deposit address' — unverifiable recipient" }
    ],
    correct_red_flag_ids: ["deposit_to_join", "guaranteed_returns"],
    explanation: {
      short: "Legitimate trading communities don't charge crypto deposits — and no one is averaging +340% monthly returns.",
      tells: [
        "Any group requiring upfront crypto payment has no accountability or recourse if they take it",
        "+340% monthly returns would make this group the most profitable trading operation in history — it's fiction",
        "'DM for deposit address' means no paper trail, no platform accountability",
        "These groups exist solely to collect the entry fee and disappear, or to pump assets the organizers already hold"
      ],
      safe_move: "Block and report. Never pay crypto deposits to join investment or signal groups from cold DMs.",
      consequence: "You deposit $200 USDT. Either the group disappears immediately, or you receive 'signals' designed to pump assets the scammer holds before dumping them on you.",
      behavioral_reinforcement: BR
    },
    tags: ["investment_fraud", "advance_fee", "trading_group", "pump_and_dump"]
  },
  {
    id: "email_crypto_scam_006",
    channel: "email",
    pattern_family: "crypto_wallet",
    difficulty: 4,
    ground_truth: "scam",
    context: "personal",
    ai_amplified: true,
    message: {
      from_name: "VaultX Platform Team",
      from_handle: "platform@vaultx-updates.io",
      subject: "Important: Wallet security update required before March 1",
      body: "Dear VaultX user,\n\nFollowing our infrastructure upgrade to enhanced encryption standards, all users must complete a one-time wallet migration by March 1, 2026 to maintain access to their funds.\n\nThe migration takes 2 minutes:\n1. Log in at vaultx-updates.io/migrate\n2. Confirm your wallet details\n3. Your funds will be migrated automatically\n\nAccounts not migrated by the deadline will have withdrawals suspended until completion.\n\nVaultX Platform Team"
    },
    red_flags: [
      { id: "lookalike_domain", label: "Lookalike domain (vaultx-updates.io)" },
      { id: "wallet_migration_required", label: "Mandatory wallet migration via emailed link" },
      { id: "deadline_fund_freeze", label: "Withdrawal suspension threat for non-compliance" }
    ],
    correct_red_flag_ids: ["lookalike_domain", "wallet_migration_required", "deadline_fund_freeze"],
    explanation: {
      short: "Exchanges handle infrastructure upgrades server-side — they never require users to 'migrate their wallet' via an emailed link.",
      tells: [
        "'vaultx-updates.io' is not vaultx.com — .io TLD and extra words are a fake domain pattern",
        "Real exchange upgrades are transparent and don't require individual users to migrate wallets by deadline",
        "'Confirm your wallet details' on the fake page means entering your login credentials",
        "Withdrawal suspension threat is the urgency mechanism to override rational skepticism"
      ],
      safe_move: "Go to vaultx.com and log in. Any real migration requirement would be displayed prominently in your account.",
      consequence: "Entering your credentials on vaultx-updates.io hands them directly to the attacker. Your account is drained before you realize the email was fake.",
      behavioral_reinforcement: BR
    },
    tags: ["phishing", "credential_theft", "impersonation", "urgency", "ai_amplified"]
  },
  {
    id: "sms_crypto_scam_004",
    channel: "sms",
    pattern_family: "crypto_wallet",
    difficulty: 2,
    ground_truth: "scam",
    context: "personal",
    ai_amplified: false,
    message: {
      from_name: "CryptoPulse",
      from_handle: "+1 (702) 555-0141",
      subject: null,
      body: "ALERT: CryptoPulse Token (CPT) listing on VaultX in 6 hours. Early investors guaranteed 8x returns. Buy now before listing: bit.do/cpt-buy. Limited supply."
    },
    red_flags: [
      { id: "guaranteed_returns", label: "Guaranteed 8x return claim" },
      { id: "shortened_url", label: "Shortened/obfuscated URL" },
      { id: "unsolicited_investment_sms", label: "Unsolicited investment tip via SMS" },
      { id: "pump_setup", label: "'Buy before listing' pump setup" }
    ],
    correct_red_flag_ids: ["guaranteed_returns", "shortened_url", "unsolicited_investment_sms"],
    explanation: {
      short: "Unsolicited 'buy before listing' crypto tips are pump-and-dump setups — the organizers already hold the token.",
      tells: [
        "No investment guarantees 8x returns — any message claiming guaranteed returns is fraudulent",
        "Shortened URLs hide the real destination — never click shortened links in investment SMS",
        "Unsolicited investment tips via SMS have a 100% fraud rate",
        "The organizers hold CPT and need buyers to inflate the price before they dump their holdings"
      ],
      safe_move: "Delete and ignore. Never invest based on unsolicited SMS tips.",
      consequence: "You buy CPT at an inflated price. The organizers dump their holdings immediately after the artificial price peak. CPT crashes. Your investment is worthless.",
      behavioral_reinforcement: BR
    },
    tags: ["pump_and_dump", "investment_fraud", "shortened_url", "unsolicited"]
  },
  {
    id: "dm_crypto_scam_006",
    channel: "dm",
    pattern_family: "crypto_wallet",
    difficulty: 3,
    ground_truth: "scam",
    context: "personal",
    ai_amplified: false,
    message: {
      from_name: "VaultX_Support_Official",
      from_handle: "@vaultx_support_official_1",
      subject: null,
      body: "Hi, I'm a community manager for VaultX. We detected an issue with your account from your recent activity. I can help you resolve this and prevent fund loss, but I'll need you to confirm your account email and the last 4 digits of your verification code to get started."
    },
    red_flags: [
      { id: "unsolicited_support_dm", label: "Unsolicited 'support' DM from unverified account" },
      { id: "verification_info_request", label: "Requesting account email and verification code" },
      { id: "suspicious_handle", label: "Handle with trailing number (not official)" }
    ],
    correct_red_flag_ids: ["unsolicited_support_dm", "verification_info_request"],
    explanation: {
      short: "Real exchange support never contacts you first via DM — especially to ask for account or verification details.",
      tells: [
        "'@vaultx_support_official_1' — the trailing '1' means this is an impersonator, not the real account",
        "VaultX support operates through official in-app tickets and email — never cold DMs",
        "Requesting your account email and verification code is a step in account takeover",
        "They claimed to detect an issue 'from your recent activity' — this is a vague hook designed to sound plausible"
      ],
      safe_move: "Ignore the DM. Contact VaultX support only through vaultx.com. Never share account details in DMs.",
      consequence: "Providing your email and verification code gives the attacker everything they need to initiate account recovery and take over your VaultX account.",
      behavioral_reinforcement: BR
    },
    tags: ["impersonation", "social_engineering", "account_takeover", "fake_support"]
  },

  // ─── CRYPTO_WALLET LEGIT (4) ─────────────────────────────────────────────
  {
    id: "email_crypto_legit_001",
    channel: "email",
    pattern_family: "crypto_wallet",
    difficulty: 3,
    ground_truth: "legit",
    context: "personal",
    ai_amplified: false,
    message: {
      from_name: "VaultX",
      from_handle: "no-reply@vaultx.com",
      subject: "Withdrawal confirmed: 0.05 BTC sent",
      body: "Hi Jordan,\n\nYour withdrawal has been processed.\n\nAmount: 0.05 BTC\nDestination: bc1q...4a2f (your saved address)\nTransaction ID: 7f3a9...d81c\nStatus: Confirmed\n\nThis withdrawal was initiated by you on Feb 14 at 2:11 PM from your registered device.\n\nIf you didn't initiate this, contact support immediately at vaultx.com/support\n\nVaultX"
    },
    red_flags: [
      { id: "withdrawal_notification", label: "Withdrawal confirmation email" },
      { id: "contains_link", label: "Contains a support link" }
    ],
    correct_red_flag_ids: [],
    explanation: {
      short: "A real VaultX withdrawal confirmation from the official domain — shows your specific details and how to dispute if needed.",
      tells: [
        "Sender is no-reply@vaultx.com — the real domain",
        "Shows the specific amount, destination address (abbreviated), and transaction ID you can verify on-chain",
        "References the exact time and device you initiated it from",
        "No action required — confirms what already happened, with a clear path to report if wrong"
      ],
      safe_move: "Verify the transaction ID on a block explorer if you want to confirm it. Contact support via vaultx.com if you didn't initiate this.",
      consequence: "This is a legitimate withdrawal confirmation. Keep it for your records.",
      behavioral_reinforcement: BR
    },
    tags: ["legitimate", "withdrawal_confirmation", "email"]
  },
  {
    id: "sms_crypto_legit_001",
    channel: "sms",
    pattern_family: "crypto_wallet",
    difficulty: 2,
    ground_truth: "legit",
    context: "personal",
    ai_amplified: false,
    message: {
      from_name: "VaultX",
      from_handle: "84291",
      subject: null,
      body: "VaultX: Your 2FA code is 392741. This code expires in 10 minutes. Do not share this code with anyone."
    },
    red_flags: [
      { id: "contains_code", label: "Contains an authentication code" }
    ],
    correct_red_flag_ids: [],
    explanation: {
      short: "A legitimate 2FA code from VaultX's registered short code — no links, no action required, just the code.",
      tells: [
        "Short code 84291 is VaultX's registered notification number",
        "The message contains only the code and a standard warning not to share it",
        "No links, no 'click here,' no cancel buttons",
        "10-minute expiry is standard for TOTP codes"
      ],
      safe_move: "Use this code only to complete a login you just initiated. If you didn't initiate a login, change your password at vaultx.com immediately.",
      consequence: "This is a legitimate 2FA message. Use the code if you initiated the login.",
      behavioral_reinforcement: BR
    },
    tags: ["legitimate", "2fa", "short_code"]
  },
  {
    id: "email_crypto_legit_002",
    channel: "email",
    pattern_family: "crypto_wallet",
    difficulty: 3,
    ground_truth: "legit",
    context: "personal",
    ai_amplified: false,
    message: {
      from_name: "VaultX",
      from_handle: "no-reply@vaultx.com",
      subject: "New login detected on your VaultX account",
      body: "Hi,\n\nWe detected a new sign-in to your VaultX account.\n\nDevice: MacBook Pro\nLocation: San Francisco, CA\nTime: Feb 14, 2026 at 9:47 AM\n\nIf this was you: no action needed.\nIf this wasn't you: secure your account at vaultx.com/security\n\nVaultX Security"
    },
    red_flags: [
      { id: "login_alert_email", label: "New device login alert" },
      { id: "contains_link", label: "Contains a security link" }
    ],
    correct_red_flag_ids: [],
    explanation: {
      short: "A real new-device login alert from VaultX's official domain — shows specific device and location, no credentials requested.",
      tells: [
        "Sender is no-reply@vaultx.com — the real domain",
        "Shows the specific device and approximate location of the login",
        "No action required if you recognize it — just informational",
        "Security link goes to vaultx.com/security, not a third-party domain"
      ],
      safe_move: "If you recognize this login, ignore. If not, visit vaultx.com/security to secure your account.",
      consequence: "This is a legitimate security notification. Act only if the login wasn't you.",
      behavioral_reinforcement: BR
    },
    tags: ["legitimate", "login_alert", "security_notification"]
  },
  {
    id: "dm_crypto_legit_001",
    channel: "dm",
    pattern_family: "crypto_wallet",
    difficulty: 3,
    ground_truth: "legit",
    context: "personal",
    ai_amplified: false,
    message: {
      from_name: "VaultX Official",
      from_handle: "@vaultx",
      subject: null,
      body: "VaultX scheduled maintenance is tonight Feb 14 from 11 PM–2 AM UTC. Deposits and withdrawals will be temporarily paused. No action needed on your part. Status updates at status.vaultx.com"
    },
    red_flags: [
      { id: "maintenance_dm", label: "Service announcement via DM" },
      { id: "contains_link", label: "Contains a URL" }
    ],
    correct_red_flag_ids: [],
    explanation: {
      short: "A platform maintenance notice from VaultX's verified official account — no action required, no links to external domains.",
      tells: [
        "The DM comes from @vaultx — VaultX's verified official account (look for the blue checkmark on the platform)",
        "Purely informational: tells you something is happening, asks nothing of you",
        "No links to third-party domains — the status URL is status.vaultx.com, a subdomain of the real domain",
        "No personal information requested, no urgency, no credentials"
      ],
      safe_move: "This is legitimate. If you have time-sensitive transactions, complete them before 11 PM UTC.",
      consequence: "Real maintenance notification. No action required.",
      behavioral_reinforcement: BR
    },
    tags: ["legitimate", "maintenance_notice", "dm"]
  }
];

const existing = JSON.parse(fs.readFileSync(drillsPath, "utf-8"));
const combined = [...existing, ...newDrills];
fs.writeFileSync(drillsPath, JSON.stringify(combined, null, 2));
console.log(`✅ Added ${newDrills.length} crypto_wallet drills. Total: ${combined.length}`);
