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

import {
  Plus,
  Wallet,
  TrendingUp,
  Calendar,
  Trash2,
  Edit2,
} from "lucide-react";
import { format } from "date-fns";

/* -------------------- MONTH & YEAR OPTIONS -------------------- */
const months = [
  { value: 1, label: "Ocak" },
  { value: 2, label: "Şubat" },
  { value: 3, label: "Mart" },
  { value: 4, label: "Nisan" },
  { value: 5, label: "Mayıs" },
  { value: 6, label: "Haziran" },
  { value: 7, label: "Temmuz" },
  { value: 8, label: "Ağustos" },
  { value: 9, label: "Eylül" },
  { value: 10, label: "Ekim" },
  { value: 11, label: "Kasım" },
  { value: 12, label: "Aralık" },
];

export default function IncomeDashboard() {
  const { toast } = useToast();
  const now = new Date();

  /* -------------------- STATE -------------------- */
  const now = new Date();

  const getDefaultPeriod = () => {
    const month = now.getMonth(); // 0-based
    const year = now.getFullYear();

    // Her zaman bir sonraki ay
    if (month === 11) {
      // Aralık → Ocak
      return { month: 1, year: year + 1 };
    }

    return { month: month + 2, year };
  };

  const defaultPeriod = getDefaultPeriod();

  const [selectedMonth, setSelectedMonth] = useState<number>(
    defaultPeriod.month,
  );
  const [selectedYear, setSelectedYear] = useState<number>(defaultPeriod.year);

  const years = Array.from({ length: 7 }, (_, i) => now.getFullYear() + i);

  /* -------------------- DATA -------------------- */
  const { data: allEntries = [], isLoading: isLoadingEntries } =
    useIncomeEntries();

  const { data: expenseEntries = [] } = useExpenseEntries({
    month: selectedMonth,
    year: selectedYear,
  });

  const { mutate: updateEntry } = useUpdateIncomeEntry();
  const { mutate: deleteIncome } = useDeleteIncome();

  /* -------------------- FILTER -------------------- */
  const filteredEntries = useMemo(() => {
    return allEntries.filter((e) => {
      if (!e.date) return false;

      const entryDate = new Date(e.date);
      const day = entryDate.getDate();

      // Endeksleme tarihi
      const indexedDate = new Date(entryDate);

      if (day >= 6) {
        indexedDate.setMonth(indexedDate.getMonth() + 1);
      }

      return (
        indexedDate.getMonth() + 1 === selectedMonth &&
        indexedDate.getFullYear() === selectedYear
      );
    });
  }, [allEntries, selectedMonth, selectedYear]);

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
          {/* MONTH SELECT */}
          <Select
            value={String(selectedMonth)}
            onValueChange={(v) => setSelectedMonth(Number(v))}
          >
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Ay" />
            </SelectTrigger>
            <SelectContent>
              {months.map((m) => (
                <SelectItem key={m.value} value={String(m.value)}>
                  {m.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* YEAR SELECT */}
          <Select
            value={String(selectedYear)}
            onValueChange={(v) => setSelectedYear(Number(v))}
          >
            <SelectTrigger className="w-[120px]">
              <SelectValue placeholder="Yıl" />
            </SelectTrigger>
            <SelectContent>
              {years.map((y) => (
                <SelectItem key={y} value={String(y)}>
                  {y}
                </SelectItem>
              ))}
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
          description="Selected period"
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
          {months.find((m) => m.value === selectedMonth)?.label} {selectedYear}
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
                  No income for this period
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
