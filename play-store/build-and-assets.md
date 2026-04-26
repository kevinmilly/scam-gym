# Signed Build + Visual Assets Runbook

Order: generate keystore → fill `keystore.properties` → produce assets → build AAB → upload.

## 1. Visual assets needed for Play Console

| Asset | Spec | Source |
|---|---|---|
| App icon | 512×512 PNG, no transparency, no rounded corners (Play applies them) | Existing purple shield-and-dumbbells logo. Generate via `npx capacitor-assets generate` (the `@capacitor/assets` package is already in devDependencies). |
| Feature graphic | 1024×500 PNG/JPEG, no transparency | Needs design. Plain background + logo + tagline ("Practice spotting scams") works. |
| Phone screenshots | 2–8, JPEG/PNG, 16:9 or 9:16, min 320 / max 3840 px on long side | Capture from running app on phone-sized browser or actual device. |
| 7" tablet screenshots | Optional, 2–8 | Skip for v1. |
| 10" tablet screenshots | Optional, 2–8 | Skip for v1. |
| Promo video | Optional, YouTube URL | Skip for v1. |

### Phone screenshots to capture (recommend 5)
1. Home page hero — "Practice spotting scams before they hit you"
2. Drill in progress — Scam vs. Legit decision
3. Result page with explanation
4. Stats page showing accuracy by family
5. Pro upsell page

To generate Android launcher icons from the existing logo:
```bash
# Place a 1024x1024 source PNG at assets/icon.png and assets/splash.png first
npx capacitor-assets generate --android
```

## 2. Keystore generation

⚠️ **Do this once. The keystore is permanent for the app's life on Play Store. Lose it → you can never update the app again.**

```bash
cd C:/Users/jamik/kevinProjects/scam-gym/android
keytool -genkey -v -keystore scamgym-release.keystore -alias scamgym -keyalg RSA -keysize 2048 -validity 10000
```

Will prompt for:
- **Keystore password** — pick something strong, save it in a password manager NOW
- Name / org / city / country — anything; not shown to users
- **Key password** — can be the same as keystore password (simpler)

### Backup the keystore immediately
Copy `android/scamgym-release.keystore` to:
1. A cloud drive (Google Drive, Dropbox, OneDrive)
2. A USB stick or external drive
3. (Optional) Encrypted archive in a second cloud account

The file is in `.gitignore` (or should be — verify). Never commit it.

## 3. Create `android/keystore.properties`

This file is referenced by `android/app/build.gradle:25-32`. Create it manually (gitignored):

```properties
storeFile=scamgym-release.keystore
storePassword=YOUR_KEYSTORE_PASSWORD
keyAlias=scamgym
keyPassword=YOUR_KEY_PASSWORD
```

Verify it's gitignored:
```bash
git check-ignore android/keystore.properties android/scamgym-release.keystore
# Both paths should print (= ignored). If empty, add to .gitignore.
```

## 4. Build signed release AAB

```bash
npm run android:sync    # syncs latest web build into Android project
npm run android:bundle  # produces app-release.aab
```

Output: `android/app/build/outputs/bundle/release/app-release.aab`

Upload that AAB to Play Console → Production (or Internal testing first).

## 5. Internal testing track first
Before pushing to production:
1. Create an internal testing release with the AAB
2. Add your Gmail as a tester
3. Install on your own Android phone via the Play opt-in link
4. Verify:
   - App launches and loads scamgym.com
   - Sign-in flow works (Firebase popup, since this is a WebView wrapper)
   - Stripe payment redirect works (returns to app, not browser)
   - Deep link `https://scamgym.com/...` opens the app, not Chrome

If sign-in or Stripe break in WebView mode, that's the highest-risk surprise — Capacitor's WebView has different cookie/popup behavior than mobile Chrome.
