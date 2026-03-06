# Scam Gym — Implementation Plan (Ready to Build)

## Priority Order
1. **B** Monetization cleanup (trust + conversion)
2. **A** Accessibility free (ethics + retention)
3. **C** Onboarding simplification (activation)
4. **D** Rename stats screen (coherence)
5. **E** PostHog analytics (truth layer)
6. **F** Sound/haptics (nice-to-have)

---

## Workstream A — Make Theme & Text Size Free

### Changes

1. **Unwrap theme toggle from PremiumGate**
   - `app/settings/page.tsx:313-345` — remove the `<PremiumGate>` wrapper around the theme toggle. Render the theme card directly.

2. **Remove "Light theme" from PREMIUM_FEATURES list**
   - `app/settings/page.tsx:24` — delete `{ icon: "...", label: "Light theme" }` from the array.

3. **No changes needed for "Larger text & spacing"**
   - Already free at `app/settings/page.tsx:284-310`.

### Files touched
- `app/settings/page.tsx`

### Acceptance criteria
- Theme toggle works for all users, no lock icon or upsell.
- "Light theme" no longer listed as a premium feature.
- Slow mode remains free (unchanged).

---

## Workstream B — Monetization Cleanup

### Problem (mapped to code)

Price CTAs currently appear in **6 locations**:

| # | File | Lines | Type |
|---|---|---|---|
| 1 | `components/PremiumGate.tsx` | 99-107 | Reusable "Unlock for $2.99" button |
| 2 | `app/settings/page.tsx` | 163-239 | Full upgrade section with feature list + Stripe link |
| 3 | `app/result/page.tsx` | 538-563 | Inline contextual upsell after drill result |
| 4 | `app/help/page.tsx` | 319-344 | Inline upsell after panic-mode analysis |
| 5 | `app/help/scripts/page.tsx` | 141-147, 183-191 | PremiumGate on reply scripts (uses component) |
| 6 | `app/help/vault/page.tsx` | 375-382 | PremiumGate on contacts vault (uses component) |

**PremiumGate is used 12 times** across the app. Most are `hideWhenLocked` (just hide content) — only the ones with `label`/`pitch` props show an upsell card.

### Changes

#### Step 1: Create `/upgrade` page
- New file: `app/upgrade/page.tsx`
- Contains: the feature list (move from `app/settings/page.tsx:15-27`), single Stripe CTA with price, "One-time purchase" trust text, restore purchase flow (move from `settings/page.tsx:188-238`).
- This is the **only place in the app that shows price**.

#### Step 2: Update PremiumGate component
- `components/PremiumGate.tsx` — change the CTA from:
  ```
  <a href={STRIPE_PAYMENT_URL}>Unlock for {PREMIUM_PRICE}</a>
  ```
  to:
  ```
  <Link href="/upgrade">Upgrade to unlock</Link>
  ```
- Remove imports of `PREMIUM_PRICE` and `STRIPE_PAYMENT_URL` from PremiumGate.
- Remove the `socialProof` prop (trust text moves to upgrade page).

#### Step 3: Replace inline upsells
- **`app/result/page.tsx:538-563`** — replace the entire inline upsell block with a compact card:
  ```
  Pitch text (keep "Seen a message like this?") + "Upgrade to unlock" link to /upgrade. No price.
  ```
- **`app/help/page.tsx:319-344`** — same treatment. Keep pitch ("Know exactly what to say"), link to `/upgrade`, no price.

#### Step 4: Simplify settings premium section
- `app/settings/page.tsx:143-241` — replace the full feature list + Stripe CTA with:
  - **If premium:** show "Pro" badge (keep existing "Premium Unlocked" block at lines 151-161).
  - **If not premium:** show compact "Upgrade to Pro" link that navigates to `/upgrade`. No feature list, no price, no Stripe link here.
- Move restore purchase UI to `/upgrade` page.

