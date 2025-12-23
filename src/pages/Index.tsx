import {
  Wallet,
  TrendingUp,
  TrendingDown,
  PiggyBank,
  ChevronRight,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Header } from "@/components/dashboard/Header";
import { OverviewCard } from "@/components/dashboard/OverviewCard";
import { TransactionItem, Transaction } from "@/components/dashboard/TransactionItem";
import { BudgetProgress, Budget } from "@/components/dashboard/BudgetProgress";
import { ExpenseChart } from "@/components/dashboard/ExpenseChart";
import { QuickActions } from "@/components/dashboard/QuickActions";
import { SavingsGoal, Goal } from "@/components/dashboard/SavingsGoal";

// Sample data
const transactions: Transaction[] = [
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

const budgets: Budget[] = [
  { id: "1", category: "Food", spent: 180, limit: 250, color: "hsl(25, 95%, 53%)" },
  { id: "2", category: "Transport", spent: 65, limit: 100, color: "hsl(199, 89%, 48%)" },
  { id: "3", category: "Entertainment", spent: 90, limit: 80, color: "hsl(280, 87%, 55%)" },
  { id: "4", category: "Shopping", spent: 120, limit: 150, color: "hsl(339, 90%, 51%)" },
];

const expenseData = [
  { name: "Food", value: 180, color: "hsl(25, 95%, 53%)" },
  { name: "Transport", value: 65, color: "hsl(199, 89%, 48%)" },
  { name: "Entertainment", value: 90, color: "hsl(280, 87%, 55%)" },
  { name: "Shopping", value: 120, color: "hsl(339, 90%, 51%)" },
  { name: "Education", value: 200, color: "hsl(168, 76%, 36%)" },
];

const savingsGoals: Goal[] = [
  { id: "1", name: "New Laptop", emoji: "💻", current: 650, target: 1200 },
  { id: "2", name: "Spring Break Trip", emoji: "✈️", current: 280, target: 800 },
];

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="container px-4 py-8 md:px-6">
        {/* Welcome Section */}
        <div className="mb-8 animate-fade-in">
          <h1 className="text-2xl font-bold tracking-tight md:text-3xl">
            Welcome back, Jamie! 👋
          </h1>
          <p className="text-muted-foreground mt-1">
            Here's what's happening with your finances today.
          </p>
        </div>

        {/* Overview Cards */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-8">
          <div className="animate-fade-in stagger-1 opacity-0">
            <OverviewCard
              title="Total Balance"
              value="$2,847.50"
              icon={<Wallet className="h-5 w-5" />}
              variant="default"
            />
          </div>
          <div className="animate-fade-in stagger-2 opacity-0">
            <OverviewCard
              title="Monthly Income"
              value="$1,250.00"
              icon={<TrendingUp className="h-5 w-5" />}
              trend={{ value: 12, isPositive: true }}
              variant="income"
            />
          </div>
          <div className="animate-fade-in stagger-3 opacity-0">
            <OverviewCard
              title="Monthly Expenses"
              value="$655.00"
              icon={<TrendingDown className="h-5 w-5" />}
              trend={{ value: 5, isPositive: false }}
              variant="expense"
            />
          </div>
          <div className="animate-fade-in stagger-4 opacity-0">
            <OverviewCard
              title="Total Savings"
              value="$930.00"
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
                <Button variant="ghost" size="sm" className="text-xs">
                  View All <ChevronRight className="h-4 w-4 ml-1" />
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
                <QuickActions />
              </CardContent>
            </Card>

            {/* Savings Goals */}
            <Card className="shadow-card animate-fade-in stagger-2 opacity-0">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-lg font-semibold">
                  Savings Goals
                </CardTitle>
                <Button variant="ghost" size="sm" className="text-xs">
                  Add <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </CardHeader>
              <CardContent className="space-y-3">
                {savingsGoals.map((goal) => (
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
                  {transactions.map((transaction) => (
                    <TransactionItem
                      key={transaction.id}
                      transaction={transaction}
                    />
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Index;
