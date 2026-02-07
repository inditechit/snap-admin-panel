import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface PageCardProps {
  children: ReactNode;
  title?: string;
  description?: string;
  action?: ReactNode;
  className?: string;
}

export function PageCard({ children, title, description, action, className }: PageCardProps) {
  return (
    <div className={cn("rounded-xl bg-card p-6 shadow-card animate-fade-in", className)}>
      {(title || action) && (
        <div className="mb-6 flex items-center justify-between">
          <div>
            {title && <h2 className="text-lg font-semibold">{title}</h2>}
            {description && (
              <p className="mt-1 text-sm text-muted-foreground">{description}</p>
            )}
          </div>
          {action}
        </div>
      )}
      {children}
    </div>
  );
}
