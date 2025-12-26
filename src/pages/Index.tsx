import { useState } from "react";
import {
  Wallet,
  TrendingUp,
  TrendingDown,
  PiggyBank,
  ChevronRight,
  Plus,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { SidebarProvider, SidebarTrigger, SidebarInset } from "@/components/ui/sidebar";
import { Header } from "@/components/dashboard/Header";
import { AppSidebar } from "@/components/dashboard/AppSidebar";
import { OverviewCard } from "@/components/dashboard/OverviewCard";
import { TransactionItem, Transaction } from "@/components/dashboard/TransactionItem";
import { BudgetProgress, Budget } from "@/components/dashboard/BudgetProgress";
import { ExpenseChart } from "@/components/dashboard/ExpenseChart";
import { QuickActions } from "@/components/dashboard/QuickActions";
import { SavingsGoal, Goal } from "@/components/dashboard/SavingsGoal";
import { AddTransactionForm } from "@/components/forms/AddTransactionForm";
import { AddBudgetForm } from "@/components/forms/AddBudgetForm";
import { AddGoalForm } from "@/components/forms/AddGoalForm";
import { AddSavingsForm } from "@/components/forms/AddSavingsForm";

// Initial sample data
const initialTransactions: Transaction[] = [
  {
    id: "1",
    description: "Campus Bookstore",
    amount: 45.99,
    category: "Education",
    date: "Today",
    type: "expense",
  },
  {
    id: "2",
    description: "Part-time Salary",
    amount: 450.0,
    category: "Income",
    date: "Yesterday",
    type: "income",
  },
  {
    id: "3",
    description: "Spotify Premium",
    amount: 9.99,
    category: "Entertainment",
    date: "Dec 20",
    type: "expense",
  },
  {
    id: "4",
    description: "Uber to Campus",
    amount: 12.5,
    category: "Transport",
    date: "Dec 19",
    type: "expense",
  },
  {
    id: "5",
    description: "Chipotle Lunch",
    amount: 14.25,
    category: "Food",
    date: "Dec 19",
    type: "expense",
  },
];

const initialBudgets: Budget[] = [
  { id: "1", category: "Food", spent: 180, limit: 250, color: "hsl(25, 95%, 53%)" },
  { id: "2", category: "Transport", spent: 65, limit: 100, color: "hsl(199, 89%, 48%)" },
  { id: "3", category: "Entertainment", spent: 90, limit: 80, color: "hsl(280, 87%, 55%)" },
  { id: "4", category: "Shopping", spent: 120, limit: 150, color: "hsl(339, 90%, 51%)" },
];

const initialGoals: Goal[] = [
  { id: "1", name: "New Laptop", emoji: "💻", current: 650, target: 1200 },
  { id: "2", name: "Spring Break Trip", emoji: "✈️", current: 280, target: 800 },
];

const Index = () => {
  const [activeSection, setActiveSection] = useState("dashboard");
  const [transactions, setTransactions] = useState<Transaction[]>(initialTransactions);
  const [budgets, setBudgets] = useState<Budget[]>(initialBudgets);
  const [goals, setGoals] = useState<Goal[]>(initialGoals);
  const [searchQuery, setSearchQuery] = useState("");

  // Form dialog states
  const [incomeFormOpen, setIncomeFormOpen] = useState(false);
  const [expenseFormOpen, setExpenseFormOpen] = useState(false);
  const [budgetFormOpen, setBudgetFormOpen] = useState(false);
  const [goalFormOpen, setGoalFormOpen] = useState(false);
  const [savingsFormOpen, setSavingsFormOpen] = useState(false);

  // Filter transactions based on search query
  const filteredTransactions = transactions.filter((t) =>
    t.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Calculate totals
  const totalIncome = transactions
    .filter((t) => t.type === "income")
    .reduce((sum, t) => sum + t.amount, 0);
  const totalExpenses = transactions
    .filter((t) => t.type === "expense")
    .reduce((sum, t) => sum + t.amount, 0);
  const totalBalance = totalIncome - totalExpenses;
  const totalSavings = goals.reduce((sum, g) => sum + g.current, 0);

  // Calculate expense breakdown
  const expenseData = transactions
    .filter((t) => t.type === "expense")
    .reduce((acc: { name: string; value: number; color: string }[], t) => {
      const existing = acc.find((item) => item.name === t.category);
      const categoryColors: Record<string, string> = {
        Food: "hsl(25, 95%, 53%)",
        Transport: "hsl(199, 89%, 48%)",
        Entertainment: "hsl(280, 87%, 55%)",
        Shopping: "hsl(339, 90%, 51%)",
        Education: "hsl(168, 76%, 36%)",
        Utilities: "hsl(45, 93%, 47%)",
        Other: "hsl(220, 14%, 50%)",
      };
      if (existing) {
        existing.value += t.amount;
      } else {
        acc.push({
          name: t.category,
          value: t.amount,
          color: categoryColors[t.category] || categoryColors.Other,
        });
      }
      return acc;
    }, []);

  const handleQuickAction = (action: string) => {
    switch (action) {
      case "add-income":
        setIncomeFormOpen(true);
        break;
      case "add-expense":
        setExpenseFormOpen(true);
        break;
      case "set-goal":
        setGoalFormOpen(true);
        break;
      case "new-budget":
        setBudgetFormOpen(true);
        break;
    }
  };

  const handleAddTransaction = (data: {
    description: string;
    amount: string;
    category: string;
    date: string;
    type: "income" | "expense";
  }) => {
    const newTransaction: Transaction = {
      id: Date.now().toString(),
      description: data.description,
      amount: parseFloat(data.amount),
      category: data.category,
      date: new Date(data.date).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
      type: data.type,
    };
    setTransactions([newTransaction, ...transactions]);
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

  const handleAddGoal = (data: { name: string; emoji: string; target: string; current: string }) => {
    const newGoal: Goal = {
      id: Date.now().toString(),
      name: data.name,
      emoji: data.emoji,
      target: parseFloat(data.target),
      current: parseFloat(data.current),
    };
    setGoals([...goals, newGoal]);
  };

  const handleAddSavings = (data: { goalId: string; amount: string }) => {
    setGoals(
      goals.map((goal) =>
        goal.id === data.goalId
          ? { ...goal, current: goal.current + parseFloat(data.amount) }
          : goal
      )
    );
  };

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <AppSidebar
          activeSection={activeSection}
          onSectionChange={setActiveSection}
          onQuickAction={handleQuickAction}
        />
        <SidebarInset className="flex-1">
          <Header searchQuery={searchQuery} onSearchChange={setSearchQuery} />

          <main className="container px-4 py-8 md:px-6">
            {/* Welcome Section */}
            <div className="mb-8 animate-fade-in flex items-center justify-between">
              <div className="flex items-center gap-4">
                <SidebarTrigger className="md:hidden" />
                <div>
                  <h1 className="text-2xl font-bold tracking-tight md:text-3xl">
                    Welcome back, Jamie! 👋
                  </h1>
                  <p className="text-muted-foreground mt-1">
                    Here's what's happening with your finances today.
                  </p>
                </div>
              </div>
            </div>

            {/* Overview Cards */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-8">
              <div className="animate-fade-in stagger-1 opacity-0">
                <OverviewCard
                  title="Total Balance"
                  value={`$${totalBalance.toLocaleString("en-US", { minimumFractionDigits: 2 })}`}
                  icon={<Wallet className="h-5 w-5" />}
                  variant="default"
                />
              </div>
              <div className="animate-fade-in stagger-2 opacity-0">
                <OverviewCard
                  title="Monthly Income"
                  value={`$${totalIncome.toLocaleString("en-US", { minimumFractionDigits: 2 })}`}
                  icon={<TrendingUp className="h-5 w-5" />}
                  trend={{ value: 12, isPositive: true }}
                  variant="income"
                />
              </div>
              <div className="animate-fade-in stagger-3 opacity-0">
                <OverviewCard
                  title="Monthly Expenses"
                  value={`$${totalExpenses.toLocaleString("en-US", { minimumFractionDigits: 2 })}`}
                  icon={<TrendingDown className="h-5 w-5" />}
                  trend={{ value: 5, isPositive: false }}
                  variant="expense"
                />
              </div>
              <div className="animate-fade-in stagger-4 opacity-0">
                <OverviewCard
                  title="Total Savings"
                  value={`$${totalSavings.toLocaleString("en-US", { minimumFractionDigits: 2 })}`}
                  icon={<PiggyBank className="h-5 w-5" />}
                  trend={{ value: 8, isPositive: true }}
                  variant="savings"
                />
              </div>
            </div>

            {/* Main Content Grid */}
            <div className="grid gap-6 lg:grid-cols-3">
              {/* Left Column - Charts & Budgets */}
              <div className="lg:col-span-2 space-y-6">
                {/* Expense Breakdown */}
                <Card className="shadow-card animate-fade-in stagger-2 opacity-0">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg font-semibold">
                      Expense Breakdown
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ExpenseChart data={expenseData} />
                  </CardContent>
                </Card>

                {/* Budget Progress */}
                <Card className="shadow-card animate-fade-in stagger-3 opacity-0">
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-lg font-semibold">
                      Budget Progress
                    </CardTitle>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-xs"
                      onClick={() => setBudgetFormOpen(true)}
                    >
                      <Plus className="h-4 w-4 mr-1" /> Add Budget
                    </Button>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {budgets.map((budget) => (
                      <BudgetProgress key={budget.id} budget={budget} />
                    ))}
                  </CardContent>
                </Card>
              </div>

              {/* Right Column - Transactions & Actions */}
              <div className="space-y-6">
                {/* Quick Actions */}
                <Card className="shadow-card animate-fade-in stagger-1 opacity-0">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg font-semibold">
                      Quick Actions
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <QuickActions onAction={handleQuickAction} />
                  </CardContent>
                </Card>

                {/* Savings Goals */}
                <Card className="shadow-card animate-fade-in stagger-2 opacity-0">
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-lg font-semibold">
                      Savings Goals
                    </CardTitle>
                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-xs"
                        onClick={() => setSavingsFormOpen(true)}
                      >
                        <Plus className="h-4 w-4 mr-1" /> Add Funds
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-xs"
                        onClick={() => setGoalFormOpen(true)}
                      >
                        New Goal <ChevronRight className="h-4 w-4 ml-1" />
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {goals.map((goal) => (
                      <SavingsGoal key={goal.id} goal={goal} />
                    ))}
                  </CardContent>
                </Card>

                {/* Recent Transactions */}
                <Card className="shadow-card animate-fade-in stagger-3 opacity-0">
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-lg font-semibold">
                      Recent Transactions
                    </CardTitle>
                    <Button variant="ghost" size="sm" className="text-xs">
                      See All <ChevronRight className="h-4 w-4 ml-1" />
                    </Button>
                  </CardHeader>
                  <CardContent className="p-0">
                    <div className="divide-y">
                      {filteredTransactions.length > 0 ? (
                        filteredTransactions.slice(0, 5).map((transaction) => (
                          <TransactionItem
                            key={transaction.id}
                            transaction={transaction}
                          />
                        ))
                      ) : (
                        <div className="p-4 text-center text-muted-foreground">
                          No transactions found
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </main>
        </SidebarInset>
      </div>

      {/* Form Dialogs */}
      <AddTransactionForm
        open={incomeFormOpen}
        onOpenChange={setIncomeFormOpen}
        type="income"
        onSubmit={handleAddTransaction}
      />
      <AddTransactionForm
        open={expenseFormOpen}
        onOpenChange={setExpenseFormOpen}
        type="expense"
        onSubmit={handleAddTransaction}
      />
      <AddBudgetForm
        open={budgetFormOpen}
        onOpenChange={setBudgetFormOpen}
        onSubmit={handleAddBudget}
      />
      <AddGoalForm
        open={goalFormOpen}
        onOpenChange={setGoalFormOpen}
        onSubmit={handleAddGoal}
      />
      <AddSavingsForm
        open={savingsFormOpen}
        onOpenChange={setSavingsFormOpen}
        goals={goals}
        onSubmit={handleAddSavings}
      />
    </SidebarProvider>
  );
};

export default Index;
