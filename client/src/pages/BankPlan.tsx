import { useParams, Link } from "wouter";
import { Layout } from "@/components/Layout";
import { useBanks } from "@/hooks/use-banks";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

export default function BankPlan() {
  const { id } = useParams();
  const { data: banks } = useBanks();
  const bank = banks?.find(b => b.id === Number(id));

  if (!bank) return <div className="p-8">Bank not found</div>;

  return (
    <Layout>
      <div className="flex items-center gap-4 mb-6">
        <Link href="/banks">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="w-5 h-5" />
          </Button>
        </Link>
        <h1 className="text-2xl font-bold font-display">Payment Plan: {bank.name}</h1>
      </div>

      <div className="p-8 border-2 border-dashed border-border rounded-xl bg-muted/20 text-center">
        <p className="text-muted-foreground">
          Waterfall payment calculation logic goes here based on implementation notes.
          (Placeholder for future complexity)
        </p>
        <p className="mt-4 font-mono text-sm">
          Debt: ${Number(bank.totalDebt).toFixed(2)} | Rate: {bank.interestRate}% ({bank.interestType})
        </p>
      </div>
    </Layout>
  );
}
