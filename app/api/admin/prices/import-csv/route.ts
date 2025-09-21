import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { parseCSV } from "@/lib/pricing-loader";
import { revalidateTag } from "next/cache";
import { PRICING_TAG } from "@/lib/pricing-const";

export async function POST(req: Request) {
  const form = await req.formData();
  const file = form.get("file") as unknown as File;
  if (!file) return NextResponse.json({ ok:false, error:"CSV file required" }, { status:400 });
  const text = await file.text();
  const rows = parseCSV(text);
  if (!rows.length) return NextResponse.json({ ok:false, error:"Empty CSV" }, { status:400 });

  // простая маппа: Category, Service, Slug, ... attrs ..., Unit/Fixed/Setup/Q###
  const headers = Object.keys(rows[0]);
  const qRe = /^Q\s*(\d+)$/i;

  // upsert сервисов и строк
  let svcCache = new Map<string, number>(); // slug -> id
  const tasks: any[] = [];
  for (const r of rows) {
    const cat = (r["Category"] || r["Group"] || "").trim();
    const name = (r["Service"]  || r["Name"]  || "").trim();
    const slug = (r["Slug"]     || name       || "").toLowerCase().replace(/[^\w]+/g,"-").replace(/^-+|-+$/g,"");
    if (!cat || !name || !slug) continue;

    tasks.push((async () => {
      let sid = svcCache.get(slug);
      if (!sid) {
        const s = await prisma.service.upsert({
          where: { slug },
          update: { name, category: cat },
          create: { slug, name, category: cat }
        });
        sid = s.id; svcCache.set(slug, sid);
      }

      // attrs
      const skip = new Set(["Category","Group","Service","Name","Slug","Unit","UnitPrice","Price","Setup","SetupFee","Fixed","FixedPrice","Total"]);
      const attrs: Record<string,string> = {};
      for (const h of headers) if (!skip.has(h) && !qRe.test(h)) {
        const v = (r[h] ?? "").trim(); if (v) attrs[h] = v;
      }

      // rule - ищем цены по количеству
      const unit = Number((r["Unit"] ?? r["UnitPrice"] ?? r["Price"] ?? "").replace(",","."));
      const fixed = Number((r["Fixed"] ?? r["FixedPrice"] ?? r["Total"] ?? "").replace(",","."));
      const setup = Number((r["Setup"] ?? r["SetupFee"] ?? "").replace(",","."));
      
      // Проверяем, есть ли колонки Qty и PRICE для создания tiers
      const qty = Number((r["Qty"] ?? "").replace(",","."));
      const price = Number((r["PRICE"] ?? "").replace(",","."));
      
      let tiers: { qty: number; unit: number }[] = [];
      let ruleKind = "fixed";
      
      if (Number.isFinite(qty) && Number.isFinite(price) && qty > 0 && price > 0) {
        // Если есть Qty и PRICE, создаем tiers
        ruleKind = "tiers";
        tiers = [{ qty, unit: price }];
      } else {
        // Ищем колонки с количеством (Q100, Q250, etc.)
        const qtyCols = headers
          .map(h => ({ h, m: /^Q\s*(\d+)$/i.exec(h) }))
          .filter(x => x.m)
          .map(x => ({ 
            header: x.h, 
            qty: Number(x.m![1])
          }));
        
        tiers = qtyCols
          .map(({ header, qty }) => {
            const unit = Number(String(r[header] ?? "").replace(",", "."));
            if (Number.isFinite(unit) && unit > 0) return { qty, unit };
            return null;
          })
          .filter(Boolean) as { qty: number; unit: number }[];
        
        if (tiers.length > 0) {
          ruleKind = "tiers";
        } else if (Number.isFinite(unit) && unit > 0) {
          ruleKind = "perUnit";
        } else if (Number.isFinite(fixed) && fixed > 0) {
          ruleKind = "fixed";
        }
      }

      const created = await prisma.priceRow.create({
        data: {
          serviceId: sid,
          attrs,
          ruleKind: ruleKind as any,
          unit: ruleKind === "perUnit" ? unit : null,
          fixed: ruleKind === "fixed" ? fixed : null,
          setup: Number.isFinite(setup) && setup > 0 ? setup : null,
        }
      });

      if (ruleKind === "tiers" && tiers.length) {
        await prisma.tier.createMany({ data: tiers.map(t => ({ rowId: created.id, qty: t.qty, unit: t.unit })) });
      }
    })());
  }
  await Promise.all(tasks);
  revalidateTag(PRICING_TAG);
  return NextResponse.json({ ok:true, imported: rows.length });
}
