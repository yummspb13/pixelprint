"use client";

import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { useRef, useState, useEffect } from "react";
import { useNoMotion } from "@/lib/motion";

interface MagneticButtonProps {
  children: React.ReactNode;
  className?: string;
  intensity?: number;
}

export function MagneticButton({ children, className = "", intensity = 0.3 }: MagneticButtonProps) {
  const [mounted, setMounted] = useState(false);
  const noMotion = useNoMotion();

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted || noMotion) {
    return <div className={className}>{children}</div>;
  }

  return <MagneticButtonClient className={className} intensity={intensity}>{children}</MagneticButtonClient>;
}

function MagneticButtonClient({ children, className = "", intensity = 0.3 }: MagneticButtonProps) {
  const ref = useRef<HTMLDivElement>(null);

  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const translateX = useSpring(useTransform(x, [-1, 1], [-10, 10]), {
    stiffness: 300,
    damping: 30
  });
  const translateY = useSpring(useTransform(y, [-1, 1], [-10, 10]), {
    stiffness: 300,
    damping: 30
  });

  const handleMouseMove = (event: React.MouseEvent<HTMLDivElement>) => {
    if (!ref.current) return;

    const rect = ref.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    
    const distanceX = event.clientX - centerX;
    const distanceY = event.clientY - centerY;
    
    x.set((distanceX / (rect.width / 2)) * intensity);
    y.set((distanceY / (rect.height / 2)) * intensity);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <motion.div
      ref={ref}
      className={className}
      style={{ x: translateX, y: translateY }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
    >
      {children}
    </motion.div>
  );
}
