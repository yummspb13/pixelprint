import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface AdminCardProps {
  title: string;
  children: ReactNode;
  className?: string;
  actions?: ReactNode;
}

export default function AdminCard({ title, children, className = "", actions }: AdminCardProps) {
  return (
    <div className={cn(
      "bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow",
      className
    )}>
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-semibold text-px-fg font-playfair">{title}</h3>
        {actions && <div>{actions}</div>}
      </div>
      {children}
    </div>
  );
}