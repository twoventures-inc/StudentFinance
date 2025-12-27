import { useState } from "react";
import { Plus, Trash2, Edit, AlertTriangle } from "lucide-react";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/dashboard/AppSidebar";
import { Header } from "@/components/dashboard/Header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BudgetProgress, Budget } from "@/components/dashboard/BudgetProgress";
import { AddBudgetForm } from "@/components/forms/AddBudgetForm";
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

const initialBudgets: Budget[] = [
  { id: "1", category: "Food", spent: 180, limit: 300, color: "hsl(25, 95%, 53%)" },
  { id: "2", category: "Transport", spent: 75, limit: 150, color: "hsl(199, 89%, 48%)" },
  { id: "3", category: "Entertainment", spent: 120, limit: 100, color: "hsl(280, 87%, 55%)" },
  { id: "4", category: "Shopping", spent: 200, limit: 250, color: "hsl(339, 90%, 51%)" },
  { id: "5", category: "Education", spent: 50, limit: 200, color: "hsl(168, 76%, 36%)" },
];

export default function Budgets() {
  const [budgets, setBudgets] = useState<Budget[]>(initialBudgets);
  const [activeSection, setActiveSection] = useState("budgets");
  const [searchQuery, setSearchQuery] = useState("");
  const [showAddBudget, setShowAddBudget] = useState(false);
  const [showAddTransaction, setShowAddTransaction] = useState(false);
  const [transactionType, setTransactionType] = useState<"income" | "expense">("expense");
  const [budgetToDelete, setBudgetToDelete] = useState<Budget | null>(null);
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

  const handleAddBudget = (data: { category: string; limit: string; color: string }) => {
    const newBudget: Budget = {
      id: Date.now().toString(),
      category: data.category,
      spent: 0,
      limit: parseFloat(data.limit),
      color: data.color,
    };
    setBudgets([...budgets, newBudget]);
  };

  const handleDeleteBudget = (budget: Budget) => {
    setBudgets(budgets.filter((b) => b.id !== budget.id));
    toast({
      title: "Budget Deleted",
      description: `${budget.category} budget has been removed.`,
    });
    setBudgetToDelete(null);
  };

  const filteredBudgets = budgets.filter((budget) =>
    budget.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalBudget = budgets.reduce((sum, b) => sum + b.limit, 0);
  const totalSpent = budgets.reduce((sum, b) => sum + b.spent, 0);
  const overBudgetCount = budgets.filter((b) => b.spent > b.limit).length;

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
                  <h1 className="text-3xl font-bold text-foreground">Budgets</h1>
                  <p className="text-muted-foreground">
                    Track and manage your spending limits
                  </p>
                </div>
                <Button onClick={() => setShowAddBudget(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Budget
                </Button>
              </div>

              {/* Summary Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                  <CardHeader className="pb-2">
                    <CardDescription>Total Budget</CardDescription>
                    <CardTitle className="text-2xl">${totalBudget.toFixed(0)}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-xs text-muted-foreground">Monthly allocation</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardDescription>Total Spent</CardDescription>
                    <CardTitle className="text-2xl">${totalSpent.toFixed(0)}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-xs text-muted-foreground">
                      {((totalSpent / totalBudget) * 100).toFixed(0)}% of budget used
                    </p>
                  </CardContent>
                </Card>
                <Card className={overBudgetCount > 0 ? "border-expense/50" : ""}>
                  <CardHeader className="pb-2">
                    <CardDescription className="flex items-center gap-2">
                      {overBudgetCount > 0 && <AlertTriangle className="h-4 w-4 text-expense" />}
                      Over Budget
                    </CardDescription>
                    <CardTitle className="text-2xl">{overBudgetCount}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-xs text-muted-foreground">
                      {overBudgetCount > 0 ? "Categories need attention" : "All budgets on track"}
                    </p>
                  </CardContent>
                </Card>
              </div>

              {/* Budget Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredBudgets.map((budget) => (
                  <Card key={budget.id} className="relative group">
                    <CardContent className="p-5">
                      <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => setBudgetToDelete(budget)}
                        >
                          <Trash2 className="h-4 w-4 text-muted-foreground hover:text-expense" />
                        </Button>
                      </div>
                      <BudgetProgress budget={budget} />
                    </CardContent>
                  </Card>
                ))}

                {/* Add New Budget Card */}
                <Card
                  className="border-dashed cursor-pointer hover:border-primary/50 hover:bg-accent/30 transition-colors"
                  onClick={() => setShowAddBudget(true)}
                >
                  <CardContent className="p-5 flex flex-col items-center justify-center h-full min-h-[120px]">
                    <Plus className="h-8 w-8 text-muted-foreground mb-2" />
                    <p className="text-sm text-muted-foreground">Add New Budget</p>
                  </CardContent>
                </Card>
              </div>

              {filteredBudgets.length === 0 && searchQuery && (
                <div className="text-center py-12">
                  <p className="text-muted-foreground">No budgets found matching "{searchQuery}"</p>
                </div>
              )}
            </div>
          </main>
        </div>
      </div>

      <AddBudgetForm
        open={showAddBudget}
        onOpenChange={setShowAddBudget}
        onSubmit={handleAddBudget}
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

      <AlertDialog open={!!budgetToDelete} onOpenChange={() => setBudgetToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Budget</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete the "{budgetToDelete?.category}" budget? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => budgetToDelete && handleDeleteBudget(budgetToDelete)}
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
