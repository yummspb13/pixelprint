import "./vercel-env"; // Import Vercel environment variables
import { prisma } from "@/lib/db";
import { ServiceRecord, PriceRule } from "@/lib/pricing-loader";

export async function fetchAllServiceRecordsFromDB(): Promise<ServiceRecord[]> {
  const services = await prisma.service.findMany({
    include: { rows: { include: { tiers: true } } },
    orderBy: { name: "asc" },
  });

  const out: ServiceRecord[] = [];
  for (const s of services) {
    for (const r of s.rows) {
      let rule: PriceRule;
      if (r.ruleKind === "fixed") rule = { kind: "fixed", total: r.fixed ?? 0 };
      else if (r.ruleKind === "perUnit") rule = { kind: "perUnit", unit: r.unit ?? 0, setup: r.setup ?? undefined };
      else {
        rule = {
          kind: "tiers",
          tiers: r.tiers.sort((a,b)=>a.qty-b.qty).map(t => ({ qty: t.qty, unit: t.unit, setup: r.setup ?? undefined }))
        };
      }

      out.push({
        category: s.category,
        service : s.name,
        slug    : s.slug,
        variant : undefined,
        rule,
        attrs   : (r.attrs ?? {}) as Record<string,string>,
      });
    }
  }
  return out;
}
