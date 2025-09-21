"use client";

import Link from "next/link";
import { HoverCard, HoverCardTrigger, HoverCardContent } from "@/components/ui/hover-card";
import { CATEGORIES } from "@/lib/services";

export default function QuickCategories() {
  return (
    <section className="w-full border-y border-zinc-200/70 bg-zinc-50">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="flex gap-2 overflow-x-auto py-4 md:grid md:grid-cols-5 xl:grid-cols-10 md:overflow-visible">
          {CATEGORIES.map(cat => (
            <HoverCard key={cat.key} openDelay={80} closeDelay={100}>
              <HoverCardTrigger asChild>
                <Link
                  href={cat.path}
                  className="group flex min-w-[160px] md:min-w-0 flex-col items-center gap-2 rounded-xl px-3 py-3
                             text-center transition hover:bg-white hover:shadow-sm hover:ring-1 hover:ring-zinc-200"
                >
                  <cat.icon className="h-7 w-7 text-zinc-800 group-hover:text-black" strokeWidth={1.75}/>
                      <span className="text-[11px] font-semibold tracking-wide text-zinc-800 link-underline">{cat.label.toUpperCase()}</span>
                </Link>
              </HoverCardTrigger>
              <HoverCardContent align="start" side="bottom" className="w-64 bg-white/95 backdrop-blur">
                <nav className="grid gap-1">
                  {cat.items.map(item => (
                    <Link 
                      key={item.path} 
                      href={item.calc ?? item.path}
                      className="rounded-md px-2 py-1.5 text-sm text-zinc-800 hover:bg-zinc-50"
                    >
                      {item.name}
                    </Link>
                  ))}
                </nav>
              </HoverCardContent>
            </HoverCard>
          ))}
        </div>
      </div>
    </section>
  );
}