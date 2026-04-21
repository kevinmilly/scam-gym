# Android Release Guide

## One-time setup: Create a signing keystore

Run this once. Store the keystore and passwords somewhere safe (password manager).

```bash
keytool -genkey -v \
  -keystore android/keystore.jks \
  -alias scamgym \
  -keyalg RSA \
  -keysize 2048 \
  -validity 10000
```

You'll be prompted for:
- Keystore password (make it strong, save it)
- Key password (can be same as keystore password)
- Your name, org, city, country

**Never commit keystore.jks to git** — it's in .gitignore.

## Configure signing in Gradle

Create `android/keystore.properties` (also gitignored):

```properties
storeFile=../keystore.jks
storePassword=YOUR_KEYSTORE_PASSWORD
keyAlias=scamgym
keyPassword=YOUR_KEY_PASSWORD
```

Then update `android/app/build.gradle` — add this block inside `android {}`:

```gradle
def keystorePropertiesFile = rootProject.file("keystore.properties")
def keystoreProperties = new Properties()
if (keystorePropertiesFile.exists()) {
    keystoreProperties.load(new FileInputStream(keystorePropertiesFile))
}

signingConfigs {
    release {
        storeFile file(keystoreProperties['storeFile'])
        storePassword keystoreProperties['storePassword']
        keyAlias keystoreProperties['keyAlias']
        keyPassword keystoreProperties['keyPassword']
    }
}
```

And update the `release` build type to use it:

```gradle
buildTypes {
    release {
        minifyEnabled false
        proguardFiles getDefaultProguardFile('proguard-android.txt'), 'proguard-rules.pro'
        signingConfig signingConfigs.release
    }
}
```

## Build the release AAB (for Play Store)

```bash
npm run android:bundle
# Output: android/app/build/outputs/bundle/release/app-release.aab
```

## Play Store submission checklist

1. **Google Play Console** — play.google.com/console ($25 one-time, same-day approval)
2. Create app → Package name: `com.scamgym.app`
3. Upload `app-release.aab`
4. Fill in store listing:
   - **Short description** (80 chars): "Practice spotting scams before they cost you. Free."
   - **Full description** (4000 chars): see below
   - **Category**: Education
   - **Content rating**: Complete questionnaire → Everyone
5. Screenshots needed (at least 2 per form factor):
   - Phone: 1080×1920 or similar — capture home, drill, result, stats screens
6. Privacy policy URL: `https://scamgym.com/privacy` (needs to exist — see note)
7. Submit for review — Google typically approves in 1–3 days

## Full description draft

```
Scam Gym — Practice spotting scams before they cost you.

Most people only learn about scams after they've been fooled. Scam Gym lets you practice safely first — with real-world scam messages, one at a time, at your own pace.

WHAT YOU'LL PRACTICE
• Fake delivery texts and toll notices
• Bank fraud alerts
• Tech support scams
• Job offer scams
• Phishing emails
• AI-generated scam messages

HOW IT WORKS
Each practice round shows you a real-style scam or legitimate message. You decide: scam or legit? Then see exactly what gave it away — the red flags, the tells, the safe move.

YOUR PROGRESS TRACKS ITSELF
Scam Gym tracks not just whether you got it right, but how confident you were. Overconfidence is the real danger — the app shows you when you're certain but wrong, which is exactly when scammers win.

DAILY SCAM IQ QUIZ
Test yourself with 10 questions daily. See your score, see how you rank, and share your result to challenge friends and family.

FREE TO USE
No account needed to start. Practice as much as you want for free. Pro upgrade available for deeper analysis and weak-spot training.

BUILT FOR EVERYONE
Large text, clear buttons, no jargon. Designed with adults 50+ in mind — because that's who scammers target most.
```

## Note: Privacy policy

You need a privacy policy at `scamgym.com/privacy` before submitting. It must disclose:
- Firebase (auth, analytics)
- Stripe (payment processing)
- PostHog (analytics)
- What data is stored locally vs. server-side

Create a simple page at `app/privacy/page.tsx` — see Batch 3 work.

## Updating the app

Since the app loads `https://scamgym.com` live, most updates ship automatically without a new Play Store release. Only submit a new build when:
- Native Capacitor plugins change
- `versionCode` / `versionName` bump needed
- Play Store policy requires it
