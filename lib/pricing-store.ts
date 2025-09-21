import Papa from 'papaparse';
import type { Store, Rule, PriceTier } from './pricing-types';

// Нормализация заголовков CSV
const normalizeHeaders = (headers: string[]): string[] => {
  return headers.map(h => {
    const normalized = h.toLowerCase().trim();
    const mappings: Record<string, string> = {
      'quantity': 'qty_min',
      'min_qty': 'qty_min',
      'max_qty': 'qty_max',
      'price': 'unit_price',
      'unit': 'unit_price',
      'setup': 'setup_fee'
    };
    return mappings[normalized] || normalized;
  });
};

// Парсинг CSV в правила прайсинга
export function parsePricingCSV(csvContent: string): Store {
  const lines = csvContent.trim().split('\n');
  const headers = normalizeHeaders(lines[0].split(','));
  const rows = lines.slice(1).map(line => line.split(','));

  const rules: Rule[] = [];
  const ruleMap = new Map<string, Rule>();

  rows.forEach(row => {
    if (row.length !== headers.length) return;

    const data: Record<string, string> = {};
    headers.forEach((header, index) => {
      data[header] = row[index]?.trim() || '';
    });

    const product = data.product as any;
    if (!product) return;

    const key = `${product}-${data.size || ''}-${data.sides || ''}-${data.paper || ''}-${data.gsm || ''}-${data.lamination || ''}-${data.finish || ''}`;
    
    let rule = ruleMap.get(key);
    if (!rule) {
      rule = {
        product,
        size: data.size || undefined,
        sides: data.sides || undefined,
        paper: data.paper || undefined,
        gsm: data.gsm ? parseInt(data.gsm) : undefined,
        lamination: data.lamination || undefined,
        finish: data.finish || undefined,
        tiers: []
      };
      ruleMap.set(key, rule);
      rules.push(rule);
    }

    const tier: PriceTier = {
      min: parseInt(data.qty_min) || 1,
      max: data.qty_max ? parseInt(data.qty_max) : undefined,
      unit: parseFloat(data.unit_price) || 0,
      setup: data.setup_fee ? parseFloat(data.setup_fee) : undefined
    };

    rule.tiers.push(tier);
  });

  return { rules };
}

// Загрузка прайсинга из файла
export async function loadPricingStore(): Promise<Store> {
  try {
    const response = await fetch('/data/pricing.csv');
    const csvContent = await response.text();
    return parsePricingCSV(csvContent);
  } catch (error) {
    console.error('Failed to load pricing data:', error);
    return { rules: [] };
  }
}

// Создание дефолтного стора для разработки
export function createDefaultStore(): Store {
  return {
    rules: [
      {
        product: 'business-cards',
        size: '85x55mm',
        sides: 'D/S',
        paper: 'Silk',
        gsm: 350,
        tiers: [
          { min: 100, max: 249, unit: 0.25, setup: 25 },
          { min: 250, max: 499, unit: 0.20, setup: 25 },
          { min: 500, max: 999, unit: 0.18, setup: 25 },
          { min: 1000, unit: 0.15, setup: 25 }
        ]
      },
      {
        product: 'flyers',
        size: 'A4',
        sides: 'D/S',
        paper: 'Uncoated',
        gsm: 130,
        tiers: [
          { min: 100, max: 249, unit: 0.12, setup: 15 },
          { min: 250, max: 499, unit: 0.10, setup: 15 },
          { min: 500, max: 999, unit: 0.08, setup: 15 },
          { min: 1000, unit: 0.06, setup: 15 }
        ]
      }
    ]
  };
}
