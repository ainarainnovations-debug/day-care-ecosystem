import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { ArrowLeft, ChevronDown, ChevronUp, FileText, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface ParentBillingProps {
  onBack?: () => void;
}

interface Invoice {
  id: string;
  amount: number;
  status: string;
  due_date: string | null;
  paid_at: string | null;
  period_start: string | null;
  period_end: string | null;
  created_at: string;
}

const ParentBilling = ({ onBack }: ParentBillingProps) => {
  const { user } = useAuth();
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    supabase
      .from("invoices")
      .select("*")
      .eq("parent_id", user.id)
      .order("created_at", { ascending: false })
      .then(({ data }) => {
        setInvoices((data as Invoice[]) || []);
        setLoading(false);
      });
  }, [user]);

  const totalBalance = invoices
    .filter((i) => i.status !== "paid")
    .reduce((sum, i) => sum + Number(i.amount), 0);

  const pendingCount = invoices.filter((i) => i.status === "sent" || i.status === "draft").length;

  const formatDate = (d: string | null) => {
    if (!d) return "—";
    return new Date(d).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
  };

  // Mock data if no invoices
  const displayInvoices = invoices.length > 0 ? invoices : [
    { id: "1", amount: 1000, status: "overdue", due_date: "2025-07-01", paid_at: null, period_start: null, period_end: null, created_at: "2025-07-01" },
    { id: "2", amount: 1450.50, status: "paid", due_date: "2025-06-27", paid_at: "2025-06-27", period_start: null, period_end: null, created_at: "2025-06-27" },
    { id: "3", amount: 1450.50, status: "paid", due_date: "2025-06-01", paid_at: "2025-06-01", period_start: null, period_end: null, created_at: "2025-06-01" },
    { id: "4", amount: 1450.50, status: "paid", due_date: "2025-05-27", paid_at: "2025-05-27", period_start: null, period_end: null, created_at: "2025-05-27" },
    { id: "5", amount: 1450.50, status: "paid", due_date: "2025-05-01", paid_at: "2025-05-01", period_start: null, period_end: null, created_at: "2025-05-01" },
  ];

  const displayBalance = invoices.length > 0 ? totalBalance : 123345;
  const displayPending = invoices.length > 0 ? pendingCount : 50;

  return (
    <div className="px-4 pt-4">

      {/* Balance Card */}
      <div className="bg-primary/10 rounded-2xl p-5 mb-4">
        <span className="text-xs text-muted-foreground">current balance</span>
        <div className="flex items-end justify-between mt-1 mb-4">
          <span className="font-heading text-3xl font-bold text-foreground">${displayBalance.toLocaleString("en-US", { minimumFractionDigits: 2 })}</span>
          <Badge className="bg-primary/20 text-primary text-xs">Pending ${displayPending}</Badge>
        </div>
        <Button className="w-full bg-primary text-primary-foreground rounded-xl py-3 text-base font-semibold">
          Pay Now ●
        </Button>
        <div className="flex gap-3 mt-3">
          <Button variant="outline" className="flex-1 text-xs rounded-lg">
            <FileText className="w-3 h-3 mr-1" /> Statement
          </Button>
          <Button variant="outline" className="flex-1 text-xs rounded-lg">
            <FileText className="w-3 h-3 mr-1" /> Tax Statement
          </Button>
        </div>
      </div>

      {/* Payments History */}
      <div className="bg-popover rounded-xl border border-border overflow-hidden mb-6">
        <div className="p-4 border-b border-border">
          <h3 className="font-heading font-semibold text-foreground">Payments History</h3>
        </div>
        <div className="divide-y divide-border">
          {displayInvoices.map((inv) => (
            <div key={inv.id}>
              <button
                onClick={() => setExpandedId(expandedId === inv.id ? null : inv.id)}
                className="w-full p-4 flex items-center justify-between"
              >
                <div className="text-left">
                  <div className="font-semibold text-sm text-foreground">{formatDate(inv.due_date || inv.created_at)}</div>
                  <div className="text-xs text-muted-foreground">{inv.status === "paid" ? "Full Amount" : "Direction Deposit"}</div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge className={`text-xs ${inv.status === "overdue" ? "bg-destructive/10 text-destructive" : "bg-accent/10 text-accent"}`}>
                    ${Number(inv.amount).toLocaleString("en-US", { minimumFractionDigits: 2 })}
                  </Badge>
                  {expandedId === inv.id ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
                </div>
              </button>
              {expandedId === inv.id && (
                <div className="px-4 pb-4 bg-secondary/30">
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Invoice</span>
                      <Button variant="outline" size="sm" className="h-7 text-xs">
                        <Download className="w-3 h-3 mr-1" /> Download PDF
                      </Button>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Type</span>
                      <span className="text-foreground font-medium">Direction Deposit</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Description</span>
                      <span className="text-foreground font-medium">Direction Deposit</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Amount</span>
                      <Badge className="bg-accent/10 text-accent text-xs">${Number(inv.amount).toLocaleString("en-US", { minimumFractionDigits: 2 })}</Badge>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ParentBilling;
