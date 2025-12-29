import { useState } from "react";
import {
  Wallet,
  TrendingUp,
  TrendingDown,
  PiggyBank,
  ChevronRight,
  Plus,
  Loader2,
} from "lucide-react";
import { format } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { SidebarProvider, SidebarTrigger, SidebarInset } from "@/components/ui/sidebar";
import { Header } from "@/components/dashboard/Header";
import { AppSidebar } from "@/components/dashboard/AppSidebar";
import { OverviewCard } from "@/components/dashboard/OverviewCard";
import { TransactionItem } from "@/components/dashboard/TransactionItem";
import { BudgetProgress } from "@/components/dashboard/BudgetProgress";
import { SpendingSummary } from "@/components/dashboard/SpendingSummary";
import { isToday, startOfMonth, endOfMonth } from "date-fns";
import { QuickActions } from "@/components/dashboard/QuickActions";
import { SavingsGoal } from "@/components/dashboard/SavingsGoal";
import { AddTransactionForm } from "@/components/forms/AddTransactionForm";
import { AddBudgetForm } from "@/components/forms/AddBudgetForm";
import { AddGoalForm } from "@/components/forms/AddGoalForm";
import { AddSavingsForm } from "@/components/forms/AddSavingsForm";
import { useAuth } from "@/contexts/AuthContext";
import { useTransactions } from "@/hooks/useTransactions";
import { useBudgets } from "@/hooks/useBudgets";
import { useGoals } from "@/hooks/useGoals";
import { useProfile } from "@/hooks/useProfile";

const Index = () => {
  const [activeSection, setActiveSection] = useState("dashboard");
  const [searchQuery, setSearchQuery] = useState("");

  const { user } = useAuth();
  const { profile } = useProfile();
  const { transactions, isLoading: transactionsLoading, addTransaction } = useTransactions();
  const { budgets, isLoading: budgetsLoading, addBudget } = useBudgets();
  const { goals, isLoading: goalsLoading, addGoal, addSavings } = useGoals();

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

  // Calculate today's spending
  const todaySpending = transactions
    .filter((t) => t.type === "expense" && isToday(new Date(t.date)))
    .reduce((sum, t) => sum + t.amount, 0);

  // Calculate this month's spending
  const monthStart = startOfMonth(new Date());
  const monthEnd = endOfMonth(new Date());
  const monthlySpending = transactions
    .filter((t) => {
      const txDate = new Date(t.date);
      return t.type === "expense" && txDate >= monthStart && txDate <= monthEnd;
    })
    .reduce((sum, t) => sum + t.amount, 0);

  // Calculate total monthly budget
  const monthlyBudget = budgets.reduce((sum, b) => sum + b.limit, 0);

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
    addTransaction.mutate({
      description: data.description,
      amount: parseFloat(data.amount),
      category: data.category,
      date: data.date,
      type: data.type,
    });
  };

  const handleAddBudget = (data: { category: string; limit: string; color: string }) => {
    addBudget.mutate({
      category: data.category,
      limit: parseFloat(data.limit),
      color: data.color,
    });
  };

  const handleAddGoal = (data: { name: string; emoji: string; target: string; current: string }) => {
    addGoal.mutate({
      name: data.name,
      emoji: data.emoji,
      target: parseFloat(data.target),
      current: parseFloat(data.current),
    });
  };

  const handleAddSavings = (data: { goalId: string; amount: string }) => {
    addSavings.mutate({
      goalId: data.goalId,
      amount: parseFloat(data.amount),
    });
  };

  const isLoading = transactionsLoading || budgetsLoading || goalsLoading;
  const firstName = profile?.firstName || user?.email?.split('@')[0] || 'there';

  // Format transactions for display
  const displayTransactions = filteredTransactions.slice(0, 5).map(t => ({
    ...t,
    date: format(new Date(t.date), 'MMM d'),
  }));

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
                    Welcome back, {firstName}! 👋
                  </h1>
                  <p className="text-muted-foreground mt-1">
                    Here's what's happening with your finances today.
                  </p>
                </div>
              </div>
            </div>

            {isLoading ? (
              <div className="flex items-center justify-center py-20">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : (
              <>
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
                      variant="income"
                    />
                  </div>
                  <div className="animate-fade-in stagger-3 opacity-0">
                    <OverviewCard
                      title="Monthly Expenses"
                      value={`$${totalExpenses.toLocaleString("en-US", { minimumFractionDigits: 2 })}`}
                      icon={<TrendingDown className="h-5 w-5" />}
                      variant="expense"
                    />
                  </div>
                  <div className="animate-fade-in stagger-4 opacity-0">
                    <OverviewCard
                      title="Total Savings"
                      value={`$${totalSavings.toLocaleString("en-US", { minimumFractionDigits: 2 })}`}
                      icon={<PiggyBank className="h-5 w-5" />}
                      variant="savings"
                    />
                  </div>
                </div>

                {/* Main Content Grid */}
                <div className="grid gap-6 lg:grid-cols-3">
                  {/* Left Column - Charts & Budgets */}
                  <div className="lg:col-span-2 space-y-6">
                    {/* Daily & Monthly Spending Summary */}
                    <Card className="shadow-card animate-fade-in stagger-2 opacity-0">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-lg font-semibold">
                          Spending Summary
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <SpendingSummary
                          todaySpending={todaySpending}
                          monthlySpending={monthlySpending}
                          monthlyBudget={monthlyBudget}
                        />
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
                        {budgets.length > 0 ? (
                          budgets.slice(0, 4).map((budget) => (
                            <BudgetProgress key={budget.id} budget={budget} />
                          ))
                        ) : (
                          <p className="text-muted-foreground text-center py-4">No budgets yet. Create one to get started!</p>
                        )}
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
                        {goals.length > 0 ? (
                          goals.slice(0, 2).map((goal) => (
                            <SavingsGoal key={goal.id} goal={goal} />
                          ))
                        ) : (
                          <p className="text-muted-foreground text-center py-4">No goals yet. Set one to start saving!</p>
                        )}
                      </CardContent>
                    </Card>

                    {/* Recent Transactions */}
                    <Card className="shadow-card animate-fade-in stagger-3 opacity-0">
                      <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-lg font-semibold">
                          Recent Transactions
                        </CardTitle>
                        <Button variant="ghost" size="sm" className="text-xs" asChild>
                          <a href="/transactions">
                            See All <ChevronRight className="h-4 w-4 ml-1" />
                          </a>
                        </Button>
                      </CardHeader>
                      <CardContent className="p-0">
                        <div className="divide-y">
                          {displayTransactions.length > 0 ? (
                            displayTransactions.map((transaction) => (
                              <TransactionItem
                                key={transaction.id}
                                transaction={transaction}
                              />
                            ))
                          ) : (
                            <div className="p-4 text-center text-muted-foreground">
                              No transactions yet
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </>
            )}
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
