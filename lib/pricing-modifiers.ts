import { PriceRule } from "@/lib/pricing-loader";

// Тип модификатора: фикс/за единицу/процент
type Modifier =
  | { type: "fixed"; amount: number }
  | { type: "perUnit"; amount: number }
  | { type: "percent"; pct: number };

type Rule = {
  when: Partial<Record<string, string>>; // условие по выбранным опциям (например { Lamination: "Matte" })
  apply: Modifier;
};

export const MODIFIERS: Rule[] = [
  // Ламинация: фикс за заказ
  { when: { Lamination: "Matte" }, apply: { type: "fixed", amount: 6 } },
  { when: { Lamination: "Gloss" }, apply: { type: "fixed", amount: 6 } },

  // Скругление углов: фикс
  { when: { Corners: "Rounded" }, apply: { type: "fixed", amount: 5 } },

  // Срочность: процент к нетто
  { when: { Rush: "same-day" }, apply: { type: "percent", pct: 0.25 } }
];

export function extraCost(selection: Record<string, string>, qty: number, baseNet: number) {
  let add = 0;
  for (const r of MODIFIERS) {
    // проверяем, что все поля условия совпадают
    const ok = Object.entries(r.when).every(([k, v]) => selection[k] === v);
    if (!ok) continue;
    if (r.apply.type === "fixed") add += r.apply.amount;
    if (r.apply.type === "perUnit") add += r.apply.amount * qty;
    if (r.apply.type === "percent") add += baseNet * r.apply.pct;
  }
  return add;
}
