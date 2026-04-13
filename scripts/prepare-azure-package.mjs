import {
  cpSync,
  existsSync,
  mkdirSync,
  readFileSync,
  readdirSync,
  rmSync,
  writeFileSync
} from "node:fs";
import { join } from "node:path";

const root = process.cwd();
const standaloneDir = join(root, ".next", "standalone");
const staticDir = join(root, ".next", "static");
const publicDir = join(root, "public");
const prismaDir = join(root, "prisma");
const prismaCliDir = join(root, "node_modules", "prisma");
const azureStartScript = join(root, "scripts", "azure-start.mjs");
const outputDir = join(root, ".azuredist");
const outputPackageJsonPath = join(outputDir, "package.json");
const prismaClientDir = join(standaloneDir, "node_modules", "@prisma", "client");
const serverChunksDir = join(root, ".next", "server", "chunks");

function collectPrismaClientAliases() {
  if (!existsSync(serverChunksDir)) {
    return [];
  }

  const aliases = new Set();

  for (const entry of readdirSync(serverChunksDir)) {
    if (!entry.endsWith(".js")) {
      continue;
    }

    const chunk = readFileSync(join(serverChunksDir, entry), "utf8");
    const matches = chunk.matchAll(/@prisma\/client-[a-f0-9]+/g);

    for (const match of matches) {
      aliases.add(match[0]);
    }
  }

  return [...aliases];
}

if (!existsSync(standaloneDir)) {
  console.error(
    "Missing .next/standalone. Run `npm run build` before `npm run azure:package`."
  );
  process.exit(1);
}

rmSync(outputDir, { force: true, recursive: true });
mkdirSync(outputDir, { recursive: true });

cpSync(standaloneDir, outputDir, { recursive: true });

const outputPackageJson = JSON.parse(readFileSync(outputPackageJsonPath, "utf8"));
outputPackageJson.scripts = {
  ...(outputPackageJson.scripts ?? {}),
  start: "node server.js"
};
writeFileSync(outputPackageJsonPath, `${JSON.stringify(outputPackageJson, null, 2)}\n`);

rmSync(join(outputDir, ".env"), { force: true });

mkdirSync(join(outputDir, ".next"), { recursive: true });
cpSync(staticDir, join(outputDir, ".next", "static"), { recursive: true });

if (existsSync(publicDir)) {
  cpSync(publicDir, join(outputDir, "public"), { recursive: true });
}

if (existsSync(prismaDir)) {
  cpSync(prismaDir, join(outputDir, "prisma"), { recursive: true });
}

if (existsSync(prismaCliDir)) {
  cpSync(prismaCliDir, join(outputDir, "node_modules", "prisma"), {
    recursive: true
  });
}

if (existsSync(azureStartScript)) {
  cpSync(azureStartScript, join(outputDir, "azure-start.mjs"));
}

for (const alias of collectPrismaClientAliases()) {
  const aliasDir = join(outputDir, "node_modules", "@prisma", alias.replace("@prisma/", ""));

  rmSync(aliasDir, { force: true, recursive: true });
  cpSync(prismaClientDir, aliasDir, { recursive: true });
}

console.log(`Prepared Azure deployment package in ${outputDir}`);
