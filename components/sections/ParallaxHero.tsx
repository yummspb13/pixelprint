"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import RevealTitle from "@/components/ux/RevealTitle";
import { MagneticButton } from "@/components/ux/MagneticButton";
import Link from "next/link";

export default function ParallaxHero() {
  const { scrollYProgress } = useScroll({ offset: ["start start", "end start"] });
  const y1 = useTransform(scrollYProgress, [0, 1], [0, -40]);
  const y2 = useTransform(scrollYProgress, [0, 1], [0, 30]);
  const scale = useTransform(scrollYProgress, [0, 1], [1, 1.05]);

  return (
    <section className="bg-white">
      <div className="mx-auto grid max-w-7xl grid-cols-1 items-center gap-10 px-6 py-16 md:grid-cols-2">
        <div>
          <RevealTitle 
            text="Premium Digital & Large-Format Printing" 
            as="h1"
            className="text-4xl md:text-5xl font-semibold tracking-tight font-heading text-px-fg"
          />
          <p className="mt-4 text-zinc-600">
            Business stationery, flyers, posters, booklets, menus. Preflight check, same-day options, secure checkout.
          </p>
          <div className="mt-6 flex gap-3">
            <MagneticButton>
              <Link href="/services/business-cards" className="rounded-md bg-px-cyan px-4 py-2 text-white hover:bg-px-cyan/90">
                Calculate Order
              </Link>
            </MagneticButton>
            <Link href="/upload" className="rounded-md border border-px-magenta px-4 py-2 text-px-magenta hover:bg-px-magenta hover:text-white">
              Upload Artwork
            </Link>
          </div>
        </div>
        <div className="relative grid place-items-center">
          <motion.div 
            style={{ y: y1, scale }} 
            className="h-64 w-44 rounded-2xl bg-gradient-to-br from-px-cyan/10 to-px-magenta/10 shadow-xl flex items-center justify-center"
          >
            <span className="text-px-fg font-heading font-semibold">Business Cards</span>
          </motion.div>
          <motion.div 
            style={{ y: y2 }} 
            className="absolute -bottom-8 right-8 h-24 w-16 rounded-xl bg-gradient-to-br from-px-magenta/10 to-px-yellow/10 shadow flex items-center justify-center"
          >
            <span className="text-xs text-px-fg font-medium">Flyers</span>
          </motion.div>
        </div>
      </div>
    </section>
  );
}