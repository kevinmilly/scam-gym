# Data Safety Form Answers

Paste into Play Console → App content → Data safety.

## Top-level
- **Does your app collect or share any of the required user data types?** YES
- **Is all of the user data collected by your app encrypted in transit?** YES (HTTPS, Firebase, Stripe — all TLS)
- **Do you provide a way for users to request that their data is deleted?** YES (Settings → Delete Account, or email kevincoder@protonmail.com)

## Data types collected

### 1. Personal info → Email address
- **Collected?** YES
- **Shared?** NO
- **Optional?** YES (only if user signs in with Google to sync Pro across devices)
- **Purposes:**
  - Account management
  - App functionality (sync premium status across devices)
- **Processed ephemerally?** NO

### 2. Financial info → Purchase history
- **Collected?** YES (Stripe session ID stored to verify Pro purchase on restore)
- **Shared?** NO (Stripe handles the card directly; we never see card data)
- **Optional?** YES (only if user buys Pro)
- **Purposes:**
  - App functionality (verify Pro entitlement)
- **Processed ephemerally?** NO

### 3. App activity → App interactions
- **Collected?** YES (PostHog: screen views, drill completions, anonymous)
- **Shared?** NO
- **Optional?** YES (toggle in Settings → Analytics)
- **Purposes:**
  - Analytics
  - App functionality (improve the product)
- **Processed ephemerally?** NO

## Data types NOT collected
Confirm "No" for all of these (manifest only requests INTERNET permission):
- Location (precise or approximate)
- Contacts
- Photos / videos / files
- Calendar
- SMS / call logs
- Microphone / camera
- Health & fitness
- Device or other identifiers
- Web browsing history
- Installed apps

## Security practices
- **Data is encrypted in transit:** YES
- **Users can request data deletion:** YES
- **Independent security review:** NO
- **Committed to Play Families Policy:** N/A (not targeted at children)

## Notes
- All "personal" data (email, purchase, activity) is OPTIONAL — the core app works fully without sign-in or analytics.
- Practice attempts, stats, streaks, and bookmarks stay in IndexedDB on the device. Not collected by us, so they don't go on this form.
