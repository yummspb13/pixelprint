export type Attribute = { key: string; values: string[] };
export type QuoteInput = {
  slug: string;
  qty: number;
  selection: Record<string, string>;   // { Size:"A5", Sides:"D/S", ... }
  extras?: { turnaround?: string; delivery?: string; notes?: string };
};

export async function fetchOptions(slug: string) {
  const r = await fetch(`/api/pricing/options?slug=${encodeURIComponent(slug)}`, { cache: "no-store" });
  const d = await r.json();
  if (!d?.ok) throw new Error(d?.error || "Failed to load options");
  return d as { ok: true; service: { slug: string; name: string; category: string }; attributes: Attribute[] };
}

export async function fetchQuote(input: QuoteInput) {
  const r = await fetch("/api/quote", {
    method: "POST", 
    headers: { "content-type": "application/json" },
    body: JSON.stringify(input)
  });
  const d = await r.json();
  if (!d?.ok) throw new Error(d?.error || "Quote failed");
  return d as {
    ok: true;
    breakdown: { 
      base: { net: number }, 
      modifiers: { add: number; items?: any[] }, 
      net: number, 
      vat: number, 
      gross: number, 
      unit?: number 
    };
    debug?: any;
  };
}
