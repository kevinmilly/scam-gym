# ISSUES.md — Scam Gym
_Generated from static code analysis + Playwright test run · 2026-03-08_

---

## Issue 1: Undefined CSS variable `--bg` causes transparent backgrounds

**Severity:** P1
**Failing test:** Visual — not caught by assertions, but confirmed by code
**Symptom:** The sticky CTA gradient on the home page returning-user screen fades to transparent instead of the background color. The `/help/scripts` page background is also transparent.
**Likely cause:** `app/page.tsx:429` and `app/help/scripts/page.tsx:211` both use `var(--bg)`, but `app/globals.css` only defines `--background`. CSS silently ignores undefined variables and falls back to transparent.
**Fix:**
- In `app/page.tsx:429`: change `var(--bg)` → `var(--background)`
- In `app/help/scripts/page.tsx:211`: change `var(--bg)` → `var(--background)`

---

## Issue 2: Premium toast never shown — onboarded users are redirected before it renders

**Severity:** P1
**Failing test:** `04-premium.spec.ts › ?premium=1 param unlocks premium and shows toast`
**Symptom:** When a Stripe payment completes and redirects to `/?premium=1`, onboarded users are immediately redirected to `/drill` by the second `useEffect` before the premium toast can render. The `unlockPremium()` call succeeds (localStorage is set) but the confirmation UI is never seen.
**Likely cause:** `app/page.tsx` — two `useEffect` hooks race: the premium effect sets `premiumJustActivated = true`, but the redirect effect fires simultaneously and calls `router.replace("/drill")`, unmounting the component before the toast renders. The `?premium=1` URL param is not treated as equivalent to `?from=drill` for redirect-prevention purposes.
**Fix:** In the redirect `useEffect` in `app/page.tsx`, add `searchParams.get("premium") === "1"` as an additional condition to skip the redirect:
```ts
if (onboarded && selectedContext && !fromDrill && searchParams.get("premium") !== "1") {
  router.replace("/drill");
}
```

---

## Issue 3: Reset All Data leaves streak, bookmarks, and focus families in localStorage

