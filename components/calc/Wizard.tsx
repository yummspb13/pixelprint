"use client";
import { createContext, useContext, useMemo, useState } from "react";

export type Step = {
  id: string;
  title: string;
  subtitle?: string;
};

type WizardState = {
  step: number;
  setStep: (n: number) => void;
  steps: Step[];
};

const WizardCtx = createContext<WizardState | null>(null);
export function useWizard() { 
  const c = useContext(WizardCtx); 
  if (!c) throw new Error("WizardCtx"); 
  return c; 
}

export default function Wizard({ steps, children }: { steps: Step[]; children: React.ReactNode }) {
  const [step, setStep] = useState(0);
  const value = useMemo(() => ({ step, setStep, steps }), [step, steps]);
  return <WizardCtx.Provider value={value}>{children}</WizardCtx.Provider>;
}
