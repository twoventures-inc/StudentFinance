import { cn } from "@/lib/utils";
import { useCurrency } from "@/hooks/useCurrency";

export interface Transaction {
  id: string;
  description: string;
  amount: number;
  category: string;
  date: string;
  type: "income" | "expense";
}

interface TransactionItemProps {
  transaction: Transaction;
  className?: string;
}

const categoryIcons: Record<string, string> = {
  Food: "🍔",
  Transport: "🚌",
  Shopping: "🛍️",
  Entertainment: "🎬",
  Bills: "📄",
  Education: "📚",
  Health: "💊",
  Income: "💰",
  Other: "📦",
};

export function TransactionItem({ transaction, className }: TransactionItemProps) {
  const isIncome = transaction.type === "income";
  const { formatAmount } = useCurrency();

  return (
    <div
      className={cn(
        "flex items-center justify-between p-4 rounded-xl hover:bg-muted/50 transition-colors duration-200",
        className
      )}
    >
      <div className="flex items-center gap-4">
        <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center text-lg">
          {categoryIcons[transaction.category] || categoryIcons.Other}
        </div>
        <div>
          <p className="font-medium text-sm">{transaction.description}</p>
          <p className="text-xs text-muted-foreground">
            {transaction.category} • {transaction.date}
          </p>
        </div>
      </div>
      <p
        className={cn(
          "font-semibold text-sm",
          isIncome ? "text-income" : "text-expense"
        )}
      >
        {formatAmount(transaction.amount, { showSign: true, type: transaction.type })}
      </p>
    </div>
  );
}
