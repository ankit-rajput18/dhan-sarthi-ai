import { 
  LayoutDashboard, 
  Target, 
  Calculator, 
  Shield, 
  Calendar, 
  Bot,
  PiggyBank,
  User
} from "lucide-react";
import { NavLink, useLocation } from "react-router-dom";
import { getAuthUser } from '@/lib/auth';

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarTrigger,
  useSidebar,
  SidebarHeader,
  SidebarFooter,
} from "@/components/ui/sidebar";

const navigationItems = [
  { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard },
  { title: "Smart Planner", url: "/planner", icon: Target },
  { title: "Loan Analyzer", url: "/loans", icon: Calculator },
  { title: "Tax Tips", url: "/tax-tips", icon: Shield },
  { title: "Calendar", url: "/calendar", icon: Calendar },
  { title: "AI Mentor", url: "/ai-mentor", icon: Bot },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const location = useLocation();
  const currentPath = location.pathname;

  const user = getAuthUser();
  const userName = user?.name || 'User';
  const userEmail = user?.email || 'User Email';

  const isActive = (path: string) => {
    if (path === "/dashboard") {
      return currentPath === "/" || currentPath === "/dashboard";
    }
    return currentPath === path;
  };

  const getNavCls = ({ isActive }: { isActive: boolean }) =>
    isActive 
      ? "bg-primary text-primary-foreground font-medium shadow-md hover:bg-primary/90 transition-all duration-200" 
      : "hover:bg-muted/50 text-muted-foreground hover:text-foreground transition-all duration-200";

  const isCollapsed = state === "collapsed";

  return (
    <Sidebar
      className={`${isCollapsed ? "w-16" : "w-64"} bg-background`}
      collapsible="icon"
    >
      <SidebarHeader className="border-b border-border p-3 sm:p-4 bg-background">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 rounded-lg overflow-hidden flex-shrink-0">
            <img 
              src="/logo.jpg" 
              alt="Dhan-Sarthi Logo" 
              className="w-full h-full object-cover"
            />
          </div>
          {!isCollapsed && (
            <span className="mobile-title text-gradient">Dhan-Sarthi</span>
          )}
        </div>
      </SidebarHeader>

      <SidebarContent className="py-2 sm:py-4 bg-background">
        <SidebarGroup>
          <SidebarGroupLabel className={`${isCollapsed ? "sr-only" : "px-3 sm:px-4"} text-foreground`}>
            Navigation
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navigationItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink 
                      to={item.url} 
                      end 
                      className={`flex items-center px-3 sm:px-4 py-2 sm:py-3 text-sm rounded-md mx-2 transition-all duration-200 ${getNavCls({ isActive: isActive(item.url) })}`}
                      title={item.title}
                    >
                      <item.icon className={`w-5 h-5 flex-shrink-0 ${isActive(item.url) ? 'text-primary-foreground' : ''}`} />
                      {!isCollapsed && <span className="ml-3 mobile-caption">{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t border-border p-3 sm:p-4 bg-background">
        <div className="flex items-center space-x-2 sm:space-x-3">
          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
            <User className="w-4 h-4 text-primary" />
          </div>
          {!isCollapsed && (
            <div className="flex-1 min-w-0">
              <p className="mobile-caption font-medium truncate text-foreground">{userName}</p>
              <p className="text-xs text-muted-foreground truncate">{userEmail}</p>
            </div>
          )}
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}