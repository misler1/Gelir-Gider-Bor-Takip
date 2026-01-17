import { useState } from "react";
import { useLocation, Link } from "wouter";
import {
  useIncomeEntries,
  useUpdateIncomeEntry,
  useDeleteIncome,
} from "@/hooks/use-incomes";
import { useExpenseEntries } from "@/hooks/use-expenses";

import { Layout } from "@/components/Layout";
import { StatCard } from "@/components/StatCard";
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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

import { Plus, Wallet, TrendingUp, Calendar, Trash2 } from "lucide-react";
import { format, parseISO } from "date-fns";

export default function IncomeDashboard() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  /* -------------------- STATE -------------------- */
  const [selectedMonth, setSelectedMonth] = useState(
    format(new Date(), "yyyy-MM"),
  );

  /* -------------------- DATA -------------------- */
  const { data: entries = [], isLoading: isLoadingEntries } = useIncomeEntries({
    month: selectedMonth,
  });

  const { data: expenseEntries = [] } = useExpenseEntries({
    month: selectedMonth,
  });

  const { mutate: updateEntry } = useUpdateIncomeEntry();
  const { mutate: deleteIncome } = useDeleteIncome();

  /* -------------------- CALCULATIONS -------------------- */
  const totalExpectedIncome = entries.reduce(
    (sum, e) => sum + Number(e.amount),
    0,
  );

  const receivedIncome = entries
    .filter((e) => e.isReceived)
    .reduce((sum, e) => sum + Number(e.amount), 0);

  const paidExpenses = expenseEntries
    .filter((e) => e.isPaid)
    .reduce((sum, e) => sum + Number(e.amount), 0);

  const cashBalance = receivedIncome - paidExpenses;

  /* -------------------- HANDLERS -------------------- */
  const handleToggleReceived = (id: number, current: boolean) => {
    updateEntry({ id, isReceived: !current });
  };

  const handleDelete = (incomeId: number) => {
    deleteIncome(incomeId, {
      onSuccess: () => {
        toast({
          title: "Income deleted",
          description:
            "The income source and all its entries have been removed.",
        });
      },
      onError: () => {
        toast({
          title: "Error",
          description: "Could not delete income.",
          variant: "destructive",
        });
      },
    });
  };

  /* -------------------- UI -------------------- */
  return (
    <Layout>
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Income Dashboard</h1>
          <p className="text-muted-foreground">
            Track your earnings and cash flow
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Select value={selectedMonth} onValueChange={setSelectedMonth}>
            <SelectTrigger className="w-[180px]">
              <Calendar className="w-4 h-4 mr-2" />
              <SelectValue placeholder="Select month" />
            </SelectTrigger>
            <SelectContent>
              {Array.from({ length: 12 }).map((_, i) => {
                const d = new Date();
                d.setMonth(d.getMonth() - 5 + i);
                const value = format(d, "yyyy-MM");
                return (
                  <SelectItem key={value} value={value}>
                    {format(d, "MMMM yyyy")}
                  </SelectItem>
                );
              })}
            </SelectContent>
          </Select>

          <Link href="/income/add">
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Add Income
            </Button>
          </Link>
        </div>
      </div>

      {/* STATS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
        <StatCard
          title="Monthly Expected"
          value={`₺${totalExpectedIncome.toLocaleString()}`}
          description="Projected income"
          icon={TrendingUp}
          variant="success"
        />
        <StatCard
          title="Cash Balance"
          value={`₺${cashBalance.toLocaleString()}`}
          description="Received - Paid expenses"
          icon={Wallet}
          variant={cashBalance >= 0 ? "default" : "danger"}
        />
        <StatCard
          title="Progress"
          value={`${
            entries.length
              ? Math.round(
                  (entries.filter((e) => e.isReceived).length /
                    entries.length) *
                    100,
                )
              : 0
          }%`}
          description="Received incomes"
          icon={Calendar}
        />
      </div>

      {/* TABLE */}
      <div className="bg-card rounded-xl border mt-6 overflow-hidden">
        <div className="p-4 border-b font-semibold">
          Income Entries –{" "}
          {format(parseISO(selectedMonth + "-01"), "MMMM yyyy")}
        </div>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Status</TableHead>
              <TableHead>Source</TableHead>
              <TableHead>Date</TableHead>
              <TableHead className="text-right">Amount</TableHead>
              <TableHead />
            </TableRow>
          </TableHeader>

          <TableBody>
            {isLoadingEntries ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-6">
                  Loading...
                </TableCell>
              </TableRow>
            ) : entries.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-6">
                  No income entries
                </TableCell>
              </TableRow>
            ) : (
              entries.map((entry) => (
                <TableRow key={entry.id}>
                  <TableCell>
                    <Checkbox
                      checked={entry.isReceived}
                      onCheckedChange={() =>
                        handleToggleReceived(entry.id, entry.isReceived)
                      }
                    />
                  </TableCell>
                  <TableCell>{entry.incomeName}</TableCell>
                  <TableCell>
                    {format(new Date(entry.date), "dd MMM yyyy")}
                  </TableCell>
                  <TableCell className="text-right">
                    ₺{Number(entry.amount).toLocaleString()}
                  </TableCell>
                  <TableCell className="text-right">
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <Trash2 className="w-4 h-4 text-red-500" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete income?</AlertDialogTitle>
                          <AlertDialogDescription>
                            This will delete all related entries.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            className="bg-red-600"
                            onClick={() =>
                              entry.incomeId && handleDelete(entry.incomeId)
                            }
                          >
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
    </Layout>
  );
}
