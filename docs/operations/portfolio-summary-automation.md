# Portfolio Summary Automation

This automation now has a durable read-only path into the production Azure
PostgreSQL database that backs the deployed app.

## Command

```bash
npm run portfolio:summary:prod
```

## How It Works

1. Azure CLI reads the `portfolio-summary-database-url` secret from Key Vault
   `azkvjzn32vflxpfjy`.
2. The script connects with the dedicated `portfolio_summary_reader` PostgreSQL
   user.
3. It summarizes:
   - holding insert, update, and delete events from `portfolio_holding_audit`
   - per-user portfolio value movement using `PortfolioValuationSnapshot`

## Requirements

- Azure CLI authenticated to subscription
  `a94e41d4-5686-46fc-8390-e18bbbbb27cc`
- Azure identity has `Key Vault Secrets User` on `azkvjzn32vflxpfjy`
- Key Vault secret `portfolio-summary-database-url` exists

## Notes

- Holding-level delete visibility only exists from the point the
  `portfolio_holding_audit` trigger was installed.
- The script defaults to a 24 hour window. Override with
  `PORTFOLIO_SUMMARY_HOURS=<n>`.
