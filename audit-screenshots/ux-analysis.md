# Scam Gym — UX/UI Audit & Improvement Plan

**Date:** 2026-04-05
**Screenshots:** 46 captures across 10 routes, 2 viewports, 3 user states
**Manifest:** `audit-screenshots/manifest.json`

---

## Executive Summary

The app has a strong dark theme with good information hierarchy on mobile. The core drill flow is well-designed — the simulated message card, binary Scam/Legit choice, and confidence slider are intuitive. However, there are significant issues with **desktop responsiveness**, **empty states**, **visual consistency**, and **navigation clarity** that hurt usability, especially for the older-adult target audience.

---

## Critical Issues (Fix First)

### 1. Desktop layout is broken — content is not responsive
**Pages affected:** All routes on desktop (1440px)
**Evidence:** `desktop-drill-returning-top.png`, `desktop-home-returning-top.png`

The entire app renders as a narrow mobile column centered on a vast dark background. On desktop, the drill card, buttons, and text are tiny and hard to read. The home page content floats in the center with no max-width container or multi-column layout adaptation.

**Fix:** Add a `max-width: 680px` container with proper centering for content pages, OR create a responsive layout that uses the extra space (e.g., sidebar nav on desktop, wider message cards). At minimum, scale typography and touch targets up for desktop viewports.

### 2. Stats page is a dead end for new returning users
**Evidence:** `mobile-stats-returning-top.png`, `desktop-stats-returning-top.png`

The stats page shows a centered "No data yet" with a single "Start Drilling" button on an entirely empty screen. This wastes the full viewport and feels broken. The empty state has no visual warmth or encouragement.

**Fix:**
- Show a preview/skeleton of what the stats dashboard WILL look like (greyed out charts, sample data)
- Add motivational copy: "Complete 5 drills to unlock your vulnerability profile"
- Show a progress indicator (0/5 drills completed)

### 3. No persistent navigation — users get lost
**Evidence:** All pages use only a top-left "← Home" or "← Back" text link

There's no tab bar, bottom nav, or persistent navigation. Users must always go back to home then navigate forward again. This is especially painful for the older-adult audience who benefit from consistent navigation landmarks.

**Fix:** Add a bottom tab bar with 4 items: **Home**, **Drill**, **Stats**, **More** (settings/help). This is standard PWA mobile UX and critical for discoverability.

---

## High-Priority Issues

### 4. Drill page — "← Home" navigation breaks drill flow
**Evidence:** `mobile-drill-returning-top.png`

The drill page header shows "← Home" which implies leaving. During an active drill this creates anxiety. The user should feel "in" the experience, not one tap from abandoning it.

**Fix:** Replace with a subtle "X" or no back button during an active drill. Only show exit confirmation if they try to leave mid-drill.

### 5. Confidence slider labels are cryptic
**Evidence:** `mobile-drill-returning-bottom.png`

"Coin flip" and "Dead certain" as labels under 50%/95% are clever but may confuse older adults. The percentage buttons (50%, 60%, 70%, 85%, 95%) are small and closely spaced.

**Fix:**
- Make buttons larger with more padding
- Use clearer labels: "Just guessing" → "Pretty sure" → "Certain"
- Consider a slider control instead of discrete buttons for more intuitive interaction

### 6. "WHAT WOULD YOU ACTUALLY DO?" section lacks visual weight
**Evidence:** `mobile-drill-returning-bottom.png`

The behavioral response options (Ignore it, Verify first, Respond, Click the link, Call the number) are small pill buttons that look like tags, not actions. They're also marked "(optional)" which reduces engagement with arguably the most valuable training element.

**Fix:**
- Make these full-width cards with icons instead of pills
- Remove "(optional)" label — instead, make it feel natural to answer
- Add brief descriptions: "Ignore it — Delete and move on"

### 7. Session mode page has no explanation for non-premium users
**Evidence:** `mobile-session-returning-top.png`

The session page shows a drill immediately with "← Exit" and "1/10 EMAIL" header. There's no intro explaining what a session is, how it differs from single drills, or what they'll get at the end.

**Fix:** Add a brief intro screen before the first session drill: "10-Drill Session — A curated set of drills targeting your weaknesses. You'll get a score at the end."

### 8. Upgrade page for premium users is wasted space
**Evidence:** `mobile-upgrade-returning-top.png` (shown with premium storage)

Premium users see "Pro Unlocked — All features are active. Thank you for supporting Scam Gym!" on an otherwise empty page. This is a dead end.

