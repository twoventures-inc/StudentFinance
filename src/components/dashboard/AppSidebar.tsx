import { useState } from "react";
import {
  LayoutDashboard,
  ArrowUpRight,
  ArrowDownRight,
  Target,
  PieChart,
  Wallet,
  Settings,
  GraduationCap,
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarFooter,
} from "@/components/ui/sidebar";

const menuItems = [
  { title: "Dashboard", icon: LayoutDashboard, id: "dashboard" },
  { title: "Transactions", icon: Wallet, id: "transactions" },
  { title: "Budgets", icon: PieChart, id: "budgets" },
  { title: "Goals", icon: Target, id: "goals" },
];

const quickItems = [
  { title: "Add Income", icon: ArrowDownRight, id: "add-income", color: "text-income" },
  { title: "Add Expense", icon: ArrowUpRight, id: "add-expense", color: "text-expense" },
];

interface AppSidebarProps {
  activeSection: string;
  onSectionChange: (section: string) => void;
  onQuickAction: (action: string) => void;
}

export function AppSidebar({ activeSection, onSectionChange, onQuickAction }: AppSidebarProps) {
  return (
    <Sidebar className="border-r border-border/50">
      <SidebarHeader className="p-4 border-b border-border/50">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-md">
            <GraduationCap className="h-5 w-5" />
          </div>
          <div>
            <h2 className="font-semibold text-foreground">StudentFinance</h2>
            <p className="text-xs text-muted-foreground">Smart Money Manager</p>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent className="px-2">
        <SidebarGroup>
          <SidebarGroupLabel className="text-xs uppercase tracking-wider text-muted-foreground/70">
            Menu
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.id}>
                  <SidebarMenuButton
                    onClick={() => onSectionChange(item.id)}
                    isActive={activeSection === item.id}
                    className="transition-all duration-200"
                    tooltip={item.title}
                  >
                    <item.icon className="h-4 w-4" />
                    <span>{item.title}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel className="text-xs uppercase tracking-wider text-muted-foreground/70">
            Quick Actions
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {quickItems.map((item) => (
                <SidebarMenuItem key={item.id}>
                  <SidebarMenuButton
                    onClick={() => onQuickAction(item.id)}
                    className={`transition-all duration-200 hover:bg-accent/50`}
                    tooltip={item.title}
                  >
                    <item.icon className={`h-4 w-4 ${item.color}`} />
                    <span>{item.title}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t border-border/50 p-4">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton tooltip="Settings">
              <Settings className="h-4 w-4" />
              <span>Settings</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
