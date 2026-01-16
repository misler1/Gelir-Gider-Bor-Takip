import { Sidebar } from "./Sidebar";
import { Menu } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useState } from "react";
import { Sidebar as MobileSidebarContent } from "./Sidebar"; // Reuse content

export function Layout({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-muted/30">
      <Sidebar />
      
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Mobile Header */}
        <div className="md:hidden flex items-center justify-between p-4 bg-card border-b border-border">
          <h1 className="font-display font-bold text-lg">FinTracker</h1>
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <button className="p-2 -mr-2 text-muted-foreground hover:text-foreground">
                <Menu className="w-6 h-6" />
              </button>
            </SheetTrigger>
            <SheetContent side="left" className="p-0 w-72">
              <MobileSidebarContent />
            </SheetContent>
          </Sheet>
        </div>

        <div className="flex-1 overflow-y-auto p-4 md:p-8">
          <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500 slide-in-from-bottom-4">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
}
