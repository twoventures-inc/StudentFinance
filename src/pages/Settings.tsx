import { useState } from "react";
import { User, DollarSign, Bell, Save, LogOut, Loader2 } from "lucide-react";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/dashboard/AppSidebar";
import { Header } from "@/components/dashboard/Header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { AddTransactionForm } from "@/components/forms/AddTransactionForm";
import { useAuth } from "@/contexts/AuthContext";
import { useProfile } from "@/hooks/useProfile";
import { useTransactions } from "@/hooks/useTransactions";

const currencies = [
  { code: "USD", symbol: "$", name: "US Dollar" },
  { code: "EUR", symbol: "€", name: "Euro" },
  { code: "GBP", symbol: "£", name: "British Pound" },
  { code: "JPY", symbol: "¥", name: "Japanese Yen" },
  { code: "CAD", symbol: "C$", name: "Canadian Dollar" },
  { code: "AUD", symbol: "A$", name: "Australian Dollar" },
  { code: "INR", symbol: "₹", name: "Indian Rupee" },
];

export default function Settings() {
  const [activeSection, setActiveSection] = useState("settings");
  const [searchQuery, setSearchQuery] = useState("");
  const [showAddTransaction, setShowAddTransaction] = useState(false);
  const [transactionType, setTransactionType] = useState<"income" | "expense">("expense");

  const { user, signOut } = useAuth();
  const { profile, isLoading, updateProfile } = useProfile();
  const { addTransaction } = useTransactions();

  // Local form state
  const [firstName, setFirstName] = useState(profile?.firstName || "");
  const [lastName, setLastName] = useState(profile?.lastName || "");
  const [currency, setCurrency] = useState(profile?.currency || "USD");
  const [dateFormat, setDateFormat] = useState(profile?.dateFormat || "MM/DD/YYYY");
  const [notifications, setNotifications] = useState({
    budgetAlerts: profile?.budgetAlerts ?? true,
    goalReminders: profile?.goalReminders ?? true,
    weeklyReport: profile?.weeklyReport ?? false,
    monthlyReport: profile?.monthlyReport ?? true,
    overspendingWarnings: profile?.overspendingWarnings ?? true,
  });

  // Update local state when profile loads
  useState(() => {
    if (profile) {
      setFirstName(profile.firstName || "");
      setLastName(profile.lastName || "");
      setCurrency(profile.currency);
      setDateFormat(profile.dateFormat);
      setNotifications({
        budgetAlerts: profile.budgetAlerts,
        goalReminders: profile.goalReminders,
        weeklyReport: profile.weeklyReport,
        monthlyReport: profile.monthlyReport,
        overspendingWarnings: profile.overspendingWarnings,
      });
    }
  });

  const handleQuickAction = (action: string) => {
    if (action === "add-income") {
      setTransactionType("income");
      setShowAddTransaction(true);
    } else if (action === "add-expense") {
      setTransactionType("expense");
      setShowAddTransaction(true);
    }
  };

  const handleSaveProfile = () => {
    updateProfile.mutate({ firstName, lastName });
  };

  const handleSaveCurrency = () => {
    updateProfile.mutate({ currency, dateFormat });
  };

  const handleSaveNotifications = () => {
    updateProfile.mutate({
      budgetAlerts: notifications.budgetAlerts,
      goalReminders: notifications.goalReminders,
      weeklyReport: notifications.weeklyReport,
      monthlyReport: notifications.monthlyReport,
      overspendingWarnings: notifications.overspendingWarnings,
    });
  };

  const handleSignOut = async () => {
    await signOut();
  };

  if (isLoading) {
    return (
      <SidebarProvider>
        <div className="min-h-screen flex w-full bg-background">
          <AppSidebar
            activeSection={activeSection}
            onSectionChange={setActiveSection}
            onQuickAction={handleQuickAction}
          />
          <div className="flex-1 flex items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        </div>
      </SidebarProvider>
    );
  }

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
            <div className="max-w-3xl mx-auto space-y-6">
              {/* Page Header */}
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-3xl font-bold text-foreground">Settings</h1>
                  <p className="text-muted-foreground">
                    Manage your account preferences and notifications
                  </p>
                </div>
                <Button variant="outline" onClick={handleSignOut}>
                  <LogOut className="h-4 w-4 mr-2" />
                  Sign Out
                </Button>
              </div>

              {/* Profile Settings */}
              <Card>
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <User className="h-5 w-5 text-primary" />
                    <CardTitle>Profile</CardTitle>
                  </div>
                  <CardDescription>
                    Update your personal information
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={user?.email || ""}
                      disabled
                      className="bg-muted"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="firstName">First Name</Label>
                      <Input
                        id="firstName"
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="lastName">Last Name</Label>
                      <Input
                        id="lastName"
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                      />
                    </div>
                  </div>
                  <Button onClick={handleSaveProfile} disabled={updateProfile.isPending}>
                    {updateProfile.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
                    Save Profile
                  </Button>
                </CardContent>
              </Card>

              {/* Currency & Format Settings */}
              <Card>
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <DollarSign className="h-5 w-5 text-primary" />
                    <CardTitle>Currency & Format</CardTitle>
                  </div>
                  <CardDescription>
                    Set your preferred currency and date format
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Currency</Label>
                      <Select value={currency} onValueChange={setCurrency}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {currencies.map((curr) => (
                            <SelectItem key={curr.code} value={curr.code}>
                              <span className="flex items-center gap-2">
                                <span className="font-mono">{curr.symbol}</span>
                                {curr.name} ({curr.code})
                              </span>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Date Format</Label>
                      <Select value={dateFormat} onValueChange={setDateFormat}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="MM/DD/YYYY">MM/DD/YYYY</SelectItem>
                          <SelectItem value="DD/MM/YYYY">DD/MM/YYYY</SelectItem>
                          <SelectItem value="YYYY-MM-DD">YYYY-MM-DD</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <Button onClick={handleSaveCurrency} disabled={updateProfile.isPending}>
                    {updateProfile.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
                    Save Preferences
                  </Button>
                </CardContent>
              </Card>

              {/* Notification Settings */}
              <Card>
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <Bell className="h-5 w-5 text-primary" />
                    <CardTitle>Notifications</CardTitle>
                  </div>
                  <CardDescription>
                    Choose what alerts and reminders you want to receive
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Budget Alerts</p>
                      <p className="text-sm text-muted-foreground">
                        Get notified when you're close to exceeding a budget
                      </p>
                    </div>
                    <Switch
                      checked={notifications.budgetAlerts}
                      onCheckedChange={(checked) =>
                        setNotifications({ ...notifications, budgetAlerts: checked })
                      }
                    />
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Goal Reminders</p>
                      <p className="text-sm text-muted-foreground">
                        Receive reminders to contribute to your savings goals
                      </p>
                    </div>
                    <Switch
                      checked={notifications.goalReminders}
                      onCheckedChange={(checked) =>
                        setNotifications({ ...notifications, goalReminders: checked })
                      }
                    />
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Overspending Warnings</p>
                      <p className="text-sm text-muted-foreground">
                        Get alerts when you spend more than usual
                      </p>
                    </div>
                    <Switch
                      checked={notifications.overspendingWarnings}
                      onCheckedChange={(checked) =>
                        setNotifications({ ...notifications, overspendingWarnings: checked })
                      }
                    />
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Weekly Report</p>
                      <p className="text-sm text-muted-foreground">
                        Receive a weekly summary of your finances
                      </p>
                    </div>
                    <Switch
                      checked={notifications.weeklyReport}
                      onCheckedChange={(checked) =>
                        setNotifications({ ...notifications, weeklyReport: checked })
                      }
                    />
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Monthly Report</p>
                      <p className="text-sm text-muted-foreground">
                        Receive a monthly financial overview
                      </p>
                    </div>
                    <Switch
                      checked={notifications.monthlyReport}
                      onCheckedChange={(checked) =>
                        setNotifications({ ...notifications, monthlyReport: checked })
                      }
                    />
                  </div>
                  <Button onClick={handleSaveNotifications} className="mt-4" disabled={updateProfile.isPending}>
                    {updateProfile.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
                    Save Notifications
                  </Button>
                </CardContent>
              </Card>
            </div>
          </main>
        </div>
      </div>

      <AddTransactionForm
        open={showAddTransaction}
        onOpenChange={setShowAddTransaction}
        type={transactionType}
        onSubmit={(data) => {
          addTransaction.mutate({
            description: data.description,
            amount: parseFloat(data.amount),
            category: data.category,
            date: data.date,
            type: data.type,
          });
        }}
      />
    </SidebarProvider>
  );
}
