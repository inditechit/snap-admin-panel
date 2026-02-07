import { cn } from "@/lib/utils";

interface StatusBadgeProps {
  status: string;
  className?: string;
}

const statusStyles: Record<string, string> = {
  new: "status-new",
  contacted: "status-contacted",
  converted: "status-converted",
  closed: "status-closed",
  draft: "status-draft",
  published: "status-published",
  active: "status-active",
  inactive: "status-inactive",
  reviewed: "status-converted",
  pending: "status-contacted",
};

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const statusKey = status.toLowerCase();
  const styleClass = statusStyles[statusKey] || "status-closed";

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium capitalize",
        styleClass,
        className
      )}
    >
      {status}
    </span>
  );
}
