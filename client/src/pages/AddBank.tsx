import { useState } from "react";
import { useLocation } from "wouter";
import { Layout } from "@/components/Layout";
import { useCreateBank } from "@/hooks/use-banks";
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
  const { mutate: createBank, isPending } = useCreateBank();

  // Form State
  const [name, setName] = useState("");
  const [debtType, setDebtType] = useState("Credit Card");
  const [totalDebt, setTotalDebt] = useState("");
  const [interestRate, setInterestRate] = useState("");
  const [interestType, setInterestType] = useState("Monthly");
  const [minPayment, setMinPayment] = useState("");
  const [paymentDueDay, setPaymentDueDay] = useState("5");
  const [isActive, setIsActive] = useState(true);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !totalDebt || !interestRate || !minPayment) {
      toast({ title: "Error", description: "Please fill all required fields", variant: "destructive" });
      return;
    }

    createBank({
      name,
      debtType,
      totalDebt: parseFloat(totalDebt),
      interestRate: parseFloat(interestRate),
      interestType,
      minPaymentAmount: parseFloat(minPayment),
      paymentDueDay: parseInt(paymentDueDay),
      isActive
    }, {
      onSuccess: () => {
        toast({ title: "Bank Added" });
        setLocation("/banks");
      }
    });
  };

  return (
    <Layout>
      <div className="flex items-center gap-4 mb-6">
        <Button variant="ghost" size="icon" onClick={() => setLocation("/banks")}>
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <h1 className="text-2xl font-bold font-display">Add Bank / Debt</h1>
      </div>

      <div className="max-w-2xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle>Bank Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="name">Bank Name</Label>
                <Input id="name" value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Chase Sapphire" />
              </div>
              
              <div className="space-y-2">
                <Label>Type</Label>
                <Select value={debtType} onValueChange={setDebtType}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Credit Card">Credit Card</SelectItem>
                    <SelectItem value="Overdraft">Overdraft</SelectItem>
                    <SelectItem value="KMH">KMH</SelectItem>
                    <SelectItem value="Flexible Account">Flexible Account</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="debt">Total Debt Amount</Label>
                <Input type="number" id="debt" value={totalDebt} onChange={e => setTotalDebt(e.target.value)} placeholder="0.00" />
              </div>

              <div className="space-y-2">
                <Label htmlFor="minPayment">Minimum Monthly Payment</Label>
                <Input type="number" id="minPayment" value={minPayment} onChange={e => setMinPayment(e.target.value)} placeholder="0.00" />
              </div>

              <div className="space-y-2">
                <Label htmlFor="interest">Interest Rate (%)</Label>
                <Input type="number" id="interest" value={interestRate} onChange={e => setInterestRate(e.target.value)} placeholder="e.g. 19.99" />
              </div>

              <div className="space-y-2">
                <Label>Interest Period</Label>
                <Select value={interestType} onValueChange={setInterestType}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Daily">Daily</SelectItem>
                    <SelectItem value="Monthly">Monthly</SelectItem>
                  </SelectContent>
                </Select>
              </div>

               <div className="space-y-2">
                <Label htmlFor="dueDay">Payment Due Day</Label>
                <Input type="number" min="1" max="31" id="dueDay" value={paymentDueDay} onChange={e => setPaymentDueDay(e.target.value)} />
              </div>

              <div className="flex items-center justify-between pt-6">
                <Label>Active Status</Label>
                <Switch checked={isActive} onCheckedChange={setIsActive} />
              </div>
            </div>

            <Button onClick={handleSubmit} className="w-full mt-6" disabled={isPending}>
              {isPending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />}
              Save Bank
            </Button>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
