import { cpSync, existsSync, mkdirSync, rmSync } from "node:fs";
import { join } from "node:path";

const root = process.cwd();
const standaloneDir = join(root, ".next", "standalone");
const staticDir = join(root, ".next", "static");
const publicDir = join(root, "public");
const prismaDir = join(root, "prisma");
const prismaCliDir = join(root, "node_modules", "prisma");
const azureStartScript = join(root, "scripts", "azure-start.mjs");
const outputDir = join(root, ".azuredist");

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

console.log(`Prepared Azure deployment package in ${outputDir}`);
