import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { notificationService } from '@/services/notificationService';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

export function NotificationTester() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [type, setType] = useState('system');
  const [title, setTitle] = useState('Test Notification');
  const [message, setMessage] = useState('This is a test notification');
  const [loading, setLoading] = useState(false);

  const handleSend = async () => {
    if (!user) return;
    try {
      setLoading(true);
      await notificationService.createNotification(user.id, type, title, message);
      toast({ title: 'Success!', description: 'Test notification sent' });
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to send notification', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const sendQuick = async (t: string, ti: string, m: string) => {
    if (!user) return;
    try {
      await notificationService.createNotification(user.id, t, ti, m);
      toast({ title: 'Sent!', description: `${ti} notification sent` });
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>🧪 Notification Tester</CardTitle>
        <CardDescription>Development tool to test notifications</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <Label className="mb-2 block">Quick Tests</Label>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
            <Button variant="outline" size="sm" onClick={() => sendQuick('child_check_in', 'Child Checked In', 'Emma was checked in at 8:00 AM')}>👋 Check-in</Button>
            <Button variant="outline" size="sm" onClick={() => sendQuick('booking_confirmed', 'Booking Confirmed', 'Your booking is confirmed!')}>✅ Booking</Button>
            <Button variant="outline" size="sm" onClick={() => sendQuick('payment_received', 'Payment Received', 'Payment of $150 processed')}>💵 Payment</Button>
          </div>
        </div>
        <div className="space-y-4 pt-4 border-t">
          <div>
            <Label>Type</Label>
            <Select value={type} onValueChange={setType}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="system">🔔 System</SelectItem>
                <SelectItem value="alert">⚠️ Alert</SelectItem>
                <SelectItem value="booking_confirmed">✅ Booking</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div><Label>Title</Label><Input value={title} onChange={(e) => setTitle(e.target.value)} /></div>
          <div><Label>Message</Label><Textarea value={message} onChange={(e) => setMessage(e.target.value)} rows={3} /></div>
          <Button onClick={handleSend} disabled={loading} className="w-full">{loading ? 'Sending...' : 'Send Test Notification'}</Button>
        </div>
      </CardContent>
    </Card>
  );
}
