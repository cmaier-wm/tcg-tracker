import { execFileSync } from "node:child_process";

const subscriptionId =
  process.env.AZURE_SUBSCRIPTION_ID ?? "a94e41d4-5686-46fc-8390-e18bbbbb27cc";
const keyVaultName =
  process.env.PORTFOLIO_SUMMARY_KEY_VAULT ?? "azkvjzn32vflxpfjy";
const secretName =
  process.env.PORTFOLIO_SUMMARY_SECRET_NAME ?? "portfolio-summary-database-url";
const windowHours = Number.parseInt(process.env.PORTFOLIO_SUMMARY_HOURS ?? "24", 10);
const psqlBin =
  process.env.PSQL_BIN ??
  (process.platform === "darwin" ? "/opt/homebrew/opt/libpq/bin/psql" : "psql");

function requireFiniteHours(value) {
  if (!Number.isFinite(value) || value < 1) {
    throw new Error("PORTFOLIO_SUMMARY_HOURS must be a positive integer.");
  }

  return value;
}

function getDatabaseUrl() {
  const secretValue = execFileSync(
    "az",
    [
      "keyvault",
      "secret",
      "show",
      "--subscription",
      subscriptionId,
      "--vault-name",
      keyVaultName,
      "--name",
      secretName,
      "--query",
      "value",
      "-o",
      "tsv"
    ],
    {
      encoding: "utf8",
      stdio: ["ignore", "pipe", "pipe"]
    }
  ).trim();

  if (!secretValue) {
    throw new Error(`Key Vault secret ${secretName} was empty.`);
  }

  return secretValue;
}

function normalizePsqlUrl(rawUrl) {
  const url = new URL(rawUrl);
  url.searchParams.delete("schema");
  return url.toString();
}

function runJsonQuery(databaseUrl, sql) {
  const normalizedUrl = normalizePsqlUrl(databaseUrl);
  const output = execFileSync(
    psqlBin,
    [
      normalizedUrl,
      "--tuples-only",
      "--no-align",
      "--quiet",
      "-c",
      sql
    ],
    {
      encoding: "utf8",
      stdio: ["ignore", "pipe", "pipe"]
    }
  ).trim();

  return JSON.parse(output || "[]");
}

function formatCurrency(value) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD"
  }).format(Number(value ?? 0));
}

function formatSignedNumber(value) {
  const amount = Number(value ?? 0);
  const prefix = amount > 0 ? "+" : "";
  return `${prefix}${amount}`;
}

function formatSignedCurrency(value) {
  const amount = Number(value ?? 0);
  const prefix = amount > 0 ? "+" : "";
  return `${prefix}${formatCurrency(amount)}`;
}

function formatTimestamp(value) {
  return new Date(value).toLocaleString("en-US", {
    timeZone: "America/Chicago",
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit"
  });
}