#### Step 5: Post-purchase cleanup
- Already works: `isPremium()` returns true, `PremiumGate` renders children, inline upsells have `!isPremium()` / `!premium` guards.
- Add subtle "Pro" label in the settings header (next to "Settings" text) when `isPremium()` is true.

### Do NOT implement
- `canUse(featureKey)` — unnecessary. `isPremium()` boolean is sufficient for this app's scope.
- `purchaseReceiptId` — no auth system, Stripe link flow doesn't return receipt IDs client-side.
- Hydration flash prevention — already handled (`PremiumGate` returns `null` until `checked` state, line 39).

### Files touched
- `app/upgrade/page.tsx` (new)
- `components/PremiumGate.tsx`
- `app/settings/page.tsx`
- `app/result/page.tsx`
- `app/help/page.tsx`

### Acceptance criteria
- Only `/upgrade` shows the price and Stripe link.
- All locked-feature cards say "Upgrade to unlock" with no price.
- After purchase, zero upsell cards visible anywhere.
- Restore purchase flow works from `/upgrade`.

---

## Workstream C — Onboarding Simplification

### Problem (mapped to code)
- `app/page.tsx:344-371` — "How this works" calibration explainer card with 3-column grid (overconfident / well-calibrated / underconfident). Shown to ALL users on every home visit.

### Changes

#### Option chosen: Collapse + defer

1. **On home page (`app/page.tsx:344-371`):**
   - Check `scamgym_onboarded` (already exists at `page.tsx:15,72`).
   - **If NOT onboarded (first visit):** replace the full explainer with a single sentence + CTA:
     ```
     "Read a message. Decide if it's a scam. Rate your confidence."
     ```
     No calibration details yet — just get them into the first drill.
   - **If onboarded (has done at least 1 drill):** show a collapsed `<details>` expander with the full calibration card. Label: "How scoring works". Closed by default.

