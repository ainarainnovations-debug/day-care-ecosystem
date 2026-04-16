import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { User, Bell, CreditCard, Shield, AlertTriangle, Save } from "lucide-react";

const ProviderSettings = () => {
  const [notifBookings, setNotifBookings] = useState(true);
  const [notifMessages, setNotifMessages] = useState(true);
  const [notifReviews, setNotifReviews] = useState(true);
  const [notifPayments, setNotifPayments] = useState(true);
  const [notifEmail, setNotifEmail] = useState(true);
  const [notifPush, setNotifPush] = useState(false);
  const [twoFactor, setTwoFactor] = useState(false);

  return (
    <div className="space-y-8">
      {/* Account Settings */}
      <section className="bg-popover rounded-xl border border-border p-6">
        <div className="flex items-center gap-2 mb-5">
          <User className="w-5 h-5 text-primary" />
          <h3 className="font-heading text-lg font-semibold text-foreground">Account</h3>
        </div>
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-foreground mb-1 block">Display Name</label>
              <Input defaultValue="Sunshine Home Daycare" />
            </div>
            <div>
              <label className="text-sm font-medium text-foreground mb-1 block">Email</label>
              <Input defaultValue="sunshine@example.com" type="email" />
            </div>
            <div>
              <label className="text-sm font-medium text-foreground mb-1 block">Phone</label>
              <Input defaultValue="(555) 123-4567" type="tel" />
            </div>
            <div>
              <label className="text-sm font-medium text-foreground mb-1 block">Time Zone</label>
              <Input defaultValue="Eastern (EST)" disabled />
            </div>
          </div>
          <div>
            <label className="text-sm font-medium text-foreground mb-1 block">Change Password</label>
            <div className="flex gap-2">
              <Input type="password" placeholder="New password" className="max-w-xs" />
              <Button variant="outline">Update</Button>
            </div>
          </div>
          <Button className="bg-primary text-primary-foreground">
            <Save className="w-4 h-4 mr-2" /> Save Account Changes
          </Button>
        </div>
      </section>

      {/* Notification Preferences */}
      <section className="bg-popover rounded-xl border border-border p-6">
        <div className="flex items-center gap-2 mb-5">
          <Bell className="w-5 h-5 text-primary" />
          <h3 className="font-heading text-lg font-semibold text-foreground">Notifications</h3>
        </div>
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">Choose what you want to be notified about.</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              { label: "New bookings", value: notifBookings, set: setNotifBookings },
              { label: "Messages", value: notifMessages, set: setNotifMessages },
              { label: "Reviews", value: notifReviews, set: setNotifReviews },
              { label: "Payments & invoices", value: notifPayments, set: setNotifPayments },
            ].map((item) => (
              <div key={item.label} className="flex items-center justify-between py-2 px-3 rounded-lg bg-secondary/50">
                <span className="text-sm text-foreground">{item.label}</span>
                <Switch checked={item.value} onCheckedChange={item.set} />
              </div>
            ))}
          </div>
          <div className="border-t border-border pt-4 mt-4">
            <p className="text-sm font-medium text-foreground mb-3">Delivery Method</p>
            <div className="flex gap-4">
              <div className="flex items-center gap-2">
                <Switch checked={notifEmail} onCheckedChange={setNotifEmail} />
                <span className="text-sm text-foreground">Email</span>
              </div>
              <div className="flex items-center gap-2">
                <Switch checked={notifPush} onCheckedChange={setNotifPush} />
                <span className="text-sm text-foreground">Push</span>
                <Badge variant="secondary" className="text-[10px]">Coming Soon</Badge>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Payment Setup */}
      <section className="bg-popover rounded-xl border border-border p-6">
        <div className="flex items-center gap-2 mb-5">
          <CreditCard className="w-5 h-5 text-primary" />
          <h3 className="font-heading text-lg font-semibold text-foreground">Payment Setup</h3>
        </div>
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 rounded-xl bg-secondary/50">
            <div>
              <p className="text-sm font-medium text-foreground">Stripe Connect</p>
              <p className="text-xs text-muted-foreground">Receive payments directly to your bank account</p>
            </div>
            <Badge variant="secondary" className="bg-muted text-muted-foreground">Not Connected</Badge>
          </div>
          <Button variant="outline" className="w-full md:w-auto">
            <CreditCard className="w-4 h-4 mr-2" /> Connect Stripe Account
          </Button>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-foreground mb-1 block">Default Currency</label>
              <Input defaultValue="USD ($)" disabled />
            </div>
            <div>
              <label className="text-sm font-medium text-foreground mb-1 block">Invoice Frequency</label>
              <Input defaultValue="Bi-Weekly" />
            </div>
          </div>
        </div>
      </section>

      {/* Security */}
      <section className="bg-popover rounded-xl border border-border p-6">
        <div className="flex items-center gap-2 mb-5">
          <Shield className="w-5 h-5 text-primary" />
          <h3 className="font-heading text-lg font-semibold text-foreground">Security</h3>
        </div>
        <div className="space-y-4">
          <div className="flex items-center justify-between py-2 px-3 rounded-lg bg-secondary/50">
            <div>
              <p className="text-sm font-medium text-foreground">Two-Factor Authentication</p>
              <p className="text-xs text-muted-foreground">Add an extra layer of security to your account</p>
            </div>
            <Switch checked={twoFactor} onCheckedChange={setTwoFactor} />
          </div>
          <div>
            <p className="text-sm font-medium text-foreground mb-2">Active Sessions</p>
            <div className="space-y-2">
              <div className="flex items-center justify-between p-3 rounded-lg bg-secondary/30">
                <div>
                  <p className="text-sm text-foreground">Chrome on macOS</p>
                  <p className="text-xs text-muted-foreground">Current session · Last active now</p>
                </div>
                <Badge className="bg-accent/15 text-accent text-[10px]">Active</Badge>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Danger Zone */}
      <section className="bg-popover rounded-xl border border-destructive/30 p-6">
        <div className="flex items-center gap-2 mb-5">
          <AlertTriangle className="w-5 h-5 text-destructive" />
          <h3 className="font-heading text-lg font-semibold text-destructive">Danger Zone</h3>
        </div>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-foreground">Deactivate Listing</p>
              <p className="text-xs text-muted-foreground">Temporarily hide your daycare from search results</p>
            </div>
            <Button variant="outline" size="sm" className="border-destructive/30 text-destructive hover:bg-destructive/10">
              Deactivate
            </Button>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-foreground">Delete Account</p>
              <p className="text-xs text-muted-foreground">Permanently delete your account and all data</p>
            </div>
            <Button variant="outline" size="sm" className="border-destructive/30 text-destructive hover:bg-destructive/10">
              Delete
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default ProviderSettings;
