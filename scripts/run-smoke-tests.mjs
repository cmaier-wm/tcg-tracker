import { spawnSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, "..");
const iosRoot = path.join(repoRoot, "ios");

const smokeSuites = {
  web: [
    {
      label: "web unit smoke",
      command: getNpxCommand(),
      args: [
        "vitest",
        "run",
        "tests/unit/auth-password.test.ts",
        "tests/unit/mobile-home.test.ts",
        "tests/unit/password-reset.test.ts",
        "tests/unit/teams-alerts.test.ts",
        "tests/unit/theme-preference.test.ts",
        "tests/unit/value-portfolio.test.ts"
      ],
      cwd: repoRoot
    },
    {
      label: "web integration smoke",
      command: getNpxCommand(),
      args: [
        "vitest",
        "run",
        "tests/contract/auth.contract.test.ts",
        "tests/contract/mobile-home.contract.test.ts",
        "tests/contract/password-reset.contract.test.ts",
        "tests/contract/portfolio-export.contract.test.ts",
        "tests/contract/teams-alert-settings.contract.test.ts",
        "tests/integration/auth-session.test.ts",
        "tests/integration/mobile-home.test.ts",
        "tests/integration/password-reset.test.ts",
        "tests/integration/portfolio-export-route.test.ts",
        "tests/integration/settings-page.test.tsx",
        "tests/integration/teams-alert-delivery.test.ts",
        "tests/integration/teams-alert-settings.test.ts"
      ],
      cwd: repoRoot
    },
    {
      label: "web functional smoke",
      command: getNpxCommand(),
      args: [
        "playwright",
        "test",
        "tests/e2e/auth.spec.ts",
        "tests/e2e/cards-browse.spec.ts",
        "tests/e2e/console-clean.spec.ts",
        "tests/e2e/password-reset.spec.ts",
        "tests/e2e/portfolio.spec.ts",
        "tests/e2e/teams-alerts.spec.ts"
      ],
      cwd: repoRoot
    }
  ],
  ios: [
    {
      label: "ios smoke",
      command: "swift",
      args: ["test"],
      cwd: iosRoot
    }
  ]
};

const requestedMode = process.argv[2] ?? "all";
const selectedSteps = getSelectedSteps(requestedMode);

for (const step of selectedSteps) {
  console.log(`\n==> Running ${step.label}`);

  const result = spawnSync(step.command, step.args, {
    cwd: step.cwd,
    env: process.env,
    stdio: "inherit"
  });

  if (result.status !== 0) {
    process.exit(result.status ?? 1);
  }
}

function getSelectedSteps(mode) {
  if (mode === "all") {
    return [...smokeSuites.web, ...smokeSuites.ios];
  }

  if (mode === "web" || mode === "ios") {
    return smokeSuites[mode];
  }

  console.error(`Unsupported smoke test mode: ${mode}`);
  console.error("Expected one of: web, ios, all");
  process.exit(1);
}

function getNpxCommand() {
  return process.platform === "win32" ? "npx.cmd" : "npx";
}