**Severity:** P1
**Failing test:** `05-settings.spec.ts › reset data: REGRESSION — streak localStorage key remains after reset`
**Symptom:** After "Reset All Data", the user's streak, bookmarks, and focus training settings persist. IndexedDB is cleared but most localStorage keys are not.
**Likely cause:** `app/settings/page.tsx:73-83` — `handleReset()` only removes `scamgym_onboarded` and `scamgym_context`. The following keys are never cleared: `scamgym_streak`, `scamgym_bookmarks`, `scamgym_focus_families`, `scamgym_slowmode`, `scamgym_theme`, `scamgym_sound_default`, `scamgym_analytics_enabled`.
**Fix:** After `await resetAllData()` in `handleReset()`, clear all remaining scamgym keys:
```ts
[
  "scamgym_streak",
  "scamgym_bookmarks",
  "scamgym_focus_families",
  "scamgym_slowmode",
  "scamgym_theme",
  "scamgym_sound_default",
  "scamgym_analytics_enabled",
].forEach((k) => localStorage.removeItem(k));
```
Note: `scamgym_premium` should intentionally NOT be cleared on reset (it's a purchase record).

---

## Issue 4: Result page "← Drill" back button navigates forward (same as "Next Drill →")

**Severity:** P2
**Failing test:** UX issue — no assertion catches this, but both header and footer buttons call `router.push("/drill")`
**Symptom:** The header button on the result page says "← Drill" with a left-arrow, implying it goes back. It actually navigates to the next drill, identical to the "Next Drill →" footer button. Users (especially older adults) will tap ← expecting to return to the current drill.
**Likely cause:** `app/result/page.tsx:244` — `onClick={() => router.push("/drill")}` on a button labeled `"← Drill"`.
**Fix:** Either:
- Remove the header back button from the result page entirely (the sticky footer already handles "Next Drill"), or
- Change the header button to navigate home: `router.push("/?from=drill")` and relabel it `"← Home"`

---

## Issue 5: Training banner expand is dead code — banner hidden permanently after 5 drills

**Severity:** P2
**Failing test:** `02-drill-flow.spec.ts` (implicit — banner disappears with no way to restore)
**Symptom:** After 5 drills, the safety disclaimer banner ("🔒 Simulated training message — never use any links or numbers shown") hides permanently. The `bannerExpanded` state exists to re-show it, but `setBannerExpanded(true)` is never called anywhere in the code.
**Likely cause:** `app/drill/page.tsx:35,173-183` — `bannerExpanded` starts `false`, can only be set to `false` (via `onClick` and `useEffect`), and there is no UI trigger to set it to `true`. The expand button was never implemented.
**Fix:** Remove the dead `bannerExpanded` state and simplify: either hide the banner after 5 drills permanently (and remove unused state), or add a small "ⓘ" button that calls `setBannerExpanded(true)`:
```tsx
{bannerCompact && !bannerExpanded ? (
  <button onClick={() => setBannerExpanded(true)} className="text-xs" style={{color:"var(--text-muted)"}}>
    ⚠️ Training message
  </button>
) : (...existing banner...)}
```

---

## Issue 6: `updateStreak()` fires on every result page render, not just first completion

**Severity:** P2
**Failing test:** N/A — logic bug, not caught by assertions
**Symptom:** `updateStreak()` is called inside the `useEffect` that reads `sessionStorage` on the result page. If the user refreshes the result page, streak is re-triggered on a replay of an old result. While the date-based logic prevents double-counting within a day, the call is semantically wrong and could cause edge-case issues if a user completes a drill just before midnight and refreshes after.
**Likely cause:** `app/result/page.tsx:103` — `updateStreak()` is called unconditionally inside the load effect.
**Fix:** Add a `streakUpdated` flag to `sessionStorage` and only call `updateStreak()` once per drill:
```ts
if (!sessionStorage.getItem("streakUpdated")) {
  updateStreak();
  sessionStorage.setItem("streakUpdated", "1");
}
```
Clear this key in `app/drill/page.tsx` before navigating to result (after `advance()`).

---

## Issue 7: Session exit uses `window.confirm()` — broken in PWA standalone mode on iOS

**Severity:** P2
**Failing test:** `08-session.spec.ts › exit button with cancel keeps user in session` (Playwright handles dialogs but real iOS Safari PWA blocks `confirm()`)
**Symptom:** On iOS in PWA/standalone mode, `window.confirm()` is suppressed by WebKit and returns `false` immediately. Users cannot exit a session on iOS — the dialog silently accepts or blocks without showing.
**Likely cause:** `app/session/page.tsx:325` — `if (confirm("Leave session? Progress will be lost."))`.
**Fix:** Replace with in-component confirm state:
```tsx
const [showExitConfirm, setShowExitConfirm] = useState(false);

// Header button:
onClick={() => setShowExitConfirm(true)}

// Show an inline confirm banner when showExitConfirm is true:
{showExitConfirm && (
  <div className="...">
    <p>Leave session? Progress will be lost.</p>
    <button onClick={() => { clearSession(); router.push("/?from=drill"); }}>Leave</button>
    <button onClick={() => setShowExitConfirm(false)}>Stay</button>
  </div>
)}
```

---

## Issue 8: No error recovery when `saveAttempt()` fails on the drill page

**Severity:** P2
**Failing test:** N/A — not tested (no failure simulation), but confirmed by code review
**Symptom:** If IndexedDB write fails (e.g. storage quota exceeded, private browsing mode), `setSubmitting(true)` is never reset and the Submit button shows "Submitting…" permanently. The user is stuck with no error message and no way to proceed.
**Likely cause:** `app/drill/page.tsx:98` — `await saveAttempt(attempt)` has no try/catch. If it throws, the function exits without navigating to `/result` or resetting `submitting`.
**Fix:** Wrap the async work in a try/catch:
```ts
try {
  await saveAttempt(attempt);
  recordAttempt(attempt);
  // ... rest of submit logic
  router.push("/result");
} catch (err) {
  console.error("Failed to save attempt:", err);
  setSubmitting(false);
  // Optionally show a toast: setErrorMsg("Failed to save — please try again.")
}
```

---

## Issue 9: Home page flashes blank before content appears

**Severity:** P3
**Failing test:** N/A — visual flash, not assertion-testable
**Symptom:** `if (!checked) return null` on the home page causes a blank flash on every visit while `localStorage` is read in `useEffect`. On slower devices this is a noticeable white/black flash before the logo appears.
**Likely cause:** `app/page.tsx:105` — renders nothing until the `checked` state is set by the `useEffect`.
**Fix:** Replace `return null` with a minimal skeleton that shows instantly:
```tsx
if (!checked) return (
  <div className="flex flex-col min-h-dvh px-6 py-10">
    <div className="mb-12 flex items-center gap-2">
      {/* Logo — same SVG as main render */}
      <span className="font-bold text-xl tracking-tight" style={{ color: "var(--text)" }}>Scam Gym</span>
    </div>
  </div>
);
```

---

## Issue 10: "Train My Weak Spots" silently falls back with no user feedback

**Severity:** P3
**Failing test:** N/A — UX issue, not assertion-testable
**Symptom:** If a premium user clicks "Train My Weak Spots" but hasn't completed enough drills (fewer than 2 per family), `weakFamilies` is empty and the button silently calls `handleStart()` — starting a normal drill with no explanation. The user gets no feedback about why autopilot didn't activate.
**Likely cause:** `app/page.tsx:451-458` — `if (weakFamilies.length > 0) { ... } else { handleStart(); }` with no user-facing message.
**Fix:** Show a brief inline message before falling back:
```ts
} else {
  // Not enough data yet — fall back to normal drill with a toast
  setAutopilotMsg("Do a few more drills first — we need more data to find your weak spots.");
  handleStart();
}
```

---

## Issue 11: Session progress bar starts at 0% on first drill

**Severity:** P3
**Failing test:** `08-session.spec.ts › session shows progress bar` (passes but bar is 0% wide — invisible)
**Symptom:** The session progress bar width is `(currentIndex / total) * 100%`. On the first drill, `currentIndex = 0`, so the bar is 0% wide and invisible. Users may think it's broken.
**Likely cause:** `app/session/page.tsx:357` — `width: ((session.currentIndex) / sessionDrills.length) * 100}%`
**Fix:** Use `currentIndex + 1` so the bar starts at 10% (1/10) on the first drill:
```tsx
width: `${((session.currentIndex + 1) / sessionDrills.length) * 100}%`
```

---

## Summary

### P1 — Fix immediately
- Issue 1: `var(--bg)` undefined → transparent backgrounds (`app/page.tsx`, `app/help/scripts/page.tsx`)
- Issue 2: Premium toast never shown after Stripe redirect (`app/page.tsx`)
- Issue 3: Reset All Data incomplete — streak/bookmarks/focus survive reset (`app/settings/page.tsx`)

### P2 — Fix soon
- Issue 4: "← Drill" back button goes forward, not back (`app/result/page.tsx`)
- Issue 5: Training banner expand is dead code (`app/drill/page.tsx`)
- Issue 6: `updateStreak()` fires on result page refresh (`app/result/page.tsx`)
- Issue 7: `window.confirm()` broken in iOS PWA standalone mode (`app/session/page.tsx`)
- Issue 8: No error recovery if `saveAttempt()` throws (`app/drill/page.tsx`)

### P3 — Polish
- Issue 9: Home page blank flash before content (`app/page.tsx`)
- Issue 10: "Train My Weak Spots" silent fallback (`app/page.tsx`)
- Issue 11: Session progress bar starts at 0% (`app/session/page.tsx`)
