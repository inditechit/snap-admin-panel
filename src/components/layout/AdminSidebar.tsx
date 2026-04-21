import { useEffect, useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import {
  Users,
  Image,
  FileText,
  Camera,
  ChevronLeft,
  ChevronRight,
  LogOut,
  ChartBar,
  Menu, 
  X     
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
  const [isMobile, setIsMobile] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();
  const { user, logout } = useAuth();
  const isContentUser = user?.username?.toLowerCase() === "content";

  // Filter items based on role
  const filteredNavItems = navItems.filter((item) => {
    if (isContentUser) {
      // Content user only sees Gallery and Blogs
      return item.path === "/blogs" || item.path === "/gallery";
    }
    // Admin sees everything
    return true; 
  });

  // Handle screen size detection
  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth < 768);
      if (window.innerWidth >= 768) {
        setMobileOpen(false);
      }
    };

    checkScreenSize();
    window.addEventListener("resize", checkScreenSize);
    return () => window.removeEventListener("resize", checkScreenSize);
  }, []);

  // Automatically close the sidebar on mobile when a route changes
  useEffect(() => {
    if (isMobile) {
      setMobileOpen(false);
    }
  }, [location.pathname, isMobile]);

  return (
    <>
      {/* Mobile Overlay Background */}
      {isMobile && mobileOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/50 transition-opacity"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Floating Hamburger Button for Mobile */}
      {isMobile && !mobileOpen && (
        <Button
          variant="outline"
          size="icon"
          className="fixed left-4 top-4 z-50 bg-background md:hidden"
          onClick={() => setMobileOpen(true)}
        >
          <Menu className="h-5 w-5" />
        </Button>
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed left-0 top-0 z-40 flex h-screen flex-col bg-sidebar border-r border-sidebar-border transition-transform duration-300 md:translate-x-0",
          !isMobile && (collapsed ? "w-16" : "w-64"),
          isMobile ? "w-64" : "",
          isMobile && !mobileOpen ? "-translate-x-full" : "translate-x-0"
        )}
      >
        {/* Logo */}
        <div className="flex h-16 shrink-0 items-center justify-between border-b border-sidebar-border px-4">
          <div className={cn("flex items-center gap-2", !isMobile && collapsed && "justify-center w-full")}>
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-sidebar-primary">
              <Camera className="h-5 w-5 text-sidebar-primary-foreground" />
            </div>
            {(!collapsed || isMobile) && (
              <span className="text-lg font-semibold text-sidebar-foreground">
                Inditech IT
              </span>
            )}
          </div>

          {/* Mobile Close 'X' Button */}
          {isMobile && (
            <Button variant="ghost" size="icon" onClick={() => setMobileOpen(false)}>
              <X className="h-5 w-5 text-sidebar-foreground" />
            </Button>
          )}
        </div>

        {/* Navigation - using filteredNavItems here */}
        <nav className="flex flex-1 flex-col gap-1 p-3">
          {filteredNavItems.map((item) => {
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
                  !isMobile && collapsed && "justify-center px-2"
                )}
              >
                <item.icon className="h-5 w-5 flex-shrink-0" />
                {(!collapsed || isMobile) && <span>{item.title}</span>}
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
              !isMobile && collapsed && "justify-center px-2"
            )}
          >
            <LogOut className="h-5 w-5 flex-shrink-0" />
            {(!collapsed || isMobile) && <span>Logout</span>}
          </button>
        </div>

        {/* Desktop Collapse Button - Hidden on Mobile */}
        {!isMobile && (
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
        )}
      </aside>
    </>
  );
}