import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { CreditCard, DollarSign, Clock, CheckCircle, AlertCircle, TrendingUp, Settings, Bell, Info, LayoutDashboard, Calendar, Baby, Activity, Wallet, CalendarClock, Timer, KeyRound, Inbox, PencilLine, Rocket, Users } from 'lucide-react';
import Navbar from '@/components/Navbar';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/hooks/useAuth';
import { paymentService } from '@/services/paymentService';

const sidebarItems = [
  { id: "today", label: "Today", icon: LayoutDashboard, path: "/provider/dashboard" },
  { id: "schedule", label: "Schedule", icon: Calendar, path: "/provider/dashboard" },
  { id: "children", label: "Children", icon: Baby, path: "/provider/dashboard" },
  { id: "activity", label: "Log Activity", icon: Activity, path: "/provider/dashboard" },
  { id: "billing", label: "Billing", icon: Wallet, path: "/provider/dashboard" },
  { id: "availability", label: "Availability", icon: CalendarClock, path: "/provider/dashboard" },
  { id: "timelabor", label: "Time & Labor", icon: Timer, path: "/provider/dashboard" },
  { id: "invites", label: "Invites", icon: KeyRound, path: "/provider/dashboard" },
  { id: "applications", label: "Applications", icon: Inbox, path: "/provider/dashboard" },
  { id: "editprofile", label: "Edit Profile", icon: PencilLine, path: "/provider/dashboard" },
  { id: "setup", label: "Setup", icon: Rocket, path: "/provider/dashboard" },
  { id: "settings", label: "Settings", icon: Settings, path: "/provider/dashboard" },
];

// Helper function to calculate time ago
function getTimeAgo(date: Date): string {
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (minutes < 1) return 'Just now';
  if (minutes < 60) return `${minutes} min ago`;
  if (hours < 24) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
  return `${days} day${days > 1 ? 's' : ''} ago`;
}

export default function PaymentDashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  
  // Fetch real payment data
  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['payment-stats', user?.id],
    queryFn: () => paymentService.getPaymentStats(user!.id),
    enabled: !!user?.id,
  });

  const { data: recentPayments = [], isLoading: paymentsLoading } = useQuery({
    queryKey: ['recent-payments', user?.id],
    queryFn: () => paymentService.getRecentPayments(user!.id, 10),
    enabled: !!user?.id,
  });

  const { data: paymentMethods = [], isLoading: methodsLoading } = useQuery({
    queryKey: ['payment-methods', user?.id],
    queryFn: () => paymentService.getPaymentMethods(user!.id),
    enabled: !!user?.id,
  });

  // Default payment methods if none configured
  const defaultMethods = [
    { type: 'ACH Bank Transfer', fee: '0.8%', recommended: true, icon: '🏦', description: 'Lowest fees, best for recurring' },
    { type: 'Debit/Credit Card', fee: '2.9% + $0.30', recommended: false, icon: '💳', description: 'Standard card processing' },
    { type: 'FSA/HSA Card', fee: '2.9% + $0.30', recommended: false, icon: '🏥', description: 'Dependent care cards accepted' }
  ];

  const displayMethods = paymentMethods.length > 0 ? paymentMethods.map((m: any) => ({
    type: m.method_type === 'ach' ? 'ACH Bank Transfer' : m.method_type === 'card' ? 'Debit/Credit Card' : 'FSA/HSA Card',
    fee: m.method_type === 'ach' ? '0.8%' : '2.9% + $0.30',
    recommended: m.method_type === 'ach',
    icon: m.method_type === 'ach' ? '🏦' : m.method_type === 'card' ? '💳' : '🏥',
    description: m.method_type === 'ach' ? 'Lowest fees, best for recurring' : 'Standard card processing'
  })) : defaultMethods;

  if (statsLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading payment data...</p>
        </div>
      </div>
    );
  }

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
            const isActive = false; // No sidebar item is active on this page
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
            {displayMethods.map((method: any, idx: number) => (
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
          {paymentsLoading ? (
            <div className="bg-popover rounded-xl border border-border p-8 text-center text-muted-foreground">
              Loading recent payments...
            </div>
          ) : recentPayments.length === 0 ? (
            <div className="bg-popover rounded-xl border border-border p-8 text-center text-muted-foreground">
              No recent payments
            </div>
          ) : (
            <div className="bg-popover rounded-xl border border-border divide-y divide-border">
              {recentPayments.map((payment: any) => {
                const paymentDate = payment.payment_date ? new Date(payment.payment_date) : null;
                const timeAgo = paymentDate ? getTimeAgo(paymentDate) : 'Unknown';
                
                return (
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
                            <p className="font-semibold text-foreground">{payment.parent_name || 'Unknown'}</p>
                            {payment.autopay_enabled && (
                              <Badge variant="outline" className="text-xs">Autopay</Badge>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {payment.method_type?.toUpperCase() || 'N/A'} • {timeAgo}
                          </p>
                        </div>
                      </div>
                      
                      <div className="text-right">
                        <p className="text-2xl font-bold text-foreground">
                          ${(payment.amount || 0).toFixed(2)}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Net: <span className="font-semibold text-primary">
                            ${(payment.net_amount || payment.amount || 0).toFixed(2)}
                          </span>
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
                );
              })}
            </div>
          )}
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
