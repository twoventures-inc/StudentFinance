import { Calendar, CalendarDays } from "lucide-react";
import { format, endOfMonth, differenceInDays } from "date-fns";

interface SpendingSummaryProps {
  todaySpending: number;
  monthlySpending: number;
  monthlyBudget: number;
}

export function SpendingSummary({
  todaySpending,
  monthlySpending,
  monthlyBudget,
}: SpendingSummaryProps) {
  const today = new Date();
  const monthEnd = endOfMonth(today);
  const daysRemaining = differenceInDays(monthEnd, today);
  const remainingBudget = monthlyBudget - monthlySpending;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      {/* Daily Spending Card */}
      <div className="flex items-start gap-4 rounded-xl border bg-card p-5">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-teal-100">
          <Calendar className="h-5 w-5 text-teal-600" />
        </div>
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <p className="text-sm font-medium text-teal-600">Daily</p>
          </div>
          <p className="text-xs text-muted-foreground">
            {format(today, "EEEE, MMM d")}
          </p>
          <p className="text-xl font-bold pt-1">
            ${todaySpending.toLocaleString("en-US", { minimumFractionDigits: 2 })}
          </p>
          <p className="text-xs text-muted-foreground">Spent today</p>
        </div>
      </div>

      {/* Until End of Month Card */}
      <div className="flex items-start gap-4 rounded-xl border bg-card p-5">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-slate-100">
          <CalendarDays className="h-5 w-5 text-slate-600" />
        </div>
        <div className="space-y-1">
          <p className="text-sm font-medium text-muted-foreground">Until End of Month</p>
          <p className="text-xs text-muted-foreground">
            {daysRemaining} days remaining
          </p>
          <p className={`text-xl font-bold pt-1 ${remainingBudget < 0 ? "text-red-500" : ""}`}>
            ${remainingBudget.toLocaleString("en-US", { minimumFractionDigits: 2 })}
          </p>
          <p className="text-xs text-muted-foreground">
            {remainingBudget >= 0 ? "Budget remaining" : "Over budget"}
          </p>
        </div>
      </div>
    </div>
  );
}
