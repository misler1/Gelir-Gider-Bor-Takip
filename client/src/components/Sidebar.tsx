import { Link, useLocation } from "wouter";
import { 
  LayoutDashboard, 
  Wallet, 
  CreditCard, 
  Landmark,
  PiggyBank
} from "lucide-react";
import { cn } from "@/lib/utils";

const items = [
  { href: "/income", icon: Wallet, label: "Income" },
  { href: "/expenses", icon: CreditCard, label: "Expenses" },
  { href: "/banks", icon: Landmark, label: "Banks & Debts" },
];

export function Sidebar() {
  const [location] = useLocation();

  return (
    <aside className="w-64 min-h-screen bg-card border-r border-border hidden md:flex flex-col">
      <div className="p-8 pb-4">
        <div className="flex items-center gap-3 text-primary">
          <PiggyBank className="w-8 h-8" />
          <h1 className="text-xl font-bold font-display tracking-tight text-foreground">
            FinTracker
          </h1>
        </div>
      </div>

      <nav className="flex-1 px-4 py-4 space-y-2">
        {items.map((item) => {
          const isActive = location.startsWith(item.href);
          return (
            <Link key={item.href} href={item.href}>
              <div
                className={cn(
                  "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 cursor-pointer group",
                  isActive
                    ? "bg-primary text-primary-foreground shadow-md shadow-primary/20"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
              >
                <item.icon
                  className={cn(
                    "w-5 h-5 transition-transform",
                    isActive ? "scale-105" : "group-hover:scale-110"
                  )}
                />
                <span className="font-medium text-sm">{item.label}</span>
              </div>
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-border">
        <div className="px-4 py-3 bg-muted/50 rounded-xl text-xs text-muted-foreground">
          <p className="font-semibold text-foreground">Pro Plan</p>
          <p>Financial goals active</p>
        </div>
      </div>
    </aside>
  );
}
