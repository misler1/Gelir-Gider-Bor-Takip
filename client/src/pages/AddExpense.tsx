import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Layout } from "@/components/Layout";
import { useCreateExpense, useUpdateExpense, useExpenses } from "@/hooks/use-expenses";
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

export default function AddExpense() {
  const [_, setLocation] = useLocation();
  const { toast } = useToast();
  const searchParams = new URLSearchParams(window.location.search);
  const editId = searchParams.get("edit");

  const { mutate: createExpense, isPending: isCreating } = useCreateExpense();
  const { mutate: updateExpense, isPending: isUpdating } = useUpdateExpense();
  const isPending = isCreating || isUpdating;
  const { data: expenses } = useExpenses();
  const editingExpense = expenses?.find(e => e.id === Number(editId));

  // Form State
  const [name, setName] = useState("");
  const [amount, setAmount] = useState("");
  const [date, setDate] = useState(format(new Date(), "yyyy-MM-dd"));
  const [isRecurring, setIsRecurring] = useState(false);
  const [frequency, setFrequency] = useState<"weekly" | "monthly" | "yearly">("monthly");
  const [endDate, setEndDate] = useState<string>("");
  
  // Generated Schedule State
  const [schedule, setSchedule] = useState<ScheduleEntry[]>([]);

  // Load editing data
  useEffect(() => {
    if (editingExpense) {
      setName(editingExpense.name);
      setAmount(editingExpense.amount);
      setDate(format(new Date(editingExpense.date), "yyyy-MM-dd"));
      setIsRecurring(editingExpense.isRecurring || false);
      if (editingExpense.frequency) setFrequency(editingExpense.frequency as any);
      
      if (editingExpense.monthlySchedule) {
        setSchedule((editingExpense.monthlySchedule as any[]).map(s => ({
          date: format(new Date(s.date), "yyyy-MM-dd"),
          amount: s.amount
        })));
      }
    }
  }, [editingExpense]);

  // Generate schedule when inputs change
  useEffect(() => {
    if (editId && editingExpense) return;
    if (!amount || !date) {
      setSchedule([]);
      return;
    }

    const newSchedule: ScheduleEntry[] = [];
    let currentDate = new Date(date);
    const stopDate = endDate ? new Date(endDate) : addMonths(new Date(date), 24);
    
    let iterations = 0;
    while (currentDate <= stopDate && iterations < 100) {
      newSchedule.push({
        date: format(currentDate, "yyyy-MM-dd"),
        amount: amount
      });

      if (!isRecurring) break;

      if (frequency === "weekly") currentDate = addDays(currentDate, 7);
      else if (frequency === "monthly") currentDate = addMonths(currentDate, 1);
      else if (frequency === "yearly") currentDate = addYears(currentDate, 1);
      
      iterations++;
    }

    setSchedule(newSchedule);
  }, [amount, date, isRecurring, frequency, endDate, editId, editingExpense]);

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
      amount: String(amount),
      date: new Date(date), 
      isRecurring,
      frequency: isRecurring ? frequency : null,
      monthlySchedule: schedule.map(s => ({
        month: format(new Date(s.date), "yyyy-MM"),
        date: new Date(s.date).toISOString(),
        amount: String(s.amount),
        paid: false
      }))
    };

    if (editId) {
      updateExpense({ id: Number(editId), ...payload }, {
        onSuccess: () => {
          toast({ title: "Success", description: "Expense updated successfully" });
          setLocation("/expenses");
        },
        onError: (err: any) => toast({ title: "Error", description: err.message, variant: "destructive" })
      });
    } else {
      createExpense(payload, {
        onSuccess: () => {
          toast({ title: "Success", description: "Expense created successfully" });
          setLocation("/expenses");
        },
        onError: (err: any) => toast({ title: "Error", description: err.message, variant: "destructive" })
      });
    }
  };

  return (
    <Layout>
      <div className="flex items-center gap-4 mb-6">
        <Button variant="ghost" size="icon" onClick={() => setLocation("/expenses")}>
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <h1 className="text-2xl font-bold font-display">{editId ? 'Edit Expense' : 'Add Expense'}</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1 space-y-6">
          <Card className="border-border/50 shadow-sm">
            <CardHeader>
              <CardTitle>Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Expense Name</Label>
                <Input 
                  id="name" 
                  placeholder="e.g. Rent, Netflix" 
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
                <Label htmlFor="recurring" className="cursor-pointer">Recurring?</Label>
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

              {isRecurring && (
                <div className="space-y-2 animate-in slide-in-from-top-2 fade-in">
                  <Label htmlFor="endDate">End Date (Optional)</Label>
                  <Input 
                    id="endDate" 
                    type="date" 
                    value={endDate} 
                    onChange={(e) => setEndDate(e.target.value)} 
                  />
                  <p className="text-[10px] text-muted-foreground">Empty means 24 months projection.</p>
                </div>
              )}

              <Button 
                onClick={handleSubmit} 
                disabled={isPending}
                className="w-full mt-4 bg-rose-600 hover:bg-rose-700 text-white"
              >
                {isPending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />}
                Save Expense
              </Button>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-2">
          <Card className="border-border/50 shadow-sm h-full">
            <CardHeader>
              <CardTitle>Expense Projection</CardTitle>
              <p className="text-sm text-muted-foreground">
                Review payment dates and amounts.
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
                        <th className="px-4 py-3 text-left font-medium text-muted-foreground">Due Date</th>
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
