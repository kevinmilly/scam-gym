/**
 * One-time migration: Phase 2a + 2b
 * - Replace real brand names with fictional equivalents
 * - Add context, ai_amplified, behavioral_reinforcement fields
 */

import * as fs from "fs";
import * as path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const drillsPath = path.join(__dirname, "..", "data", "drills.json");

const BEHAVIORAL_REINFORCEMENT = {
  delivery_toll: "Never pay fees or click links in unexpected shipping or toll texts — the carrier's official app or website always has the real status.",
  bank_fraud_alert: "Legitimate banks never ask you to verify credentials by clicking a text link — if something seems wrong, call the number on the back of your card.",
  account_verification: "Any unsolicited message asking you to verify or secure your account by clicking a link is a default-suspect situation — navigate directly to the site yourself instead.",
  tech_support: "Legitimate tech companies never contact you first about viruses, charges, or support issues — if the contact is unsolicited, the problem is fabricated.",
  job_seeker: "Any opportunity that requires upfront payment, personal financial details, or government ID before you start working is not a job — it is a scam using employment as the hook.",
  invoice_vendor: "Any unexpected change to banking details, payment methods, or wire transfer instructions requires direct verbal confirmation with a known contact before acting.",
  romance_social: "Anyone online who builds emotional rapport quickly and then introduces money, investment, or financial requests is using a script — genuine trust develops over months, not messages.",
  qr_code: "QR codes are fully opaque shortcuts — always preview the destination URL before proceeding, and never scan codes that arrived unexpectedly or in an unusual context.",
};

const CONTEXT_BY_FAMILY = {
  delivery_toll: "personal",
  bank_fraud_alert: "personal",
  account_verification: "personal",
  tech_support: "personal",
  romance_social: "personal",
  qr_code: "personal",
  invoice_vendor: "small_business",
  job_seeker: "job_seeker",
};

