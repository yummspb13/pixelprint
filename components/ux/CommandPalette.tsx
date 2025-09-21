"use client";
import { useEffect, useMemo, useState } from "react";
import { CommandDialog, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList, CommandSeparator } from "@/components/ui/command";
import { DialogTitle } from "@/components/ui/dialog";
import { useRouter } from "next/navigation";
import { CATEGORIES } from "@/lib/services";
import { Search, Calculator } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

export default function CommandPalette() {
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const { t } = useLanguage();

  // hotkey
  useEffect(()=>{
    const onKey = (e:KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase()==="k") {
        e.preventDefault(); setOpen(v=>!v);
      }
    };
    if (typeof window !== 'undefined') {
      window.addEventListener("keydown", onKey);
      return ()=> window.removeEventListener("keydown", onKey);
    }
  }, []);

  // услуги из CSV (список калькуляторов)
  const [calc, setCalc] = useState<{service:string;slug:string;category:string}[]>([]);
  useEffect(()=>{
    fetch("/api/pricing/services",{cache:"no-store"})
      .then(r=>r.json())
      .then(data => {
        if (data?.ok && Array.isArray(data.services)) {
          // Фильтруем только услуги с калькулятором и активные
          const filteredServices = data.services
            .filter((s: any) => s.isActive && s.calculatorAvailable)
            .map((s: any) => ({
              service: s.name,
              slug: s.slug,
              category: s.category
            }));
          setCalc(filteredServices);
        }
      })
      .catch(()=>{});
  },[]);

  const catFlat = useMemo(()=> CATEGORIES.flatMap(c=> c.items.map(i=>({...i, cat:c.label}))), []);

  function go(href:string){ setOpen(false); router.push(href); }

  return (
    <CommandDialog open={open} onOpenChange={setOpen}>
      <DialogTitle className="sr-only">{t('commandPalette.title')}</DialogTitle>
      <CommandInput placeholder={t('commandPalette.placeholder')} />
      <CommandList>
        <CommandEmpty>{t('commandPalette.noResults')}</CommandEmpty>

        <CommandGroup heading={t('commandPalette.services')}>
          {Array.isArray(calc) && calc.map(i=>(
            <CommandItem key={i.slug} onSelect={()=>go(`/services/${i.slug}`)}>
              <Search className="mr-2 h-4 w-4" /> {i.service}
              <span className="ml-auto text-xs text-zinc-500">{i.category}</span>
            </CommandItem>
          ))}
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  );
}
