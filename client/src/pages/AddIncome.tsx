import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Layout } from "@/components/Layout";
import { useCreateIncome, useUpdateIncome, useIncomes } from "@/hooks/use-incomes";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { addDays, addMonths, addYears, format } from "date-fns";
import { Loader2, Save, ArrowLeft } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface ScheduleEntry {
  date: string;
  amount: string;
}

export default function AddIncome() {
  const [_, setLocation] = useLocation();
  const { toast } = useToast();
  const searchParams = new URLSearchParams(window.location.search);
  const editId = searchParams.get("edit");
  
  const { mutate: createIncome, isPending: isCreating } = useCreateIncome();
  const { mutate: updateIncome, isPending: isUpdating } = useUpdateIncome();
  const isPending = isCreating || isUpdating;
  const { data: incomes } = useIncomes();
  const editingIncome = incomes?.find(i => i.id === Number(editId));

  // Form State
  const [name, setName] = useState("");
  const [amount, setAmount] = useState("");
  const [date, setDate] = useState(format(new Date(), "yyyy-MM-dd"));
  const [isRecurring, setIsRecurring] = useState(false);
  const [frequency, setFrequency] = useState<"weekly" | "monthly" | "yearly">("monthly");
  
  // Generated Schedule State
  const [schedule, setSchedule] = useState<ScheduleEntry[]>([]);

  // Load editing data
  useEffect(() => {
    if (editingIncome) {
      setName(editingIncome.name);
      setAmount(editingIncome.baseAmount);
      setDate(format(new Date(editingIncome.baseDate), "yyyy-MM-dd"));
      setIsRecurring(editingIncome.isRecurring || false);
      if (editingIncome.frequency) setFrequency(editingIncome.frequency as any);
      
      if (editingIncome.monthlySchedule) {
        setSchedule((editingIncome.monthlySchedule as any[]).map(s => ({
          date: format(new Date(s.date), "yyyy-MM-dd"),
          amount: s.amount
        })));
      }
    }
  }, [editingIncome]);

  // Generate schedule when inputs change (only if not editing or if inputs changed)
  useEffect(() => {
    if (editId && editingIncome) return; // Don't auto-regenerate if editing existing
    if (!amount || !date) {
      setSchedule([]);
      return;
    }

    const newSchedule: ScheduleEntry[] = [];
    let currentDate = new Date(date);
    const numEntries = isRecurring ? 24 : 1; 

    for (let i = 0; i < numEntries; i++) {
      newSchedule.push({
        date: format(currentDate, "yyyy-MM-dd"),
        amount: amount
      });

      if (!isRecurring) break;

      if (frequency === "weekly") currentDate = addDays(currentDate, 7);
      if (frequency === "monthly") currentDate = addMonths(currentDate, 1);
      if (frequency === "yearly") currentDate = addYears(currentDate, 1);
    }

    setSchedule(newSchedule);
  }, [amount, date, isRecurring, frequency, editId, editingIncome]);

  const handleScheduleChange = (index: number, field: keyof ScheduleEntry, value: string) => {
    const updated = [...schedule];
    updated[index] = { ...updated[index], [field]: value };
    setSchedule(updated);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !amount || !date) {
      toast({ title: "Validation Error", description: "Please fill in all required fields", variant: "destructive" });
      return;
    }

    const payload = {
      name,
      baseAmount: String(amount),
      baseDate: new Date(date).toISOString(),
      isRecurring,
      frequency: isRecurring ? frequency : null,
      monthlySchedule: schedule.map(s => ({
        month: format(new Date(s.date), "yyyy-MM"),
        date: new Date(s.date).toISOString(),
        amount: String(s.amount),
        approved: false
      }))
    };

    if (editId) {
      updateIncome({ id: Number(editId), ...payload }, {
        onSuccess: () => {
          toast({ title: "Success", description: "Income updated successfully" });
          setLocation("/income");
        },
        onError: (err) => toast({ title: "Error", description: err.message, variant: "destructive" })
      });
    } else {
      createIncome(payload, {
        onSuccess: () => {
          toast({ title: "Success", description: "Income created successfully" });
          setLocation("/income");
        },
        onError: (err) => toast({ title: "Error", description: err.message, variant: "destructive" })
      });
    }
  };

  return (
    <Layout>
      <div className="flex items-center gap-4 mb-6">
        <Button variant="ghost" size="icon" onClick={() => setLocation("/income")}>
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <h1 className="text-2xl font-bold font-display">{editId ? 'Edit Income Source' : 'Add Income Source'}</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Configuration */}
        <div className="lg:col-span-1 space-y-6">
          <Card className="border-border/50 shadow-sm">
            <CardHeader>
              <CardTitle>Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Income Name</Label>
                <Input 
                  id="name" 
                  placeholder="e.g. Salary, Dividend" 
                  value={name} 
                  onChange={(e) => setName(e.target.value)} 
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="amount">Default Amount</Label>
                <Input 
                  id="amount" 
                  type="number" 
                  placeholder="0.00" 
                  value={amount} 
                  onChange={(e) => setAmount(e.target.value)} 
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="date">Start Date</Label>
                <Input 
                  id="date" 
                  type="date" 
                  value={date} 
                  onChange={(e) => setDate(e.target.value)} 
                />
              </div>

              <div className="flex items-center justify-between py-2 border-t border-border mt-4">
                <Label htmlFor="recurring" className="cursor-pointer">Recurring Income?</Label>
                <Switch 
                  id="recurring" 
                  checked={isRecurring} 
                  onCheckedChange={setIsRecurring} 
                />
              </div>

              {isRecurring && (
                <div className="space-y-2 animate-in slide-in-from-top-2 fade-in">
                  <Label>Frequency</Label>
                  <Select value={frequency} onValueChange={(v: any) => setFrequency(v)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="weekly">Weekly</SelectItem>
                      <SelectItem value="monthly">Monthly</SelectItem>
                      <SelectItem value="yearly">Yearly</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}

              <Button 
                onClick={handleSubmit} 
                disabled={isPending}
                className="w-full mt-4 bg-emerald-600 hover:bg-emerald-700 text-white"
              >
                {isPending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />}
                Save Income
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Schedule Preview */}
        <div className="lg:col-span-2">
          <Card className="border-border/50 shadow-sm h-full">
            <CardHeader>
              <CardTitle>Projection Schedule</CardTitle>
              <p className="text-sm text-muted-foreground">
                Review and edit the generated entries. These will be created as individual records.
              </p>
            </CardHeader>
            <CardContent>
              {schedule.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground border-2 border-dashed border-border/50 rounded-xl">
                  Fill in the details to generate a schedule.
                </div>
              ) : (
                <div className="border rounded-xl overflow-hidden max-h-[600px] overflow-y-auto custom-scrollbar">
                  <table className="w-full text-sm">
                    <thead className="bg-muted/50 sticky top-0 z-10">
                      <tr>
                        <th className="px-4 py-3 text-left font-medium text-muted-foreground">#</th>
                        <th className="px-4 py-3 text-left font-medium text-muted-foreground">Date</th>
                        <th className="px-4 py-3 text-right font-medium text-muted-foreground">Amount</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {schedule.map((entry, idx) => (
                        <tr key={idx} className="hover:bg-muted/30 transition-colors">
                          <td className="px-4 py-3 text-muted-foreground w-12">{idx + 1}</td>
                          <td className="px-4 py-2">
                            <Input 
                              type="date" 
                              value={entry.date} 
                              onChange={(e) => handleScheduleChange(idx, "date", e.target.value)}
                              className="h-8 w-full bg-transparent border-transparent hover:border-input focus:border-input transition-all"
                            />
                          </td>
                          <td className="px-4 py-2">
                             <Input 
                              type="number" 
                              value={entry.amount} 
                              onChange={(e) => handleScheduleChange(idx, "amount", e.target.value)}
                              className="h-8 w-full text-right bg-transparent border-transparent hover:border-input focus:border-input transition-all font-mono"
                            />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
}
