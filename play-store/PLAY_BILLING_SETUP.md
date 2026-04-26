# Google Play Billing — Setup Checklist

Code is wired up. This doc covers the parts you have to do in dashboards I can't reach.

Stack: `@revenuecat/purchases-capacitor` (client) + RevenueCat REST API (server verification) → signed `premium:gp_…` token → existing `unlockPremiumWithToken()` flow.

---

## 1. Play Console — Create the in-app product

Path: **Monetize with Play → Products → In-app products**

> ⚠️ You can't create a product until you've uploaded a signed AAB at least once. If you haven't, do step **6** first (build + upload to Internal testing), then come back.

- **Product ID:** `scamgym_pro_unlock` *(must match `PLAY_PRODUCT_ID` in `lib/playBilling.ts`)*
- **Name:** `Scam Gym Pro`
- **Description:** `One-time unlock of all Pro features.`
- **Price:** `$9.99 USD` (set this; Play auto-converts to other currencies)
- **Status:** **Active**

## 2. Play Console — License testers (so test purchases don't charge)

Path: **Setup → License testing** (top-level Play Console, not inside the app)

- Add the Google account you'll test with (the one on your phone).
- **License response:** `LICENSED`
- Save.

The tester account also needs to be in your Internal testing track tester list (step 6).

## 3. RevenueCat — Create project + product + entitlement

Sign up at <https://app.revenuecat.com> (free up to $10K MTR).

### a. New project
- Name: `Scam Gym`

### b. Add the Android app
Path: **Project settings → Apps → New → Play Store**

- **Package name:** `com.scamgym.app`
- **Service Account credentials:** upload the JSON.
  - To create one: Google Cloud Console → IAM & Admin → Service Accounts → Create.
  - Grant role: *Pub/Sub Publisher* (for real-time notifications, optional but recommended).
  - In Play Console: **Setup → API access → Link service account → grant Financial data + Manage orders + Manage store presence permissions**.
  - Then upload the downloaded JSON to RevenueCat.
- You can skip the service account at first to get tests running and add it later — but server-side verification works better with it linked.

### c. Add the product
Path: **Products → New**

- **Identifier:** `scamgym_pro_unlock` *(must match Play Console exactly)*
- **Type:** Non-consumable (one-time / lifetime)
- Attach to the Play Store app.

### d. Create the entitlement
Path: **Entitlements → New**

- **Identifier:** `pro` *(must match `PLAY_ENTITLEMENT_ID` in `lib/playBilling.ts`; if you change it, set `REVENUECAT_ENTITLEMENT_ID` env var)*
- Attach the `scamgym_pro_unlock` product to it.

### e. Create an offering
Path: **Offerings → New**

- **Identifier:** `default`
- Add a package — type **Lifetime** — pointing at the product.
- Mark this offering as **Current**.

### f. Grab API keys
Path: **Project settings → API keys**

- **Public Android SDK key** — looks like `goog_xxxxxxxxxxxxxxxx`. This goes in the client.
- **Secret key (V2)** — looks like `sk_xxxxxxxxxxxxxxxx`. Server-only, never ship this to the client.

## 4. Vercel — Environment variables

Path: **Vercel project → Settings → Environment Variables** (Production + Preview).

| Name | Value | Notes |
|---|---|---|
| `NEXT_PUBLIC_REVENUECAT_ANDROID_KEY` | `goog_…` | Public; OK to expose to client |
| `REVENUECAT_SECRET_KEY` | `sk_…` | Server-only |
| `PREMIUM_TOKEN_SECRET` | *(already set)* | Same HMAC secret used by `/api/unlock` |
| `REVENUECAT_ENTITLEMENT_ID` | `pro` | Optional, defaults to `pro` |

After adding, **redeploy** (env vars don't apply to existing deployments).

For local dev you'd also add these to `.env.local`, but you can't actually exercise Play Billing locally — you have to install via Play Store internal track to test.

## 5. Sync Capacitor (one-time, after install)

Already installed `@revenuecat/purchases-capacitor`. Run:

```bash
npm run android:sync
```

This adds the native RevenueCat module to the Android project.

## 6. Build & upload to Internal testing

```bash
npm run android:build-full
```

That produces `android/app/build/outputs/bundle/release/app-release.aab`.

Path: **Play Console → Test and release → Internal testing → Create new release**

- Upload the AAB.
- In **Testers**, add your Google account email.
- Save → Review → Roll out.
- Within a few minutes you get an opt-in URL. Open it on your phone in the same Google account, accept, then install via Play Store.

## 7. Smoke test the purchase flow

On the Internal-test install (NOT a debug build — Play Billing won't work in debug):

1. Open the app, go to **Upgrade**.
2. Tap **Unlock Pro — $9.99**.
3. Google Play sheet opens. Because you're a license tester, the receipt says *"This is a test purchase. You will not be charged."*
4. Confirm. App should flip to **Pro Active**.
5. Uninstall the app, reinstall, open Upgrade, tap **Restore purchases**. Should re-unlock.

## 8. Promote to Closed testing (required before production)

Per Play's policy for new personal developer accounts:

- Run a **Closed test** with **at least 12 opted-in testers** for **14 continuous days**.
- Then **Apply for production access** (button on the Production track page).

You can keep adding testers via an email list or a Google Group. The 14-day clock only resets if testers drop below 12.

---

## Troubleshooting

| Symptom | Cause | Fix |
|---|---|---|
| `Pro is not available right now.` | Offering not marked Current in RC, or product not Active in Play, or app installed via debug instead of Play | Mark offering Current; activate product; install from Play Store |
| `Could not verify purchase with our server.` | Missing `REVENUECAT_SECRET_KEY` or `PREMIUM_TOKEN_SECRET` on Vercel | Set env vars and redeploy |
| Purchase succeeds but `Pro Active` doesn't appear | Entitlement ID mismatch | Make sure RC entitlement is `pro` (or set `REVENUECAT_ENTITLEMENT_ID`) |
| Restore says "No previous purchase" | Different Google account on device than the one that purchased | Switch accounts in Play Store, retry |
| Play sheet shows real price (not "test purchase") | Account not in license testers | Add to **Setup → License testing** at Play Console root |

## What's wired up in the code

- `lib/playBilling.ts` — `purchasePremium()` and `restorePurchases()` using RevenueCat SDK
- `lib/platform.ts` — `isNativeAndroid()` so web keeps Stripe, Android uses Play
- `app/upgrade/page.tsx` — branches on platform; Stripe verbiage hidden on Android
- `app/api/verify-play-purchase/route.ts` — server-side verification via RC REST API → signed `premium:gp_…` token
- `lib/premium.ts` — `isPremium()` accepts both `cs_` (Stripe) and `gp_` (Play) tokens

---

## Why no iOS yet

Same SDK works for iOS — to add later:
1. Add iOS app in RevenueCat with App Store Connect shared secret.
2. Create matching IAP in App Store Connect with product ID `scamgym_pro_unlock`.
3. Add `NEXT_PUBLIC_REVENUECAT_IOS_KEY` env var and switch the SDK config in `lib/playBilling.ts` to pick the right key per platform.
