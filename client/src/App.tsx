import { Switch, Route, Redirect } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";

// Pages
import IncomeDashboard from "@/pages/IncomeDashboard";
import AddIncome from "@/pages/AddIncome";
import ExpenseDashboard from "@/pages/ExpenseDashboard";
import AddExpense from "@/pages/AddExpense";
import BanksDashboard from "@/pages/BanksDashboard";
import AddBank from "@/pages/AddBank";
import BankPlan from "@/pages/BankPlan";

function Router() {
  return (
    <Switch>
      <Route path="/" component={() => <Redirect to="/income" />} />
      
      {/* Income Routes */}
      <Route path="/income" component={IncomeDashboard} />
      <Route path="/income/add" component={AddIncome} />
      
      {/* Expense Routes */}
      <Route path="/expenses" component={ExpenseDashboard} />
      <Route path="/expenses/add" component={AddExpense} />
      
      {/* Bank Routes */}
      <Route path="/banks" component={BanksDashboard} />
      <Route path="/banks/add" component={AddBank} />
      <Route path="/banks/:id/plan" component={BankPlan} />
      
      {/* Fallback */}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