async function main() {
  const hours = requireFiniteHours(windowHours);
  const databaseUrl = getDatabaseUrl();
  const startedAt = new Date();
  const windowStart = new Date(startedAt.getTime() - hours * 60 * 60 * 1000);

  try {
    execFileSync(psqlBin, ["--version"], {
      encoding: "utf8",
      stdio: ["ignore", "pipe", "pipe"]
    });

    const auditEvents = runJsonQuery(
      databaseUrl,
      `
        select coalesce(json_agg(t), '[]'::json)::text
        from (
        select
          a.occurred_at as "occurredAt",
          a.operation,
          u.email,
          c.name as "cardName",
          cv."variantLabel",
          a.old_quantity as "oldQuantity",
          a.new_quantity as "newQuantity"
        from public.portfolio_holding_audit a
        join "UserAccount" u on u.id = a.user_id
        left join "CardVariation" cv on cv.id = a.card_variation_id
        left join "Card" c on c.id = cv."cardId"
        where a.occurred_at >= now() - (${hours} * interval '1 hour')
        order by a.occurred_at desc, u.email asc
        ) t
      `
    );

    const valueDeltas = runJsonQuery(
      databaseUrl,
      `
        select coalesce(json_agg(t), '[]'::json)::text
        from (
        with window_start as (
          select now() - (${hours} * interval '1 hour') as started_at
        ),
        users as (
          select id, email
          from "UserAccount"
        )
        select
          u.email,
          before_window."capturedAt" as "beforeCapturedAt",
          before_window."totalValue" as "beforeTotalValue",
          before_window."holdingCount" as "beforeHoldingCount",
          latest."capturedAt" as "latestCapturedAt",
          latest."totalValue" as "latestTotalValue",
          latest."holdingCount" as "latestHoldingCount"
        from users u
        left join lateral (
          select s."capturedAt", s."totalValue", s."holdingCount"
          from "PortfolioValuationSnapshot" s, window_start ws
          where s."userId" = u.id
            and s."capturedAt" < ws.started_at
          order by s."capturedAt" desc
          limit 1
        ) before_window on true
        left join lateral (
          select s."capturedAt", s."totalValue", s."holdingCount"
          from "PortfolioValuationSnapshot" s
          where s."userId" = u.id
          order by s."capturedAt" desc
          limit 1
        ) latest on true
        order by u.email asc
        ) t
      `
    );

    const lines = [];
    lines.push(
      `Portfolio changes for the last ${hours} hours as of ${formatTimestamp(startedAt.toISOString())}`
    );
    lines.push("");

    if (auditEvents.length === 0) {
      lines.push("No holding-level changes were recorded in this window.");
    } else {
      const counts = auditEvents.reduce(
        (accumulator, event) => {
          const key = String(event.operation).toLowerCase();
          accumulator[key] = (accumulator[key] ?? 0) + 1;
          return accumulator;
        },
        {}
      );

      lines.push(
        `Holding events: ${counts.insert ?? 0} added, ${counts.update ?? 0} updated, ${counts.delete ?? 0} removed`
      );
      lines.push("");
      lines.push("Event details:");

      for (const event of auditEvents) {
        const cardLabel = [event.cardName, event.variantLabel].filter(Boolean).join(" / ");
        const quantityText =
          event.operation === "INSERT"
            ? `qty ${formatSignedNumber(event.newQuantity)}`
            : event.operation === "DELETE"
              ? `qty ${formatSignedNumber(-Number(event.oldQuantity ?? 0))}`
              : `qty ${event.oldQuantity} -> ${event.newQuantity}`;

        lines.push(
          `- ${formatTimestamp(event.occurredAt)} | ${event.email} | ${event.operation.toLowerCase()} | ${cardLabel} | ${quantityText}`
        );
      }
    }

    lines.push("");
    lines.push("Portfolio value movement:");

    for (const row of valueDeltas) {
      if (!row.latestCapturedAt) {
        lines.push(`- ${row.email}: no valuation snapshots available`);
        continue;
      }

      const latestCapturedAt = new Date(row.latestCapturedAt);
      if (latestCapturedAt < windowStart) {
        lines.push(
          `- ${row.email}: no valuation snapshots recorded in this window (latest was ${formatTimestamp(row.latestCapturedAt)})`
        );
        continue;
      }

      if (!row.beforeCapturedAt) {
        lines.push(
          `- ${row.email}: latest ${formatCurrency(row.latestTotalValue)} (${row.latestHoldingCount} holdings); no baseline snapshot before the window`
        );
        continue;
      }

      const valueDelta = Number(row.latestTotalValue) - Number(row.beforeTotalValue);
      const holdingDelta =
        Number(row.latestHoldingCount) - Number(row.beforeHoldingCount);

      lines.push(
        `- ${row.email}: ${formatSignedCurrency(valueDelta)} to ${formatCurrency(row.latestTotalValue)} (${formatSignedNumber(holdingDelta)} holdings, now ${row.latestHoldingCount})`
      );
    }

    console.log(lines.join("\n"));
  } catch (error) {
    if (String(error?.message ?? "").includes("spawnSync psql ENOENT")) {
      console.error("psql is required. Install libpq and ensure `psql` is on PATH.");
      process.exit(1);
    }

    throw error;
  }
}

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
