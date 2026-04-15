import { spawnSync } from "node:child_process";

function runOrExit(command, args) {
  const result = spawnSync(command, args, {
    cwd: process.cwd(),
    env: process.env,
    stdio: "inherit"
  });

  if (result.status !== 0) {
    process.exit(result.status ?? 1);
  }
}

runOrExit(process.execPath, [
  "./node_modules/prisma/build/index.js",
  "migrate",
  "deploy",
  "--schema",
  "./prisma/schema.prisma"
]);

runOrExit(process.execPath, ["./server.js"]);
