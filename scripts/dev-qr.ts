import { networkInterfaces } from "os";
import { spawn } from "child_process";
import qrcode from "qrcode-terminal";

const PORT = process.env.PORT || "3000";

function getLanAddress(): string | null {
  const ifaces = networkInterfaces();
  const candidates: string[] = [];
  for (const list of Object.values(ifaces)) {
    if (!list) continue;
    for (const iface of list) {
      if (iface.family === "IPv4" && !iface.internal) {
        candidates.push(iface.address);
      }
    }
  }
  // Prefer 192.168.* / 10.* over other ranges (likely LAN over VPN/virtual adapters)
  candidates.sort((a, b) => {
    const score = (ip: string) =>
      ip.startsWith("192.168.") ? 3 : ip.startsWith("10.") ? 2 : ip.startsWith("172.") ? 1 : 0;
    return score(b) - score(a);
  });
  return candidates[0] ?? null;
}

const ip = getLanAddress();
if (!ip) {
  console.error("Could not detect a LAN IP. Are you connected to Wi-Fi?");
  process.exit(1);
}

const url = `http://${ip}:${PORT}`;

console.log("\nScan with your phone camera (same Wi-Fi network):\n");
qrcode.generate(url, { small: true });
console.log(`\n  ${url}\n`);
console.log("Starting Next.js dev server bound to LAN…\n");

const child = spawn("npx", ["next", "dev", "-H", "0.0.0.0", "-p", PORT], {
  stdio: "inherit",
  shell: true,
});

child.on("exit", (code) => process.exit(code ?? 0));

const shutdown = () => child.kill("SIGINT");
process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);
