import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { notificationService, type NotificationType } from '@/services/notificationService';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

/**
 * Development-only component for testing notifications
 * Remove from production or protect with admin role
 */
export function NotificationTester() {
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [type, setType] = useState<NotificationType>('system');
  const [title, setTitle] = useState('Test Notification');
  const [message, setMessage] = useState('This is a test notification');
  const [loading, setLoading] = useState(false);

  const handleSendNotification = async () => {
    if (!user) {
      toast({
        title: 'Error',
        description: 'You must be logged in to send notifications',
        variant: 'destructive',
      });
      return;
    }

    try {
      setLoading(true);
      
      await notificationService.createNotification(
        user.id, // Send to self for testing
        type,
        title,
        message,
        {
          test: true,
          timestamp: new Date().toISOString(),
        },
        {
          actionUrl: '/notifications',
          actionLabel: 'View All',
        }
      );

      toast({
        title: 'Success!',
        description: 'Test notification sent successfully',
      });
      
      // Reset form
      setTitle('Test Notification');
      setMessage('This is a test notification');
    } catch (error) {
      console.error('Error sending notification:', error);
      toast({
        title: 'Error',
        description: 'Failed to send notification',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const sendQuickTest = async (testType: NotificationType, testTitle: string, testMessage: string) => {
    if (!user) return;
    
    try {
      await notificationService.createNotification(
        user.id,
        testType,
        testTitle,
        testMessage,
        { test: true },
        { actionUrl: '/notifications', actionLabel: 'View' }
      );
      
      toast({
        title: 'Sent!',
        description: `${testTitle} notification sent`,
      });
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>🧪 Notification Tester</CardTitle>
        <CardDescription>
          Development tool to test notification system (remove in production)
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Quick Test Buttons */}
        <div>
          <Label className="mb-2 block">Quick Tests</Label>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => sendQuickTest('child_check_in', 'Child Checked In', 'Emma was checked in at 8:00 AM')}
            >
              👋 Check-in
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => sendQuickTest('child_check_out', 'Child Checked Out', 'Emma was checked out at 5:00 PM')}
            >
              👋 Check-out
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => sendQuickTest('teacher_clock_in', 'Teacher Clocked In', 'Sarah Johnson clocked in at 7:45 AM')}
            >
              ⏰ Clock-in
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => sendQuickTest('booking_confirmed', 'Booking Confirmed', 'Your booking for next Monday is confirmed!')}
            >
              ✅ Booking
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => sendQuickTest('payment_received', 'Payment Received', 'Payment of $150 has been processed')}
            >
              💵 Payment
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => sendQuickTest('alert', 'Important Alert', 'Please update your contact information')}
            >
              ⚠️ Alert
            </Button>
          </div>
        </div>

        {/* Custom Notification Form */}
        <div className="space-y-4 pt-4 border-t">
          <Label>Custom Notification</Label>
          
          <div>
            <Label htmlFor="type">Type</Label>
            <Select value={type} onValueChange={(v) => setType(v as NotificationType)}>
              <SelectTrigger id="type">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="child_check_in">👋 Child Check-in</SelectItem>
                <SelectItem value="child_check_out">👋 Child Check-out</SelectItem>
                <SelectItem value="teacher_clock_in">⏰ Teacher Clock-in</SelectItem>
                <SelectItem value="teacher_clock_out">⏰ Teacher Clock-out</SelectItem>
                <SelectItem value="booking_confirmed">✅ Booking Confirmed</SelectItem>
                <SelectItem value="booking_cancelled">❌ Booking Cancelled</SelectItem>
                <SelectItem value="message_received">💬 Message</SelectItem>
                <SelectItem value="payment_received">💵 Payment Received</SelectItem>
                <SelectItem value="payment_due">⚠️ Payment Due</SelectItem>
                <SelectItem value="time_entry_approved">✅ Time Approved</SelectItem>
                <SelectItem value="time_entry_rejected">❌ Time Rejected</SelectItem>
                <SelectItem value="review_received">⭐ Review</SelectItem>
                <SelectItem value="activity_logged">📝 Activity</SelectItem>
                <SelectItem value="alert">⚠️ Alert</SelectItem>
                <SelectItem value="system">🔔 System</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Notification title"
            />
          </div>

          <div>
            <Label htmlFor="message">Message</Label>
            <Textarea
              id="message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Notification message"
              rows={3}
            />
          </div>

          <Button onClick={handleSendNotification} disabled={loading} className="w-full">
            {loading ? 'Sending...' : 'Send Test Notification'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
