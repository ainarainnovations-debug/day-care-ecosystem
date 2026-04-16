import { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Users, DollarSign, TrendingUp, Calendar, Check, X, Shield, Search, Settings, AlertTriangle, FileText, Building2, LayoutDashboard, UserCheck } from "lucide-react";
import AdminClaims from "@/components/admin/AdminClaims";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

type AdminTab = "overview" | "approvals" | "providers" | "users" | "bookings" | "commission" | "alerts" | "claims" | "audit" | "settings";

const sidebarItems: { id: AdminTab; label: string; icon: React.ElementType }[] = [
  { id: "overview", label: "Overview", icon: LayoutDashboard },
  { id: "approvals", label: "Approvals", icon: UserCheck },
  { id: "providers", label: "Providers", icon: Building2 },
  { id: "users", label: "Users", icon: Users },
  { id: "bookings", label: "Bookings", icon: Calendar },
  { id: "commission", label: "Commission", icon: DollarSign },
  { id: "alerts", label: "Alerts", icon: AlertTriangle },
  { id: "claims", label: "Claims", icon: Shield },
  { id: "audit", label: "Audit Log", icon: FileText },
  { id: "settings", label: "Settings", icon: Settings },
];

const AdminDashboard = () => {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<AdminTab>("overview");
  const [stats, setStats] = useState({ totalBookings: 0, totalRevenue: 0, totalCommission: 0, activeProviders: 0, registeredParents: 0 });
  const [pendingProviders, setPendingProviders] = useState<any[]>([]);
  const [activeProviders, setActiveProviders] = useState<any[]>([]);
  const [recentBookings, setRecentBookings] = useState<any[]>([]);
  const [alerts, setAlerts] = useState<any[]>([]);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [commissionRate, setCommissionRate] = useState("10");
  const [providerSearch, setProviderSearch] = useState("");

  const logAccess = async (action: string, targetType: string, targetId?: string) => {
    await supabase.rpc("log_admin_access", {
      _action: action,
      _target_type: targetType,
      _target_id: targetId || null,
      _details: {},
    });
  };

  const fetchData = async () => {
    // Stats
    const [bookingsRes, providersRes, parentsRes, settingsRes] = await Promise.all([
      supabase.from("bookings").select("total_price, commission_amount, status"),
      supabase.from("provider_profiles").select("id, user_id, business_name, capacity, is_verified, is_active"),
      supabase.from("profiles").select("id").eq("role", "parent"),
      supabase.from("platform_settings").select("value").eq("key", "commission_percentage").single(),
    ]);

    const bookings = bookingsRes.data || [];
    const completedBookings = bookings.filter(b => b.status === "completed");
    setStats({
      totalBookings: bookings.length,
      totalRevenue: completedBookings.reduce((sum, b) => sum + Number(b.total_price || 0), 0),
      totalCommission: completedBookings.reduce((sum, b) => sum + Number(b.commission_amount || 0), 0),
      activeProviders: (providersRes.data || []).filter(p => p.is_active).length,
      registeredParents: (parentsRes.data || []).length,
    });

    if (settingsRes.data?.value) setCommissionRate(settingsRes.data.value);

    // Pending providers (not verified)
    const pending = (providersRes.data || []).filter(p => !p.is_verified);
    setPendingProviders(pending);

    // Active providers with reviews
    const active = (providersRes.data || []).filter(p => p.is_verified && p.is_active);
    setActiveProviders(active);

    // Recent bookings with parent/provider info
    const { data: recentB } = await supabase
      .from("bookings")
      .select("id, date, total_price, commission_amount, status, booking_type, parent_id, provider_id")
      .order("created_at", { ascending: false })
      .limit(20);
    setRecentBookings(recentB || []);

    // Alerts
    const { data: alertData } = await supabase
      .from("admin_alerts")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(50);
    setAlerts(alertData || []);

    // Audit logs
    const { data: auditData } = await supabase
      .from("admin_audit_log")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(30);
    setAuditLogs(auditData || []);

    // Log this dashboard access
    await logAccess("view_dashboard", "admin_dashboard");
  };

  useEffect(() => { fetchData(); }, []);

  const handleApproveProvider = async (providerId: string) => {
    const { error } = await supabase
      .from("provider_profiles")
      .update({ is_verified: true })
      .eq("id", providerId);
    if (!error) {
      toast({ title: "Provider approved" });
      await logAccess("approve_provider", "provider_profile", providerId);
      fetchData();
    }
  };

  const handleRejectProvider = async (providerId: string) => {
    const { error } = await supabase
      .from("provider_profiles")
      .update({ is_active: false })
      .eq("id", providerId);
    if (!error) {
      toast({ title: "Provider rejected" });
      await logAccess("reject_provider", "provider_profile", providerId);
      fetchData();
    }
  };

  const handleResolveAlert = async (alertId: string) => {
    const { error } = await supabase
      .from("admin_alerts")
      .update({ is_resolved: true, resolved_at: new Date().toISOString() })
      .eq("id", alertId);
    if (!error) {
      toast({ title: "Alert resolved" });
      fetchData();
    }
  };

  const handleUpdateCommission = async () => {
    const { error } = await supabase
      .from("platform_settings")
      .update({ value: commissionRate })
      .eq("key", "commission_percentage");
    if (!error) {
      toast({ title: "Commission rate updated" });
      await logAccess("update_commission", "platform_settings", undefined);
    }
  };

  const unresolvedAlerts = alerts.filter(a => !a.is_resolved);
  const severityColor = (s: string) => {
    switch (s) {
      case "critical": return "bg-destructive text-destructive-foreground";
      case "high": return "bg-destructive/80 text-destructive-foreground";
      case "medium": return "bg-secondary text-foreground";
      default: return "bg-muted text-muted-foreground";
    }
  };

  const filteredProviders = activeProviders.filter(p =>
    p.business_name.toLowerCase().includes(providerSearch.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="font-heading text-2xl md:text-3xl font-bold text-foreground">Admin Panel</h1>
            <p className="text-muted-foreground mt-1">Platform overview & management</p>
          </div>
          {unresolvedAlerts.length > 0 && (
            <Badge className="bg-destructive text-destructive-foreground">
              <AlertTriangle className="w-3 h-3 mr-1" /> {unresolvedAlerts.length} alert{unresolvedAlerts.length > 1 ? 's' : ''}
            </Badge>
          )}
        </div>

        {/* Privacy Notice */}
        <div className="bg-light-coral/30 rounded-lg border border-primary/20 p-3 mb-6 text-sm text-foreground">
          <Shield className="w-4 h-4 inline mr-2 text-primary" />
          For safety and support purposes, CareConnect may access booking data when necessary. All admin actions are logged.
        </div>

        {/* Sidebar + Content Layout */}
        <div className="flex gap-6">
          {/* Sidebar Navigation */}
          <div className="w-56 flex-shrink-0">
            <div className="bg-popover rounded-xl border border-border p-2 sticky top-4">
              <nav className="space-y-1">
                {sidebarItems.map((item) => {
                  const Icon = item.icon;
                  const showBadge = item.id === "alerts" && unresolvedAlerts.length > 0;
                  const showApprovalBadge = item.id === "approvals" && pendingProviders.length > 0;
                  
                  return (
                    <button
                      key={item.id}
                      onClick={() => setActiveTab(item.id)}
                      className={`w-full flex items-center justify-between gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                        activeTab === item.id
                          ? "bg-primary text-primary-foreground"
                          : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <Icon className="w-4 h-4" />
                        <span>{item.label}</span>
                      </div>
                      {showBadge && (
                        <Badge className="bg-destructive text-destructive-foreground text-xs px-1.5 py-0">
                          {unresolvedAlerts.length}
                        </Badge>
                      )}
                      {showApprovalBadge && (
                        <Badge className="bg-accent text-accent-foreground text-xs px-1.5 py-0">
                          {pendingProviders.length}
                        </Badge>
                      )}
                    </button>
                  );
                })}
              </nav>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1">
            {activeTab === "overview" && (
              <div className="space-y-6">
                {/* Stats */}
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                  {[
                    { label: "Total Revenue", value: `$${stats.totalRevenue.toLocaleString()}`, icon: <DollarSign className="w-5 h-5 text-primary" /> },
                    { label: "Commission", value: `$${stats.totalCommission.toLocaleString()}`, icon: <TrendingUp className="w-5 h-5 text-accent" /> },
                    { label: "Providers", value: stats.activeProviders, icon: <Shield className="w-5 h-5 text-accent" /> },
                    { label: "Parents", value: stats.registeredParents, icon: <Users className="w-5 h-5 text-primary" /> },
                    { label: "Bookings", value: stats.totalBookings, icon: <Calendar className="w-5 h-5 text-muted-foreground" /> },
                  ].map((stat) => (
                    <div key={stat.label} className="bg-popover rounded-xl border border-border p-4">
                      <div className="flex items-center gap-2 mb-2">{stat.icon}<span className="text-xs text-muted-foreground">{stat.label}</span></div>
                      <div className="text-xl font-bold text-foreground">{stat.value}</div>
                    </div>
                  ))}
                </div>

                {/* Quick Actions */}
                {(unresolvedAlerts.length > 0 || pendingProviders.length > 0) && (
                  <div className="bg-popover rounded-xl border border-border p-6">
                    <h3 className="font-heading text-lg font-semibold text-foreground mb-4">Action Required</h3>
                    <div className="space-y-3">
                      {unresolvedAlerts.length > 0 && (
                        <div className="flex items-center justify-between p-3 bg-destructive/10 rounded-lg">
                          <div className="flex items-center gap-3">
                            <AlertTriangle className="w-5 h-5 text-destructive" />
                            <span className="text-sm font-medium text-foreground">{unresolvedAlerts.length} unresolved alert{unresolvedAlerts.length > 1 ? 's' : ''}</span>
                          </div>
                          <Button size="sm" variant="outline" onClick={() => setActiveTab("alerts")}>View</Button>
                        </div>
                      )}
                      {pendingProviders.length > 0 && (
                        <div className="flex items-center justify-between p-3 bg-accent/10 rounded-lg">
                          <div className="flex items-center gap-3">
                            <UserCheck className="w-5 h-5 text-accent" />
                            <span className="text-sm font-medium text-foreground">{pendingProviders.length} pending approval{pendingProviders.length > 1 ? 's' : ''}</span>
                          </div>
                          <Button size="sm" variant="outline" onClick={() => setActiveTab("approvals")}>Review</Button>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            {activeTab === "approvals" && (
              <div className="space-y-4">
                <h2 className="font-heading text-xl font-semibold text-foreground">Provider Approvals</h2>
                {pendingProviders.length === 0 ? (
                  <div className="bg-popover rounded-xl border border-border p-12 text-center">
                    <UserCheck className="w-12 h-12 mx-auto mb-3 text-muted-foreground opacity-40" />
                    <p className="font-medium text-foreground">No pending approvals</p>
                    <p className="text-sm text-muted-foreground mt-1">All provider applications are up to date</p>
                  </div>
                ) : (
                  pendingProviders.map((p) => (
                    <div key={p.id} className="bg-popover rounded-xl border border-border p-5">
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 bg-light-sage rounded-full flex items-center justify-center text-lg">🏡</div>
                          <div>
                            <h3 className="font-heading font-semibold text-foreground">{p.business_name}</h3>
                            <p className="text-sm text-muted-foreground">Capacity: {p.capacity} children</p>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button size="sm" className="bg-accent text-accent-foreground" onClick={() => handleApproveProvider(p.id)}>
                            <Check className="w-3 h-3 mr-1" /> Approve
                          </Button>
                          <Button size="sm" variant="outline" className="text-destructive" onClick={() => handleRejectProvider(p.id)}>
                            <X className="w-3 h-3 mr-1" /> Reject
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {activeTab === "providers" && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="font-heading text-xl font-semibold text-foreground">Active Providers</h2>
                  <div className="relative w-64">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input placeholder="Search providers..." className="pl-9" value={providerSearch} onChange={e => setProviderSearch(e.target.value)} />
                  </div>
                </div>
                <div className="bg-popover rounded-xl border border-border overflow-hidden">
                  <div className="divide-y divide-border">
                    {filteredProviders.length === 0 ? (
                      <div className="p-8 text-center text-muted-foreground">No providers found</div>
                    ) : (
                      filteredProviders.map((p) => (
                        <div key={p.id} className="p-4 flex items-center justify-between hover:bg-secondary/50 transition-colors">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-light-sage rounded-full flex items-center justify-center text-sm">🏡</div>
                            <div>
                              <div className="font-medium text-foreground">{p.business_name}</div>
                              <div className="text-xs text-muted-foreground">Capacity: {p.capacity} children</div>
                            </div>
                          </div>
                          <Badge className="bg-accent text-accent-foreground">Active</Badge>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            )}

            {activeTab === "users" && (
              <div className="space-y-4">
                <h2 className="font-heading text-xl font-semibold text-foreground">User Management</h2>
                <div className="bg-popover rounded-xl border border-border p-6">
                  <div className="grid grid-cols-3 gap-4 mb-6">
                    <div className="p-4 bg-secondary rounded-lg">
                      <p className="text-sm text-muted-foreground">Total Users</p>
                      <p className="text-2xl font-bold text-foreground">{stats.registeredParents + stats.activeProviders}</p>
                    </div>
                    <div className="p-4 bg-secondary rounded-lg">
                      <p className="text-sm text-muted-foreground">Parents</p>
                      <p className="text-2xl font-bold text-foreground">{stats.registeredParents}</p>
                    </div>
                    <div className="p-4 bg-secondary rounded-lg">
                      <p className="text-sm text-muted-foreground">Providers</p>
                      <p className="text-2xl font-bold text-foreground">{stats.activeProviders}</p>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground">Detailed user management coming soon...</p>
                </div>
              </div>
            )}

            {activeTab === "bookings" && (
              <div className="space-y-4">
                <h2 className="font-heading text-xl font-semibold text-foreground">Recent Bookings</h2>
                <div className="bg-popover rounded-xl border border-border overflow-hidden">
                  <div className="divide-y divide-border">
                    {recentBookings.length === 0 ? (
                      <div className="p-8 text-center text-muted-foreground">No bookings yet</div>
                    ) : (
                      recentBookings.map((b) => (
                        <div key={b.id} className="p-4 flex items-center justify-between hover:bg-secondary/50 transition-colors">
                          <div>
                            <div className="font-medium text-foreground">{b.booking_type.replace("_", " ")} — {b.date}</div>
                            <div className="text-xs text-muted-foreground">ID: {b.id.slice(0, 8)}...</div>
                          </div>
                          <div className="flex items-center gap-4">
                            <div className="text-right">
                              <div className="font-semibold text-foreground">${Number(b.total_price)}</div>
                              <div className="text-xs text-accent">+${Number(b.commission_amount)} commission</div>
                            </div>
                            <Badge className={
                              b.status === "completed" ? "bg-accent text-accent-foreground" :
                              b.status === "cancelled" ? "bg-destructive text-destructive-foreground" :
                              "bg-secondary text-foreground"
                            }>{b.status}</Badge>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            )}

            {activeTab === "commission" && (
              <div className="space-y-6">
                <h2 className="font-heading text-xl font-semibold text-foreground">Commission Settings</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-popover rounded-xl border border-border p-6">
                    <h3 className="font-heading text-lg font-semibold text-foreground mb-4">Commission Rate</h3>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-foreground">Per-booking commission</span>
                        <div className="flex items-center gap-1">
                          <Input type="number" value={commissionRate} onChange={e => setCommissionRate(e.target.value)} className="w-20 text-center" />
                          <span className="text-sm text-muted-foreground">%</span>
                        </div>
                      </div>
                      <Button className="w-full bg-primary text-primary-foreground" onClick={handleUpdateCommission}>Save Commission Rate</Button>
                      <div className="bg-light-sage/50 rounded-lg p-4">
                        <p className="text-sm text-foreground">Total commission earned: <span className="font-bold text-primary">${stats.totalCommission.toLocaleString()}</span></p>
                      </div>
                    </div>
                  </div>
                  <div className="bg-popover rounded-xl border border-border p-6">
                    <h3 className="font-heading text-lg font-semibold text-foreground mb-4">Subscription Plans</h3>
                    <div className="space-y-3">
                      {[
                        { name: "Basic", price: 0, features: "Up to 6 kids, basic features" },
                        { name: "Pro", price: 29, features: "Up to 15 kids, activity logs, reports" },
                        { name: "Enterprise", price: 79, features: "Unlimited, priority support, API access" },
                      ].map((plan) => (
                        <div key={plan.name} className="p-3 rounded-lg border border-border flex items-center justify-between">
                          <div>
                            <div className="font-medium text-foreground">{plan.name}</div>
                            <div className="text-xs text-muted-foreground">{plan.features}</div>
                          </div>
                          <span className="font-semibold text-foreground">{plan.price === 0 ? "Free" : `$${plan.price}/mo`}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "alerts" && (
              <div className="space-y-4">
                <h2 className="font-heading text-xl font-semibold text-foreground">Platform Alerts</h2>
                {unresolvedAlerts.length === 0 ? (
                  <div className="bg-popover rounded-xl border border-border p-12 text-center">
                    <AlertTriangle className="w-12 h-12 mx-auto mb-3 text-muted-foreground opacity-40" />
                    <p className="font-medium text-foreground">No active alerts</p>
                    <p className="text-sm text-muted-foreground mt-1">All alerts have been resolved</p>
                  </div>
                ) : (
                  unresolvedAlerts.map((alert) => (
                    <div key={alert.id} className="bg-popover rounded-xl border border-border p-5">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex items-start gap-3 flex-1">
                          <AlertTriangle className={`w-5 h-5 mt-0.5 flex-shrink-0 ${alert.severity === "critical" || alert.severity === "high" ? "text-destructive" : "text-muted-foreground"}`} />
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1 flex-wrap">
                              <span className="font-medium text-foreground">{alert.title || alert.alert_type.replace("_", " ")}</span>
                              <Badge className={severityColor(alert.severity)}>{alert.severity}</Badge>
                            </div>
                            <p className="text-sm text-muted-foreground">{alert.description || alert.message}</p>
                            <p className="text-xs text-muted-foreground mt-1">{new Date(alert.created_at).toLocaleString()}</p>
                          </div>
                        </div>
                        <Button size="sm" variant="outline" onClick={() => handleResolveAlert(alert.id)}>
                          <Check className="w-3 h-3 mr-1" /> Resolve
                        </Button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {activeTab === "claims" && <AdminClaims />}

            {activeTab === "audit" && (
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <FileText className="w-5 h-5 text-muted-foreground" />
                  <h2 className="font-heading text-xl font-semibold text-foreground">Admin Activity Log</h2>
                </div>
                <p className="text-sm text-muted-foreground">All admin actions are permanently recorded for compliance</p>
                <div className="bg-popover rounded-xl border border-border overflow-hidden">
                  <div className="divide-y divide-border">
                    {auditLogs.length === 0 ? (
                      <div className="p-8 text-center text-muted-foreground">No audit entries yet</div>
                    ) : (
                      auditLogs.map((log) => (
                        <div key={log.id} className="p-4 flex items-center justify-between hover:bg-secondary/50 transition-colors">
                          <div>
                            <span className="text-sm font-medium text-foreground">{log.action}</span>
                            <span className="text-xs text-muted-foreground ml-2">on {log.target_type}</span>
                            {log.target_id && <span className="text-xs text-muted-foreground ml-1">({log.target_id.slice(0, 8)}...)</span>}
                          </div>
                          <span className="text-xs text-muted-foreground">{new Date(log.created_at).toLocaleString()}</span>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            )}

            {activeTab === "settings" && (
              <div className="space-y-4">
                <h2 className="font-heading text-xl font-semibold text-foreground">Platform Settings</h2>
                <div className="bg-popover rounded-xl border border-border p-6">
                  <p className="text-sm text-muted-foreground">Platform configuration and preferences coming soon...</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
