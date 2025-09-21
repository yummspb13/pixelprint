"use client";
import { motion } from "framer-motion";
import { useNoMotion, ease, dur } from "@/lib/motion";
export default function ScrollReveal({ children, delay=0, y=20 }: {children:React.ReactNode; delay?:number; y?:number}) {
  const off = useNoMotion();
  if (off) return <>{children}</>;
  return (
    <motion.div initial={{opacity:0,y}} whileInView={{opacity:1,y:0}} viewport={{once:true,amount:.2}}
      transition={{duration:dur.xs,delay,ease}}>
      {children}
    </motion.div>
  );
}