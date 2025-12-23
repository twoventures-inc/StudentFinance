import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

export interface Budget {
  id: string;
  category: string;
  spent: number;
  limit: number;
  color: string;
}

interface BudgetProgressProps {
  budget: Budget;
  className?: string;
}

const categoryEmojis: Record<string, string> = {
  Food: "🍔",
  Transport: "🚌",
  Shopping: "🛍️",
  Entertainment: "🎬",
  Bills: "📄",
  Education: "📚",
  Health: "💊",
  Other: "📦",
};

export function BudgetProgress({ budget, className }: BudgetProgressProps) {
  const percentage = Math.min((budget.spent / budget.limit) * 100, 100);
  const isOverBudget = budget.spent > budget.limit;
  const remaining = budget.limit - budget.spent;

  return (
    <div className={cn("space-y-3", className)}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-lg">
            {categoryEmojis[budget.category] || categoryEmojis.Other}
          </span>
          <span className="font-medium text-sm">{budget.category}</span>
        </div>
        <div className="text-right">
          <span className="text-sm font-semibold">
            ${budget.spent.toFixed(0)}
          </span>
          <span className="text-xs text-muted-foreground">
            {" "}
            / ${budget.limit.toFixed(0)}
          </span>
        </div>
      </div>
      <Progress
        value={percentage}
        className={cn(
          "h-2",
          isOverBudget && "[&>div]:bg-expense"
        )}
        style={
          !isOverBudget
            ? { "--progress-color": budget.color } as React.CSSProperties
            : undefined
        }
      />
      <p
        className={cn(
          "text-xs",
          isOverBudget ? "text-expense" : "text-muted-foreground"
        )}
      >
        {isOverBudget
          ? `$${Math.abs(remaining).toFixed(0)} over budget`
          : `$${remaining.toFixed(0)} remaining`}
      </p>
    </div>
  );
}
