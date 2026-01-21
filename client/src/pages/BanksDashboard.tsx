import { useState } from "react";
import { Link } from "wouter";
import { useBanks, useDeleteBank } from "@/hooks/use-banks";
import { Layout } from "@/components/Layout";
import { useLocation } from "wouter";
import { Plus, Landmark, Trash2, ExternalLink, Edit2, TrendingDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";

export default function BanksDashboard() {
  const [_, setLocation] = useLocation();
  const { data: banks, isLoading } = useBanks();
  const { mutate: deleteBank } = useDeleteBank();
  const { toast } = useToast();

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

  const handleDelete = (id: number) => {
    deleteBank(id, {
      onSuccess: () => toast({ title: "Bank deleted" }),
      onError: () => toast({ title: "Error", variant: "destructive" }),
    });
  };

  return (
    <Layout>
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold font-display text-foreground">Banks & Debts</h1>
          <p className="text-muted-foreground mt-1">Manage credit cards, loans, and payments.</p>
        </div>
        
        <Link href="/banks/add">
          <Button className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-600/20">
            <Plus className="w-4 h-4 mr-2" />
            Add Bank/Debt
          </Button>
        </Link>
      </div>

      {!isLoading && banks && banks.length > 0 && (
        <Card className="mb-8 border-indigo-100 bg-indigo-50/30 dark:bg-indigo-950/10">
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
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
              <div className="text-center md:text-right">
                <p className="text-xs text-muted-foreground uppercase tracking-widest font-semibold">Aktif Borç Hesabı</p>
                <p className="text-sm font-medium">{banks.length} Banka / Hesap</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {isLoading ? (
        <div className="text-center py-12">Loading...</div>
      ) : banks?.length === 0 ? (
        <div className="text-center py-16 border-2 border-dashed border-border rounded-2xl bg-muted/10">
          <Landmark className="w-12 h-12 mx-auto text-muted-foreground/50 mb-4" />
          <h3 className="text-lg font-medium">No banks added yet</h3>
          <p className="text-muted-foreground mb-4">Add a credit card, overdraft, or loan to start tracking.</p>
          <Link href="/banks/add">
            <Button variant="outline">Add First Bank</Button>
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
                  <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Total Debt</p>
                  <p className="text-2xl font-bold text-foreground font-mono">
                    ₺{Number(bank.totalDebt).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </p>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-muted-foreground">Interest Rate</p>
                    <p className="font-medium">{bank.interestRate}% <span className="text-[10px] text-muted-foreground">({bank.interestType})</span></p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Min Payment</p>
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
                        <AlertDialogTitle>Delete {bank.name}?</AlertDialogTitle>
                        <AlertDialogDescription>This will remove the bank and all payment history.</AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={() => handleDelete(bank.id)} className="bg-red-600">Delete</AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>

                <Link href={`/banks/${bank.id}/plan`}>
                  <Button variant="secondary" size="sm" className="group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                    View Plan
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
