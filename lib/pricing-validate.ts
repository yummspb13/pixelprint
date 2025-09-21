export function validateHeaders(headers: string[]) {
  const mustHave = ["Category","Service"];
  const ok = mustHave.every(h => headers.includes(h));
  const hints: string[] = [];
  if (!ok) hints.push(`CSV must include headers: ${mustHave.join(", ")}`);
  // Подсказки по ценам:
  const hasUnit = headers.some(h => ["Unit","UnitPrice","Price"].includes(h));
  const hasFixed = headers.some(h => ["Fixed","FixedPrice","Total"].includes(h));
  const hasTiers = headers.some(h => /^Q\s*\d+$/i.test(h));
  if (!hasUnit && !hasFixed && !hasTiers) hints.push("Provide Unit/Fixed or tier columns Q100,Q250,...");
  return { ok, hints };
}
