"use client";
import { useReducedMotion } from "framer-motion";

export function useNoMotion() {
  return useReducedMotion() || process.env.NEXT_PUBLIC_FX_ENABLED === "0";
}

export const ease = [0.22, 1, 0.36, 1] as const;
export const dur = { xs:.25, sm:.4, md:.6 };
