import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatCardProps {
  title: string;
  value: string | number;
  description?: string;
  icon: LucideIcon;
  variant?: "default" | "success" | "danger" | "neutral";
  trend?: string;
}

export function StatCard({ 
  title, 
  value, 
  description, 
  icon: Icon,
  variant = "default",
  trend
}: StatCardProps) {
  
  const variants = {
    default: "bg-card border-border/50 text-foreground",
    success: "bg-emerald-50 border-emerald-100 text-emerald-900",
    danger: "bg-rose-50 border-rose-100 text-rose-900",
    neutral: "bg-slate-50 border-slate-100 text-slate-900",
  };

  const iconVariants = {
    default: "bg-primary/10 text-primary",
    success: "bg-emerald-100 text-emerald-600",
    danger: "bg-rose-100 text-rose-600",
    neutral: "bg-slate-200 text-slate-600",
  };

  return (
    <div className={cn(
      "rounded-2xl p-6 border shadow-sm transition-all duration-300 hover:shadow-md",
      variants[variant]
    )}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium opacity-70 mb-1">{title}</p>
          <h3 className="text-2xl font-bold font-display tracking-tight">{value}</h3>
          {description && (
            <p className="mt-1 text-xs opacity-60">{description}</p>
          )}
        </div>
        <div className={cn(
          "p-3 rounded-xl",
          iconVariants[variant]
        )}>
          <Icon className="w-5 h-5" />
        </div>
      </div>
      {trend && (
        <div className="mt-4 flex items-center gap-2 text-xs font-medium">
          <span className={cn(
            "px-2 py-0.5 rounded-full",
            trend.startsWith("+") ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
          )}>
            {trend}
          </span>
          <span className="opacity-60">vs last month</span>
        </div>
      )}
    </div>
  );
}
