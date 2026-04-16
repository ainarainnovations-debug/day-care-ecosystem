import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CreditCard, DollarSign, Clock, CheckCircle, AlertCircle, TrendingUp } from 'lucide-react';

export default function PaymentDashboard() {
  
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
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Header */}
        <div>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Payment Collection</h1>
          <p className="text-gray-600">Multiple methods, fully tracked, instant confirmation</p>
        </div>

        {/* Info Alert */}
        <Alert className="bg-blue-50 border-blue-200">
          <DollarSign className="h-4 w-4 text-blue-600" />
          <AlertDescription>
            <strong>Platform shows director the net amount after fees</strong> - Parents pay their way (ACH, card, FSA/HSA), 
            you see exactly what you'll receive. 82% of families on autopay means near-zero collections work!
          </AlertDescription>
        </Alert>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="p-6 bg-gradient-to-br from-green-500 to-emerald-600 text-white">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm opacity-90">Total Collected</span>
              <DollarSign className="h-5 w-5" />
            </div>
            <p className="text-3xl font-bold">${stats.totalCollected.toLocaleString()}</p>
            <p className="text-xs opacity-90 mt-1">This month</p>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-600">Pending</span>
              <Clock className="h-5 w-5 text-yellow-500" />
            </div>
            <p className="text-3xl font-bold text-gray-900">${stats.pendingPayments.toLocaleString()}</p>
            <p className="text-xs text-gray-600 mt-1">8 invoices</p>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-600">Autopay Rate</span>
              <TrendingUp className="h-5 w-5 text-green-500" />
            </div>
            <p className="text-3xl font-bold text-gray-900">{stats.autopayRate}%</p>
            <p className="text-xs text-gray-600 mt-1">32 of 39 families</p>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-600">Avg Collection</span>
              <CheckCircle className="h-5 w-5 text-blue-500" />
            </div>
            <p className="text-3xl font-bold text-gray-900">{stats.averageCollectionTime} days</p>
            <p className="text-xs text-gray-600 mt-1">Industry: 15 days</p>
          </Card>
        </div>

        {/* Payment Methods */}
        <div className="space-y-4">
          <h2 className="text-2xl font-bold text-gray-900">Payment Methods</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {paymentMethods.map((method, idx) => (
              <Card key={idx} className={`p-6 relative ${method.recommended ? 'border-2 border-green-500' : ''}`}>
                {method.recommended && (
                  <Badge className="absolute top-4 right-4 bg-green-500">Recommended</Badge>
                )}
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <span className="text-4xl">{method.icon}</span>
                    <div>
                      <h3 className="font-semibold text-gray-900">{method.type}</h3>
                      <p className="text-sm text-gray-600">{method.description}</p>
                    </div>
                  </div>
                  <div className="pt-3 border-t">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Processing Fee:</span>
                      <span className="font-bold text-gray-900">{method.fee}</span>
                    </div>
                  </div>
                  {method.type === 'ACH Bank Transfer' && (
                    <div className="bg-green-50 p-3 rounded-lg">
                      <p className="text-xs text-green-800">
                        <strong>Example:</strong> $1,200 payment = $9.60 fee<br />
                        <strong>You receive:</strong> $1,190.40
                      </p>
                    </div>
                  )}
                </div>
              </Card>
            ))}
          </div>
        </div>

        {/* Recent Payments */}
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold text-gray-900">Recent Payments</h2>
            <Button variant="outline">View All</Button>
          </div>
          <Card>
            <div className="divide-y">
              {recentPayments.map((payment) => (
                <div key={payment.id} className="p-6 hover:bg-gray-50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                        payment.status === 'succeeded' ? 'bg-green-100' : 'bg-yellow-100'
                      }`}>
                        {payment.status === 'succeeded' ? (
                          <CheckCircle className="h-6 w-6 text-green-600" />
                        ) : (
                          <Clock className="h-6 w-6 text-yellow-600" />
                        )}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-semibold text-gray-900">{payment.parent}</p>
                          {payment.autopay && (
                            <Badge variant="outline" className="text-xs">Autopay</Badge>
                          )}
                        </div>
                        <p className="text-sm text-gray-600">{payment.method} • {payment.time}</p>
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <p className="text-2xl font-bold text-gray-900">${payment.amount.toFixed(2)}</p>
                      <p className="text-sm text-gray-600">
                        Fee: ${payment.fee.toFixed(2)} • Net: <span className="font-semibold text-green-600">${payment.net.toFixed(2)}</span>
                      </p>
                    </div>
                  </div>
                  {payment.status === 'succeeded' && (
                    <div className="mt-3 flex items-center gap-2 text-xs text-green-600">
                      <CheckCircle className="h-3 w-3" />
                      <span>Receipt sent • Payment confirmed instantly</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Autopay Enrollment */}
          <Card className="p-6 bg-gradient-to-br from-purple-50 to-pink-50 border-purple-200">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-purple-500 rounded-full flex items-center justify-center">
                  <Clock className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-purple-900">Autopay Enrollment</h3>
                  <p className="text-sm text-purple-700">Set and forget</p>
                </div>
              </div>
              <p className="text-sm text-purple-800">
                Parent sets up autopay once — invoice generates, payment pulls automatically on the due date. 
                <strong> Director's favorite feature: 80%+ of families on autopay means near-zero collections work.</strong>
              </p>
              <Badge className="bg-purple-500">32 families enrolled</Badge>
            </div>
          </Card>

          {/* Instant Confirmation */}
          <Card className="p-6 bg-gradient-to-br from-blue-50 to-cyan-50 border-blue-200">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center">
                  <CheckCircle className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-blue-900">Instant Confirmation</h3>
                  <p className="text-sm text-blue-700">Real-time</p>
                </div>
              </div>
              <p className="text-sm text-blue-800">
                Parent pays — they get a receipt immediately, director's dashboard updates in real time. 
                <strong> No waiting to reconcile who paid and who didn't.</strong> Every payment is timestamped and attributed.
              </p>
              <Badge className="bg-blue-500">Real-time tracking</Badge>
            </div>
          </Card>

          {/* Payment Plans */}
          <Card className="p-6 bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center">
                  <CreditCard className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-green-900">Payment Plans</h3>
                  <p className="text-sm text-green-700">Family flexibility</p>
                </div>
              </div>
              <p className="text-sm text-green-800">
                Director can split any invoice into installments for families who need it — two payments of $600 instead of one $1,200. 
                <strong> Platform tracks each installment separately</strong> and sends reminders for each.
              </p>
              <Badge className="bg-green-500">5 active plans</Badge>
            </div>
          </Card>
        </div>

        {/* Coming Soon */}
        <Card className="p-6 bg-gradient-to-r from-yellow-50 to-orange-50 border-yellow-200">
          <div className="flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5" />
            <div className="space-y-2">
              <h3 className="font-semibold text-yellow-900">Full Payment System Coming Soon</h3>
              <p className="text-sm text-yellow-800">
                Complete integration with Stripe for ACH, card, and FSA/HSA processing • Automated autopay enrollment • 
                Real-time payment confirmation • Payment plan creation • Fee calculator • Receipt generation • 
                Collections dashboard • Payment reminders • Failed payment recovery
              </p>
            </div>
          </div>
        </Card>

      </div>
    </div>
  );
}
