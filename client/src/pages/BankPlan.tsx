import { useParams, Link } from "wouter";
import { Layout } from "@/components/Layout";
import { useBanks, useUpdateBank } from "@/hooks/use-banks";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Landmark, Calendar, TrendingDown, Edit3, AlertTriangle } from "lucide-react";
import { format, addMonths, parseISO } from "date-fns";
import { useUpdateBankPayment, useBankPayments } from "@/hooks/use-banks";
import { CheckCircle2, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useState, useMemo } from "react";

export default function BankPlan() {
  const { id } = useParams();
  const { toast } = useToast();
  const { data: banks } = useBanks();
  const { mutate: updateBank } = useUpdateBank();
  const bank = banks?.find(b => b.id === Number(id));

  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [tempAmount, setTempAmount] = useState("");

  if (!bank) return <div className="p-8 text-center">Bank not found</div>;

  const handleCustomPayment = (monthKey: string, amount: string) => {
    const customPayments = { ...(bank.customPayments || {}), [monthKey]: amount };
    updateBank({
      id: bank.id,
      customPayments
    }, {
      onSuccess: () => {
        toast({ title: "Ödeme Planı Güncellendi" });
        setEditingIndex(null);
      }
    });
  };

  const handlePayment = (date: Date, amount: number) => {
    const monthKey = format(date, "yyyy-MM");
    const newTotalDebt = Math.max(0, Number(bank.totalDebt) - amount);
    const newPaidMonths = [...(bank.paidMonths || []), monthKey];

    updateBank({
      id: bank.id,
      totalDebt: newTotalDebt.toString(),
      paidMonths: newPaidMonths,
    }, {
      onSuccess: () => {
        toast({
          title: "Ödeme Kaydedildi",
          description: `${format(date, "MMMM yyyy")} dönemi için ₺${amount.toLocaleString()} ödeme yapıldı.`,
        });
      }
    });
  };

  const { projection, hasWarning } = useMemo(() => {
    const results = [];
    let currentDebt = Number(bank.totalDebt);
    const monthlyRate = Number(bank.interestRate) / 100;
    let monthOffset = 0;
    let warning = false;

    // Borç bitene kadar veya 60 ay (güvenlik sınırı) devam et
    while (currentDebt > 0.01 && monthOffset < 60) {
      const date = addMonths(new Date(), monthOffset);
      const monthKey = format(date, "yyyy-MM");
      
      const interest = currentDebt * monthlyRate;
      
      // Özel ödeme miktarını al veya varsayılan asgariyi kullan
      let paymentAmount = Number(bank.minPaymentAmount);
      if (bank.minPaymentType === "percentage") {
        paymentAmount = (currentDebt * Number(bank.minPaymentAmount)) / 100;
      }
      
      const customAmount = bank.customPayments?.[monthKey];
      if (customAmount) {
        paymentAmount = Number(customAmount);
      }

      // Ödeme faizi karşılamıyorsa uyarı ver ve borç birikmeye devam eder
      if (paymentAmount <= interest && currentDebt > 0) {
        if (monthOffset >= 23) { // 24. ayda (0-indexed) kes
          warning = true;
          break;
        }
      }

      // Borçtan düşülecek miktar (faiz önce eklenir, sonra ödeme düşülür)
      const actualPayment = Math.min(paymentAmount, currentDebt + interest);
      const remainingDebt = Math.max(0, currentDebt + interest - actualPayment);

      results.push({
        date,
        monthKey,
        startingDebt: currentDebt,
        interest,
        payment: actualPayment,
        remainingDebt,
        isCustom: !!customAmount
      });

      currentDebt = remainingDebt;
      monthOffset++;
    }

    return { projection: results, hasWarning: warning };
  }, [bank]);

  return (
    <Layout>
      <div className="flex items-center justify-between gap-4 mb-8">
        <div className="flex items-center gap-4">
          <Link href="/banks">
            <Button variant="ghost" size="icon" className="hover:bg-muted">
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold font-display text-foreground">{bank.name} - Ödeme Planı</h1>
            <p className="text-muted-foreground mt-1 text-sm">Borç tamamen kapanana kadar dinamik hesaplama.</p>
          </div>
        </div>
        {hasWarning && (
          <div className="flex items-center gap-2 bg-amber-50 text-amber-700 px-4 py-2 rounded-lg border border-amber-200 animate-pulse">
            <AlertTriangle className="w-5 h-5" />
            <span className="text-sm font-medium">Dikkat: Ödeme miktarı faizi karşılamıyor! Plan 24. ayda kesildi.</span>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card className="border-border/50 shadow-sm bg-indigo-50/50 dark:bg-indigo-950/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-indigo-600 dark:text-indigo-400">Güncel Toplam Borç</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-mono">₺{Number(bank.totalDebt).toLocaleString()}</div>
          </CardContent>
        </Card>
        <Card className="border-border/50 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Aylık Faiz Oranı</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">%{bank.interestRate} <span className="text-xs font-normal text-muted-foreground">({bank.interestType})</span></div>
          </CardContent>
        </Card>
        <Card className="border-border/50 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-rose-600">Planlanan Vade</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-rose-600 font-mono">{projection.length} Ay</div>
          </CardContent>
        </Card>
      </div>

      <div className="bg-card rounded-2xl border shadow-sm overflow-hidden mb-12">
        <div className="p-6 border-b border-border flex items-center justify-between bg-muted/30">
          <h3 className="font-semibold text-lg flex items-center gap-2">
            <Calendar className="w-5 h-5 text-indigo-600" />
            Dinamik Ödeme Takvimi
          </h3>
          <span className="text-xs text-muted-foreground">Miktarları düzenlemek için kaleme tıklayın</span>
        </div>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-muted/10">
              <TableRow>
                <TableHead className="w-[80px]">Dönem</TableHead>
                <TableHead>Tarih</TableHead>
                <TableHead className="text-right">Başlangıç Borcu</TableHead>
                <TableHead className="text-right">Aylık Faiz</TableHead>
                <TableHead className="text-right">Ödeme Tutarı</TableHead>
                <TableHead className="text-right">Kalan Borç</TableHead>
                <TableHead className="text-right">İşlem</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {projection.map((row, idx) => {
                const isPaid = bank.paidMonths?.includes(row.monthKey);
                const isEditing = editingIndex === idx;

                return (
                  <TableRow key={idx} className={isPaid ? "bg-green-50/20 opacity-80" : ""}>
                    <TableCell className="font-medium">{idx + 1}. Ay</TableCell>
                    <TableCell className="text-muted-foreground whitespace-nowrap">{format(row.date, "MMMM yyyy")}</TableCell>
                    <TableCell className="text-right font-mono text-xs">₺{row.startingDebt.toLocaleString(undefined, { minimumFractionDigits: 2 })}</TableCell>
                    <TableCell className="text-right font-mono text-muted-foreground text-xs">₺{row.interest.toLocaleString(undefined, { minimumFractionDigits: 2 })}</TableCell>
                    <TableCell className="text-right">
                      {isEditing ? (
                        <div className="flex items-center justify-end gap-2">
                          <Input
                            type="number"
                            className="w-24 h-8 text-right font-mono"
                            value={tempAmount}
                            onChange={(e) => setTempAmount(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') handleCustomPayment(row.monthKey, tempAmount);
                              if (e.key === 'Escape') setEditingIndex(null);
                            }}
                            autoFocus
                          />
                        </div>
                      ) : (
                        <div 
                          className={`flex items-center justify-end gap-2 font-mono font-bold cursor-pointer group ${row.isCustom ? "text-indigo-600" : "text-rose-600"}`}
                          onClick={() => {
                            if (!isPaid) {
                              setEditingIndex(idx);
                              setTempAmount(row.payment.toString());
                            }
                          }}
                        >
                          ₺{row.payment.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                          {!isPaid && <Edit3 className="w-3 h-3 opacity-0 group-hover:opacity-50 transition-opacity" />}
                        </div>
                      )}
                    </TableCell>
                    <TableCell className="text-right font-mono font-bold">₺{row.remainingDebt.toLocaleString(undefined, { minimumFractionDigits: 2 })}</TableCell>
                    <TableCell className="text-right">
                      {isPaid ? (
                        <div className="flex items-center justify-end gap-1 text-green-600 font-medium text-sm">
                          <CheckCircle2 className="w-4 h-4" />
                          Ödendi
                        </div>
                      ) : (
                        <Button 
                          size="sm" 
                          variant="outline" 
                          className="h-8 gap-1 hover:bg-green-50 hover:text-green-600 hover:border-green-200"
                          onClick={() => handlePayment(row.date, row.payment)}
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          Ödeme Yap
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      </div>
    </Layout>
  );
}
