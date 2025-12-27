import { useState } from "react";
import { Plus, Trash2, PiggyBank, TrendingUp, Target } from "lucide-react";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/dashboard/AppSidebar";
import { Header } from "@/components/dashboard/Header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { SavingsGoal, Goal } from "@/components/dashboard/SavingsGoal";
import { AddGoalForm } from "@/components/forms/AddGoalForm";
import { AddSavingsForm } from "@/components/forms/AddSavingsForm";
import { AddTransactionForm } from "@/components/forms/AddTransactionForm";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";

const initialGoals: Goal[] = [
  { id: "1", name: "New Laptop", emoji: "💻", current: 450, target: 1200 },
  { id: "2", name: "Summer Trip", emoji: "✈️", current: 800, target: 2000 },
  { id: "3", name: "Emergency Fund", emoji: "🏦", current: 1500, target: 5000 },
  { id: "4", name: "New Phone", emoji: "📱", current: 200, target: 800 },
];

export default function Goals() {
  const [goals, setGoals] = useState<Goal[]>(initialGoals);
  const [activeSection, setActiveSection] = useState("goals");
  const [searchQuery, setSearchQuery] = useState("");
  const [showAddGoal, setShowAddGoal] = useState(false);
  const [showAddSavings, setShowAddSavings] = useState(false);
  const [showAddTransaction, setShowAddTransaction] = useState(false);
  const [transactionType, setTransactionType] = useState<"income" | "expense">("expense");
  const [goalToDelete, setGoalToDelete] = useState<Goal | null>(null);
  const { toast } = useToast();

  const handleQuickAction = (action: string) => {
    if (action === "add-income") {
      setTransactionType("income");
      setShowAddTransaction(true);
    } else if (action === "add-expense") {
      setTransactionType("expense");
      setShowAddTransaction(true);
    }
  };

  const handleAddGoal = (data: { name: string; emoji: string; target: string; current: string }) => {
    const newGoal: Goal = {
      id: Date.now().toString(),
      name: data.name,
      emoji: data.emoji,
      current: parseFloat(data.current),
      target: parseFloat(data.target),
    };
    setGoals([...goals, newGoal]);
  };

  const handleAddSavings = (data: { goalId: string; amount: string }) => {
    setGoals(
      goals.map((goal) =>
        goal.id === data.goalId
          ? { ...goal, current: Math.min(goal.current + parseFloat(data.amount), goal.target) }
          : goal
      )
    );
  };

  const handleDeleteGoal = (goal: Goal) => {
    setGoals(goals.filter((g) => g.id !== goal.id));
    toast({
      title: "Goal Deleted",
      description: `${goal.emoji} ${goal.name} has been removed.`,
    });
    setGoalToDelete(null);
  };

  const filteredGoals = goals.filter((goal) =>
    goal.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalTarget = goals.reduce((sum, g) => sum + g.target, 0);
  const totalSaved = goals.reduce((sum, g) => sum + g.current, 0);
  const completedGoals = goals.filter((g) => g.current >= g.target).length;
  const overallProgress = totalTarget > 0 ? (totalSaved / totalTarget) * 100 : 0;

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <AppSidebar
          activeSection={activeSection}
          onSectionChange={setActiveSection}
          onQuickAction={handleQuickAction}
        />
        <div className="flex-1 flex flex-col">
          <Header searchQuery={searchQuery} onSearchChange={setSearchQuery} />
          <main className="flex-1 p-6 overflow-auto">
            <div className="max-w-7xl mx-auto space-y-6">
              {/* Page Header */}
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-3xl font-bold text-foreground">Savings Goals</h1>
                  <p className="text-muted-foreground">
                    Track your progress towards financial goals
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" onClick={() => setShowAddSavings(true)}>
                    <PiggyBank className="h-4 w-4 mr-2" />
                    Add Funds
                  </Button>
                  <Button onClick={() => setShowAddGoal(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    New Goal
                  </Button>
                </div>
              </div>

              {/* Summary Cards */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card>
                  <CardHeader className="pb-2">
                    <CardDescription className="flex items-center gap-2">
                      <Target className="h-4 w-4 text-savings" />
                      Total Target
                    </CardDescription>
                    <CardTitle className="text-2xl">${totalTarget.toLocaleString()}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-xs text-muted-foreground">Across all goals</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardDescription className="flex items-center gap-2">
                      <PiggyBank className="h-4 w-4 text-savings" />
                      Total Saved
                    </CardDescription>
                    <CardTitle className="text-2xl text-savings">${totalSaved.toLocaleString()}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-xs text-muted-foreground">
                      {overallProgress.toFixed(0)}% of total target
                    </p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardDescription>Remaining</CardDescription>
                    <CardTitle className="text-2xl">${(totalTarget - totalSaved).toLocaleString()}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-xs text-muted-foreground">Still needed</p>
                  </CardContent>
                </Card>
                <Card className={completedGoals > 0 ? "border-savings/50" : ""}>
                  <CardHeader className="pb-2">
                    <CardDescription className="flex items-center gap-2">
                      <TrendingUp className="h-4 w-4 text-savings" />
                      Completed
                    </CardDescription>
                    <CardTitle className="text-2xl">{completedGoals}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-xs text-muted-foreground">
                      {completedGoals > 0 ? "Goals achieved! 🎉" : "Keep saving!"}
                    </p>
                  </CardContent>
                </Card>
              </div>

              {/* Goal Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredGoals.map((goal) => (
                  <div key={goal.id} className="relative group">
                    <div className="absolute top-3 right-3 z-10 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 bg-background/80 backdrop-blur-sm"
                        onClick={() => setGoalToDelete(goal)}
                      >
                        <Trash2 className="h-4 w-4 text-muted-foreground hover:text-expense" />
                      </Button>
                    </div>
                    <SavingsGoal goal={goal} />
                  </div>
                ))}

                {/* Add New Goal Card */}
                <div
                  className="p-4 rounded-xl border border-dashed border-savings/30 cursor-pointer hover:border-savings/50 hover:bg-savings/5 transition-colors flex flex-col items-center justify-center min-h-[140px]"
                  onClick={() => setShowAddGoal(true)}
                >
                  <Plus className="h-8 w-8 text-savings/50 mb-2" />
                  <p className="text-sm text-muted-foreground">Add New Goal</p>
                </div>
              </div>

              {filteredGoals.length === 0 && searchQuery && (
                <div className="text-center py-12">
                  <p className="text-muted-foreground">No goals found matching "{searchQuery}"</p>
                </div>
              )}
            </div>
          </main>
        </div>
      </div>

      <AddGoalForm
        open={showAddGoal}
        onOpenChange={setShowAddGoal}
        onSubmit={handleAddGoal}
      />

      <AddSavingsForm
        open={showAddSavings}
        onOpenChange={setShowAddSavings}
        goals={goals}
        onSubmit={handleAddSavings}
      />

      <AddTransactionForm
        open={showAddTransaction}
        onOpenChange={setShowAddTransaction}
        type={transactionType}
        onSubmit={(data) => {
          toast({
            title: "Transaction Added",
            description: `${data.type === "income" ? "Income" : "Expense"} of $${data.amount} added.`,
          });
        }}
      />

      <AlertDialog open={!!goalToDelete} onOpenChange={() => setGoalToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Goal</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{goalToDelete?.emoji} {goalToDelete?.name}"? This action cannot be undone and you'll lose ${goalToDelete?.current.toLocaleString()} in tracked savings.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => goalToDelete && handleDeleteGoal(goalToDelete)}
              className="bg-expense hover:bg-expense/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </SidebarProvider>
  );
}
