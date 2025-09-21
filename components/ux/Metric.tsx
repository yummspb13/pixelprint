"use client";
import { useInView, animate } from "framer-motion";
import { useEffect, useRef, useState } from "react";

export default function Metric({ to, label }:{ to:number; label:string }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="text-center">
        <div className="text-2xl font-semibold tabular-nums">0+</div>
        <div className="text-xs text-zinc-600">{label}</div>
      </div>
    );
  }

  return <MetricClient to={to} label={label} />;
}

function MetricClient({ to, label }:{ to:number; label:string }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once:true, margin:"-80px" });
  const [value, setValue] = useState(0);

  useEffect(() => {
    if (!inView) return;
    const controls = animate(0, to, { 
      duration: 1.2, 
      ease: "easeOut",
      onUpdate: (latest) => setValue(Math.round(latest))
    });
    return controls.stop;
  }, [inView, to]);

  return (
    <div ref={ref} className="text-center">
      <div className="text-2xl font-semibold tabular-nums">
        {value}+
      </div>
      <div className="text-xs text-zinc-600">{label}</div>
    </div>
  );
}
