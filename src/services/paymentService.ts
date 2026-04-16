import { supabase } from '@/integrations/supabase/client';

export interface PaymentMethod {
  id: string;
  parent_id: string;
  provider_id: string;
  method_type: 'ach' | 'card' | 'fsa_hsa';
  is_primary: boolean;
  is_autopay_enabled: boolean;
  card_brand?: string;
  card_last4?: string;
  account_last4?: string;
  status: string;
  created_at: string;
}

export interface Invoice {
  id: string;
  provider_id: string;
  parent_id: string;
  child_id: string;
  amount: number;
  due_date: string;
  status: 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled';
  paid_at?: string;
  created_at: string;
}

export interface Payment {
  id: string;
  invoice_id: string;
  parent_id: string;
  provider_id: string;
  amount: number;
  processing_fee: number;
  net_amount: number;
  payment_method_id: string;
  status: 'pending' | 'processing' | 'succeeded' | 'failed';
  payment_method_type: string;
  processed_at?: string;
  created_at: string;
}

export const paymentService = {
  // Get payment stats for provider
  async getPaymentStats(providerId: string) {
    // Get all invoices
    const { data: invoices } = await supabase
      .from('invoices' as any)
      .select('*')
      .eq('provider_id', providerId);

    // Get all payments
    const { data: payments } = await supabase
      .from('payments' as any)
      .select('*')
      .eq('provider_id', providerId);

    // Get payment methods with autopay
    const { data: autopayMethods } = await supabase
      .from('payment_methods' as any)
      .select('*')
      .eq('provider_id', providerId)
      .eq('is_autopay_enabled', true);

    const totalCollected = (payments || []).reduce((sum: number, p: any) => 
      p.status === 'succeeded' ? sum + p.net_amount : sum, 0
    );

    const pendingPayments = (invoices || []).reduce((sum: number, i: any) => 
      i.status === 'sent' || i.status === 'overdue' ? sum + i.amount : sum, 0
    );

    const autopayRate = autopayMethods && invoices ? 
      (autopayMethods.length / Math.max(invoices.length, 1)) * 100 : 0;

    // Calculate average collection time
    const paidInvoices = (invoices || []).filter((i: any) => i.status === 'paid');
    const avgDays = paidInvoices.length > 0 ?
      paidInvoices.reduce((sum: number, inv: any) => {
        const created = new Date(inv.created_at);
        const paid = new Date(inv.paid_at);
        const days = (paid.getTime() - created.getTime()) / (1000 * 60 * 60 * 24);
        return sum + days;
      }, 0) / paidInvoices.length : 0;

    return {
      totalCollected,
      pendingPayments,
      autopayRate: Math.round(autopayRate),
      averageCollectionTime: avgDays.toFixed(1),
      totalInvoices: invoices?.length || 0,
      autopayCount: autopayMethods?.length || 0,
    };
  },

  // Get recent payments
  async getRecentPayments(providerId: string, limit = 10) {
    const { data, error } = await supabase
      .from('payments' as any)
      .select(`
        *,
        payment_methods!inner(method_type, card_last4, account_last4, is_autopay_enabled),
        profiles!payments_parent_id_fkey(full_name)
      `)
      .eq('provider_id', providerId)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return (data || []) as unknown as any[];
  },

  // Get payment methods for provider
  async getPaymentMethods(providerId: string) {
    const { data, error } = await supabase
      .from('payment_methods' as any)
      .select('*')
      .eq('provider_id', providerId)
      .eq('status', 'active');

    if (error) throw error;
    return (data || []) as unknown as PaymentMethod[];
  },

  // Get invoices
  async getInvoices(providerId: string) {
    const { data, error } = await supabase
      .from('invoices' as any)
      .select(`
        *,
        profiles!invoices_parent_id_fkey(full_name),
        children(first_name, last_name)
      `)
      .eq('provider_id', providerId)
      .order('due_date', { ascending: false });

    if (error) throw error;
    return (data || []) as unknown as any[];
  },
};
