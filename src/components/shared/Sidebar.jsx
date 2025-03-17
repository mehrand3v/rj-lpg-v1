// components/shared/Sidebar.jsx
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import { Menu, X, ChevronRight } from "lucide-react";
import { NavLink } from "react-router-dom";

const routes = [
  {
    name: "Dashboard",
    path: "/",
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="h-5 w-5"
      >
        <rect width="7" height="9" x="3" y="3" rx="1" />
        <rect width="7" height="5" x="14" y="3" rx="1" />
        <rect width="7" height="9" x="14" y="12" rx="1" />
        <rect width="7" height="5" x="3" y="16" rx="1" />
      </svg>
    ),
  },
  {
    name: "Customers",
    path: "/customers",
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="h-5 w-5"
      >
        <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
      </svg>
    ),
  },
  {
    name: "Sales",
    path: "/sales",
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="h-5 w-5"
      >
        <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
      </svg>
    ),
  },
  {
    name: "Payments",
    path: "/payment",
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="h-5 w-5"
      >
        <rect width="20" height="14" x="2" y="5" rx="2" />
        <line x1="2" x2="22" y1="10" y2="10" />
        <line x1="6" x2="6" y1="15" y2="15" />
        <line x1="10" x2="10" y1="15" y2="15" />
      </svg>
    )
  },
];

// Group routes by category
const routeCategories = {
  "Main Navigation": [routes[0]], // Dashboard
  "Customer Management": [routes[1]], // Customers
  Financial: [routes[2], routes[3]], // Sales and Payments
};

const SidebarItem = ({
  icon,
  name,
  path,
  badge,
  isMobile = false,
  onItemClick,
}) => {
  const handleClick = () => {
    if (onItemClick && typeof onItemClick === "function") {
      setTimeout(() => {
        onItemClick();
      }, 100);
    }
  };

  return (
    <NavLink
      to={path}
      className={({ isActive }) =>
        cn(
          "relative flex items-center justify-between gap-3 rounded-lg px-3 py-2 text-sm transition-all duration-200 ease-in-out",
          "hover:bg-accent/50 hover:text-accent-foreground",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
          isActive
            ? "bg-accent text-accent-foreground font-medium before:absolute before:left-0 before:top-1/2 before:-translate-y-1/2 before:w-1 before:h-5 before:bg-primary before:rounded-r-md"
            : "text-muted-foreground",
          isMobile && "w-full"
        )
      }
      onClick={handleClick}
    >
      <div className="flex items-center gap-3">
        <div className="flex items-center justify-center">{icon}</div>
        <span>{name}</span>
      </div>

      {badge && (
        <span className="bg-primary/10 text-primary text-xs font-medium px-2 py-0.5 rounded-full">
          {badge}
        </span>
      )}
    </NavLink>
  );
};

