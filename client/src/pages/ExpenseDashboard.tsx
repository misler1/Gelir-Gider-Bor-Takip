import { useState } from "react";
import { Link, useLocation } from "wouter";
import {
  useExpenseEntries,
  useUpdateExpenseEntry,
  useDeleteExpense,
} from "@/hooks/use-expenses";
import { useIncomeEntries } from "@/hooks/use-incomes";
import { Layout } from "@/components/Layout";
import { StatCard } from "@/components/StatCard";
import { format } from "date-fns";
import {
  Plus,
  CreditCard,
  TrendingDown,
  Calendar,
  Trash2,
  Wallet,
  Edit2,
} from "lucide-react";
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

/* -------------------- AY İSİMLERİ -------------------- */
const MONTHS = [
  "Ocak",
  "Şubat",
  "Mart",
  "Nisan",
  "Mayıs",
  "Haziran",
  "Temmuz",
  "Ağustos",
  "Eylül",
  "Ekim",
  "Kasım",
  "Aralık",
];

export default function ExpenseDashboard() {
  const now = new Date();

  /* -------------------- DEFAULT DÖNEM (HER ZAMAN +1 AY) -------------------- */
  const getDefaultPeriod = () => {
    const month = now.getMonth(); // 0-based
    const year = now.getFullYear();

    if (month === 11) {
      // Aralık → Ocak
      return { month: 0, year: year + 1 };
    }

    return { month: month + 1, year };
  };

  const defaultPeriod = getDefaultPeriod();

  /* -------------------- STATE -------------------- */
  const [selectedYear, setSelectedYear] = useState(defaultPeriod.year);
  const [selectedMonth, setSelectedMonth] = useState(defaultPeriod.month);

  const { toast } = useToast();
  const [, setLocation] = useLocation();

  /* -------------------- DATA -------------------- */
  const { data: allEntries = [], isLoading } = useExpenseEntries();
  const { mutate: updateEntry } = useUpdateExpenseEntry();
  const { mutate: deleteExpense } = useDeleteExpense();

  /* -------------------- 6–5 ENDESKLEME FİLTRESİ -------------------- */
  const entries = allEntries.filter((e) => {
    if (!e.date) return false;

    const entryDate = new Date(e.date);
    const indexedDate = new Date(entryDate);

    // Ayın 6'sı ve sonrası → bir sonraki ay
    if (entryDate.getDate() >= 6) {
      indexedDate.setMonth(indexedDate.getMonth() + 1);
    }

    return (
      indexedDate.getFullYear() === selectedYear &&
      indexedDate.getMonth() === selectedMonth
    );
  });

  /* -------------------- NAKİT HESAPLAMA -------------------- */
  const monthKey = `${selectedYear}-${String(selectedMonth + 1).padStart(
    2,
    "0",
  )}`;

  const { data: incomeEntries = [] } = useIncomeEntries({ month: monthKey });

  const totalPlanned = entries.reduce((sum, e) => sum + Number(e.amount), 0);

  const paidTotal = entries
    .filter((e) => e.isPaid)
    .reduce((sum, e) => sum + Number(e.amount), 0);

  const receivedIncome = incomeEntries
    .filter((i) => i.isReceived)
    .reduce((sum, i) => sum + Number(i.amount), 0);

  const cashBalance = receivedIncome - paidTotal;

  /* -------------------- UI -------------------- */
  return (
    <Layout>
      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Expenses Dashboard</h1>
          <p className="text-muted-foreground">Giderlerinizi yönetin</p>
        </div>

        {/* AY + YIL */}
        <div className="flex gap-3 items-center">
          <Select
            value={String(selectedMonth)}
            onValueChange={(v) => setSelectedMonth(Number(v))}
          >
            <SelectTrigger className="w-[140px]">
              <Calendar className="w-4 h-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {MONTHS.map((m, i) => (
                <SelectItem key={i} value={String(i)}>
                  {m}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            value={String(selectedYear)}
            onValueChange={(v) => setSelectedYear(Number(v))}
          >
            <SelectTrigger className="w-[120px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {Array.from({ length: 10 }).map((_, i) => {
                const year = now.getFullYear() + i;
                return (
                  <SelectItem key={year} value={String(year)}>
                    {year}
                  </SelectItem>
                );
              })}
            </SelectContent>
          </Select>

          <Link href="/expenses/add">
            <Button className="bg-rose-600 text-white">
              <Plus className="w-4 h-4 mr-2" />
              Gider Ekle
            </Button>
          </Link>
        </div>
      </div>

      {/* STATS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
        <StatCard
          title="Planlanan"
          value={`₺${totalPlanned.toLocaleString()}`}
          icon={TrendingDown}
          variant="danger"
        />
        <StatCard
          title="Nakit Bakiye"
          value={`₺${cashBalance.toLocaleString()}`}
          icon={Wallet}
          variant={cashBalance >= 0 ? "default" : "danger"}
        />
        <StatCard
          title="Ödenen"
          value={`₺${paidTotal.toLocaleString()}`}
          icon={CreditCard}
          variant="neutral"
        />
      </div>

      {/* TABLE */}
      <div className="bg-card rounded-2xl border mt-6 overflow-hidden">
        <div className="p-6 border-b font-semibold">
          {MONTHS[selectedMonth]} {selectedYear}
        </div>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Durum</TableHead>
              <TableHead>Ad</TableHead>
              <TableHead>Tarih</TableHead>
              <TableHead className="text-right">Tutar</TableHead>
              <TableHead />
            </TableRow>
          </TableHeader>

          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8">
                  Yükleniyor...
                </TableCell>
              </TableRow>
            ) : entries.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8">
                  Kayıt yok
                </TableCell>
              </TableRow>
            ) : (
              entries.map((e) => (
                <TableRow key={e.id}>
                  <TableCell>
                    <Checkbox
                      checked={e.isPaid}
                      onCheckedChange={() =>
                        updateEntry({ id: e.id, isPaid: !e.isPaid })
                      }
                    />
                  </TableCell>
                  <TableCell>{e.expenseName}</TableCell>
                  <TableCell>
                    {format(new Date(e.date), "dd.MM.yyyy")}
                  </TableCell>
                  <TableCell className="text-right">
                    ₺{Number(e.amount).toLocaleString()}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() =>
                        setLocation(`/expenses/add?edit=${e.expenseId}`)
                      }
                    >
                      <Edit2 className="w-4 h-4" />
                    </Button>

                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button size="icon" variant="ghost">
                          <Trash2 className="w-4 h-4 text-red-600" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Silinsin mi?</AlertDialogTitle>
                          <AlertDialogDescription>
                            Tüm ileri kayıtlar silinir.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Vazgeç</AlertDialogCancel>
                          <AlertDialogAction
                            className="bg-red-600"
                            onClick={() => deleteExpense(e.expenseId)}
                          >
                            Sil
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
