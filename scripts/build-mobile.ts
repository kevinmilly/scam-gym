import { renameSync, existsSync, rmSync } from "fs";
import { execSync } from "child_process";
import path from "path";

const apiDir = path.resolve("app/api");
const apiBackup = path.resolve("app/_api_backup");

try {
  // Clear Next.js cache so stale type references to API routes don't cause build failure
  if (existsSync(".next")) rmSync(".next", { recursive: true, force: true });
  if (existsSync(apiDir)) renameSync(apiDir, apiBackup);
  execSync("next build", {
    stdio: "inherit",
    env: { ...process.env, BUILD_TARGET: "mobile" },
  });
} finally {
  if (existsSync(apiBackup)) renameSync(apiBackup, apiDir);
}
