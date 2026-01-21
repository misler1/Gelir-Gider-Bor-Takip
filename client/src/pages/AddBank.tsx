import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Layout } from "@/components/Layout";
import { useCreateBank, useBanks, useUpdateBank } from "@/hooks/use-banks";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Loader2, Save } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function AddBank() {
  const [_, setLocation] = useLocation();
  const { toast } = useToast();
  const searchParams = new URLSearchParams(window.location.search);
  const editId = searchParams.get("edit");

  const { mutate: createBank, isPending: isCreating } = useCreateBank();
  const { mutate: updateBank, isPending: isUpdating } = useUpdateBank();
  const isPending = isCreating || isUpdating;

  const { data: banks } = useBanks();
  const editingBank = banks?.find(b => b.id === Number(editId));

  // Form State
  const [name, setName] = useState("");
  const [debtType, setDebtType] = useState("Credit Card");
  const [totalDebt, setTotalDebt] = useState("");
  const [interestRate, setInterestRate] = useState("");
  const [interestType, setInterestType] = useState("Monthly");
  const [minPaymentType, setMinPaymentType] = useState("amount");
  const [minPayment, setMinPayment] = useState("");
  const [paymentDueDay, setPaymentDueDay] = useState("5");
  const [isActive, setIsActive] = useState(true);

  // Load editing data
  useEffect(() => {
    if (editingBank) {
      setName(editingBank.name);
      setDebtType(editingBank.debtType);
      setTotalDebt(editingBank.totalDebt);
      setInterestRate(editingBank.interestRate);
      setInterestType(editingBank.interestType);
      setMinPaymentType(editingBank.minPaymentType || "amount");
      setMinPayment(editingBank.minPaymentAmount);
      setPaymentDueDay(String(editingBank.paymentDueDay));
      setIsActive(editingBank.isActive || false);
    }
  }, [editingBank]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !totalDebt || !interestRate || !minPayment) {
      toast({ title: "Error", description: "Please fill all required fields", variant: "destructive" });
      return;
    }

    const payload = {
      name,
      debtType,
      totalDebt,
      interestRate,
      interestType,
      minPaymentType,
      minPaymentAmount: minPayment,
      paymentDueDay: parseInt(paymentDueDay),
      isActive
    };

    if (editId) {
      updateBank({ id: Number(editId), ...payload }, {
        onSuccess: () => {
          toast({ title: "Bank Updated" });
          setLocation("/banks");
        },
        onError: (err: any) => toast({ title: "Error", description: err.message, variant: "destructive" })
      });
    } else {
      createBank(payload, {
        onSuccess: () => {
          toast({ title: "Bank Added" });
          setLocation("/banks");
        }
      });
    }
  };

  return (
    <Layout>
      <div className="flex items-center gap-4 mb-6">
        <Button variant="ghost" size="icon" onClick={() => setLocation("/banks")}>
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <h1 className="text-2xl font-bold font-display">{editId ? 'Banka / Borç Düzenle' : 'Banka / Borç Ekle'}</h1>
      </div>

      <div className="max-w-2xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle>Banka Bilgileri</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="name">Banka Adı</Label>
                <Input id="name" value={name} onChange={e => setName(e.target.value)} placeholder="Örn: Garanti BBVA" />
              </div>
              
              <div className="space-y-2">
                <Label>Tür</Label>
                <Select value={debtType} onValueChange={setDebtType}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Credit Card">Kredi Kartı</SelectItem>
                    <SelectItem value="Overdraft">Kredili Mevduat Hesabı (KMH)</SelectItem>
                    <SelectItem value="KMH">KMH</SelectItem>
                    <SelectItem value="Flexible Account">Esnek Hesap</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="debt">Toplam Borç Tutarı</Label>
                <Input type="number" id="debt" value={totalDebt} onChange={e => setTotalDebt(e.target.value)} placeholder="0.00" />
              </div>

              <div className="space-y-2">
                <Label htmlFor="minPayment">Minimum Aylık Ödeme</Label>
                <div className="flex gap-2">
                  <Input 
                    type="number" 
                    id="minPayment" 
                    value={minPayment} 
                    onChange={e => setMinPayment(e.target.value)} 
                    placeholder="0.00" 
                    className="flex-1"
                  />
                  <Select value={minPaymentType} onValueChange={setMinPaymentType}>
                    <SelectTrigger className="w-[100px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="amount">₺</SelectItem>
                      <SelectItem value="percentage">%</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="interest">Faiz Oranı (%)</Label>
                <Input type="number" id="interest" value={interestRate} onChange={e => setInterestRate(e.target.value)} placeholder="Örn: 4.25" />
              </div>

              <div className="space-y-2">
                <Label>Faiz Dönemi</Label>
                <Select value={interestType} onValueChange={setInterestType}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Daily">Günlük</SelectItem>
                    <SelectItem value="Monthly">Aylık</SelectItem>
                  </SelectContent>
                </Select>
              </div>

               <div className="space-y-2">
                <Label htmlFor="dueDay">Ödeme Günü (Ayın Kaçı?)</Label>
                <Input type="number" min="1" max="31" id="dueDay" value={paymentDueDay} onChange={e => setPaymentDueDay(e.target.value)} />
              </div>

              <div className="flex items-center justify-between pt-6">
                <Label>Aktif Durum</Label>
                <Switch checked={isActive} onCheckedChange={setIsActive} />
              </div>
            </div>

            <Button onClick={handleSubmit} className="w-full mt-6" disabled={isPending}>
              {isPending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />}
              Bankayı Kaydet
            </Button>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