2. **On first result screen (`app/result/page.tsx`):**
   - Check if this is the user's first completed drill (e.g., total attempts === 1).
   - If yes, show a one-time calibration explainer card below the verdict — reuse the same 3-column content from the home page.
   - Store a flag so it only shows once (can reuse `scamgym_onboarded` — it's already set to "1" when first drill starts).

### Do NOT implement
- `hasCompletedFirstDrill` as a new flag — `scamgym_onboarded` already serves this purpose.

### Files touched
- `app/page.tsx`
- `app/result/page.tsx`

### Acceptance criteria
- First-time user sees minimal text + "Start Training" CTA on home. No multi-paragraph calibration.
- Calibration explanation appears on the first result screen.
- Returning users can expand calibration info on home if they want it.

---

## Workstream D — Rename Stats Screen

### Path chosen: B (rename to match content)

### Changes

1. **`app/stats/page.tsx:126`** — change "My Vulnerabilities" to "My Progress".
2. **Bottom nav / any links** — grep for navigation to `/stats` and update labels if any say "Vulnerabilities".

That's it. Internal variable names (`topVulnerabilities` in `stats.ts`) stay as-is — renaming internals adds churn with no user benefit.

### Files touched
- `app/stats/page.tsx`

### Acceptance criteria
- Screen title reads "My Progress".
- No UI text references "vulnerabilities" as a page name.

---

## Workstream E — PostHog Analytics

### Setup

1. **Install:** `npm install posthog-js`
2. **Create provider:** `components/PostHogProvider.tsx` — initialize with project API key, wrap app in `app/layout.tsx`.
3. **Privacy disclosure:** Update "About Scam Gym" text in `app/settings/page.tsx:482-485`:
   - Change from: "All data stays on your device. Nothing is sent to a server."
   - Change to: "Your drill data stays on your device. We collect anonymous usage analytics to improve the app. No personal information is stored on our servers."
4. **Add analytics toggle** in settings (opt-out). Default: opted in. Store in `scamgym_analytics` localStorage key. Call `posthog.opt_out_capturing()` when disabled.

### Events to instrument

#### Core funnel (implement first)
| Event | Where | Properties |
|---|---|---|
| `landing_viewed` | `app/page.tsx` onMount | `isOnboarded`, `isPro` |
| `first_drill_started` | `app/drill/page.tsx` onMount | `drillId`, `patternFamily` |
| `drill_completed` | `app/drill/page.tsx` on submit | `drillId`, `isCorrect`, `confidence`, `patternFamily` |
| `result_viewed` | `app/result/page.tsx` onMount | `drillId`, `isCorrect`, `calVerdict` |

#### Monetization (implement second)
| Event | Where | Properties |
|---|---|---|
| `upgrade_prompt_shown` | `components/PremiumGate.tsx` onMount (when locked) | `label`, `screen` |
| `upgrade_clicked` | `components/PremiumGate.tsx` on CTA click | `screen` |
| `upgrade_screen_viewed` | `app/upgrade/page.tsx` onMount | `referrer` |
| `purchase_started` | `app/upgrade/page.tsx` on Stripe link click | — |
| `purchase_success` | `app/page.tsx` when `?premium=1` param detected | — |

#### Feature usage (implement third)
| Event | Where |
|---|---|
| `focus_training_set` | `app/settings/page.tsx` on family select |
| `bookmark_added` | `app/result/page.tsx` on bookmark click |
| `session_started` | `app/session/page.tsx` onMount |
| `session_completed` | `app/session/page.tsx` on finish |
| `panic_mode_used` | `app/help/page.tsx` on analyze click |

### Do NOT implement
- `scroll_depth` on onboarding — complex for React SPA, low ROI at this stage.
- `app_exit after paywall` — not reliably detectable in PWA/web. Infer from funnel drop-off instead.
- `sessionId` as a custom property — PostHog auto-generates session IDs.

### Files touched
- `package.json` (add posthog-js)
- `components/PostHogProvider.tsx` (new)
- `app/layout.tsx` (wrap with provider)
- `app/settings/page.tsx` (privacy text + analytics toggle)
- All pages listed above (add capture calls)

### Acceptance criteria
- PostHog receives events in dashboard.
- Can build funnel: landing -> drill -> result -> upgrade screen -> purchase.
- Analytics toggle in settings; opting out stops all tracking.
- Privacy disclosure updated.

---

## Workstream F — Sound & Haptics

### Current state
- `lib/haptics.ts` already exists with a `tap()` function used on buttons.

### Changes

1. **Create `lib/audio.ts`:**
   - Use Web Audio API (no audio files to load).
   - Export `playCorrect()` — short rising tone (~200ms).
   - Export `playIncorrect()` — short low tone (~200ms).
   - Both check `scamgym_audio` localStorage before playing.
   - Export `isAudioEnabled()` and `setAudioEnabled(bool)`.

2. **Add audio toggle in settings (`app/settings/page.tsx`):**
   - New card between Slow Mode and Theme.
   - Default: OFF. Label: "Sound effects".

3. **Wire up sounds:**
   - `app/drill/page.tsx` — after answer submission, play correct/incorrect tone.
   - `app/session/page.tsx` — same treatment during session drills.

### Files touched
- `lib/audio.ts` (new)
- `app/settings/page.tsx`
- `app/drill/page.tsx`
- `app/session/page.tsx`

### Acceptance criteria
- No sound plays by default.
- Audio toggle exists in settings.
- Correct/incorrect tones are short and subtle.

---

## Definition of Done

- [ ] No accessibility paywalls (theme + text size free for all).
- [ ] Only `/upgrade` shows price. All other surfaces say "Upgrade to unlock".
- [ ] Post-purchase: zero upsell cards anywhere, "Pro" label in settings.
- [ ] Onboarding defers calibration until first result (or collapses it).
- [ ] Stats screen titled "My Progress".
- [ ] PostHog events confirm funnel + conversion behavior.
- [ ] Privacy disclosure updated, analytics opt-out available.
- [ ] Sound effects off by default, toggle in settings.
