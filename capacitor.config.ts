import type { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "com.scamgym.app",
  appName: "Scam Gym",
  // Point at the live deployed URL — updates ship over-the-air without store review.
  // Switch to webDir for a fully offline static build if needed later.
  server: {
    url: "https://scamgym.com",
    cleartext: false,
  },
  android: {
    backgroundColor: "#faf7f2",
    allowMixedContent: false,
    captureInput: true,
    webContentsDebuggingEnabled: false,
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 1200,
      backgroundColor: "#faf7f2",
      androidSplashResourceName: "splash",
      showSpinner: false,
    },
  },
};

export default config;
