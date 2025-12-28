import { useState, useMemo } from "react";
import { format, isWithinInterval } from "date-fns";
import {
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Filter,
  Calendar,
  Search,
  Plus,
  Loader2,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { Header } from "@/components/dashboard/Header";
import { AppSidebar } from "@/components/dashboard/AppSidebar";
import { AddTransactionForm } from "@/components/forms/AddTransactionForm";
import { cn } from "@/lib/utils";
import { useTransactions } from "@/hooks/useTransactions";

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

const categories = [
  "All",
  "Food",
  "Transport",
  "Shopping",
  "Entertainment",
  "Bills",
  "Education",
  "Health",
  "Income",
  "Other",
];

const ITEMS_PER_PAGE = 8;

type SortDirection = "asc" | "desc" | null;

const Transactions = () => {
  const [activeSection, setActiveSection] = useState("transactions");
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [dateSortDirection, setDateSortDirection] = useState<SortDirection>("desc");
  const [currentPage, setCurrentPage] = useState(1);
  const [dateRange, setDateRange] = useState<{
    from: Date | undefined;
    to: Date | undefined;
  }>({ from: undefined, to: undefined });

  // Form dialog states
  const [incomeFormOpen, setIncomeFormOpen] = useState(false);
  const [expenseFormOpen, setExpenseFormOpen] = useState(false);

  const { transactions, isLoading, addTransaction } = useTransactions();

  const handleQuickAction = (action: string) => {
    if (action === "add-income") setIncomeFormOpen(true);
    if (action === "add-expense") setExpenseFormOpen(true);
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

  // Filter and sort transactions
  const filteredAndSortedTransactions = useMemo(() => {
    let result = [...transactions];

    // Apply search filter
    if (searchQuery) {
      result = result.filter(
        (t) =>
          t.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
          t.category.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Apply category filter
    if (categoryFilter !== "All") {
      result = result.filter((t) => t.category === categoryFilter);
    }

    // Apply date range filter
    if (dateRange.from || dateRange.to) {
      result = result.filter((t) => {
        const txDate = new Date(t.date);
        if (dateRange.from && dateRange.to) {
          return isWithinInterval(txDate, { start: dateRange.from, end: dateRange.to });
        }
        if (dateRange.from) {
          return txDate >= dateRange.from;
        }
        if (dateRange.to) {
          return txDate <= dateRange.to;
        }
        return true;
      });
    }

    // Apply date sorting
    if (dateSortDirection) {
      result.sort((a, b) => {
        const dateA = new Date(a.date).getTime();
        const dateB = new Date(b.date).getTime();
        return dateSortDirection === "asc" ? dateA - dateB : dateB - dateA;
      });
    }

    return result;
  }, [transactions, searchQuery, categoryFilter, dateRange, dateSortDirection]);

  // Pagination
  const totalPages = Math.ceil(filteredAndSortedTransactions.length / ITEMS_PER_PAGE);
  const paginatedTransactions = filteredAndSortedTransactions.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const toggleDateSort = () => {
    setDateSortDirection((prev) => {
      if (prev === null) return "desc";
      if (prev === "desc") return "asc";
      return "desc";
    });
  };

  const clearFilters = () => {
    setSearchQuery("");
    setCategoryFilter("All");
    setDateRange({ from: undefined, to: undefined });
    setCurrentPage(1);
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
            {/* Page Header */}
            <div className="mb-8 animate-fade-in">
              <h1 className="text-2xl font-bold tracking-tight md:text-3xl">
                Transactions 💳
              </h1>
              <p className="text-muted-foreground mt-1">
                View and manage all your transactions in one place.
              </p>
            </div>

            {/* Filters Card */}
            <Card className="shadow-card mb-6 animate-fade-in">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg font-semibold flex items-center gap-2">
                  <Filter className="h-5 w-5" />
                  Filters
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-4 items-end">
                  {/* Search */}
                  <div className="flex-1 min-w-[200px]">
                    <label className="text-sm font-medium mb-2 block">
                      Search
                    </label>
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Search transactions..."
                        value={searchQuery}
                        onChange={(e) => {
                          setSearchQuery(e.target.value);
                          setCurrentPage(1);
                        }}
                        className="pl-9"
                      />
                    </div>
                  </div>

                  {/* Category Filter */}
                  <div className="min-w-[150px]">
                    <label className="text-sm font-medium mb-2 block">
                      Category
                    </label>
                    <Select
                      value={categoryFilter}
                      onValueChange={(value) => {
                        setCategoryFilter(value);
                        setCurrentPage(1);
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map((cat) => (
                          <SelectItem key={cat} value={cat}>
                            {cat !== "All" && categoryIcons[cat]} {cat}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Date Range */}
                  <div className="min-w-[200px]">
                    <label className="text-sm font-medium mb-2 block">
                      Date Range
                    </label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full justify-start text-left font-normal",
                            !dateRange.from && "text-muted-foreground"
                          )}
                        >
                          <Calendar className="mr-2 h-4 w-4" />
                          {dateRange.from ? (
                            dateRange.to ? (
                              <>
                                {format(dateRange.from, "LLL dd")} -{" "}
                                {format(dateRange.to, "LLL dd")}
                              </>
                            ) : (
                              format(dateRange.from, "LLL dd, y")
                            )
                          ) : (
                            <span>Pick a date range</span>
                          )}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <CalendarComponent
                          initialFocus
                          mode="range"
                          defaultMonth={dateRange.from}
                          selected={dateRange}
                          onSelect={(range) => {
                            setDateRange({
                              from: range?.from,
                              to: range?.to,
                            });
                            setCurrentPage(1);
                          }}
                          numberOfMonths={2}
                          className="p-3 pointer-events-auto"
                        />
                      </PopoverContent>
                    </Popover>
                  </div>

                  {/* Clear Filters */}
                  <Button variant="outline" onClick={clearFilters}>
                    Clear Filters
                  </Button>

                  {/* Add Transaction */}
                  <Button onClick={() => setExpenseFormOpen(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Transaction
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Transactions Table */}
            <Card className="shadow-card animate-fade-in">
              <CardContent className="p-0">
                {isLoading ? (
                  <div className="flex items-center justify-center py-20">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-[300px]">Description</TableHead>
                        <TableHead>Category</TableHead>
                        <TableHead>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="-ml-3 h-8 data-[state=open]:bg-accent"
                            onClick={toggleDateSort}
                          >
                            Date
                            {dateSortDirection === "asc" ? (
                              <ArrowUp className="ml-2 h-4 w-4" />
                            ) : dateSortDirection === "desc" ? (
                              <ArrowDown className="ml-2 h-4 w-4" />
                            ) : (
                              <ArrowUpDown className="ml-2 h-4 w-4" />
                            )}
                          </Button>
                        </TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead className="text-right">Amount</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {paginatedTransactions.length > 0 ? (
                        paginatedTransactions.map((transaction) => (
                          <TableRow key={transaction.id}>
                            <TableCell className="font-medium">
                              <div className="flex items-center gap-3">
                                <span className="text-lg">
                                  {categoryIcons[transaction.category] ||
                                    categoryIcons.Other}
                                </span>
                                {transaction.description}
                              </div>
                            </TableCell>
                            <TableCell>
                              <span className="inline-flex items-center rounded-full bg-muted px-2.5 py-0.5 text-xs font-medium">
                                {transaction.category}
                              </span>
                            </TableCell>
                            <TableCell>{format(new Date(transaction.date), "MMM dd, yyyy")}</TableCell>
                            <TableCell>
                              <span
                                className={cn(
                                  "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
                                  transaction.type === "income"
                                    ? "bg-income/10 text-income"
                                    : "bg-expense/10 text-expense"
                                )}
                              >
                                {transaction.type === "income"
                                  ? "Income"
                                  : "Expense"}
                              </span>
                            </TableCell>
                            <TableCell
                              className={cn(
                                "text-right font-medium",
                                transaction.type === "income"
                                  ? "text-income"
                                  : "text-expense"
                              )}
                            >
                              {transaction.type === "income" ? "+" : "-"}$
                              {transaction.amount.toFixed(2)}
                            </TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell
                            colSpan={5}
                            className="h-24 text-center text-muted-foreground"
                          >
                            No transactions found.
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mt-6">
                <Pagination>
                  <PaginationContent>
                    <PaginationItem>
                      <PaginationPrevious
                        onClick={() =>
                          setCurrentPage((prev) => Math.max(prev - 1, 1))
                        }
                        className={cn(
                          currentPage === 1 &&
                            "pointer-events-none opacity-50"
                        )}
                      />
                    </PaginationItem>
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                      (page) => (
                        <PaginationItem key={page}>
                          <PaginationLink
                            onClick={() => setCurrentPage(page)}
                            isActive={currentPage === page}
                          >
                            {page}
                          </PaginationLink>
                        </PaginationItem>
                      )
                    )}
                    <PaginationItem>
                      <PaginationNext
                        onClick={() =>
                          setCurrentPage((prev) =>
                            Math.min(prev + 1, totalPages)
                          )
                        }
                        className={cn(
                          currentPage === totalPages &&
                            "pointer-events-none opacity-50"
                        )}
                      />
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>
              </div>
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
    </SidebarProvider>
  );
};

export default Transactions;
