import { useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import {
  Users,
  Image,
  FileText,
  Camera,
  ChevronLeft,
  ChevronRight,
  LogOut,
  ChartBar, // 1. Import LogOut icon
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/AuthContext";

const navItems = [
  { title: "Dashboard", icon: ChartBar, path: "/" },
  { title: "Leads", icon: Users, path: "/leads" },
  { title: "Gallery", icon: Image, path: "/gallery" },
  { title: "Blogs", icon: FileText, path: "/blogs" },
];

export function AdminSidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();
  const { logout } = useAuth(); // 3. Get logout function

  return (
    <aside
      className={cn(
        // Added 'flex flex-col' to enable pushing logout to bottom
        "fixed left-0 top-0 z-40 flex h-screen flex-col bg-sidebar transition-all duration-300",
        collapsed ? "w-16" : "w-64"
      )}
    >
      {/* Logo */}
      <div className="flex h-16 shrink-0 items-center justify-between border-b border-sidebar-border px-4">
        <div className={cn("flex items-center gap-2", collapsed && "justify-center w-full")}>
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-sidebar-primary">
            <Camera className="h-5 w-5 text-sidebar-primary-foreground" />
          </div>
          {!collapsed && (
            <span className="text-lg font-semibold text-sidebar-foreground">
              Inditech IT
            </span>
          )}
        </div>
      </div>

      {/* Navigation - Added 'flex-1' to take up available space */}
      <nav className="flex flex-1 flex-col gap-1 p-3">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                isActive
                  ? "bg-sidebar-accent text-sidebar-primary"
                  : "text-sidebar-muted",
                collapsed && "justify-center px-2"
              )}
            >
              <item.icon className="h-5 w-5 flex-shrink-0" />
              {!collapsed && <span>{item.title}</span>}
            </NavLink>
          );
        })}
      </nav>

      {/* Logout Button Section */}
      <div className="border-t border-sidebar-border p-3">
        <button
          onClick={logout}
          className={cn(
            "flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-red-500 transition-colors hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/50",
            collapsed && "justify-center px-2"
          )}
        >
          <LogOut className="h-5 w-5 flex-shrink-0" />
          {!collapsed && <span>Logout</span>}
        </button>
      </div>

      {/* Collapse Button */}
      <Button
        variant="ghost"
        size="icon"
        className="absolute -right-3 top-20 h-6 w-6 rounded-full border bg-card shadow-card hover:bg-muted"
        onClick={() => setCollapsed(!collapsed)}
      >
        {collapsed ? (
          <ChevronRight className="h-3 w-3" />
        ) : (
          <ChevronLeft className="h-3 w-3" />
        )}
      </Button>
    </aside>
  );
}