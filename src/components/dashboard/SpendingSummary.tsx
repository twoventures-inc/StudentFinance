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
  const dailyAllowance = daysRemaining > 0 ? remainingBudget / daysRemaining : 0;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      {/* Daily Spending Card */}
      <div className="relative overflow-hidden rounded-xl border bg-card p-6">
        <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-full -translate-y-8 translate-x-8" />
        <div className="relative">
          <div className="flex items-center gap-3 mb-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
              <Calendar className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Daily</p>
              <p className="text-xs text-muted-foreground">
                {format(today, "EEEE, MMM d")}
              </p>
            </div>
          </div>
          <div className="space-y-1">
            <p className="text-2xl font-bold">
              ${todaySpending.toLocaleString("en-US", { minimumFractionDigits: 2 })}
            </p>
            <p className="text-xs text-muted-foreground">
              Spent today
            </p>
          </div>
          {monthlyBudget > 0 && (
            <div className="mt-4 pt-4 border-t">
              <p className="text-sm text-muted-foreground">
                Daily allowance:{" "}
                <span className={`font-semibold ${dailyAllowance >= 0 ? "text-green-600" : "text-red-500"}`}>
                  ${Math.max(0, dailyAllowance).toLocaleString("en-US", { minimumFractionDigits: 2 })}
                </span>
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Until End of Month Card */}
      <div className="relative overflow-hidden rounded-xl border bg-card p-6">
        <div className="absolute top-0 right-0 w-24 h-24 bg-accent/10 rounded-full -translate-y-8 translate-x-8" />
        <div className="relative">
          <div className="flex items-center gap-3 mb-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent/20">
              <CalendarDays className="h-5 w-5 text-accent-foreground" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Until End of Month</p>
              <p className="text-xs text-muted-foreground">
                {daysRemaining} days remaining
              </p>
            </div>
          </div>
          <div className="space-y-1">
            <p className={`text-2xl font-bold ${remainingBudget >= 0 ? "" : "text-red-500"}`}>
              ${remainingBudget.toLocaleString("en-US", { minimumFractionDigits: 2 })}
            </p>
            <p className="text-xs text-muted-foreground">
              {remainingBudget >= 0 ? "Budget remaining" : "Over budget"}
            </p>
          </div>
          {monthlyBudget > 0 && (
            <div className="mt-4 pt-4 border-t">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Monthly budget</span>
                <span className="font-semibold">
                  ${monthlyBudget.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                </span>
              </div>
              <div className="mt-2 h-2 rounded-full bg-muted overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all ${
                    monthlySpending / monthlyBudget > 0.9
                      ? "bg-red-500"
                      : monthlySpending / monthlyBudget > 0.7
                      ? "bg-yellow-500"
                      : "bg-green-500"
                  }`}
                  style={{
                    width: `${Math.min(100, (monthlySpending / monthlyBudget) * 100)}%`,
                  }}
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
