const response = await fetch("http://127.0.0.1:3000/api/snapshots", {
  method: "POST"
});

if (!response.ok) {
  console.error(`Snapshot run failed: ${response.status} ${response.statusText}`);
  process.exit(1);
}

console.log(JSON.stringify(await response.json(), null, 2));
