// lib/pricing-loader.ts
import fs from 'node:fs/promises';

// --------- Типы цен ---------
export type Tier = { qty: number; unit: number; setup?: number };
export type PriceRule =
  | { kind: 'tiers'; tiers: Tier[] }
  | { kind: 'perUnit'; unit: number; setup?: number }
  | { kind: 'fixed'; total: number };

// --------- Унифицированная запись услуги ---------
export type ServiceRecord = {
  category: string;         // Business Stationery / Advertising / ...
  service: string;          // Например: Business cards
  slug: string;             // "business-cards"
  variant?: string;         // Произвольная вариация (если есть)
  rule: PriceRule;          // Правило ценообразования
  attrs: Record<string, string>; // Остальные атрибуты (Size, Sides, Paper, GSM, Lamination, ...)
};

// Модель калькулятора для конкретной услуги
export type CalculatorModel = {
  slug: string;
  title: string;
  category: string;
  optionKeys: string[];                 // Порядок опций
  options: Record<string, string[]>;    // Допустимые значения
  rows: ServiceRecord[];                // Сырые строки (комбинации атрибутов)
};

// --------- Утилиты ---------
const TRIM = (s: unknown) =>
  String(s ?? '').replace(/\uFEFF/g, '').trim(); // убираем BOM/пробелы

const slugify = (s: string) =>
  TRIM(s)
    .toLowerCase()
    .replace(/&/g, ' and ')
    .replace(/[^\w]+/g, '-')
    .replace(/^-+|-+$/g, '');

const isNum = (v: unknown) => /^-?\d+(\.\d+)?$/.test(String(v ?? '').trim());

const toNum = (v: unknown) => {
  const s = String(v ?? '').replace(',', '.').trim();
  return isNum(s) ? Number(s) : NaN;
};

// Находим колонки тиров Q100, Q250, ...
const pickTierCols = (headers: string[]) =>
  headers
    .map((h) => ({ h, m: /^Q\s*(\d+)$/i.exec(h) }))
    .filter((x) => x.m)
    .map((x) => ({ header: x.h, qty: Number(x.m![1]) }))
    .sort((a, b) => a.qty - b.qty);

// Простейший CSV-парсер, поддерживает кавычки и запятые
export function parseCSV(text: string): Record<string, string>[] {
  const rows: string[] = [];
  let cur = '';
  let inQ = false;

  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    const next = text[i + 1];

    if (ch === '"') {
      if (inQ && next === '"') {
        cur += '"';
        i++;
      } else {
        inQ = !inQ;
      }
      continue;
    }
    if (!inQ && (ch === '\n' || ch === '\r')) {
      if (cur !== '' || (rows.length && rows[rows.length - 1] !== '')) rows.push(cur);
      cur = '';
      // CRLF => пропускаем второй символ
      if (ch === '\r' && next === '\n') i++;
      continue;
    }
    if (!inQ && ch === ',') {
      cur += '\u0001'; // временный разделитель
      continue;
    }
    cur += ch;
  }
  if (cur !== '') rows.push(cur);

  if (rows.length === 0) return [];
  const headers = rows[0]
    .split('\u0001')
    .map(TRIM)
    .map((h) => h.replace(/\s+/g, ' '));
  return rows.slice(1).filter(Boolean).map((line) => {
    const cols = line.split('\u0001');
    const rec: Record<string, string> = {};
    headers.forEach((h, i) => (rec[h] = TRIM(cols[i] ?? '')));
    return rec;
  });
}

// --------- Построение правила цены по строке ---------
function buildRuleFromRow(row: Record<string, string>, headers: string[]): PriceRule | null {
  // 1) fixed
  const fixed = toNum(row['Fixed'] ?? row['FixedPrice'] ?? row['Total']);
  if (!Number.isNaN(fixed) && fixed > 0) return { kind: 'fixed', total: fixed };

  // 2) tiers по колонкам Q###
  const tierCols = pickTierCols(headers);
  if (tierCols.length) {
    const setup = toNum(row['Setup'] ?? row['SetupFee']);
    const tiers: Tier[] = tierCols
      .map(({ header, qty }) => {
        const unit = toNum(row[header]);
        if (!Number.isNaN(unit) && unit > 0) return { qty, unit, setup: Number.isNaN(setup) ? undefined : setup };
        return null;
      })
      .filter(Boolean) as Tier[];
    if (tiers.length) return { kind: 'tiers', tiers };
  }

  // 3) perUnit (+ optional setup)
  const unit = toNum(row['Unit'] ?? row['UnitPrice'] ?? row['Price']);
  const setup = toNum(row['Setup'] ?? row['SetupFee']);
  if (!Number.isNaN(unit) && unit > 0) {
    return { kind: 'perUnit', unit, setup: Number.isNaN(setup) ? undefined : setup };
  }

  return null;
}

