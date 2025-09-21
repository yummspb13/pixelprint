"use client";
import { useRef } from "react";
import { cn } from "@/lib/utils";

type Props = {
  className?: string;
  children: React.ReactNode;
};

export default function SmartHover({ className, children }: Props) {
  const ref = useRef<HTMLDivElement>(null);

  const onMove = (e: React.PointerEvent) => {
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const x = e.clientX - r.left;
    const y = e.clientY - r.top;
    el.style.setProperty("--mx", `${x}px`);
    el.style.setProperty("--my", `${y}px`);
  };
  const onLeave = () => {
    const el = ref.current;
    if (!el) return;
    el.style.removeProperty("--mx");
    el.style.removeProperty("--my");
  };

  return (
    <div
      ref={ref}
      onPointerMove={onMove}
      onPointerLeave={onLeave}
      className={cn(
        // базовая карточка — можно убрать, если уже применяешь свои классы
        "smart-hover relative rounded-2xl border border-zinc-200 bg-white shadow-sm transition",
        "hover:shadow-lg",
        className
      )}
    >
      {children}
    </div>
  );
}