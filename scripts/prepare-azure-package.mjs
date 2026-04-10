import {
  cpSync,
  existsSync,
  mkdirSync,
  readdirSync,
  readFileSync,
  rmSync,
  writeFileSync
} from "node:fs";
import { join } from "node:path";

const root = process.cwd();
const standaloneDir = join(root, ".next", "standalone");
const staticDir = join(root, ".next", "static");
const publicDir = join(root, "public");
const prismaDir = join(root, "prisma");
const prismaScopedDir = join(root, "node_modules", "@prisma");
const prismaCliDir = join(root, "node_modules", "prisma");
const azureStartScript = join(root, "scripts", "azure-start.mjs");
const outputDir = join(root, ".azuredist");

function walkFiles(dir) {
  const entries = readdirSync(dir, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    const fullPath = join(dir, entry.name);

    if (entry.isDirectory()) {
      files.push(...walkFiles(fullPath));
      continue;
    }

    if (entry.isFile()) {
      files.push(fullPath);
    }
  }

  return files;
}

function getPrismaClientAliases(serverDir) {
  if (!existsSync(serverDir)) {
    return [];
  }

  const aliasPattern = /@prisma\/(client-[a-f0-9]+)/g;
  const aliases = new Set();

  for (const filePath of walkFiles(serverDir)) {
    if (!/\.(?:js|json)$/.test(filePath)) {
      continue;
    }

    const contents = readFileSync(filePath, "utf8");

    for (const match of contents.matchAll(aliasPattern)) {
      aliases.add(match[1]);
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

rmSync(join(outputDir, ".env"), { force: true });

const packageJsonPath = join(outputDir, "package.json");

if (existsSync(packageJsonPath)) {
  const packageJson = JSON.parse(readFileSync(packageJsonPath, "utf8"));
  packageJson.scripts = {
    ...packageJson.scripts,
    start: "node server.js"
  };
  writeFileSync(packageJsonPath, `${JSON.stringify(packageJson, null, 2)}\n`);
}

mkdirSync(join(outputDir, ".next"), { recursive: true });
cpSync(staticDir, join(outputDir, ".next", "static"), { recursive: true });

if (existsSync(publicDir)) {
  cpSync(publicDir, join(outputDir, "public"), { recursive: true });
}

if (existsSync(prismaDir)) {
  cpSync(prismaDir, join(outputDir, "prisma"), { recursive: true });
}

if (existsSync(prismaScopedDir)) {
  cpSync(prismaScopedDir, join(outputDir, "node_modules", "@prisma"), {
    recursive: true
  });
}

if (existsSync(prismaCliDir)) {
  cpSync(prismaCliDir, join(outputDir, "node_modules", "prisma"), {
    recursive: true
  });
}

const prismaClientDir = join(root, "node_modules", "@prisma", "client");
const prismaClientAliases = getPrismaClientAliases(join(root, ".next", "server"));

for (const alias of prismaClientAliases) {
  const aliasDir = join(outputDir, "node_modules", "@prisma", alias);

  if (existsSync(prismaClientDir) && !existsSync(aliasDir)) {
    cpSync(prismaClientDir, aliasDir, { recursive: true });
  }
}

if (existsSync(azureStartScript)) {
  cpSync(azureStartScript, join(outputDir, "azure-start.mjs"));
}

console.log(`Prepared Azure deployment package in ${outputDir}`);
