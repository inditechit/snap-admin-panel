import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface StatCardProps {
  title: string;
  value: string | number;
  icon: ReactNode;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  variant?: "primary" | "accent" | "success" | "info";
}

export function StatCard({ title, value, icon, trend, variant = "primary" }: StatCardProps) {
  const variantClasses = {
    primary: "stat-card-primary",
    accent: "stat-card-accent",
    success: "stat-card-success",
    info: "stat-card-info",
  };

  return (
    <div
      className={cn(
        "rounded-xl p-6 text-primary-foreground shadow-card-md animate-fade-in",
        variantClasses[variant]
      )}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium opacity-90">{title}</p>
          <p className="mt-2 text-3xl font-bold">{value}</p>
          {trend && (
            <p className="mt-2 text-sm">
              <span className={trend.isPositive ? "text-success-foreground" : "text-destructive-foreground"}>
                {trend.isPositive ? "↑" : "↓"} {Math.abs(trend.value)}%
              </span>
              <span className="ml-1 opacity-75">vs last month</span>
            </p>
          )}
        </div>
        <div className="rounded-lg bg-primary-foreground/20 p-3">
          {icon}
        </div>
      </div>
    </div>
  );
}