// Ordered list of replacements — order matters (longer/more specific first)
const REPLACEMENTS = [
  // ── Delivery / Shipping ────────────────────────────────────────
  ["DHL Express", "SwiftShip International"],
  ["DHL Customs Services", "SwiftShip Customs Team"],
  ["dhl-customs-clearance.com", "swiftship-customs.com"],
  ["dhl.com", "swiftship.com"],
  ["1-800-225-5345", "1-800-555-0500"],
  ["FedEx: ", "SwiftShip: "],       // prefix in SMS bodies
  ["FedEx", "SwiftShip"],
  ["fedex-redelivery-fee.net", "swiftship-redelivery-fee.net"],
  ["fedex.com", "swiftship.com"],
  ["1-800-463-3339", "1-800-555-0400"],
  ["UPS", "TrackPro"],
  ["ups-reschedule-delivery.com", "trackpro-reschedule.com"],
  ["ups.com", "trackpro.com"],
  ["69877", "71043"],
  ["1-800-742-5877", "1-800-555-0300"],
  ["USPS: ", "NationPost: "],         // prefix in SMS bodies
  ["USPS Delivery", "NationPost Delivery"],
  ["USPS Mail Services", "NationPost Mail Services"],
  ["USPS attempted", "NationPost attempted"],
  ["USPS Form 3849", "NationPost Form 3849"],
  ["USPS", "NationPost"],
  ["usps-mail-center.com", "nationpost-mail-center.com"],
  ["usps-redelivery-update.com", "nationpost-redelivery-update.com"],
  ["usps.com/track", "nationpost.com/track"],
  ["usps.com", "nationpost.com"],
  ["28777", "47832"],
  ["1-800-275-8777", "1-800-555-0200"],

  // ── Toll Services ──────────────────────────────────────────────
  ["SunPass", "QuikPass"],
  ["sunpass-billing-pay.com", "quikpass-billing-pay.com"],
  ["sunpass.com", "quikpass.com"],
  ["E-ZPass NJ", "FastLane NJ"],
  ["E-ZPass", "FastLane"],
  ["ezpass-nj-account.com", "fastlane-nj-account.com"],
  ["ezpassnj.com", "fastlanenj.com"],
  ["e-zpassny.com", "fastlaneny.com"],

  // ── Banks ──────────────────────────────────────────────────────
  ["Wells Fargo Security", "Crestline CU Security"],
  ["Wells Fargo Customer Security Team", "Crestline CU Security Team"],
  ["Wells Fargo", "Crestline Credit Union"],
  ["wellsfargo-alerts.com", "crestlinecu-alerts.com"],
  ["wellsfargo.com", "crestlinecu.com"],
  ["93557", "82114"],
  ["1-800-869-3557", "1-800-555-0600"],
  ["Chase Fraud", "NorthStar Fraud"],
  ["Chase", "NorthStar Bank"],
  ["chase-secure-verify.com", "northstarbank-secure-verify.com"],
  ["chase.com", "northstarbank.com"],
  ["24273", "55321"],
  ["Bank of America", "NorthStar Bank"],
  ["BofA", "NorthStar"],
  ["900-00", "900-01"],
  ["Citibank", "NorthStar Bank"],
  ["Citi Online Banking", "NorthStar Online Banking"],
  ["Citi account", "NorthStar account"],
  ["citi-online-update.com", "northstarbank-online-update.com"],
  ["citibank.com", "northstarbank.com"],
  ["citi.com", "northstarbank.com"],
  ["Capital One", "Crestline Credit Union"],
  ["capitalone.com", "crestlinecu.com"],
  ["American Express Fraud Prevention", "NorthStar Bank Fraud Prevention"],
  ["American Express", "NorthStar Bank"],
  ["americanexpress.com", "northstarbank.com"],
  ["Amex", "NorthStar Bank"],

  // ── Apple / Apex Devices ────────────────────────────────────────
  ["apple-id-verify.com", "apexdevices-id-verify.com"],
  ["appleid.apple.com", "account.apexdevices.com"],
  ["email.apple.com", "email.apexdevices.com"],
  ["id.apple.com", "account.apexdevices.com"],
  ["Apple Support", "Apex Devices Support"],
  ["Apple ID", "Apex ID"],
  ["Apple Pay", "Apex Pay"],
  ["iCloud", "ApexCloud"],
  ["Apple", "Apex Devices"],
  ["apple.com", "apexdevices.com"],
  ["1-800-275-2273", "1-800-555-0700"],

  // ── Google / Orbit Tech ─────────────────────────────────────────
  ["accounts.google.com", "accounts.orbittech.com"],
  ["myaccount.google.com", "account.orbittech.com"],
  ["Google Account", "Orbit Tech Account"],
  ["Google Accounts Team", "Orbit Tech Accounts Team"],
  ["Google Account Team", "Orbit Tech Account Team"],
  ["Google", "Orbit Tech"],
  ["google.com", "orbittech.com"],

  // ── Microsoft / Pinnacle Software ──────────────────────────────
  ["microsoft-account-alert.com", "pinnaclesoft-account-alert.com"],
  ["microsoft365-renewalcenter.com", "pinnaclesoft365-renewalcenter.com"],
  ["windows-security-center.net", "pinnaclesoft-security-center.net"],
  ["account.microsoft.com", "account.pinnaclesoft.com"],
  ["account.live.com", "account.pinnaclesoft.com"],
  ["accountprotection@microsoft.com", "security@pinnaclesoft.com"],
  ["security@microsoft.com", "security@pinnaclesoft.com"],
  ["microsoft-noreply@microsoft.com", "noreply@pinnaclesoft.com"],
  ["account.live.com/activity", "account.pinnaclesoft.com/activity"],
  ["Microsoft 365 Personal", "Pinnacle 365 Personal"],
  ["Microsoft 365 Billing", "Pinnacle 365 Billing"],
  ["Microsoft 365", "Pinnacle 365"],
  ["Microsoft Account Team", "Pinnacle Account Team"],
  ["Microsoft Certified Support", "Pinnacle Certified Support"],
  ["Windows Security Team", "Pinnacle Security Team"],
  ["Microsoft", "Pinnacle Software"],
  ["microsoft.com", "pinnaclesoft.com"],
  ["OneDrive", "PinnacleDrive"],
  ["Windows Defender", "Pinnacle Defender"],
  ["1-800-642-7676", "1-800-555-0800"],

  // ── Amazon / MarketHub ──────────────────────────────────────────
  ["Amazon Web Services", "MarketHub Cloud"],
  ["Amazon Prime", "MarketHub Prime"],
  ["Amazon Security", "MarketHub Security"],
  ["amazon-security-alert.net", "markethub-security-alert.net"],
  ["shipment-tracking@amazon.com", "shipment-tracking@markethub.com"],
  ["billing@amazon.com", "billing@markethub.com"],
  ["console.aws.amazon.com/billing", "console.cloud.markethub.com/billing"],
  ["console.aws.amazon.com", "console.cloud.markethub.com"],
  ["amazon.com/primerenew", "markethub.com/primerenew"],
  ["amazon.com/orders", "markethub.com/orders"],
  ["amazon.com", "markethub.com"],
  ["AWS Account ID", "MarketHub Cloud Account ID"],
  ["AWS bill", "MarketHub Cloud bill"],
  ["AWS Billing Team", "MarketHub Cloud Billing Team"],
  ["AWS", "MarketHub Cloud"],
  ["Amazon", "MarketHub"],
  ["262966", "372944"],

  // ── Netflix / StreamVault ───────────────────────────────────────
  ["Netflix Billing Team", "StreamVault Billing Team"],
  ["Netflix", "StreamVault"],
  ["netflix-account-center.com", "streamvault-account-center.com"],
  ["netflix.com", "streamvault.com"],

  // ── PayPal / PayBridge ──────────────────────────────────────────
  ["PayPal Account Services", "PayBridge Account Services"],
  ["PayPal Resolution Center", "PayBridge Resolution Center"],
  ["paypal-account-alert.com", "paybridge-account-alert.com"],
  ["paypal-resolution-center.com", "paybridge-resolution-center.com"],
  ["paypal.com/disputes", "paybridge.com/disputes"],
  ["service@paypal.com", "service@paybridge.com"],
  ["PayPal", "PayBridge"],
  ["paypal.com", "paybridge.com"],

  // ── Venmo / QuickSend ───────────────────────────────────────────
  ["venmo-account-secure.com", "quicksend-account-secure.com"],
  ["Venmo", "QuickSend"],
  ["venmo.com", "quicksend.com"],
  ["86753", "73241"],
  ["900-09", "900-07"],
  ["1-855-812-4430", "1-855-555-0090"],

  // ── LinkedIn / TalentLink ───────────────────────────────────────
  ["LinkedIn Recruiter", "TalentLink Recruiter"],
  ["talent-hire-network.com", "talent-hire-network.com"],   // already fictional
  ["@LinkedlnJobs", "@TalentLlnkJobs"],   // preserve lookalike substitution
  ["LinkedIn", "TalentLink"],
  ["linkedin.com", "talentlink.com"],
  ["talentlink.com/in/maya-patel-stripe", "talentlink.com/in/maya-patel-paybridge"],
  ["talentlink.com/in/priya-sharma-notion", "talentlink.com/in/priya-sharma-arkade"],

  // ── DocuSign / SignFlow ─────────────────────────────────────────
  ["dse@docusign.net", "notify@signflow.net"],
  ["docusign.com/review", "signflow.com/review"],
  ["DocuSign", "SignFlow"],
  ["docusign.com", "signflow.com"],
  ["docusign.net", "signflow.net"],

  // ── Instagram / Prism ───────────────────────────────────────────
  ["Instagram Verified", "Prism Verified"],
  ["@instagram.support.team", "@prism.support.team"],
  ["instagram.com/accounts/request_verification", "prism.social/verify"],
  ["Instagram", "Prism"],
  ["32665", "45891"],
  ["instagram.com", "prism.social"],

  // ── Facebook / SocialHub ────────────────────────────────────────
  ["facebookmail.com", "socialhub-mail.com"],
  ["facebook.com/hacked", "socialhub.com/hacked"],
  ["facebook.com", "socialhub.com"],
  ["Facebook Security Team", "SocialHub Security Team"],
  ["Facebook", "SocialHub"],

  // ── Steam / PixelPlay ───────────────────────────────────────────
  ["steam-account-support.com", "pixelplay-account-support.com"],
  ["steampowered.com/support", "pixelplay.com/support"],
  ["store.steampowered.com", "pixelplay.com"],
  ["steampowered.com", "pixelplay.com"],
  ["valvesoftware.com", "pixelplay.com"],
  ["Steam Account Services", "PixelPlay Account Services"],
  ["Steam User", "PixelPlay User"],
  ["Steam client", "PixelPlay client"],
  ["Steam", "PixelPlay"],
  ["VAC", "FairPlay"],

  // ── Zoom / LinkMeet ─────────────────────────────────────────────
  ["no-reply@zoom.us", "no-reply@linkmeet.io"],
  ["zoom.us/profile", "linkmeet.io/profile"],
  ["zoom.us", "linkmeet.io"],
  ["Zoom Security Team", "LinkMeet Security Team"],
  ["Zoom", "LinkMeet"],

  // ── Eventbrite / GatherHub ─────────────────────────────────────
  ["order@eventbrite.com", "order@gatherhub.com"],
  ["eventbrite.com/mytickets", "gatherhub.com/mytickets"],
  ["eventbrite.com", "gatherhub.com"],
  ["Eventbrite Team", "GatherHub Team"],
  ["Eventbrite", "GatherHub"],

  // ── Delta / SkyBridge Airlines ─────────────────────────────────
  ["noreply@delta.com", "noreply@skybridge.com"],
  ["delta.com/mytrips", "skybridge.com/mytrips"],
  ["delta.com", "skybridge.com"],
  ["Delta Air Lines", "SkyBridge Airlines"],
  ["Delta Flight DL", "SkyBridge Flight SB"],
  ["Delta app", "SkyBridge app"],
  ["Delta Bonvoy", "SkyBridge Rewards"],
  ["Delta", "SkyBridge Airlines"],

  // ── Marriott / HarborStay ─────────────────────────────────────
  ["noreply@marriott.com", "noreply@harborstay.com"],
  ["marriott.com", "harborstay.com"],
  ["New York Marriott Marquis", "HarborStay Marquis NYC"],
  ["Marriott Bonvoy", "HarborStay Rewards"],
  ["Marriott NYC", "HarborStay NYC"],
  ["Marriott Hotels", "HarborStay Hotels"],
  ["Marriott", "HarborStay"],
  ["MRR-4421897", "HST-4421897"],

  // ── Ticketmaster / TicketVault ─────────────────────────────────
  ["noreply@ticketmaster.com", "noreply@ticketvault.com"],
  ["ticketmaster.com", "ticketvault.com"],
  ["Ticketmaster app", "TicketVault app"],
  ["Ticketmaster", "TicketVault"],

  // ── Dropbox / CloudDrive ───────────────────────────────────────
  ["no-reply@dropbox.com", "no-reply@clouddrive.io"],
  ["dropbox.com/account/security", "clouddrive.io/account/security"],
  ["dropbox.com", "clouddrive.io"],
  ["Dropbox Team", "CloudDrive Team"],
  ["Dropbox", "CloudDrive"],

  // ── Norton Security / ShieldPro ────────────────────────────────
  ["Norton Total Protection", "ShieldPro Total Protection"],
  ["norton-renewal-center.com", "shieldpro-renewal-center.com"],
  ["norton.com", "shieldpro.com"],
  ["Norton Billing Department", "ShieldPro Billing Department"],
  ["Norton", "ShieldPro"],

  // ── McAfee / ShieldPro ─────────────────────────────────────────
  ["McAfee Total Protection", "ShieldPro Total Protection"],
  ["mcafee-renewals.net", "shieldpro-renewals.net"],
  ["mcafee.com", "shieldpro.com"],
  ["McAfee Billing Department", "ShieldPro Billing Department"],
  ["McAfee", "ShieldPro"],

  // ── Geek Squad / TechGuard ─────────────────────────────────────
  ["Best Buy Geek Squad", "TechGuard"],
  ["Geek Squad Total Home Protection", "TechGuard Total Home Protection"],
  ["Geek Squad Annual Protection Plan", "TechGuard Annual Protection Plan"],
  ["geeksquad-auto-renewal.com", "techguard-auto-renewal.com"],
  ["orders@bestbuy.com", "orders@techguard.com"],
  ["bestbuy.com/geeksquad", "techguard.com/support"],
  ["bestbuy.com", "techguard.com"],
  ["Geek Squad Billing", "TechGuard Billing"],
  ["Geek Squad", "TechGuard"],

  // ── QuickBooks / LedgerFlow ────────────────────────────────────
  ["invoicing@quickbooks.intuit.com", "invoicing@ledgerflow.com"],
  ["qbo.intuit.com/pay", "app.ledgerflow.com/pay"],
  ["QuickBooks Payments", "LedgerFlow Payments"],
  ["QuickBooks", "LedgerFlow"],

  // ── Stripe (as employer) / PayBridge ──────────────────────────
  ["maya.patel@stripe.com", "maya.patel@paybridge.com"],
  ["stripe.com | linkedin.com", "paybridge.com | talentlink.com"],
  ["dashboard.stripe.com/payouts", "dashboard.paybridge.com/payouts"],
  ["dashboard.stripe.com", "dashboard.paybridge.com"],
  ["support@stripe.com", "support@paybridge.com"],
  ["at Stripe", "at PayBridge"],
  ["Stripe Support", "PayBridge Support"],
  ["Stripe", "PayBridge"],
  ["stripe.com", "paybridge.com"],

  // ── Notion (as employer) / Arkade ─────────────────────────────
  ["priya.sharma@notion.so", "priya.sharma@arkade.co"],
  ["people@notion.so", "people@arkade.co"],
  ["notion.so | linkedin.com", "arkade.co | talentlink.com"],
  ["notion.so", "arkade.co"],
  ["at Notion", "at Arkade"],
  ["Notion", "Arkade"],

  // ── Figma (as employer) / PixelCanvas ─────────────────────────
  ["figma.com/careers", "pixelcanvas.com/careers"],
  ["figma.com", "pixelcanvas.com"],
  ["Figma plugin", "PixelCanvas plugin"],
  ["at Figma", "at PixelCanvas"],
  ["Figma", "PixelCanvas"],

  // ── Calendly ───────────────────────────────────────────────────
  ["calendly.com/maya-stripe", "cal.com/maya-paybridge"],

  // ── Other real-brand mentions ──────────────────────────────────
  ["National Consumer Panel", "Consumer Insights Group"],
  ["Walmart gift cards", "RetailMart gift cards"],
  ["Walmart", "RetailMart"],
  ["MSPA", "MSPA"],   // no change — fictional validator reference is fine
  ["mspa-americas.org", "mspa-americas.org"],
  ["USAJobs.gov", "FedJobs.gov"],
  ["USAJobs", "FedJobs"],
  // Zelle stays (it's a payment rail, commonly referenced)
  // CashApp stays (similar)
];

function applyReplacements(str) {
  for (const [from, to] of REPLACEMENTS) {
    str = str.split(from).join(to);
  }
  return str;
}

function transformDrill(drill) {
  // Deep clone via JSON round-trip for text replacement
  let json = JSON.stringify(drill);
  json = applyReplacements(json);
  const d = JSON.parse(json);

  // Add new fields
  const family = d.pattern_family;
  d.context = CONTEXT_BY_FAMILY[family] ?? "personal";
  d.ai_amplified = false;
  d.explanation.behavioral_reinforcement =
    BEHAVIORAL_REINFORCEMENT[family] ??
    "When in doubt, verify through a channel you initiated — not one provided in the message.";

  return d;
}

const raw = fs.readFileSync(drillsPath, "utf-8");
const drills = JSON.parse(raw);

if (!Array.isArray(drills)) {
  console.error("drills.json must be a JSON array");
  process.exit(1);
}

const transformed = drills.map(transformDrill);

fs.writeFileSync(drillsPath, JSON.stringify(transformed, null, 2), "utf-8");
console.log(`✅ Transformed ${transformed.length} drills successfully.`);
