"use client";
import { motion, useScroll, useSpring } from "framer-motion";
import { useEffect, useState } from "react";

export default function ScrollProgress() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div
        className="fixed left-0 top-0 z-[60] h-[3px] w-full origin-left
                   [background:linear-gradient(90deg,rgba(0,174,239,1),rgba(236,0,140,1),rgba(255,242,0,1))]"
        role="progressbar"
        aria-label="Scroll progress"
        style={{ transform: 'scaleX(0)' }}
      />
    );
  }

  return <ScrollProgressClient />;
}

function ScrollProgressClient() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 120, damping: 20, mass: .2 });

  return (
    <motion.div
      style={{ scaleX }}
      className="fixed left-0 top-0 z-[60] h-[3px] w-full origin-left
                 [background:linear-gradient(90deg,rgba(0,174,239,1),rgba(236,0,140,1),rgba(255,242,0,1))]"
      role="progressbar"
      aria-label="Scroll progress"
    />
  );
}
