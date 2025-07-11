
import { NavLink } from "react-router-dom";
import { Home, Package, ShoppingCart, BarChart3, Settings } from "lucide-react";
import { cn } from "@/lib/utils";
import { ThemeToggle } from "@/components/theme/ThemeToggle";

const navigationItems = [
  { icon: Home, label: "Dashboard", path: "/" },
  { icon: Package, label: "Products", path: "/products" },
  { icon: ShoppingCart, label: "Orders", path: "/orders" },
  { icon: BarChart3, label: "Analytics", path: "/analytics" },
  { icon: Settings, label: "Settings", path: "/settings" },
];

export function MobileNavigation() {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-background border-t border-border md:hidden">
      <div className="flex items-center justify-around px-2 py-2">
        {navigationItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              cn(
                "flex flex-col items-center justify-center min-w-0 flex-1 px-2 py-2 text-xs font-medium rounded-lg transition-all duration-200",
                isActive
                  ? "text-primary bg-primary-light"
                  : "text-muted-foreground hover:text-foreground hover:bg-secondary"
              )
            }
          >
            {({ isActive }) => (
              <>
                <item.icon 
                  className={cn(
                    "h-5 w-5 mb-1 transition-transform",
                    isActive && "scale-110"
                  )} 
                />
                <span className="truncate">{item.label}</span>
              </>
            )}
          </NavLink>
        ))}
        <ThemeToggle variant="mobile" />
      </div>
    </nav>
  );
}
