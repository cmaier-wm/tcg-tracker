import { spawnSync } from "node:child_process";

const action = process.argv[2] ?? "up";
const validActions = new Set(["up", "down"]);

if (!validActions.has(action)) {
  console.error(`Unsupported action: ${action}`);
  process.exit(1);
}

const args =
  action === "up"
    ? ["compose", "-f", "docker/postgres/compose.yml", "up", "-d"]
    : ["compose", "-f", "docker/postgres/compose.yml", "down", "--remove-orphans"];

const result = spawnSync("docker", args, { stdio: "inherit" });
process.exit(result.status ?? 1);

