import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Plus, Landmark, Trash2, ExternalLink, Edit2, TrendingDown, Wallet } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Layout } from "@/components/Layout";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useBanks, useDeleteBank, useUpdateBank } from "@/hooks/use-banks";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";

export default function BanksDashboard() {
  const [_, setLocation] = useLocation();
  const { data: banks, isLoading } = useBanks();
  const { mutate: deleteBank } = useDeleteBank();
  const { mutate: updateBank } = useUpdateBank();
  const { toast } = useToast();

  const [extraPaymentAmount, setExtraPaymentAmount] = useState("");
  const [selectedBankId, setSelectedBankId] = useState<number | null>(null);
  const [isExtraPaymentOpen, setIsExtraPaymentOpen] = useState(false);

  const totalMinPayment = banks?.reduce((sum, bank) => {
    // Bu ay ödeme yapılmış mı kontrol et
    const currentMonth = new Date().toISOString().slice(0, 7); // yyyy-MM
    if (bank.paidMonths?.includes(currentMonth)) {
      return sum;
    }

    const amount = Number(bank.minPaymentAmount);
    if (bank.minPaymentType === "percentage") {
      return sum + (Number(bank.totalDebt) * amount / 100);
    }
    return sum + amount;
  }, 0) || 0;

  const handleExtraPayment = () => {
    if (!selectedBankId || !extraPaymentAmount || isNaN(Number(extraPaymentAmount))) return;

    const bank = banks?.find(b => b.id === selectedBankId);
    if (!bank) return;

    const newDebt = Math.max(0, Number(bank.totalDebt) - Number(extraPaymentAmount));

    updateBank({
      id: selectedBankId,
      totalDebt: newDebt.toString()
    }, {
      onSuccess: () => {
        toast({
          title: "Ara Ödeme Başarılı",
          description: `₺${Number(extraPaymentAmount).toLocaleString()} tutarındaki ara ödeme borçtan düşüldü.`,
        });
        setIsExtraPaymentOpen(false);
        setExtraPaymentAmount("");
        setSelectedBankId(null);
      },
      onError: () => {
        toast({
          title: "Hata",
          description: "Ara ödeme kaydedilirken bir hata oluştu.",
          variant: "destructive",
        });
      }
    });
  };

  const handleDelete = (id: number) => {
    deleteBank(id, {
      onSuccess: () => toast({ title: "Banka silindi" }),
      onError: () => toast({ title: "Hata", variant: "destructive" }),
    });
  };

  return (
    <Layout>
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold font-display text-foreground">Bankalar & Borçlar</h1>
          <p className="text-muted-foreground mt-1">Kredi kartları, krediler ve ödemeleri yönetin.</p>
        </div>
        
        <Link href="/banks/add">
          <Button className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-600/20">
            <Plus className="w-4 h-4 mr-2" />
            Banka/Borç Ekle
          </Button>
        </Link>
      </div>

      {!isLoading && banks && banks.length > 0 && (
        <div className="mb-8 grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card className="border-indigo-100 bg-indigo-50/30 dark:bg-indigo-950/10">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-indigo-100 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400 rounded-full">
                  <TrendingDown className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Toplam Aylık Asgari Ödeme</p>
                  <h2 className="text-2xl font-bold text-indigo-600 dark:text-indigo-400 font-mono">
                    ₺{totalMinPayment.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </h2>
                </div>
              </div>
            </CardContent>
          </Card>

          <Dialog open={isExtraPaymentOpen} onOpenChange={setIsExtraPaymentOpen}>
            <DialogTrigger asChild>
              <Button 
                variant="outline" 
                className="h-full border-dashed border-2 hover:border-indigo-500 hover:bg-indigo-50/50 transition-all group"
                onClick={() => setSelectedBankId(null)}
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-indigo-100 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400 rounded-full group-hover:scale-110 transition-transform">
                    <Wallet className="w-5 h-5" />
                  </div>
                  <div className="text-left">
                    <p className="text-sm font-medium">Ara Ödeme Yap</p>
                    <p className="text-xs text-muted-foreground">Herhangi bir bankaya ekstra ödeme gönder</p>
                  </div>
                </div>
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Ara Ödeme Yap</DialogTitle>
                <DialogDescription>
                  Borçtan düşülecek ödeme miktarını girin ve ilgili bankayı seçin.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="bankSelect">Banka Seçin</Label>
                  <Select onValueChange={(v) => setSelectedBankId(Number(v))}>
                    <SelectTrigger id="bankSelect">
                      <SelectValue placeholder="Banka seçin..." />
                    </SelectTrigger>
                    <SelectContent>
                      {banks?.map((bank) => (
                        <SelectItem key={bank.id} value={bank.id.toString()}>
                          {bank.name} (Kalan: ₺{Number(bank.totalDebt).toLocaleString()})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="amount">Ödeme Tutarı (₺)</Label>
                  <Input
                    id="amount"
                    type="number"
                    placeholder="0.00"
                    value={extraPaymentAmount}
                    onChange={(e) => setExtraPaymentAmount(e.target.value)}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsExtraPaymentOpen(false)}>İptal</Button>
                <Button onClick={handleExtraPayment} className="bg-indigo-600">Ödemeyi Kaydet</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      )}

      {isLoading ? (
        <div className="text-center py-12">Yükleniyor...</div>
      ) : banks?.length === 0 ? (
        <div className="text-center py-16 border-2 border-dashed border-border rounded-2xl bg-muted/10">
          <Landmark className="w-12 h-12 mx-auto text-muted-foreground/50 mb-4" />
          <h3 className="text-lg font-medium">Henüz banka eklenmemiş</h3>
          <p className="text-muted-foreground mb-4">Takip etmek için bir kredi kartı veya kredi ekleyin.</p>
          <Link href="/banks/add">
            <Button variant="outline">İlk Bankayı Ekle</Button>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {banks?.map((bank) => (
            <Card key={bank.id} className="border-border/50 shadow-md hover:shadow-lg transition-all group">
              <CardHeader className="pb-4">
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-lg">{bank.name}</CardTitle>
                    <CardDescription>{bank.debtType}</CardDescription>
                  </div>
                  <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
                    <Landmark className="w-5 h-5" />
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4 pb-4">
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Toplam Borç</p>
                  <p className="text-2xl font-bold text-foreground font-mono">
                    ₺{Number(bank.totalDebt).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </p>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-muted-foreground">Faiz Oranı</p>
                    <p className="font-medium">{bank.interestRate}% <span className="text-[10px] text-muted-foreground">({bank.interestType})</span></p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Asgari Ödeme</p>
                    <p className="font-medium text-rose-600">
                      {bank.minPaymentType === "percentage" ? `%${bank.minPaymentAmount}` : `₺${Number(bank.minPaymentAmount).toLocaleString()}`}
                    </p>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="pt-2 flex justify-between border-t border-border/50 bg-muted/20">
                 <div className="flex items-center gap-1">
                   <Button
                     variant="ghost"
                     size="sm"
                     className="text-muted-foreground hover:text-indigo-600"
                     onClick={() => setLocation(`/banks/add?edit=${bank.id}`)}
                   >
                     <Edit2 className="w-4 h-4" />
                   </Button>
                   <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-red-600">
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>{bank.name} silinsin mi?</AlertDialogTitle>
                        <AlertDialogDescription>Bu işlem bankayı ve tüm ödeme geçmişini kaldıracaktır.</AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>İptal</AlertDialogCancel>
                        <AlertDialogAction onClick={() => handleDelete(bank.id)} className="bg-red-600">Sil</AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>

                <Link href={`/banks/${bank.id}/plan`}>
                  <Button variant="secondary" size="sm" className="group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                    Planı Gör
                    <ExternalLink className="w-3 h-3 ml-2" />
                  </Button>
                </Link>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </Layout>
  );
}
