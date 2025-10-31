export type Attribute = { 
  key: string; 
  values: string[];
  isMain?: boolean;
  isModifier?: boolean;
};
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
  console.log('🔍 fetchQuote called with:', input);
  const r = await fetch("/api/quote", {
    method: "POST", 
    headers: { "content-type": "application/json" },
    body: JSON.stringify(input),
    cache: "no-store"
  });
  console.log('🔍 fetchQuote response status:', r.status);
  
  // Если 404 - комбинация не существует, возвращаем null вместо ошибки
  if (r.status === 404) {
    const d = await r.json();
    console.log('⚠️ Combination not found (404):', d?.error);
    return { ok: false, error: d?.error || "Combination not available" } as any;
  }
  
  // Для других ошибок тоже обрабатываем
  if (!r.ok) {
    const d = await r.json().catch(() => ({ error: "Request failed" }));
    console.error('❌ Quote API error:', d?.error || "Request failed");
    return { ok: false, error: d?.error || "Request failed" } as any;
  }
  
  const d = await r.json();
  console.log('🔍 fetchQuote response data:', d);
  if (!d?.ok) {
    return { ok: false, error: d?.error || "Quote failed" } as any;
  }
  
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
