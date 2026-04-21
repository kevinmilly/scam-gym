export default function PrivacyPage() {
  return (
    <div className="max-w-2xl mx-auto px-5 py-10 space-y-6" style={{ color: "var(--text)" }}>
      <h1 className="text-2xl font-bold" style={{ color: "var(--text)" }}>Privacy Policy</h1>
      <p className="text-xs" style={{ color: "var(--text-muted)" }}>Last updated: April 2026</p>

      <section className="space-y-2">
        <h2 className="text-base font-bold">What Scam Gym collects</h2>
        <p className="text-sm leading-relaxed" style={{ color: "var(--text-muted)" }}>
          Scam Gym is designed to work with as little data collection as possible. Most of your practice data — your attempts, scores, streaks, and bookmarks — stays entirely on your device and is never sent to our servers.
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="text-base font-bold">Data stored on your device only</h2>
        <ul className="text-sm leading-relaxed space-y-1 list-disc pl-4" style={{ color: "var(--text-muted)" }}>
          <li>Your practice attempt history (correct/incorrect, confidence, timestamps)</li>
          <li>Your accuracy stats and vulnerability profile</li>
          <li>Bookmarked practice rounds</li>
          <li>Streak and milestone progress</li>
          <li>App settings (theme, focus families, vacation mode)</li>
        </ul>
        <p className="text-sm leading-relaxed" style={{ color: "var(--text-muted)" }}>
          This data lives in your browser&apos;s local storage and IndexedDB. It is not accessible to us. Clearing your browser data or uninstalling the app deletes it permanently.
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="text-base font-bold">Data collected when you sign in (optional)</h2>
        <p className="text-sm leading-relaxed" style={{ color: "var(--text-muted)" }}>
          If you choose to sign in with Google to sync your Pro status across devices, we store the following in Firebase Firestore:
        </p>
        <ul className="text-sm leading-relaxed space-y-1 list-disc pl-4" style={{ color: "var(--text-muted)" }}>
          <li>Your email address</li>
          <li>The date you unlocked Pro</li>
          <li>Your Stripe session ID (to verify the purchase)</li>
        </ul>
        <p className="text-sm leading-relaxed" style={{ color: "var(--text-muted)" }}>
          We do not store your practice history server-side. Sign-in is optional and only used to restore your Pro status on a new device.
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="text-base font-bold">Third-party services</h2>
        <ul className="text-sm leading-relaxed space-y-1 list-disc pl-4" style={{ color: "var(--text-muted)" }}>
          <li><strong>Firebase (Google)</strong> — authentication and Pro status sync. <a href="https://firebase.google.com/support/privacy" className="underline">Firebase Privacy Policy</a></li>
          <li><strong>Stripe</strong> — payment processing for Pro. We never see your card details. <a href="https://stripe.com/privacy" className="underline">Stripe Privacy Policy</a></li>
          <li><strong>PostHog</strong> — anonymized usage analytics (e.g. which screens are visited, quiz completion rates). No personally identifiable information is sent. <a href="https://posthog.com/privacy" className="underline">PostHog Privacy Policy</a></li>
        </ul>
      </section>

      <section className="space-y-2">
        <h2 className="text-base font-bold">Cookies and tracking</h2>
        <p className="text-sm leading-relaxed" style={{ color: "var(--text-muted)" }}>
          We do not use advertising cookies or sell your data. PostHog analytics uses a first-party cookie to count unique sessions; you can opt out in Settings → Analytics.
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="text-base font-bold">Children</h2>
        <p className="text-sm leading-relaxed" style={{ color: "var(--text-muted)" }}>
          Scam Gym is not directed at children under 13. We do not knowingly collect data from children.
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="text-base font-bold">Deleting your data</h2>
        <p className="text-sm leading-relaxed" style={{ color: "var(--text-muted)" }}>
          To delete all local data: Settings → Reset All Data. To delete your account and server-side data (if signed in): Settings → Delete Account. To request data deletion by email: contact@scamgym.com.
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="text-base font-bold">Contact</h2>
        <p className="text-sm leading-relaxed" style={{ color: "var(--text-muted)" }}>
          Questions? Email contact@scamgym.com.
        </p>
      </section>
    </div>
  );
}
