async function getServices() {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3010';
  const r = await fetch(`${baseUrl}/api/pricing/services`, { cache: "no-store" });
  if (!r.ok) return [];
  return r.json();
}

export default async function Page() {
  const items = await getServices();
  return (
    <div className="mx-auto max-w-5xl p-6">
      <h1 className="text-2xl font-semibold mb-4">Pricing Models</h1>
      <ul className="space-y-2">
        {items.map((s: any) => (
          <li key={s.slug} className="flex items-center gap-3">
            <span className="text-zinc-600">{s.category}</span>
            <span className="font-medium">{s.service}</span>
            <a className="text-blue-600" href={`/services/${s.slug}`}>calc</a>
          </li>
        ))}
      </ul>
    </div>
  );
}