export const Sidebar = () => {
  const [open, setOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);

  return (
    <>
      {/* Mobile Sidebar */}
      <div className="lg:hidden fixed z-40 left-0 top-0 p-4">
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild>
            <Button
              variant="outline"
              size="icon"
              className="h-10 w-10 text-foreground hover:bg-accent/50 transition-colors"
            >
              <Menu className="h-5 w-5" />
              <span className="sr-only">Toggle Menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="p-0 w-72 shadow-lg">
            <div className="flex h-full flex-col bg-background">
              <div className="flex items-center justify-between px-6 py-4 border-b border-border">
                <div>
                  <SheetTitle className="text-lg font-semibold tracking-tight text-foreground">
                    MyApp
                  </SheetTitle>
                  <SheetDescription className="text-sm text-muted-foreground">
                    Navigation
                  </SheetDescription>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setOpen(false)}
                  className="h-8 w-8 rounded-full"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
              <ScrollArea className="flex-1 p-4">
                <div className="flex flex-col gap-6">
                  {Object.entries(routeCategories).map(
                    ([category, categoryRoutes]) => (
                      <div key={category} className="space-y-2">
                        <h3 className="text-xs font-semibold text-muted-foreground tracking-wider uppercase px-3">
                          {category}
                        </h3>
                        <div className="space-y-1">
                          {categoryRoutes.map((route) => (
                            <SidebarItem
                              key={route.path}
                              {...route}
                              isMobile={true}
                              onItemClick={() => setOpen(false)}
                            />
                          ))}
                        </div>
                      </div>
                    )
                  )}
                </div>
              </ScrollArea>
              <div className="p-4 border-t border-border">
                <Button
                  variant="outline"
                  className="w-full justify-start gap-2"
                  size="sm"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="h-4 w-4"
                  >
                    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                    <circle cx="9" cy="7" r="4" />
                    <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
                    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                  </svg>
                  Account Settings
                </Button>
              </div>
            </div>
          </SheetContent>
        </Sheet>
      </div>

      {/* Desktop Sidebar */}
      <aside
        className={cn(
          "hidden lg:flex h-screen flex-col border-r border-border bg-background transition-all duration-300 ease-in-out",
          collapsed ? "w-20" : "w-64"
        )}
      >
        <div
          className={cn(
            "px-6 py-4 border-b border-border flex items-center",
            collapsed ? "justify-center" : "justify-between"
          )}
        >
          {!collapsed && (
            <>
              <div>
                <h2 className="text-lg font-semibold tracking-tight text-foreground">
                  MyApp
                </h2>
                <p className="text-sm text-muted-foreground">Navigation</p>
              </div>
            </>
          )}
          {collapsed && (
            <div className="h-8 w-8 flex items-center justify-center">
              <span className="text-xl font-bold text-primary">M</span>
            </div>
          )}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setCollapsed(!collapsed)}
            className="h-8 w-8 rounded-full"
          >
            <ChevronRight
              className={cn(
                "h-4 w-4 transition-transform duration-200",
                collapsed ? "rotate-180" : ""
              )}
            />
          </Button>
        </div>
        <ScrollArea
          className={cn("flex-1", collapsed ? "px-2 py-2" : "px-3 py-4")}
        >
          <div className="flex flex-col gap-6">
            {collapsed ? (
              // Collapsed view - just icons
              <div className="flex flex-col items-center gap-2 py-2">
                {routes.map((route) => (
                  <NavLink
                    key={route.path}
                    to={route.path}
                    className={({ isActive }) =>
                      cn(
                        "relative flex h-10 w-10 items-center justify-center rounded-lg",
                        "hover:bg-accent/50 hover:text-accent-foreground",
                        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                        isActive
                          ? "bg-accent text-accent-foreground"
                          : "text-muted-foreground"
                      )
                    }
                    title={route.name}
                  >
                    {route.icon}
                    {route.badge && (
                      <span className="absolute -top-1 -right-1 bg-primary text-primary-foreground text-xs w-4 h-4 flex items-center justify-center rounded-full" />
                    )}
                  </NavLink>
                ))}
              </div>
            ) : (
              // Expanded view - categories and full items
              Object.entries(routeCategories).map(
                ([category, categoryRoutes]) => (
                  <div key={category} className="space-y-2">
                    <h3 className="text-xs font-semibold text-muted-foreground tracking-wider uppercase px-3">
                      {category}
                    </h3>
                    <div className="space-y-1">
                      {categoryRoutes.map((route) => (
                        <SidebarItem key={route.path} {...route} />
                      ))}
                    </div>
                  </div>
                )
              )
            )}
          </div>
        </ScrollArea>
        {!collapsed && (
          <div className="p-4 border-t border-border">
            <Button
              variant="outline"
              className="w-full justify-start gap-2"
              size="sm"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-4 w-4"
              >
                <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                <circle cx="9" cy="7" r="4" />
                <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
                <path d="M16 3.13a4 4 0 0 1 0 7.75" />
              </svg>
              Account Settings
            </Button>
          </div>
        )}
      </aside>
    </>
  );
};