**Fix:** Turn this into a "Pro Dashboard" showing premium features in use, or redirect premium users away from this route entirely (replace nav link with something useful).

---

## Medium-Priority Issues

### 9. Landing page (fresh user) is text-heavy
**Evidence:** `mobile-home-fresh-top.png`, `mobile-home-fresh-bottom.png`

The onboarding landing page has good structure (headline, demo drill, feature cards) but the feature cards at the bottom ("Real-world drills", "Confidence tracking", "Personal risk profile") are text-heavy with small type. They read like documentation, not marketing.

**Fix:**
- Larger icons with more visual prominence
- Shorter copy — one line each, not two
- Add social proof numbers if available ("2,000+ drills completed")

### 10. Help page ("Help Me Right Now") needs urgency design
**Evidence:** `mobile-help-returning-top.png`

The help page asks "How did they contact you?" with 4 large cards. This is good UX for the use case, but the page title "Help Me Right Now" and the calm card layout don't match the urgency a user in this situation would feel.

**Fix:**
- Add a reassuring banner: "Don't respond to the message yet. Let's figure this out together."
- Use warmer colors (not just dark cards on dark background)
- Make the cards more visually distinct from each other

### 11. Help scripts page is very hard to read
**Evidence:** `mobile-help-scripts-returning-top.png`

The scripts page is extremely long and dense — it rendered as a very tall narrow screenshot suggesting walls of text. Small font on dark background makes this particularly hard for older adults.

**Fix:**
- Use expandable accordions instead of showing all scripts at once
- Increase font size for this reference content
- Add a "Copy to clipboard" button for each script

### 12. Verification Vault empty state
**Evidence:** `mobile-help-vault-returning-top.png`

Clean empty state with warning banner and "+ Add Contact" CTA. The warning banner is good. However, the page feels disconnected from the rest of the app.

**Fix:** Add a brief explanation of WHY someone would save contacts here, with an example: "Saved your bank's real number? Next time you get a suspicious call, check it here first."

### 13. Settings page is very long and undifferentiated
**Evidence:** `mobile-settings-returning-top.png`, `mobile-settings-returning-bottom.png`

Settings is a single long scroll with sections: Training Mode, Larger text, Sound, Theme, Focus Training, Export/Import Data, Reset, Usage analytics, About. All sections have the same visual weight.

**Fix:**
- Group into collapsible sections: "Training", "Accessibility", "Data", "About"
- Move dangerous action ("Reset All Data") behind a confirmation AND visually separate it from routine settings
- The "Upgrade to unlock" button appears twice — once at top, once mid-page. Keep only one.

---

## Low-Priority / Polish

### 14. Color consistency
The accent purple (`#7c5cfc`-ish) is used for primary CTAs, active states, and decorative borders. It works well. However, the Scam button red and Legit button green could have stronger contrast against the dark background for accessibility.

### 15. Touch target sizes
Several interactive elements (confidence percentages, behavioral response pills, navigation links) appear to be below the recommended 44x44px minimum touch target. This is especially important for the older-adult audience.

### 16. Result page not captured in answered state
The result page screenshots show a new drill (not a completed result) because the screenshot tool didn't simulate submitting an answer. This means the actual result/feedback UI wasn't audited. Consider adding a manual capture for this.

---

## Recommended Implementation Order

| Priority | Issue | Effort | Impact |
|----------|-------|--------|--------|
| P0 | #3 — Add bottom tab navigation | Medium | High |
| P0 | #1 — Desktop responsive layout | Medium | High |
| P0 | #2 — Stats empty state improvement | Low | Medium |
| P1 | #5 — Confidence slider redesign | Low | Medium |
| P1 | #6 — Behavioral response redesign | Low | Medium |
| P1 | #4 — Drill navigation fix | Low | Low |
| P1 | #7 — Session intro screen | Low | Medium |
| P1 | #8 — Premium upgrade page redirect | Low | Low |
| P2 | #13 — Settings page grouping | Medium | Medium |
| P2 | #9 — Landing page copy tightening | Low | Medium |
| P2 | #10 — Help page urgency design | Low | Medium |
| P2 | #11 — Help scripts readability | Medium | Medium |
| P2 | #12 — Vault empty state copy | Low | Low |
| P3 | #14 — Color contrast audit | Low | Low |
| P3 | #15 — Touch target sizing pass | Medium | Medium |
