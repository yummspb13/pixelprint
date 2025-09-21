"use client";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

export default function BackgroundFX({ className }: { className?: string }) {
  const [on, setOn] = useState(false);
  const [mounted, setMounted] = useState(false);
  
  useEffect(() => {
    setMounted(true);
    const disabled = window.matchMedia("(prefers-reduced-motion: reduce)").matches ||
      process.env.NEXT_PUBLIC_FX_ENABLED === "0";
    setOn(!disabled);
  }, []);
  
  if (!mounted || !on) return null;

  return (
    <div aria-hidden className={cn("pointer-events-none fixed inset-0 z-0 overflow-hidden", className)} style={{ clipPath: 'inset(0)' }}>
      {/* мягкие CMYK beams */}
      <div className="absolute -top-1/3 left-0 h-[120vh] w-[50vw] rotate-[-12deg] bg-[radial-gradient(60%_60%_at_50%_50%,rgba(0,174,239,0.18),transparent_60%)] animate-beam-slow" style={{ clipPath: 'inset(0)' }} />
      <div className="absolute -top-1/4 right-0 h-[120vh] w-[50vw] rotate-[10deg] bg-[radial-gradient(60%_60%_at_50%_50%,rgba(236,0,140,0.16),transparent_60%)] animate-beam-slow" style={{ clipPath: 'inset(0)' }} />
      <div className="absolute bottom-0 left-0 h-[90vh] w-[50vw] rotate-[6deg] bg-[radial-gradient(60%_60%_at_50%_50%,rgba(255,242,0,0.12),transparent_60%)] animate-beam-slower" style={{ clipPath: 'inset(0)' }} />
      {/* лёгкий шум */}
      <div className="absolute inset-0 opacity-[.06] mix-blend-overlay [background-image:url('data:image/svg+xml;utf8,<svg xmlns=%22http://www.w3.org/2000/svg%22 width=%224%22 height=%224%22><rect width=%224%22 height=%224%22 fill=%22%23fff%22/><circle cx=%221%22 cy=%221%22 r=%22.4%22 fill=%22%23000%22 opacity=%220.5%22/></svg>')]" />
    </div>
  );
}
