import { readFileSync } from "node:fs";
import path from "node:path";

describe("Azure Prisma packaging", () => {
  it("includes the Linux Prisma engine target required by App Service", () => {
    const schemaPath = path.join(process.cwd(), "prisma", "schema.prisma");
    const schema = readFileSync(schemaPath, "utf8");

    expect(schema).toContain('binaryTargets = ["native", "debian-openssl-3.0.x"]');
  });
});
