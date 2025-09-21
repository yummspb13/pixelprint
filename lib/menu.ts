import { CATEGORIES } from "@/lib/services";

export type MegaTile = { label: string; href: string; image?: string };
export type MegaSection = {
  id: string;            // "services"
  label: string;         // "Services"
  tiles: MegaTile[];     // верхние плитки с картинками
  links: { label: string; href: string }[]; // все ссылки списком
};

// базовый раздел "Services": 4–8 популярных плиток + полный список ссылок
export function buildServicesSection(): MegaSection {
  // подставь свои картинки в /public/menu/*
  const pick = (name: string) => {
    // ищем первую ссылку с этим названием среди всех категорий
    for (const c of CATEGORIES) {
      const m = c.items.find(i => i.name.toLowerCase().includes(name.toLowerCase()));
      if (m) return m.path;
    }
    return "/services";
  };

  const tiles: MegaTile[] = [
    { label: "Business Cards", href: pick("Business cards"), image: "/menu/business-cards.jpg" },
    { label: "Flyers & Leaflets", href: pick("Flyers") || pick("Leaflets"), image: "/menu/flyers.jpg" },
    { label: "Posters", href: pick("Poster"), image: "/menu/posters.jpg" },
    { label: "Large Format", href: "/services/large-format", image: "/menu/large-format.jpg" },
    { label: "Menus", href: pick("menu"), image: "/menu/menus.jpg" },
    { label: "Booklets", href: pick("booklet"), image: "/menu/booklets.jpg" },
    { label: "Photocopying", href: pick("photocopying"), image: "/menu/copy.jpg" },
    { label: "Finishing", href: "/services/print-finishing", image: "/menu/finishing.jpg" },
    { label: "Configurator", href: "/services/business-cards", image: "/menu/configurator.jpg" },
  ];

  // Убираем дублирующиеся пути, оставляя только уникальные
  const uniqueTiles = tiles.filter((tile, index, self) => 
    index === self.findIndex(t => t.href === tile.href)
  );

  const allLinks = CATEGORIES.flatMap(c =>
    c.items.map(it => ({ label: it.name, href: it.path }))
  );

  // Убираем дублирующиеся ссылки, оставляя только уникальные
  const uniqueLinks = allLinks.filter((link, index, self) => 
    index === self.findIndex(l => l.href === link.href && l.label === link.label)
  );

  return { id: "services", label: "Services", tiles: uniqueTiles, links: uniqueLinks };
}
