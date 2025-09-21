"use client";

import Link from "next/link";
import Image from "next/image";
import { NavigationMenu, NavigationMenuList, NavigationMenuItem, NavigationMenuTrigger, NavigationMenuContent } from "@/components/ui/navigation-menu";
import { buildServicesSection, MegaSection } from "@/lib/menu";
import { ChevronRight } from "lucide-react";
import { useMemo, useState, useEffect } from "react";

// утилита: разбить длинный список на N колонок
function chunk<T>(arr: T[], columns: number): T[][] {
  const res: T[][] = Array.from({ length: columns }, () => []);
  arr.forEach((item, i) => res[i % columns].push(item));
  return res;
}

interface MenuTile {
  id: number;
  label: string;
  href: string;
  image?: string;
  order: number;
  isActive: boolean;
}

export default function MegaMenuPro() {
  const [menuTiles, setMenuTiles] = useState<MenuTile[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMenuTiles();
  }, []);

  const fetchMenuTiles = async () => {
    try {
      const response = await fetch('/api/admin/menu');
      const data = await response.json();
      setMenuTiles((data.tiles || []).filter((tile: MenuTile) => tile.isActive));
    } catch (error) {
      console.error('Error fetching menu tiles:', error);
    } finally {
      setLoading(false);
    }
  };

  // позже можно сделать несколько разделов (Products, Large Format и т.д.)
  const sections: MegaSection[] = useMemo(() => {
    if (loading || menuTiles.length === 0) {
      return [buildServicesSection()];
    }

    // Создаем секцию из данных базы данных
    const tiles = menuTiles.map(tile => ({
      label: tile.label,
      href: tile.href,
      image: tile.image
    }));

    // Получаем все ссылки из существующей секции
    const existingSection = buildServicesSection();
    
    return [{
      id: "services",
      label: "Services",
      tiles: tiles,
      links: existingSection.links
    }];
  }, [menuTiles, loading]);
  return (
    <NavigationMenu className="hidden md:block">
      <NavigationMenuList>
        {sections.map(sec => (
          <NavigationMenuItem key={sec.id}>
            <NavigationMenuTrigger className="text-sm font-medium">{sec.label}</NavigationMenuTrigger>
            <NavigationMenuContent>
              <div className="w-[900px] max-w-[min(90vw,1000px)] p-4">
                {/* Плитки сверху */}
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                  {sec.tiles.slice(0, 8).map((tile, index) => (
                    <Link
                      key={`${tile.href}-${tile.label}-${index}`}
                      href={tile.href}
                      className="group relative overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-sm transition
                                 hover:shadow-md hover:-translate-y-0.5"
                    >
                      <div className="relative h-24 w-full">
                        {tile.image ? (
                          <Image src={tile.image} alt={tile.label} fill sizes="(min-width:768px) 220px, 33vw"
                                 className="object-cover" priority={false} />
                        ) : (
                          <div className="absolute inset-0 bg-[linear-gradient(135deg,#f3f4f6,white)]" />
                        )}
                        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition
                                        bg-gradient-to-t from-black/15 to-transparent" />
                      </div>
                      <div className="flex items-center justify-between px-3 py-2">
                        <span className="text-sm font-medium text-zinc-800">{tile.label}</span>
                        <ChevronRight className="h-4 w-4 text-zinc-400 group-hover:text-zinc-600 transition" />
                      </div>
                    </Link>
                  ))}
                </div>

                {/* Разделитель */}
                <div className="my-4 h-px w-full bg-zinc-200" />

                {/* Много-колоночный список ниже с визуальным разделением */}
                {(() => {
                  const cols = chunk(sec.links, 4); // 4 колонки для лучшего разделения
                  return (
                    <div className="grid grid-cols-2 gap-x-8 gap-y-3 sm:grid-cols-3 md:grid-cols-4">
                      {cols.map((col, i) => (
                        <div key={i} className="space-y-2">
                          {col.map((link, linkIndex) => (
                            <Link
                              key={`${link.href}-${link.label}-${linkIndex}`}
                              href={link.href}
                              className="block rounded-md px-3 py-2 text-sm text-zinc-700 hover:bg-gradient-to-r hover:from-px-cyan/10 hover:to-px-magenta/10 hover:text-px-cyan transition-all duration-200 border-l-2 border-transparent hover:border-px-cyan/30"
                            >
                              {link.label}
                            </Link>
                          ))}
                        </div>
                      ))}
                    </div>
                  );
                })()}
              </div>
            </NavigationMenuContent>
          </NavigationMenuItem>
        ))}
      </NavigationMenuList>
    </NavigationMenu>
  );
}
