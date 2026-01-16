import { useState } from "react";
import { Link } from "wouter";
import { useIncomes, useIncomeEntries, useUpdateIncomeEntry, useDeleteIncome } from "@/hooks/use-incomes";
import { Layout } from "@/components/Layout";
import { StatCard } from "@/components/StatCard";
import { format, startOfMonth, endOfMonth, parseISO } from "date-fns";
import { Plus, Wallet, TrendingUp, Calendar, Trash2 } from "lucide-react";
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
import { useExpenses, useExpenseEntries } from "@/hooks/use-expenses"; // For Cash Balance calc

export default function IncomeDashboard() {
  const [selectedMonth, setSelectedMonth] = useState(format(new Date(), "yyyy-MM"));
  const { toast } = useToast();

  const startDate = format(startOfMonth(new Date(selectedMonth)), "yyyy-MM-dd");
  const endDate = format(endOfMonth(new Date(selectedMonth)), "yyyy-MM-dd");

  const { data: allEntries, isLoading: isLoadingEntries } = useIncomeEntries();
  const entries = allEntries?.filter(e => format(new Date(e.date), "yyyy-MM") === selectedMonth);
  const { mutate: updateEntry } = useUpdateIncomeEntry();
  const { mutate: deleteIncome } = useDeleteIncome();

  // For Cash Balance Calculation
  const { data: expenseEntries } = useExpenseEntries({ month: selectedMonth });
  
  const totalExpectedIncome = entries?.reduce((sum, e) => sum + Number(e.amount), 0) || 0;
  
  const receivedIncome = entries
    ?.filter(e => e.isReceived)
    .reduce((sum, e) => sum + Number(e.amount), 0) || 0;

  const paidExpenses = expenseEntries
    ?.filter(e => e.isPaid)
    .reduce((sum, e) => sum + Number(e.amount), 0) || 0;
    
  const cashBalance = receivedIncome - paidExpenses;

  const handleToggleReceived = (id: number, currentStatus: boolean) => {
    updateEntry({ id, isReceived: !currentStatus });
  };

  const handleDelete = (incomeId: number) => {
    deleteIncome(incomeId, {
      onSuccess: () => {
        toast({ title: "Income deleted", description: "The income source and all its entries have been removed." });
      },
      onError: () => {
        toast({ title: "Error", description: "Could not delete income.", variant: "destructive" });
      }
    });
  };

  return (
    <Layout>
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold font-display text-foreground">Income Dashboard</h1>
          <p className="text-muted-foreground mt-1">Track your earnings and cash flow.</p>
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
                date.setMonth(date.getMonth() - 5 + i); // Show 5 months back, 6 forward
                const value = format(date, "yyyy-MM");
                return (
                  <SelectItem key={value} value={value}>
                    {format(date, "MMMM yyyy")}
                  </SelectItem>
                );
              })}
            </SelectContent>
          </Select>

          <Link href="/income/add">
            <Button className="bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg shadow-emerald-600/20">
              <Plus className="w-4 h-4 mr-2" />
              Add Income
            </Button>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <StatCard
          title="Monthly Expected"
          value={`$${totalExpectedIncome.toFixed(2)}`}
          description="Total projected income for this month"
          icon={TrendingUp}
          variant="success"
        />
        <StatCard
          title="Cash Balance"
          value={`$${cashBalance.toFixed(2)}`}
          description="Received Income - Paid Expenses"
          icon={Wallet}
          variant={cashBalance >= 0 ? "default" : "danger"}
        />
        <StatCard
          title="Progress"
          value={`${entries?.length ? Math.round((entries.filter(e => e.isReceived).length / entries.length) * 100) : 0}%`}
          description="Incomes received this month"
          icon={Calendar}
          variant="neutral"
        />
      </div>

      <div className="bg-card rounded-2xl border shadow-sm overflow-hidden">
        <div className="p-6 border-b border-border">
          <h3 className="font-semibold text-lg">Income Entries - {format(parseISO(selectedMonth + "-01"), "MMMM yyyy")}</h3>
        </div>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Status</TableHead>
                <TableHead>Source</TableHead>
                <TableHead>Date</TableHead>
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
                  <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">No income entries for this month.</TableCell>
                </TableRow>
              ) : (
                entries?.map((entry) => (
                  <TableRow key={entry.id} className="group">
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Checkbox 
                          checked={entry.isReceived || false}
                          onCheckedChange={() => handleToggleReceived(entry.id, entry.isReceived || false)}
                          className="data-[state=checked]:bg-emerald-600 data-[state=checked]:border-emerald-600"
                        />
                        <span className={`text-sm ${entry.isReceived ? 'text-emerald-600 font-medium' : 'text-muted-foreground'}`}>
                          {entry.isReceived ? 'Received' : 'Pending'}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="font-medium text-foreground">{entry.incomeName}</TableCell>
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
                            <AlertDialogTitle>Delete this income source?</AlertDialogTitle>
                            <AlertDialogDescription>
                              This will delete the master record and ALL future scheduled entries. This action cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={() => entry.incomeId && handleDelete(entry.incomeId)} className="bg-red-600 hover:bg-red-700">
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
