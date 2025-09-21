"use client";

import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { useRef, useState, useEffect } from "react";
import { useNoMotion } from "@/lib/motion";

interface TiltCardProps {
  children: React.ReactNode;
  className?: string;
  intensity?: number;
}

export function TiltCard({ children, className = "", intensity = 15 }: TiltCardProps) {
  const [mounted, setMounted] = useState(false);
  const noMotion = useNoMotion();

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted || noMotion) {
    return <div className={className}>{children}</div>;
  }

  return <TiltCardClient className={className} intensity={intensity}>{children}</TiltCardClient>;
}

function TiltCardClient({ children, className = "", intensity = 15 }: TiltCardProps) {
  const ref = useRef<HTMLDivElement>(null);

  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const rotateX = useSpring(useTransform(y, [-0.5, 0.5], [intensity, -intensity]), {
    stiffness: 300,
    damping: 30
  });
  const rotateY = useSpring(useTransform(x, [-0.5, 0.5], [-intensity, intensity]), {
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
    
    x.set(distanceX / (rect.width / 2));
    y.set(distanceY / (rect.height / 2));
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <motion.div
      ref={ref}
      className={className}
      style={{ rotateX, rotateY }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
    >
      {children}
    </motion.div>
  );
}
