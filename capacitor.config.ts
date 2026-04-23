import type { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "com.scamgym.app",
  appName: "Scam Gym",
  webDir: "out",
  android: {
    backgroundColor: "#faf7f2",
    allowMixedContent: false,
    captureInput: true,
    webContentsDebuggingEnabled: false,
  },
  plugins: {
    FirebaseAuthentication: {
      skipNativeAuth: false,
      providers: ["google.com"],
    },
    SplashScreen: {
      launchShowDuration: 1200,
      backgroundColor: "#faf7f2",
      androidSplashResourceName: "splash",
      showSpinner: false,
    },
  },
};

export default config;
