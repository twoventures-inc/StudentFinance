import { ReactNode } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface OverviewCardProps {
  title: string;
  value: string;
  icon: ReactNode;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  variant?: "default" | "income" | "expense" | "savings";
  className?: string;
}

const variantStyles = {
  default: "bg-card",
  income: "bg-income/10 border-income/20",
  expense: "bg-expense/10 border-expense/20",
  savings: "bg-savings/10 border-savings/20",
};

const iconStyles = {
  default: "bg-primary/10 text-primary",
  income: "bg-income/20 text-income",
  expense: "bg-expense/20 text-expense",
  savings: "bg-savings/20 text-savings",
};

export function OverviewCard({
  title,
  value,
  icon,
  trend,
  variant = "default",
  className,
}: OverviewCardProps) {
  return (
    <Card
      className={cn(
        "shadow-card hover:shadow-card-hover transition-all duration-300 border",
        variantStyles[variant],
        className
      )}
    >
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <p className="text-2xl font-semibold tracking-tight">{value}</p>
            {trend && (
              <p
                className={cn(
                  "text-xs font-medium flex items-center gap-1",
                  trend.isPositive ? "text-income" : "text-expense"
                )}
              >
                <span>{trend.isPositive ? "↑" : "↓"}</span>
                {Math.abs(trend.value)}% from last month
              </p>
            )}
          </div>
          <div
            className={cn(
              "p-3 rounded-xl",
              iconStyles[variant]
            )}
          >
            {icon}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
