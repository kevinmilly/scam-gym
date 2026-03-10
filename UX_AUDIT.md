# Scam Gym — UX & Functionality Audit
> Generated via static code analysis of all pages, components, and lib files.

---

## 🔴 CONFIRMED BUGS (code-verified, will cause wrong behavior)

### 1. Undefined CSS variable `--bg` used in 2 places
**Files:** `app/page.tsx:429`, `app/help/scripts/page.tsx:211`
**Details:** Both files use `var(--bg)` but `globals.css` only defines `--background`. In CSS, an invalid variable falls back to `initial` (transparent).
- **Home page returning-user screen:** the sticky CTA gradient (`transparent → var(--bg)`) renders fully transparent — content scrolls visibly behind the action buttons.
- **Help scripts page:** background is transparent instead of the intended background color.
**Fix:** Replace `var(--bg)` with `var(--background)` in both locations.

---

### 2. Training banner "expand" state is dead code — banner permanently hidden after 5 drills
**File:** `app/drill/page.tsx:173-183`
**Details:** The banner hides after 5 completed drills (`bannerCompact = true`). There is a `bannerExpanded` state variable and the `onClick` sets it to `false`, but `setBannerExpanded(true)` is **never called anywhere**. The expand button doesn't exist. Once hidden, the safety disclaimer is gone permanently with no way to recall it.
**Impact:** Users who haven't seen the banner enough times lose access to the "never use links/numbers" warning.
**Fix:** Either remove `bannerExpanded` state entirely (just hide it permanently after 5 drills and document that's intentional), or add a button to re-show it.

---

### 3. Settings "Reset All Data" leaves most localStorage keys intact
**File:** `app/settings/page.tsx:73-83`
**Details:** `handleReset()` calls `resetAllData()` (which clears IndexedDB) and then manually removes only `scamgym_onboarded` and `scamgym_context`. It does **not** clear:
- `scamgym_streak`
- `scamgym_bookmarks`
- `scamgym_focus_families`
- `scamgym_slowmode`
- `scamgym_theme`
- `scamgym_sound_default`
- `scamgym_analytics_enabled`
- `scamgym_premium` (arguably intentional, but worth noting)

After "Reset All Data", the user returns to the onboarding screen but their streak, bookmarks, and focus settings persist — making the reset misleading and incomplete.
**Fix:** Clear all `scamgym_*` keys (except `scamgym_premium` if intentional) in `handleReset`.

---

### 4. Result page "← Drill" back button navigates *forward* (to the next drill)
**File:** `app/result/page.tsx:244`
**Details:** The header back button says "← Drill" and calls `router.push("/drill")`. The sticky footer also has "Next Drill →" which calls `router.push("/drill")`. Both buttons do the **same thing** — go to the next drill — but the back button uses a left arrow and "Drill" label, implying it goes back. For users who want to re-read the drill they just completed, there's no way to do so, and the back button is deceptive.
**Impact:** Users (especially older adults) will expect ← to go back. Instead they skip to the next drill.
**Fix:** Either remove the header back button on the result page, change it to "← Home" linking to `/?from=drill`, or relabel it "Next Drill" to match the footer.

---

### 5. `updateStreak()` fires on every result page load, including page refresh
**File:** `app/result/page.tsx:103`
**Details:** `updateStreak()` is called unconditionally inside the `useEffect` that reads from `sessionStorage`. If the user refreshes the result page (the `sessionStorage` data still exists during the same tab session), `updateStreak()` fires again. Since streak uses date-based logic, this likely won't double-count, but it's semantically wrong — the streak should only update when a drill is *completed*, not when the result page is *viewed*. Also, if someone opens result in a second tab, they'd get a second streak update call.
**Fix:** Set a `streakUpdated` key in `sessionStorage` after the first call and skip if already set.

---

## 🟡 UX ISSUES (work technically, but create friction or confusion)

### 6. "Train My Weak Spots" silently falls back with no user feedback
**File:** `app/page.tsx:446-458`
**Details:** If a premium user clicks "Train My Weak Spots" but has fewer than 2 attempts per family (new user), `weakFamilies` is empty and the code silently calls `handleStart()` — navigating to `/drill` in normal mode. The user gets no feedback explaining why autopilot didn't activate.
**Fix:** Show a brief message like "Do a few more drills first — we need data to find your weak spots."

---

### 7. Session page shows browser `confirm()` dialog for exit
**File:** `app/session/page.tsx:325`
**Details:** The Exit button uses native `window.confirm("Leave session? Progress will be lost.")`. This is blocked by some mobile browsers and looks jarring. On iOS WebKit, `confirm()` in PWA standalone mode can be non-functional.
**Fix:** Replace with an in-UI confirmation state (toggle a confirm banner/overlay instead of native dialog).

---

### 8. No "back" button in the context picker for brand-new users
**File:** `app/page.tsx:258-314`
**Details:** When a new user clicks "Try Your First Drill" and reaches the context picker, there's no way to go back to the onboarding/welcome screen. The back button is absent. If they want to re-read the value props before committing, they're stuck.
**Fix:** Add a `← Back` button that sets `setShowContextPicker(false); setShowOnboarding(true)`.

---

### 9. Home page flashes blank before content appears
**File:** `app/page.tsx:105`
**Details:** `if (!checked) return null` causes a blank white/dark flash on every home page load while `useEffect` runs to check `localStorage`. For older-device users this can be a noticeable flash.
**Fix:** Return a minimal skeleton (logo at minimum) instead of `null`.

---

### 10. Home page: changing context from returning user screen doesn't re-onboard
**File:** `app/page.tsx:91-94`
**Details:** `handleContextSelect()` closes the context picker (`setShowContextPicker(false)`) but doesn't navigate anywhere — it returns to the returning user screen. However, the `scamgym_onboarded` key is not updated, so if the user changes context via this path and then navigates home again (without `?from=drill`), they'd be auto-redirected to `/drill` with the new context. This flow is technically correct but the UX transition is abrupt — the context picker disappears instantly with no confirmation feedback.

---

### 11. Drill page: no error recovery if `saveAttempt()` throws
**File:** `app/drill/page.tsx:63-115`
**Details:** If IndexedDB write fails (storage quota exceeded, private browsing), `setSubmitting(true)` stays `true` permanently and the button shows "Submitting…" forever. There's no error state, no retry, and no user message.
**Fix:** Add a try/catch around `saveAttempt()` and reset `submitting` + show an error message on failure.

---

### 12. Stats page "premium-gated" sections show upsell pitch but no free sample
**File:** `app/stats/page.tsx` (via `PremiumGate`)
**Details:** The Accuracy Trend Chart, Attempt History, and Saved Drills sections show upsell cards for free users. The `peekContent` (blurred preview) prop exists in `PremiumGate` for exactly this purpose, but none of these stats sections pass `peekContent`. Free users see no preview of what they'd be unlocking — just a sales pitch. For conversion, a blurred 1-line preview would significantly increase upgrade intent.

---

### 13. Session page: progress bar starts at 0% (not 1/10) on first drill
**File:** `app/session/page.tsx:357`
**Details:** `width: ((session.currentIndex) / sessionDrills.length) * 100}%` — on the first drill, `currentIndex = 0` so the bar is 0% wide. It only starts visually filling after the first submission. Users may think the progress bar is broken.
**Fix:** Use `(currentIndex + 1)` or `((currentIndex + 0.5) / total)` to show at least partial fill on drill 1.

---

## 🟢 WORKING WELL (worth noting)

- **Premium URL param cleanup**: `?premium=1` is properly cleaned via `window.history.replaceState` ✓
- **Result page sessionStorage guard**: Missing data → redirect to `/drill` is clean ✓
- **`?from=drill` loop prevention**: Home page correctly avoids infinite redirect using this param ✓
- **Double-submit guard**: `submitting` state correctly disables the button ✓
- **Drill reset on navigation**: `useEffect` on `currentDrill?.id` correctly resets form state ✓
- **Context picker in settings**: Correctly updates `scamgym_context` via DrillContext ✓

---

## Priority Fix Order

| Priority | Issue | Effort |
|----------|-------|--------|
| P1 | `var(--bg)` undefined (visual bug on home + help/scripts) | ~5 min |
| P1 | Reset All Data incomplete | ~15 min |
| P1 | "← Drill" back button misleading direction | ~5 min |
| P2 | Training banner expand dead code | ~10 min |
| P2 | `updateStreak()` fires on refresh | ~10 min |
| P2 | No error recovery on drill submit failure | ~15 min |
| P3 | "Train My Weak Spots" silent fallback | ~10 min |
| P3 | Session exit uses `confirm()` | ~20 min |
| P3 | No back button in context picker | ~10 min |
| P3 | Home page blank flash | ~10 min |
| P3 | Session progress bar starts at 0% | ~5 min |