// --------- Маппинг CSV → ServiceRecord ---------
export function toServiceRecord(row: Record<string, string>, headers: string[]): ServiceRecord | null {
  const category =
    row['Category'] ?? row['Group'] ?? row['Категория'] ?? '';
  const service =
    row['Service'] ?? row['Name'] ?? row['Услуга'] ?? '';
  if (!TRIM(category) || !TRIM(service)) return null;

  const slug = slugify(row['Slug'] ?? service);
  const variant = TRIM(row['Variant'] ?? row['Option'] ?? '');

  const rule = buildRuleFromRow(row, headers);
  if (!rule) return null;

  // Собираем атрибуты (все столбцы кроме служебных и ценовых)
  const SKIP = new Set([
    'Category','Group','Категория',
    'Service','Name','Услуга',
    'Variant','Option','Slug',
    'Unit','UnitPrice','Price','Setup','SetupFee','Fixed','FixedPrice','Total'
  ]);
  // также не включаем Q###
  pickTierCols(headers).forEach(({ header }) => SKIP.add(header));

  const attrs: Record<string, string> = {};
  for (const h of headers) {
    if (SKIP.has(h)) continue;
    const v = TRIM(row[h]);
    if (v) attrs[h] = v;
  }

  return { category: TRIM(category), service: TRIM(service), slug, variant: TRIM(variant) || undefined, rule, attrs };
}

// --------- Загрузка источников ---------

export async function loadFromCSVPath(path: string): Promise<ServiceRecord[]> {
  const csv = await fs.readFile(path, 'utf8');
  const rows = parseCSV(csv);
  if (!rows.length) return [];
  const headers = Object.keys(rows[0]);
  const out: ServiceRecord[] = [];
  for (const r of rows) {
    const rec = toServiceRecord(r, headers);
    if (rec) out.push(rec);
  }
  return out;
}

// Ожидаем API вида { ok: boolean, items: Array<Record<string,string>> }
export async function loadFromApi(endpoint = '/api/pricing/import'): Promise<ServiceRecord[]> {
  const res = await fetch(endpoint, { cache: 'no-store' });
  if (!res.ok) return [];
  const data = await res.json().catch(() => ({} as any));
  const items: Record<string, string>[] = Array.isArray(data?.items) ? data.items : [];
  if (!items.length) return [];
  const headers = Object.keys(items[0] ?? {});
  const out: ServiceRecord[] = [];
  for (const r of items) {
    const rec = toServiceRecord(r, headers);
    if (rec) out.push(rec);
  }
  return out;
}

// Объединённый загрузчик: сначала БД, затем API, затем CSV-файл
export async function loadPricing(opts?: { csvPath?: string; api?: string }): Promise<ServiceRecord[]> {
  // 1) Сначала БД
  try {
    const { fetchAllServiceRecordsFromDB } = await import('@/lib/pricing-db');
    const dbData = await fetchAllServiceRecordsFromDB();
    if (dbData.length) return dbData;
  } catch { /* ignore */ }

  // 2) Затем API
  const apiEp = opts?.api ?? '/api/pricing/import';
  try {
    const apiData = await loadFromApi(apiEp);
    if (apiData.length) return apiData;
  } catch { /* ignore */ }

  // 3) Затем CSV-файл
  if (opts?.csvPath) {
    try {
      const fileData = await loadFromCSVPath(opts.csvPath);
      if (fileData.length) return fileData;
    } catch { /* ignore */ }
  }

  // Попробуем дефолтное расположение в репо
  try {
    return await loadFromCSVPath('data/Pixel Price List 2025 - Services.csv');
  } catch {
    return [];
  }
}

