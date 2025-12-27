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
import { useNavigate, useLocation } from "react-router-dom";
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
  { title: "Dashboard", icon: LayoutDashboard, id: "dashboard", path: "/" },
  { title: "Transactions", icon: Wallet, id: "transactions", path: "/transactions" },
  { title: "Budgets", icon: PieChart, id: "budgets", path: "/budgets" },
  { title: "Goals", icon: Target, id: "goals", path: "/goals" },
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
  const navigate = useNavigate();
  const location = useLocation();

  const handleMenuClick = (item: typeof menuItems[0]) => {
    onSectionChange(item.id);
    navigate(item.path);
  };

  const isActive = (item: typeof menuItems[0]) => {
    if (item.path !== "/") {
      return location.pathname === item.path;
    }
    if (item.path === "/" && location.pathname === "/") {
      return activeSection === item.id;
    }
    return false;
  };

  return (
    <Sidebar collapsible="icon" className="border-r border-border/50">
      <SidebarHeader className="p-4 border-b border-border/50 group-data-[collapsible=icon]:p-2">
        <div className="flex items-center gap-3 group-data-[collapsible=icon]:justify-center">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-md group-data-[collapsible=icon]:h-8 group-data-[collapsible=icon]:w-8">
            <GraduationCap className="h-5 w-5 group-data-[collapsible=icon]:h-4 group-data-[collapsible=icon]:w-4" />
          </div>
          <div className="group-data-[collapsible=icon]:hidden">
            <h2 className="font-semibold text-foreground">StudentFinance</h2>
            <p className="text-xs text-muted-foreground">Smart Money Manager</p>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent className="px-2 group-data-[collapsible=icon]:px-1">
        <SidebarGroup>
          <SidebarGroupLabel className="text-xs uppercase tracking-wider text-muted-foreground/70">
            Menu
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.id}>
                  <SidebarMenuButton
                    onClick={() => handleMenuClick(item)}
                    isActive={isActive(item)}
                    className="transition-all duration-200 group-data-[collapsible=icon]:justify-center"
                    tooltip={item.title}
                  >
                    <item.icon className="h-4 w-4" />
                    <span className="group-data-[collapsible=icon]:hidden">{item.title}</span>
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
                    className="transition-all duration-200 hover:bg-accent/50 group-data-[collapsible=icon]:justify-center"
                    tooltip={item.title}
                  >
                    <item.icon className={`h-4 w-4 ${item.color}`} />
                    <span className="group-data-[collapsible=icon]:hidden">{item.title}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t border-border/50 p-4 group-data-[collapsible=icon]:p-2">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton 
              tooltip="Settings" 
              className="group-data-[collapsible=icon]:justify-center"
              onClick={() => navigate("/settings")}
              isActive={location.pathname === "/settings"}
            >
              <Settings className="h-4 w-4" />
              <span className="group-data-[collapsible=icon]:hidden">Settings</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
