const url =
  process.argv[2] ??
  process.env.SERVICE_WEB_URI ??
  process.env.WEB_APP_URL ??
  null;

if (!url) {
  console.error(
    "Missing deployment URL. Pass it as an argument or set SERVICE_WEB_URI."
  );
  process.exit(1);
}

const targets = [
  { label: "health API", url: `${url.replace(/\/$/, "")}/api/health` },
  { label: "cards API", url: `${url.replace(/\/$/, "")}/api/cards?offset=0&limit=1` }
];

const VERIFY_ATTEMPTS = 5;
const VERIFY_RETRY_DELAY_MS = 5000;
const VERIFY_REQUEST_TIMEOUT_MS = 60000;

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

for (const target of targets) {
  let lastErrorMessage = "";

  for (let attempt = 1; attempt <= VERIFY_ATTEMPTS; attempt += 1) {
    try {
      const response = await fetch(target.url, {
        signal: AbortSignal.timeout(VERIFY_REQUEST_TIMEOUT_MS),
        redirect: "follow",
        headers: {
          "user-agent": "tcg-tracker-deploy-check"
        }
      });

      if (response.ok) {
        console.log(`Verified ${target.label}: ${target.url}`);
        lastErrorMessage = "";
        break;
      }

      lastErrorMessage = `${response.status} ${response.statusText}`;
    } catch (error) {
      lastErrorMessage = error instanceof Error ? error.message : String(error);
    }

    if (attempt < VERIFY_ATTEMPTS) {
      console.warn(
        `Verification retry ${attempt}/${VERIFY_ATTEMPTS - 1} for ${target.label}: ${lastErrorMessage}`
      );
      await sleep(VERIFY_RETRY_DELAY_MS);
      continue;
    }

    console.error(`Verification failed for ${target.label}: ${lastErrorMessage}`);
    process.exit(1);
  }
}
