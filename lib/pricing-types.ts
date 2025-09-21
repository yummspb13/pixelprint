export type ProductKey =
  | "business-cards" | "flyers" | "posters" | "letterheads"
  | "photocopying-bw" | "photocopying-colour" | "laminating"
  | "booklet" | "menu-flat" | "menu-folded" | "menu-waterproof";

export type PriceTier = { 
  min: number; 
  max?: number; 
  unit: number; 
  setup?: number; 
};

export type Rule = {
  product: ProductKey;
  size?: string; 
  sides?: string; 
  paper?: string; 
  gsm?: number;
  lamination?: string; 
  finish?: string;
  tiers: PriceTier[]; // если нет ступеней — одна запись {min:1,unit:...}
};

export type Store = { rules: Rule[] };

export type Selection = Partial<Omit<Rule, "product" | "tiers">> & { qty: number };

export type Quote = { 
  net: number; 
  vat: number; 
  gross: number; 
  rule?: Rule; 
  tier?: PriceTier; 
};
