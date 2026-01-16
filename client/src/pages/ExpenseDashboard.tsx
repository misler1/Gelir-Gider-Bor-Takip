import { useState } from "react";
import { Link } from "wouter";
import { useExpenses, useExpenseEntries, useUpdateExpenseEntry, useDeleteExpense } from "@/hooks/use-expenses";
import { useIncomes, useIncomeEntries } from "@/hooks/use-incomes"; // For cash balance
import { Layout } from "@/components/Layout";
import { StatCard } from "@/components/StatCard";
import { format, startOfMonth, endOfMonth, parseISO } from "date-fns";
import { Plus, CreditCard, TrendingDown, Calendar, Trash2, Wallet } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";

export default function ExpenseDashboard() {
  const [selectedMonth, setSelectedMonth] = useState(format(new Date(), "yyyy-MM"));
  const { toast } = useToast();

  const { data: allEntries, isLoading: isLoadingEntries } = useExpenseEntries();
  const entries = allEntries?.filter(e => format(new Date(e.date), "yyyy-MM") === selectedMonth);
  const { mutate: updateEntry } = useUpdateExpenseEntry();
  const { mutate: deleteExpense } = useDeleteExpense();

  // For Cash Balance
  const { data: incomeEntries } = useIncomeEntries({ month: selectedMonth });
  
  const totalPlannedExpenses = entries?.reduce((sum, e) => sum + Number(e.amount), 0) || 0;
  
  const paidExpenses = entries
    ?.filter(e => e.isPaid)
    .reduce((sum, e) => sum + Number(e.amount), 0) || 0;
  
  const receivedIncome = incomeEntries
    ?.filter(e => e.isReceived)
    .reduce((sum, e) => sum + Number(e.amount), 0) || 0;

  const cashBalance = receivedIncome - paidExpenses;

  const handleTogglePaid = (id: number, currentStatus: boolean) => {
    updateEntry({ id, isPaid: !currentStatus });
  };

  const handleDelete = (expenseId: number) => {
    deleteExpense(expenseId, {
      onSuccess: () => {
        toast({ title: "Expense deleted", description: "Expense and all future entries removed." });
      },
      onError: () => {
        toast({ title: "Error", description: "Could not delete expense.", variant: "destructive" });
      }
    });
  };

  return (
    <Layout>
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold font-display text-foreground">Expenses Dashboard</h1>
          <p className="text-muted-foreground mt-1">Manage your spending and bills.</p>
        </div>
        
        <div className="flex items-center gap-3">
           <Select value={selectedMonth} onValueChange={setSelectedMonth}>
            <SelectTrigger className="w-[180px] bg-background">
              <Calendar className="w-4 h-4 mr-2 text-muted-foreground" />
              <SelectValue placeholder="Select month" />
            </SelectTrigger>
            <SelectContent>
              {Array.from({ length: 12 }).map((_, i) => {
                const date = new Date();
                date.setMonth(date.getMonth() - 5 + i); 
                const value = format(date, "yyyy-MM");
                return (
                  <SelectItem key={value} value={value}>
                    {format(date, "MMMM yyyy")}
                  </SelectItem>
                );
              })}
            </SelectContent>
          </Select>

          <Link href="/expenses/add">
            <Button className="bg-rose-600 hover:bg-rose-700 text-white shadow-lg shadow-rose-600/20">
              <Plus className="w-4 h-4 mr-2" />
              Add Expense
            </Button>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <StatCard
          title="Monthly Planned"
          value={`$${totalPlannedExpenses.toFixed(2)}`}
          description="Total expenses for this month"
          icon={TrendingDown}
          variant="danger"
        />
        <StatCard
          title="Cash Balance"
          value={`$${cashBalance.toFixed(2)}`}
          description="Real-time available funds"
          icon={Wallet}
          variant={cashBalance >= 0 ? "default" : "danger"}
        />
        <StatCard
          title="Paid"
          value={`${entries?.length ? Math.round((entries.filter(e => e.isPaid).length / entries.length) * 100) : 0}%`}
          description="Expenses paid this month"
          icon={CreditCard}
          variant="neutral"
        />
      </div>

      <div className="bg-card rounded-2xl border shadow-sm overflow-hidden">
        <div className="p-6 border-b border-border">
          <h3 className="font-semibold text-lg">Expense Entries - {format(parseISO(selectedMonth + "-01"), "MMMM yyyy")}</h3>
        </div>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Status</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Due Date</TableHead>
                <TableHead className="text-right">Amount</TableHead>
                <TableHead className="w-[100px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoadingEntries ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">Loading...</TableCell>
                </TableRow>
              ) : entries?.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">No expense entries for this month.</TableCell>
                </TableRow>
              ) : (
                entries?.map((entry) => (
                  <TableRow key={entry.id} className="group">
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Checkbox 
                          checked={entry.isPaid || false}
                          onCheckedChange={() => handleTogglePaid(entry.id, entry.isPaid || false)}
                          className="data-[state=checked]:bg-rose-600 data-[state=checked]:border-rose-600"
                        />
                        <span className={`text-sm ${entry.isPaid ? 'text-rose-600 font-medium' : 'text-muted-foreground'}`}>
                          {entry.isPaid ? 'Paid' : 'Unpaid'}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="font-medium text-foreground">{entry.expenseName}</TableCell>
                    <TableCell className="text-muted-foreground">{format(new Date(entry.date), "MMM d, yyyy")}</TableCell>
                    <TableCell className="text-right font-mono font-medium">
                      ${Number(entry.amount).toFixed(2)}
                    </TableCell>
                    <TableCell>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="ghost" size="icon" className="opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-red-600">
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete this expense?</AlertDialogTitle>
                            <AlertDialogDescription>
                              This will delete the master record and ALL future scheduled entries.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={() => entry.expenseId && handleDelete(entry.expenseId)} className="bg-red-600 hover:bg-red-700">
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </Layout>
  );
}
