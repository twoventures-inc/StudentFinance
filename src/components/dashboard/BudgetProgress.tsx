import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { useCurrency } from "@/hooks/useCurrency";

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
  const { formatAmountShort } = useCurrency();

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
            {formatAmountShort(budget.spent)}
          </span>
          <span className="text-xs text-muted-foreground">
            {" "}
            / {formatAmountShort(budget.limit)}
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
          ? `${formatAmountShort(Math.abs(remaining))} over budget`
          : `${formatAmountShort(remaining)} remaining`}
      </p>
    </div>
  );
}