// --------- Построение модели калькулятора ---------

// Какие атрибуты считаем «опциями» по умолчанию
const DEFAULT_OPTION_KEYS = [
  'Size', 'Format', 'Sides', 'Paper', 'Stock', 'GSM', 'Lamination', 'Corners', 'Color', 'Colour', 'Fold'
];

export function buildCalculatorModel(all: ServiceRecord[], serviceSlug: string): CalculatorModel | null {
  const rows = all.filter((r) => r.slug === serviceSlug);
  if (!rows.length) return null;

  const title = rows[0].service;
  const category = rows[0].category;

  // Собираем все ключи атрибутов и сортируем по «важности»
  const keySet = new Set<string>();
  rows.forEach((r) => Object.keys(r.attrs).forEach((k) => keySet.add(k)));
  const keys = Array.from(keySet);

  const prioritized = [
    ...DEFAULT_OPTION_KEYS.filter((k) => keySet.has(k)),
    ...keys.filter((k) => !DEFAULT_OPTION_KEYS.includes(k)) // «хвост»
  ];

  // Списки значений для каждого ключа
  const options: Record<string, string[]> = {};
  for (const k of prioritized) {
    const vals = new Set<string>();
    rows.forEach((r) => {
      const v = r.attrs[k];
      if (v) vals.add(v);
    });
    if (vals.size) options[k] = Array.from(vals);
  }

  return {
    slug: serviceSlug,
    title,
    category,
    optionKeys: Object.keys(options),
    options,
    rows
  };
}

// Поиск строки-правила, которая соответствует выбранным опциям
export function matchRecord(model: CalculatorModel, selection: Record<string, string>): ServiceRecord | null {
  // Нормализуем ключи (с точным совпадением по выбранным полям)
  const keys = model.optionKeys;
  for (const row of model.rows) {
    let ok = true;
    for (const k of keys) {
      const want = selection[k];
      if (!want) continue; // поле не выбрано → пропускаем
      const have = row.attrs[k];
      if (have !== want) { ok = false; break; }
    }
    if (ok) return row;
  }
  return null;
}

// Утилита для расчёта по количеству
export function calcTotalsFor(rule: PriceRule, qty: number, vatRate = 0.2) {
  if (qty <= 0) return { net: 0, vat: 0, gross: 0 };

  if (rule.kind === 'fixed') {
    const net = rule.total;
    return { net, vat: net * vatRate, gross: net * (1 + vatRate) };
  }
  if (rule.kind === 'perUnit') {
    const net = (rule.setup ?? 0) + rule.unit * qty;
    return { net, vat: net * vatRate, gross: net * (1 + vatRate) };
  }
  // tiers
  const sorted = [...rule.tiers].sort((a, b) => a.qty - b.qty);
  let t = sorted[0];
  for (const tier of sorted) if (qty >= tier.qty) t = tier;
  const net = (t.setup ?? 0) + t.unit * qty;
  return { net, vat: net * vatRate, gross: net * (1 + vatRate) };
}

// --------- Индексы/хелперы ---------

export function indexByCategory(records: ServiceRecord[]) {
  const map = new Map<string, ServiceRecord[]>();
  for (const r of records) {
    const key = r.category;
    if (!map.has(key)) map.set(key, []);
    map.get(key)!.push(r);
  }
  return map;
}

export function listServices(records: ServiceRecord[]) {
  // уникальные пары (service, slug)
  const map = new Map<string, { service: string; slug: string; category: string }>();
  for (const r of records) {
    const key = `${r.slug}`;
    if (!map.has(key)) map.set(key, { service: r.service, slug: r.slug, category: r.category });
  }
  return Array.from(map.values());
}

// --------- Пример server-usage (можно вызывать из route/page) ---------
// const records = await loadPricing({ api: '/api/pricing/import', csvPath: 'data/Pixel Price List 2025 - Services.csv' });
// const model = buildCalculatorModel(records, 'business-cards');
// const row = matchRecord(model!, { Size: '85x55mm', Sides: 'D/S', Paper: 'Silk', GSM: '350' });
// const totals = row ? calcTotalsFor(row.rule, 500) : null;
