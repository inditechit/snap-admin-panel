import { ReactNode, useState, useEffect } from "react";
import { AdminSidebar } from "./AdminSidebar";
import { AdminHeader } from "./AdminHeader";
import { cn } from "@/lib/utils";

interface AdminLayoutProps {
  children: ReactNode;
  title: string;
  subtitle?: string;
}

export function AdminLayout({ children, title, subtitle }: AdminLayoutProps) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  // Listen for sidebar collapse state changes
  useEffect(() => {
    const checkSidebarWidth = () => {
      const sidebar = document.querySelector("aside");
      if (sidebar) {
        setSidebarCollapsed(sidebar.classList.contains("w-16"));
      }
    };

    // Initial check
    checkSidebarWidth();

    // Create observer for sidebar changes
    const observer = new MutationObserver(checkSidebarWidth);
    const sidebar = document.querySelector("aside");
    if (sidebar) {
      observer.observe(sidebar, { attributes: true, attributeFilter: ["class"] });
    }

    return () => observer.disconnect();
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <AdminSidebar />
      <main
        className={cn(
          "min-h-screen transition-all duration-300",
          // Default to 0 margin on mobile, apply 16 or 64 on medium screens and up
          "ml-0", 
          sidebarCollapsed ? "md:ml-16" : "md:ml-64"
        )}
      >
        <AdminHeader title={title} subtitle={subtitle} />
        
        {/* Added a bit of top padding on mobile so content doesn't overlap 
            with the floating hamburger menu button from AdminSidebar */}
        <div className="p-4 pt-16 md:p-6 md:pt-6">
          {children}
        </div>
      </main>
    </div>
  );
}