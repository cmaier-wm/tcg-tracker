const required = [
  "AZURE_ENV_NAME",
  "AZURE_LOCATION",
  "AZURE_SUBSCRIPTION_ID",
  "POSTGRES_ADMIN_USERNAME",
  "POSTGRES_ADMIN_PASSWORD"
];

const missing = required.filter((name) => !process.env[name]);

if (missing.length === 0) {
  console.log("Azure deployment environment looks complete.");
  process.exit(0);
}

console.error("Missing required azd environment values:");
for (const name of missing) {
  console.error(`- ${name}`);
}

console.error("\nSet them with:");
if (missing.includes("AZURE_LOCATION")) {
  console.error("  azd env set AZURE_LOCATION centralus");
}
if (missing.includes("AZURE_SUBSCRIPTION_ID")) {
  console.error(
    "  azd env set AZURE_SUBSCRIPTION_ID <subscription-id>"
  );
}
if (missing.includes("POSTGRES_ADMIN_USERNAME")) {
  console.error("  azd env set POSTGRES_ADMIN_USERNAME tcgtrackeradmin");
}
if (missing.includes("POSTGRES_ADMIN_PASSWORD")) {
  console.error(
    "  azd env set POSTGRES_ADMIN_PASSWORD <url-safe-password>"
  );
}

process.exit(1);
