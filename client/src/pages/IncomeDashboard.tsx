import { useState, useMemo } from "react";
import { Link, useLocation } from "wouter";
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

import { Plus, Wallet, TrendingUp, Calendar, Trash2, Edit2 } from "lucide-react";
import { format } from "date-fns";

export default function IncomeDashboard() {
  const { toast } = useToast();

  /* -------------------- STATE -------------------- */
  const [selectedMonth, setSelectedMonth] = useState(
    format(new Date(), "yyyy-MM"),
  );

  /* -------------------- DATA -------------------- */
  const { data: allEntries = [], isLoading: isLoadingEntries } = useIncomeEntries();

  const { data: expenseEntries = [] } = useExpenseEntries({
    month: selectedMonth,
  });

  const { mutate: updateEntry } = useUpdateIncomeEntry();
  const { mutate: deleteIncome } = useDeleteIncome();

  /* -------------------- MONTH FILTER -------------------- */
  const filteredEntries = useMemo(() => {
    return allEntries.filter((e) => {
      // Backend ISO string formatında tarih gönderiyor (örn: 2026-02-05T00:00:00.000Z)
      // selectedMonth formatı ise yyyy-MM (örn: 2026-02)
      // İlk 7 karakter karşılaştırması en kesin yöntemdir.
      if (!e.date) return false;
      const dateStr = String(e.date);
      return dateStr.substring(0, 7) === selectedMonth;
    });
  }, [allEntries, selectedMonth]);

  /* -------------------- CALCULATIONS -------------------- */
  const totalExpectedIncome = filteredEntries.reduce(
    (sum, e) => sum + Number(e.amount),
    0,
  );

  const receivedIncome = filteredEntries
    .filter((e) => e.isReceived)
    .reduce((sum, e) => sum + Number(e.amount), 0);

  const paidExpenses = expenseEntries
    .filter((e) => e.isPaid)
    .reduce((sum, e) => sum + Number(e.amount), 0);

  const cashBalance = receivedIncome - paidExpenses;

  /* -------------------- HANDLERS -------------------- */
  const [, setLocation] = useLocation();
  const handleToggleReceived = (id: number, current: boolean) => {
    updateEntry({ id, isReceived: !current });
  };

  const handleDelete = (incomeId: number) => {
    deleteIncome(incomeId, {
      onSuccess: () =>
        toast({
          title: "Income deleted",
          description: "All related entries removed.",
        }),
      onError: () =>
        toast({
          title: "Error",
          description: "Could not delete income.",
          variant: "destructive",
        }),
    });
  };

  /* -------------------- UI -------------------- */
  return (
    <Layout>
      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Income Dashboard</h1>
          <p className="text-muted-foreground">Monthly income overview</p>
        </div>

        <div className="flex items-center gap-3">
          <Select value={selectedMonth} onValueChange={setSelectedMonth}>
            <SelectTrigger className="w-[180px]">
              <Calendar className="w-4 h-4 mr-2" />
              <SelectValue />
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
          title="Expected Income"
          value={`₺${totalExpectedIncome.toLocaleString()}`}
          description="This month"
          icon={TrendingUp}
          variant="success"
        />
        <StatCard
          title="Cash Balance"
          value={`₺${cashBalance.toLocaleString()}`}
          description="Received - Paid"
          icon={Wallet}
          variant={cashBalance >= 0 ? "default" : "danger"}
        />
        <StatCard
          title="Progress"
          value={`${
            filteredEntries.length
              ? Math.round(
                  (filteredEntries.filter((e) => e.isReceived).length /
                    filteredEntries.length) *
                    100,
                )
              : 0
          }%`}
          description="Income received"
          icon={Calendar}
        />
      </div>

      {/* TABLE */}
      <div className="bg-card rounded-xl border mt-6 overflow-hidden">
        <div className="p-4 border-b font-semibold">
          Income Entries –{" "}
          {format(new Date(selectedMonth + "-01"), "MMMM yyyy")}
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
                <TableCell colSpan={6} className="text-center py-6">
                  Loading...
                </TableCell>
              </TableRow>
            ) : filteredEntries.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-6">
                  No income for this month
                </TableCell>
              </TableRow>
            ) : (
              filteredEntries.map((entry) => (
                <TableRow key={entry.id}>
                  <TableCell>
                    <Checkbox
                      checked={entry.isReceived || false}
                      onCheckedChange={() =>
                        handleToggleReceived(entry.id, !!entry.isReceived)
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
                    <div className="flex items-center justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() =>
                          setLocation(`/income/add?edit=${entry.incomeId}`)
                        }
                        title="Düzenle"
                      >
                        <Edit2 className="w-4 h-4 text-muted-foreground" />
                      </Button>
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
                              This deletes all months.
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
                    </div>
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
