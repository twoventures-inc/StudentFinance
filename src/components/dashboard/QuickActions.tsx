import { Plus, ArrowUpRight, ArrowDownRight, Target } from "lucide-react";
import { Button } from "@/components/ui/button";

export function QuickActions() {
  return (
    <div className="grid grid-cols-2 gap-3">
      <Button
        variant="outline"
        className="h-auto py-4 flex flex-col items-center gap-2 hover:bg-income/10 hover:border-income/30 hover:text-income transition-colors"
      >
        <ArrowDownRight className="h-5 w-5" />
        <span className="text-xs font-medium">Add Income</span>
      </Button>
      <Button
        variant="outline"
        className="h-auto py-4 flex flex-col items-center gap-2 hover:bg-expense/10 hover:border-expense/30 hover:text-expense transition-colors"
      >
        <ArrowUpRight className="h-5 w-5" />
        <span className="text-xs font-medium">Add Expense</span>
      </Button>
      <Button
        variant="outline"
        className="h-auto py-4 flex flex-col items-center gap-2 hover:bg-savings/10 hover:border-savings/30 hover:text-savings transition-colors"
      >
        <Target className="h-5 w-5" />
        <span className="text-xs font-medium">Set Goal</span>
      </Button>
      <Button
        variant="outline"
        className="h-auto py-4 flex flex-col items-center gap-2 hover:bg-primary/10 hover:border-primary/30 hover:text-primary transition-colors"
      >
        <Plus className="h-5 w-5" />
        <span className="text-xs font-medium">New Budget</span>
      </Button>
    </div>
  );
}
