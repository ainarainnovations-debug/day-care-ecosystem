import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { CreditCard, DollarSign, Clock, CheckCircle, AlertCircle, TrendingUp, Settings, Bell, Info, LayoutDashboard, Calendar, Baby, Activity, Wallet, CalendarClock, Timer, KeyRound, Inbox, PencilLine, Rocket, Users } from 'lucide-react';
import Navbar from '@/components/Navbar';
import { useNavigate } from 'react-router-dom';

const sidebarItems = [
  { id: "today", label: "Today", icon: LayoutDashboard, path: "/provider/dashboard" },
  { id: "capacity", label: "Capacity", icon: Users, path: "/provider/capacity" },
  { id: "payments", label: "Payments", icon: DollarSign, path: "/provider/payments" },
  { id: "schedule", label: "Schedule", icon: Calendar, path: "/provider/dashboard" },
  { id: "children", label: "Children", icon: Baby, path: "/provider/dashboard" },
  { id: "activity", label: "Log Activity", icon: Activity, path: "/provider/dashboard" },
  { id: "billing", label: "Billing", icon: Wallet, path: "/provider/dashboard" },
  { id: "availability", label: "Availability", icon: CalendarClock, path: "/provider/dashboard" },
  { id: "timelabor", label: "Time & Labor", icon: Timer, path: "/provider/dashboard" },
  { id: "settings", label: "Settings", icon: Settings, path: "/provider/dashboard" },
];

