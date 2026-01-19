import { useParams, Link } from "wouter";
import { Layout } from "@/components/Layout";
import { useBanks, useUpdateBank } from "@/hooks/use-banks";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Landmark, Calendar, TrendingDown } from "lucide-react";
import { format, addMonths } from "date-fns";
import { useUpdateBankPayment, useBankPayments } from "@/hooks/use-banks";
import { CheckCircle2, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function BankPlan() {
  const { id } = useParams();
  const { toast } = useToast();
  const { data: banks } = useBanks();
  const { data: payments } = useBankPayments(Number(id));
  const { mutate: updatePayment, isPending: isUpdating } = useUpdateBankPayment();
  const { mutate: updateBank } = useUpdateBank();
  const bank = banks?.find(b => b.id === Number(id));

  if (!bank) return <div className="p-8 text-center">Bank not found</div>;

  const handlePayment = (index: number) => {
    const paymentAmount = Number(bank.minPaymentAmount);
    let finalPayment = paymentAmount;

    // Eğer yüzdeyse borç üzerinden hesapla
    if (bank.minPaymentType === "percentage") {
      finalPayment = (Number(bank.totalDebt) * paymentAmount) / 100;
    }

    const newTotalDebt = Math.max(0, Number(bank.totalDebt) - finalPayment);

    updateBank({
      id: bank.id,
      totalDebt: newTotalDebt.toString(),
    }, {
      onSuccess: () => {
        toast({
          title: "Ödeme Kaydedildi",
          description: `${format(addMonths(new Date(), index), "MMMM yyyy")} dönemi için ₺${finalPayment.toLocaleString()} ödeme yapıldı ve borçtan düşüldü.`,
        });
      },
      onError: () => {
        toast({
          title: "Hata",
          description: "Ödeme kaydedilirken bir hata oluştu.",
          variant: "destructive",
        });
      }
    });
  };

  // Simple amortized or waterfall projection (Placeholder logic as per system requirement)
  // For now, we show a 12-month projection of minimum payments and interest
  const projection = Array.from({ length: 12 }).map((_, i) => {
    const date = addMonths(new Date(), i);
    const amount = Number(bank.minPaymentAmount);
    return {
      date,
      amount,
      interest: Number(bank.totalDebt) * (Number(bank.interestRate) / 100),
    };
  });

  return (
    <Layout>
      <div className="flex items-center gap-4 mb-8">
        <Link href="/banks">
          <Button variant="ghost" size="icon" className="hover:bg-muted">
            <ArrowLeft className="w-5 h-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold font-display text-foreground">{bank.name} - Ödeme Planı</h1>
          <p className="text-muted-foreground mt-1">Gelecek 12 ay için tahmini ödeme takvimi.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card className="border-border/50 shadow-sm bg-indigo-50/50 dark:bg-indigo-950/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-indigo-600 dark:text-indigo-400">Toplam Borç</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-mono">₺{Number(bank.totalDebt).toLocaleString()}</div>
          </CardContent>
        </Card>
        <Card className="border-border/50 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Faiz Oranı</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{bank.interestRate}% <span className="text-xs font-normal text-muted-foreground">({bank.interestType})</span></div>
          </CardContent>
        </Card>
        <Card className="border-border/50 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-rose-600">Asgari Ödeme</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-rose-600 font-mono">₺{Number(bank.minPaymentAmount).toLocaleString()}</div>
          </CardContent>
        </Card>
      </div>

      <div className="bg-card rounded-2xl border shadow-sm overflow-hidden">
        <div className="p-6 border-b border-border flex items-center justify-between">
          <h3 className="font-semibold text-lg flex items-center gap-2">
            <Calendar className="w-5 h-5 text-indigo-600" />
            Tahmini Takvim
          </h3>
          <span className="text-xs text-muted-foreground">Gelecek 12 Ay</span>
        </div>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Dönem</TableHead>
                <TableHead>Tarih</TableHead>
                <TableHead className="text-right">Ödeme Tutarı</TableHead>
                <TableHead className="text-right">Tahmini Faiz</TableHead>
                <TableHead className="text-right">İşlem</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {projection.map((row, idx) => (
                <TableRow key={idx}>
                  <TableCell className="font-medium">{idx + 1}. Ay</TableCell>
                  <TableCell className="text-muted-foreground">{format(row.date, "MMMM yyyy")}</TableCell>
                  <TableCell className="text-right font-mono font-bold text-rose-600">₺{row.amount.toLocaleString()}</TableCell>
                  <TableCell className="text-right font-mono text-muted-foreground">₺{row.interest.toLocaleString(undefined, { maximumFractionDigits: 2 })}</TableCell>
                  <TableCell className="text-right">
                    <Button 
                      size="sm" 
                      variant="outline" 
                      className="h-8 gap-1 hover:bg-green-50 hover:text-green-600 hover:border-green-200"
                      onClick={() => handlePayment(idx)}
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Ödeme Yapıldı
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </Layout>
  );
}
