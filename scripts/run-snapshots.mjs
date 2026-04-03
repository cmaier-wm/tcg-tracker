const POKEMON_CATEGORY_ID = "3";
const categoryIds = process.argv.slice(2);
const searchParams = new URLSearchParams();

for (const categoryId of (categoryIds.length ? categoryIds : [POKEMON_CATEGORY_ID])) {
  searchParams.append("categoryId", categoryId);
}

const response = await fetch(
  `http://127.0.0.1:3000/api/snapshots?${searchParams.toString()}`,
  {
    method: "POST"
  }
);

if (!response.ok) {
  console.error(`Snapshot run failed: ${response.status} ${response.statusText}`);
  process.exit(1);
}

console.log(JSON.stringify(await response.json(), null, 2));
