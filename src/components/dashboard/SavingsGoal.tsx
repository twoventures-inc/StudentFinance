import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

export interface Goal {
  id: string;
  name: string;
  emoji: string;
  current: number;
  target: number;
}

interface SavingsGoalProps {
  goal: Goal;
  className?: string;
}

export function SavingsGoal({ goal, className }: SavingsGoalProps) {
  const percentage = (goal.current / goal.target) * 100;

  return (
    <div
      className={cn(
        "p-4 rounded-xl bg-savings/5 border border-savings/20 space-y-3",
        className
      )}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-xl">{goal.emoji}</span>
          <span className="font-medium text-sm">{goal.name}</span>
        </div>
        <span className="text-xs font-semibold text-savings">
          {percentage.toFixed(0)}%
        </span>
      </div>
      <Progress
        value={percentage}
        className="h-2 [&>div]:bg-savings"
      />
      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span>${goal.current.toLocaleString()}</span>
        <span>${goal.target.toLocaleString()}</span>
      </div>
    </div>
  );
}
