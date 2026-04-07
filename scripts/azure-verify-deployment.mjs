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
  { label: "home page", url },
  { label: "cards API", url: `${url.replace(/\/$/, "")}/api/cards?offset=0&limit=1` }
];

for (const target of targets) {
  let response;

  try {
    response = await fetch(target.url, {
      signal: AbortSignal.timeout(20000),
      redirect: "follow",
      headers: {
        "user-agent": "tcg-tracker-deploy-check"
      }
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error(`Verification failed for ${target.label}: ${message}`);
    process.exit(1);
  }

  if (!response.ok) {
    console.error(
      `Verification failed for ${target.label}: ${response.status} ${response.statusText}`
    );
    process.exit(1);
  }

  console.log(`Verified ${target.label}: ${target.url}`);
}
