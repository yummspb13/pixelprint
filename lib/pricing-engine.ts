import type { Store, ProductKey, Selection, Rule, Quote } from "./pricing-types";

export const VAT = 0.20;

export function findRules(store: Store, product: ProductKey, sel: Selection): Rule[] {
  return store.rules.filter(r => {
    if (r.product !== product) return false;
    const keys: (keyof Selection)[] = ["size", "sides", "paper", "gsm", "lamination", "finish"];
    return keys.every(k => !sel[k] || (String((r as any)[k]).toLowerCase() === String(sel[k])?.toLowerCase()));
  });
}

export function pickTier(r: Rule, qty: number) {
  const t = [...r.tiers].sort((a, b) => a.min - b.min)
    .reduce((acc, t) => qty >= t.min && (t.max ? qty <= t.max : true) ? t : acc, r.tiers[0]);
  return t;
}

export function quote(store: Store, product: ProductKey, sel: Selection): Quote {
  const candidates = findRules(store, product, sel);
  const rule = candidates[0] ?? store.rules.find(r => r.product === product)!;
  const tier = pickTier(rule, sel.qty || 1);
  const net = (tier.setup ?? 0) + tier.unit * (sel.qty || 1);
  return { net, vat: net * VAT, gross: net * (1 + VAT), rule, tier };
}
