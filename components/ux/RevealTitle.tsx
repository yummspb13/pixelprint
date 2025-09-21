"use client";
import { motion } from "framer-motion";
import { useNoMotion, ease, dur } from "@/lib/motion";
import { cn } from "@/lib/utils";

export default function RevealTitle({ text, as:Tag="h2", className, stagger=.06, delay=0 }:{
  text:string; as?: keyof React.JSX.IntrinsicElements; className?:string; stagger?:number; delay?:number;
}) {
  const off = useNoMotion();
  const words = text.split(" ");
  if (off) return <Tag className={className}>{text}</Tag>;
  return (
    <Tag className={cn("leading-tight", className)}>
      {words.map((w,i)=>(
        <span key={i} className="inline-block overflow-hidden">
          <motion.span
            initial={{ opacity:0, y:12, clipPath:"inset(0 100% 0 0)" }}
            whileInView={{ opacity:1, y:0, clipPath:"inset(0 0% 0 0)" }}
            viewport={{ once:true, amount:.7 }}
            transition={{ delay: delay + i*stagger, duration: dur.sm, ease }}
            className="inline-block"
          >
            {w}&nbsp;
          </motion.span>
        </span>
      ))}
    </Tag>
  );
}