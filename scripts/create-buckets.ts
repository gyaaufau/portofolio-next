const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;

async function createBucket(name: string) {
  const res = await fetch(`${SUPABASE_URL}/storage/v1/bucket`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${SERVICE_KEY}`,
      apikey: SERVICE_KEY,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      id: name,
      name,
      public: true,
      file_size_limit: 52428800,
    }),
  });

  const data = await res.json();
  if (res.ok) {
    console.log(`✓ ${name} bucket created`);
  } else if (data.message?.includes("already exists") || data.statusCode === "409") {
    console.log(`✓ ${name} bucket already exists`);
  } else {
    console.error(`✗ ${name}: ${JSON.stringify(data)}`);
  }
}

async function main() {
  await createBucket("portfolio");
  await createBucket("apps");
}

main();
