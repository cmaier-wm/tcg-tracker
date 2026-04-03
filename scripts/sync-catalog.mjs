function parseArgs(argv) {
  const categoryIds = [];
  let syncAll = false;
  let catalogOnly = false;

  for (let index = 0; index < argv.length; index += 1) {
    const value = argv[index];

    if (value === "--all") {
      syncAll = true;
      continue;
    }

    if (value === "--catalog-only") {
      catalogOnly = true;
      continue;
    }

    if (value === "--category" && argv[index + 1]) {
      categoryIds.push(argv[index + 1]);
      index += 1;
      continue;
    }

    if (value.startsWith("--category=")) {
      categoryIds.push(value.slice("--category=".length));
      continue;
    }

    if (!value.startsWith("--")) {
      categoryIds.push(value);
    }
  }

  return {
    categoryIds,
    syncAll,
    catalogOnly
  };
}

const POKEMON_CATEGORY_ID = "3";
const { categoryIds, syncAll, catalogOnly } = parseArgs(process.argv.slice(2));
const selectedCategoryIds = !syncAll && categoryIds.length === 0 ? [POKEMON_CATEGORY_ID] : categoryIds;

const searchParams = new URLSearchParams();

if (catalogOnly) {
  searchParams.set("catalogOnly", "true");
}

for (const categoryId of selectedCategoryIds) {
  searchParams.append("categoryId", categoryId);
}

const response = await fetch(
  `http://127.0.0.1:3000/api/snapshots?${searchParams.toString()}`,
  {
    method: "POST"
  }
);

if (!response.ok) {
  console.error(`Catalog sync failed: ${response.status} ${response.statusText}`);
  console.error(await response.text());
  process.exit(1);
}

console.log(JSON.stringify(await response.json(), null, 2));