export default function PaymentDashboard() {
  const navigate = useNavigate();
  
  // Mock data for demonstration
  const stats = {
    totalCollected: 45600,
    pendingPayments: 12800,
    autopayRate: 82,
    averageCollectionTime: 2.3
  };

  const paymentMethods = [
    { type: 'ACH Bank Transfer', fee: '0.8%', recommended: true, icon: '🏦', description: 'Lowest fees, best for recurring' },
    { type: 'Debit/Credit Card', fee: '2.9% + $0.30', recommended: false, icon: '💳', description: 'Standard card processing' },
    { type: 'FSA/HSA Card', fee: '2.9% + $0.30', recommended: false, icon: '🏥', description: 'Dependent care cards accepted' }
  ];

  const recentPayments = [
    { id: '1', parent: 'Sarah Johnson', amount: 1200, method: 'ACH', fee: 9.60, net: 1190.40, status: 'succeeded', autopay: true, time: '2 min ago' },
    { id: '2', parent: 'Michael Chen', amount: 600, method: 'Card', fee: 17.70, net: 582.30, status: 'succeeded', autopay: false, time: '1 hour ago' },
    { id: '3', parent: 'Emily Davis', amount: 1200, method: 'ACH', fee: 9.60, net: 1190.40, status: 'succeeded', autopay: true, time: '3 hours ago' },
    { id: '4', parent: 'James Wilson', amount: 450, method: 'FSA', fee: 13.35, net: 436.65, status: 'processing', autopay: false, time: '5 hours ago' }
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="flex">
        {/* Left sidebar */}
        <aside className="w-64 min-h-[calc(100vh-64px)] bg-popover border-r border-border p-4 flex-shrink-0 hidden md:flex flex-col gap-1">
          <div className="mb-4 px-3">
            <h2 className="font-heading text-lg font-bold text-foreground flex items-center gap-2">
              <LayoutDashboard className="w-5 h-5 stroke-[2.25]" /> Provider
            </h2>
            <p className="text-xs text-muted-foreground">Sunshine Home Daycare</p>
          </div>
          {sidebarItems.map((item) => {
            const SideIcon = item.icon;
            const isActive = item.id === "payments";
            return (
              <Tooltip key={item.id}>
                <TooltipTrigger asChild>
                  <button
                    onClick={() => navigate(item.path)}
                    className={`group flex items-center gap-3 px-3 py-2.5 rounded-xl text-left text-sm font-body transition-all duration-200 w-full relative ${
                      isActive
                        ? "bg-primary/10 text-primary font-semibold"
                        : "text-muted-foreground hover:bg-secondary hover:text-foreground hover:translate-x-1"
                    }`}
                  >
                    {isActive && (
                      <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 bg-primary rounded-r-full" />
                    )}
                    <SideIcon className={`w-[18px] h-[18px] flex-shrink-0 transition-transform duration-200 group-hover:scale-110 ${isActive ? "stroke-[2.5]" : "stroke-[2.25] group-hover:stroke-[2.5]"}`} />
                    {item.label}
                  </button>
                </TooltipTrigger>
                <TooltipContent side="right" className="text-xs">
                  {item.label}
                </TooltipContent>
              </Tooltip>
            );
          })}
        </aside>

        {/* Main content */}
        <main className="flex-1 p-6 md:p-8 max-w-5xl animate-fade-in">
        
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="font-heading text-xl md:text-2xl font-bold text-foreground flex items-center gap-2">
              <DollarSign className="w-6 h-6 stroke-[2.25]" />
              Payment Collection
            </h1>
            <p className="text-sm text-muted-foreground mt-0.5">Multiple methods, fully tracked, instant confirmation</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm">
              <Settings className="w-4 h-4" />
            </Button>
            <Button variant="outline" size="sm" className="relative">
              <Bell className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Info Banner */}
        <div className="bg-light-coral/30 rounded-xl border border-primary/20 p-5 mb-6">
          <div className="flex items-start gap-3">
            <Info className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm text-foreground">
                <strong>Platform shows director the net amount after fees</strong> — Parents pay their way (ACH, card, FSA/HSA), 
                you see exactly what you'll receive. 82% of families on autopay means near-zero collections work!
              </p>
            </div>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-popover rounded-xl border border-border p-4">
            <div className="flex items-center gap-2 mb-2">
              <DollarSign className="w-5 h-5 text-primary" />
              <span className="text-sm text-muted-foreground">Total Collected</span>
            </div>
            <div className="text-2xl font-bold text-foreground">${stats.totalCollected.toLocaleString()}</div>
            <div className="text-xs text-muted-foreground">This month</div>
          </div>

          <div className="bg-popover rounded-xl border border-border p-4">
            <div className="flex items-center gap-2 mb-2">
              <Clock className="w-5 h-5 text-accent" />
              <span className="text-sm text-muted-foreground">Pending</span>
            </div>
            <div className="text-2xl font-bold text-foreground">${stats.pendingPayments.toLocaleString()}</div>
            <div className="text-xs text-muted-foreground">8 invoices</div>
          </div>

          <div className="bg-popover rounded-xl border border-border p-4">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="w-5 h-5 text-primary" />
              <span className="text-sm text-muted-foreground">Autopay Rate</span>
            </div>
            <div className="text-2xl font-bold text-foreground">{stats.autopayRate}%</div>
            <div className="text-xs text-muted-foreground">32 of 39 families</div>
          </div>

          <div className="bg-popover rounded-xl border border-border p-4">
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle className="w-5 h-5 text-accent" />
              <span className="text-sm text-muted-foreground">Avg Collection</span>
            </div>
            <div className="text-2xl font-bold text-foreground">{stats.averageCollectionTime} days</div>
            <div className="text-xs text-muted-foreground">Industry: 15 days</div>
          </div>
        </div>

        {/* Payment Methods */}
        <div className="space-y-4 mb-6">
          <h2 className="font-heading text-lg font-bold text-foreground">Payment Methods</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {paymentMethods.map((method, idx) => (
              <div key={idx} className={`bg-popover rounded-xl border p-6 relative ${method.recommended ? 'border-primary' : 'border-border'}`}>
                {method.recommended && (
                  <Badge className="absolute top-4 right-4 bg-primary">Recommended</Badge>
                )}
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <span className="text-4xl">{method.icon}</span>
                    <div>
                      <h3 className="font-semibold text-foreground">{method.type}</h3>
                      <p className="text-sm text-muted-foreground">{method.description}</p>
                    </div>
                  </div>
                  <div className="pt-3 border-t border-border">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Processing Fee:</span>
                      <span className="font-bold text-foreground">{method.fee}</span>
                    </div>
                  </div>
                  {method.type === 'ACH Bank Transfer' && (
                    <div className="bg-primary/10 p-3 rounded-lg">
                      <p className="text-xs text-foreground">
                        <strong>Example:</strong> $1,200 payment = $9.60 fee<br />
                        <strong>You receive:</strong> $1,190.40
                      </p>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Payments */}
        <div className="space-y-4 mb-6">
          <div className="flex justify-between items-center">
            <h2 className="font-heading text-lg font-bold text-foreground">Recent Payments</h2>
            <Button variant="outline" size="sm">View All</Button>
          </div>
          <div className="bg-popover rounded-xl border border-border divide-y divide-border">
            {recentPayments.map((payment) => (
              <div key={payment.id} className="p-6 hover:bg-secondary/50 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                      payment.status === 'succeeded' ? 'bg-primary/10' : 'bg-accent/10'
                    }`}>
                      {payment.status === 'succeeded' ? (
                        <CheckCircle className="h-6 w-6 text-primary" />
                      ) : (
                        <Clock className="h-6 w-6 text-accent" />
                      )}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-semibold text-foreground">{payment.parent}</p>
                        {payment.autopay && (
                          <Badge variant="outline" className="text-xs">Autopay</Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">{payment.method} • {payment.time}</p>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <p className="text-2xl font-bold text-foreground">${payment.amount.toFixed(2)}</p>
                    <p className="text-sm text-muted-foreground">
                      Fee: ${payment.fee.toFixed(2)} • Net: <span className="font-semibold text-primary">${payment.net.toFixed(2)}</span>
                    </p>
                  </div>
                </div>
                {payment.status === 'succeeded' && (
                  <div className="mt-3 flex items-center gap-2 text-xs text-primary">
                    <CheckCircle className="h-3 w-3" />
                    <span>Receipt sent • Payment confirmed instantly</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          
          {/* Autopay Enrollment */}
          <div className="bg-popover rounded-xl border border-border p-6">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                  <Clock className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-bold text-foreground">Autopay Enrollment</h3>
                  <p className="text-sm text-muted-foreground">Set and forget</p>
                </div>
              </div>
              <p className="text-sm text-foreground">
                Parent sets up autopay once — invoice generates, payment pulls automatically on the due date. 
                <strong> Director's favorite feature: 80%+ of families on autopay means near-zero collections work.</strong>
              </p>
              <Badge className="bg-primary">32 families enrolled</Badge>
            </div>
          </div>

          {/* Instant Confirmation */}
          <div className="bg-popover rounded-xl border border-border p-6">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-accent/10 rounded-full flex items-center justify-center">
                  <CheckCircle className="h-6 w-6 text-accent" />
                </div>
                <div>
                  <h3 className="font-bold text-foreground">Instant Confirmation</h3>
                  <p className="text-sm text-muted-foreground">Real-time</p>
                </div>
              </div>
              <p className="text-sm text-foreground">
                Parent pays — they get a receipt immediately, director's dashboard updates in real time. 
                <strong> No waiting to reconcile who paid and who didn't.</strong> Every payment is timestamped and attributed.
              </p>
              <Badge className="bg-accent">Real-time tracking</Badge>
            </div>
          </div>

          {/* Payment Plans */}
          <div className="bg-popover rounded-xl border border-border p-6">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                  <CreditCard className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-bold text-foreground">Payment Plans</h3>
                  <p className="text-sm text-muted-foreground">Family flexibility</p>
                </div>
              </div>
              <p className="text-sm text-foreground">
                Director can split any invoice into installments for families who need it — two payments of $600 instead of one $1,200. 
                <strong> Platform tracks each installment separately</strong> and sends reminders for each.
              </p>
              <Badge className="bg-primary">5 active plans</Badge>
            </div>
          </div>
        </div>

        {/* Coming Soon */}
        <div className="bg-light-coral/30 rounded-xl border border-primary/20 p-5">
          <div className="flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
            <div className="space-y-2">
              <h3 className="font-semibold text-foreground">Full Payment System Coming Soon</h3>
              <p className="text-sm text-muted-foreground">
                Complete integration with Stripe for ACH, card, and FSA/HSA processing • Automated autopay enrollment • 
                Real-time payment confirmation • Payment plan creation • Fee calculator • Receipt generation • 
                Collections dashboard • Payment reminders • Failed payment recovery
              </p>
            </div>
          </div>
        </div>

      </main>
      </div>
    </div>
  );
}
