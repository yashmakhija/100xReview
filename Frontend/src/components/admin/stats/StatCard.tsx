import React, { ReactNode } from "react";
import { cn } from "../../../lib/utils";
import { LucideIcon } from "lucide-react";

interface StatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  iconBgClass: string;
  iconColor: string;
  isDark: boolean;
  footer?: ReactNode;
}

const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  icon: Icon,
  iconBgClass,
  iconColor,
  isDark,
  footer,
}) => {
  return (
    <div
      className={cn(
        "p-5 rounded-xl border backdrop-blur-sm",
        isDark
          ? "bg-zinc-900/60 border-zinc-800 shadow-xl shadow-black/10"
          : "bg-white/60 border-gray-100 shadow-lg shadow-gray-100/50"
      )}
    >
      <div className="flex items-start justify-between">
        <div>
          <p
            className={cn(
              "text-sm font-medium",
              isDark ? "text-zinc-400" : "text-gray-500"
            )}
          >
            {title}
          </p>
          <p className="mt-1 text-3xl font-bold">{value}</p>
          {footer && <div className="mt-2">{footer}</div>}
        </div>
        <div className={cn("p-3 rounded-xl", iconBgClass)}>
          <Icon className={`h-6 w-6 ${iconColor}`} />
        </div>
      </div>
    </div>
  );
};

export default StatCard;
