import { Bell, Search, PanelLeft, LogOut, User, Settings, TrendingUp, TrendingDown, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { useAuth } from "@/contexts/AuthContext";
import { useProfile } from "@/hooks/useProfile";
import { useNavigate } from "react-router-dom";
import { useTransactions } from "@/hooks/useTransactions";
import { useCurrency } from "@/hooks/useCurrency";
import { formatDistanceToNow } from "date-fns";
import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";

interface HeaderProps {
  searchQuery?: string;
  onSearchChange?: (query: string) => void;
}

interface RealtimeNotification {
  id: string;
  type: "income" | "expense";
  title: string;
  description: string;
  amount: number;
  category: string;
  time: string;
  isRead: boolean;
  isNew?: boolean;
}

export function Header({ searchQuery = "", onSearchChange }: HeaderProps) {
  const { signOut, user } = useAuth();
  const { profile } = useProfile();
  const { transactions } = useTransactions();
  const { formatAmount } = useCurrency();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  // Track read notification IDs in localStorage
  const [readNotificationIds, setReadNotificationIds] = useState<Set<string>>(() => {
    const stored = localStorage.getItem(`readNotifications_${user?.id}`);
    return stored ? new Set(JSON.parse(stored)) : new Set();
  });

  // Track new realtime notifications that haven't been fetched yet
  const [realtimeNotifications, setRealtimeNotifications] = useState<RealtimeNotification[]>([]);

  // Persist read notifications to localStorage
  useEffect(() => {
    if (user?.id) {
      localStorage.setItem(`readNotifications_${user.id}`, JSON.stringify([...readNotificationIds]));
    }
  }, [readNotificationIds, user?.id]);

  // Subscribe to realtime transaction inserts
  useEffect(() => {
    if (!user?.id) return;

    const channel = supabase
      .channel('transactions-realtime')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'transactions',
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          const newTransaction = payload.new as {
            id: string;
            type: string;
            description: string;
            amount: number;
            category: string;
            date: string;
          };

          // Show toast notification
          toast({
            title: newTransaction.type === 'income' ? '💰 Income received!' : '💸 Expense recorded',
            description: `${newTransaction.description} - ${newTransaction.type === 'income' ? '+' : '-'}$${Number(newTransaction.amount).toFixed(2)}`,
          });

          // Add to realtime notifications (will be merged when transactions refetch)
          const notification: RealtimeNotification = {
            id: newTransaction.id,
            type: newTransaction.type as "income" | "expense",
            title: newTransaction.type === 'income' ? 'Income received' : 'Expense recorded',
            description: newTransaction.description,
            amount: Number(newTransaction.amount),
            category: newTransaction.category,
            time: 'Just now',
            isRead: false,
            isNew: true,
          };

          setRealtimeNotifications(prev => [notification, ...prev.filter(n => n.id !== newTransaction.id)]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user?.id, toast]);

  // Clear realtime notifications when they appear in fetched transactions
  useEffect(() => {
    if (transactions.length > 0) {
      const transactionIds = new Set(transactions.map(t => t.id));
      setRealtimeNotifications(prev => prev.filter(n => !transactionIds.has(n.id)));
    }
  }, [transactions]);

  const getInitials = () => {
    const firstInitial = profile?.firstName?.charAt(0)?.toUpperCase() || "";
    const lastInitial = profile?.lastName?.charAt(0)?.toUpperCase() || "";
    if (firstInitial || lastInitial) {
      return `${firstInitial}${lastInitial}`;
    }
    return user?.email?.charAt(0)?.toUpperCase() || "U";
  };

  // Merge realtime notifications with fetched transactions
  const fetchedNotifications = transactions?.slice(0, 5).map((t) => ({
    id: t.id,
    type: t.type as "income" | "expense",
    title: t.type === "income" ? "Income received" : "Expense recorded",
    description: t.description,
    amount: t.amount,
    category: t.category,
    time: formatDistanceToNow(new Date(t.date), { addSuffix: true }),
    isRead: readNotificationIds.has(t.id),
    isNew: false,
  })) || [];

  // Combine realtime and fetched, remove duplicates, limit to 5
  const recentNotifications = [...realtimeNotifications, ...fetchedNotifications]
    .filter((notification, index, self) => 
      index === self.findIndex(n => n.id === notification.id)
    )
    .slice(0, 5)
    .map(n => ({ ...n, isRead: readNotificationIds.has(n.id) ? true : n.isRead }));

  const unreadCount = recentNotifications.filter(n => !n.isRead).length;

  const markAsRead = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setReadNotificationIds(prev => new Set([...prev, id]));
  };

  const markAllAsRead = () => {
    const allIds = recentNotifications.map(n => n.id);
    setReadNotificationIds(prev => new Set([...prev, ...allIds]));
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-card/80 backdrop-blur-md">
      <div className="flex h-16 items-center justify-between px-4 md:px-6">
        <div className="flex items-center gap-4">
          <SidebarTrigger className="h-9 w-9 flex items-center justify-center hover:bg-accent rounded-md">
            <PanelLeft className="h-5 w-5" />
            <span className="sr-only">Toggle Sidebar</span>
          </SidebarTrigger>
        </div>

        <div className="hidden md:flex items-center gap-2 flex-1 max-w-md mx-8" data-tour="search">
          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search transactions..."
              className="pl-9 bg-muted/50 border-0 focus-visible:ring-1"
              value={searchQuery}
              onChange={(e) => onSearchChange?.(e.target.value)}
            />
          </div>
        </div>

        <div className="flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="relative" data-tour="notifications">
                <Bell className="h-5 w-5" />
                {unreadCount > 0 && (
                  <Badge 
                    variant="destructive" 
                    className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-[10px] font-bold"
                  >
                    {unreadCount > 9 ? "9+" : unreadCount}
                  </Badge>
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-80 bg-popover" align="end" forceMount>
              <DropdownMenuLabel className="font-normal">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium">Notifications</p>
                  {unreadCount > 0 && (
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="h-auto py-1 px-2 text-xs text-primary hover:text-primary"
                      onClick={markAllAsRead}
                    >
                      Mark all as read
                    </Button>
                  )}
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <ScrollArea className="h-[280px]">
                {recentNotifications.length > 0 ? (
                  recentNotifications.map((notification) => (
                    <DropdownMenuItem
                      key={notification.id}
                      className={`flex items-start gap-3 p-3 cursor-pointer ${
                        !notification.isRead ? "bg-accent/50" : ""
                      }`}
                      onClick={() => navigate("/transactions")}
                    >
                      <div className={`mt-0.5 p-1.5 rounded-full ${
                        notification.type === "income" 
                          ? "bg-income/10 text-income" 
                          : "bg-expense/10 text-expense"
                      }`}>
                        {notification.type === "income" ? (
                          <TrendingUp className="h-3.5 w-3.5" />
                        ) : (
                          <TrendingDown className="h-3.5 w-3.5" />
                        )}
                      </div>
                      <div className="flex-1 space-y-1">
                        <div className="flex items-center justify-between">
                          <p className={`text-sm leading-none ${!notification.isRead ? "font-semibold" : "font-medium"}`}>
                            {notification.title}
                          </p>
                          {!notification.isRead && (
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-5 w-5 hover:bg-primary/10"
                              onClick={(e) => markAsRead(notification.id, e)}
                            >
                              <Check className="h-3 w-3 text-primary" />
                            </Button>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground line-clamp-1">
                          {notification.description}
                        </p>
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-muted-foreground">
                            {notification.time}
                          </span>
                          <span className={`text-xs font-medium ${
                            notification.type === "income" 
                              ? "text-income" 
                              : "text-expense"
                          }`}>
                            {notification.type === "income" ? "+" : "-"}
                            {formatAmount(notification.amount)}
                          </span>
                        </div>
                      </div>
                    </DropdownMenuItem>
                  ))
                ) : (
                  <div className="p-6 text-center">
                    <Bell className="h-8 w-8 mx-auto text-muted-foreground/50 mb-2" />
                    <p className="text-sm text-muted-foreground">No recent activity</p>
                  </div>
                )}
              </ScrollArea>
              {recentNotifications.length > 0 && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem 
                    className="text-center justify-center text-sm text-primary cursor-pointer"
                    onClick={() => navigate("/transactions")}
                  >
                    View all transactions
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-9 w-9 rounded-full" data-tour="profile">
                <Avatar className="h-9 w-9 border-2 border-primary/20">
                  <AvatarFallback className="bg-primary/10 text-primary font-medium text-xs">
                    {getInitials()}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56 bg-popover" align="end" forceMount>
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">My Account</p>
                  <p className="text-xs leading-none text-muted-foreground">
                    {user?.email}
                  </p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => navigate("/settings")}>
                <User className="mr-2 h-4 w-4" />
                <span>Profile</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => navigate("/settings")}>
                <Settings className="mr-2 h-4 w-4" />
                <span>Settings</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={signOut} className="text-destructive focus:text-destructive">
                <LogOut className="mr-2 h-4 w-4" />
                <span>Log out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
