-- =====================================================
-- PAYMENT COLLECTION SYSTEM
-- Multiple payment methods, autopay, payment plans, real-time tracking
-- =====================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. PAYMENT METHODS TABLE
CREATE TABLE IF NOT EXISTS payment_methods (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    parent_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    provider_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    
    -- Method type
    method_type TEXT NOT NULL, -- 'ach', 'card', 'fsa_hsa'
    is_primary BOOLEAN DEFAULT false,
    is_autopay_enabled BOOLEAN DEFAULT false,
    
    -- ACH bank details (encrypted in production)
    bank_name TEXT,
    account_last4 TEXT,
    routing_number_last4 TEXT,
    account_type TEXT, -- 'checking', 'savings'
    
    -- Card details (encrypted in production)
    card_brand TEXT, -- 'visa', 'mastercard', 'amex', 'discover'
    card_last4 TEXT,
    card_exp_month INTEGER,
    card_exp_year INTEGER,
    
    -- FSA/HSA details
    fsa_provider TEXT,
    fsa_card_last4 TEXT,
    
    -- Stripe/payment processor tokens
    stripe_payment_method_id TEXT,
    stripe_customer_id TEXT,
    
    -- Status
    status TEXT NOT NULL DEFAULT 'active', -- 'active', 'expired', 'failed', 'removed'
    verified_at TIMESTAMP WITH TIME ZONE,
    
    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_used_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX idx_payment_methods_parent ON payment_methods(parent_id);
CREATE INDEX idx_payment_methods_provider ON payment_methods(provider_id);
CREATE INDEX idx_payment_methods_autopay ON payment_methods(is_autopay_enabled);

COMMENT ON TABLE payment_methods IS 'Parent payment methods: ACH, card, FSA/HSA';
COMMENT ON COLUMN payment_methods.method_type IS 'ach (lowest fees), card, fsa_hsa';

-- 2. INVOICES TABLE
CREATE TABLE IF NOT EXISTS invoices_payment (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    provider_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    parent_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    child_id UUID REFERENCES children(id) ON DELETE SET NULL,
    
    -- Invoice details
    invoice_number TEXT NOT NULL UNIQUE,
    invoice_date DATE NOT NULL DEFAULT CURRENT_DATE,
    due_date DATE NOT NULL,
    
    -- Amounts
    subtotal DECIMAL(10,2) NOT NULL,
    discount_amount DECIMAL(10,2) DEFAULT 0,
    tax_amount DECIMAL(10,2) DEFAULT 0,
    total_amount DECIMAL(10,2) NOT NULL,
    amount_paid DECIMAL(10,2) DEFAULT 0,
    amount_due DECIMAL(10,2) GENERATED ALWAYS AS (total_amount - amount_paid) STORED,
    
    -- Line items (JSON array)
    line_items JSONB NOT NULL DEFAULT '[]',
    -- Example: [{"description": "Tuition - May 2026", "quantity": 1, "unit_price": 1200, "amount": 1200}]
    
    -- Status
    status TEXT NOT NULL DEFAULT 'draft', -- 'draft', 'sent', 'viewed', 'partial', 'paid', 'overdue', 'cancelled'
    
    -- Payment plan info
    is_payment_plan BOOLEAN DEFAULT false,
    payment_plan_id UUID,
    installment_number INTEGER,
    total_installments INTEGER,
    
    -- Autopay
    autopay_scheduled BOOLEAN DEFAULT false,
    autopay_attempted_at TIMESTAMP WITH TIME ZONE,
    autopay_success BOOLEAN,
    
    -- Timestamps
    sent_at TIMESTAMP WITH TIME ZONE,
    viewed_at TIMESTAMP WITH TIME ZONE,
    paid_at TIMESTAMP WITH TIME ZONE,
    
    -- Notes
    notes TEXT,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_invoices_provider ON invoices_payment(provider_id);
CREATE INDEX idx_invoices_parent ON invoices_payment(parent_id);
CREATE INDEX idx_invoices_child ON invoices_payment(child_id);
CREATE INDEX idx_invoices_status ON invoices_payment(status);
CREATE INDEX idx_invoices_due_date ON invoices_payment(due_date);
CREATE INDEX idx_invoices_payment_plan ON invoices_payment(payment_plan_id);
CREATE INDEX idx_invoices_number ON invoices_payment(invoice_number);

COMMENT ON TABLE invoices IS 'Parent invoices with autopay and payment plan support';

-- 3. PAYMENTS TABLE
CREATE TABLE IF NOT EXISTS payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    provider_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    parent_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    invoice_id UUID NOT NULL REFERENCES invoices_payment(id) ON DELETE CASCADE,
    payment_method_id UUID REFERENCES payment_methods(id) ON DELETE SET NULL,
    
    -- Payment details
    payment_number TEXT NOT NULL UNIQUE,
    payment_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Amount
    amount DECIMAL(10,2) NOT NULL,
    processing_fee DECIMAL(10,2) DEFAULT 0,
    net_amount DECIMAL(10,2) GENERATED ALWAYS AS (amount - processing_fee) STORED,
    
    -- Payment method used
    method_type TEXT NOT NULL, -- 'ach', 'card', 'fsa_hsa', 'cash', 'check'
    method_details TEXT, -- Last 4 digits, check number, etc.
    
    -- Processing
    processor TEXT DEFAULT 'stripe', -- 'stripe', 'plaid', 'manual'
    processor_transaction_id TEXT,
    processor_fee_percentage DECIMAL(5,4), -- e.g., 0.029 for 2.9%
    processor_fee_fixed DECIMAL(10,2), -- e.g., 0.30
    
    -- Status
    status TEXT NOT NULL DEFAULT 'pending', -- 'pending', 'processing', 'succeeded', 'failed', 'refunded'
    
    -- Autopay
    is_autopay BOOLEAN DEFAULT false,
    
    -- Confirmation
    receipt_number TEXT,
    receipt_sent_at TIMESTAMP WITH TIME ZONE,
    
    -- Failure handling
    failure_code TEXT,
    failure_message TEXT,
    retry_count INTEGER DEFAULT 0,
    
    -- Refund
    refunded_amount DECIMAL(10,2) DEFAULT 0,
    refunded_at TIMESTAMP WITH TIME ZONE,
    refund_reason TEXT,
    
    -- Metadata
    metadata JSONB DEFAULT '{}',
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_payments_provider ON payments(provider_id);
CREATE INDEX idx_payments_parent ON payments(parent_id);
CREATE INDEX idx_payments_invoice ON payments(invoice_id);
CREATE INDEX idx_payments_status ON payments(status);
CREATE INDEX idx_payments_date ON payments(payment_date);
CREATE INDEX idx_payments_receipt ON payments(receipt_number);
CREATE INDEX idx_payments_autopay ON payments(is_autopay);

COMMENT ON TABLE payments IS 'Real-time payment tracking with instant confirmation';
COMMENT ON COLUMN payments.net_amount IS 'Amount after processing fees (what director receives)';

-- 4. PAYMENT PLANS TABLE
CREATE TABLE IF NOT EXISTS payment_plans (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    provider_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    parent_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    
    -- Plan details
    plan_name TEXT NOT NULL,
    total_amount DECIMAL(10,2) NOT NULL,
    number_of_installments INTEGER NOT NULL,
    installment_amount DECIMAL(10,2) NOT NULL,
    
    -- Schedule
    start_date DATE NOT NULL,
    frequency TEXT NOT NULL DEFAULT 'monthly', -- 'weekly', 'biweekly', 'monthly'
    
    -- Status
    status TEXT NOT NULL DEFAULT 'active', -- 'active', 'completed', 'cancelled', 'defaulted'
    
    -- Tracking
    installments_paid INTEGER DEFAULT 0,
    amount_paid DECIMAL(10,2) DEFAULT 0,
    last_payment_date DATE,
    next_payment_date DATE,
    
    -- Notes
    notes TEXT,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_payment_plans_provider ON payment_plans(provider_id);
CREATE INDEX idx_payment_plans_parent ON payment_plans(parent_id);
CREATE INDEX idx_payment_plans_status ON payment_plans(status);
CREATE INDEX idx_payment_plans_next_payment ON payment_plans(next_payment_date);

COMMENT ON TABLE payment_plans IS 'Split invoices into installments for family flexibility';

-- 5. AUTOPAY ENROLLMENT TABLE
CREATE TABLE IF NOT EXISTS autopay_enrollments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    provider_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    parent_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    payment_method_id UUID NOT NULL REFERENCES payment_methods(id) ON DELETE CASCADE,
    
    -- Settings
    is_enabled BOOLEAN DEFAULT true,
    day_of_month INTEGER, -- 1-28, when to pull payment
    
    -- Status
    status TEXT NOT NULL DEFAULT 'active', -- 'active', 'paused', 'cancelled'
    
    -- Tracking
    total_successful_payments INTEGER DEFAULT 0,
    total_failed_payments INTEGER DEFAULT 0,
    last_successful_payment_date DATE,
    last_failed_payment_date DATE,
    
    -- Failure handling
    consecutive_failures INTEGER DEFAULT 0,
    max_retry_attempts INTEGER DEFAULT 3,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    CONSTRAINT valid_day_of_month CHECK (day_of_month BETWEEN 1 AND 28)
);

CREATE INDEX idx_autopay_provider ON autopay_enrollments(provider_id);
CREATE INDEX idx_autopay_parent ON autopay_enrollments(parent_id);
CREATE INDEX idx_autopay_status ON autopay_enrollments(status);
CREATE INDEX idx_autopay_enabled ON autopay_enrollments(is_enabled);

COMMENT ON TABLE autopay_enrollments IS 'Set and forget autopay - director favorite feature';

-- 6. PROCESSING FEES TABLE (Reference data)
CREATE TABLE IF NOT EXISTS payment_processing_fees (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    method_type TEXT NOT NULL UNIQUE,
    
    -- Fee structure
    percentage_fee DECIMAL(5,4) NOT NULL, -- e.g., 0.008 for 0.8% (ACH), 0.029 for 2.9% (Card)
    fixed_fee DECIMAL(10,2) DEFAULT 0, -- e.g., 0.30 for cards
    
    -- Display info
    display_name TEXT NOT NULL,
    description TEXT,
    
    -- Status
    is_active BOOLEAN DEFAULT true,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert default fee structures
INSERT INTO payment_processing_fees (method_type, percentage_fee, fixed_fee, display_name, description) VALUES
('ach', 0.008, 0, 'ACH Bank Transfer', 'Lowest fees (0.8%), best for recurring payments'),
('card', 0.029, 0.30, 'Debit/Credit Card', 'Standard card processing (2.9% + $0.30)'),
('fsa_hsa', 0.029, 0.30, 'FSA/HSA Dependent Care Card', 'Same as card processing (2.9% + $0.30)')
ON CONFLICT (method_type) DO NOTHING;

COMMENT ON TABLE payment_processing_fees IS 'Platform shows director net amount after fees';

-- =====================================================
-- RPC FUNCTIONS
-- =====================================================

-- Function: Calculate processing fee for a payment
CREATE OR REPLACE FUNCTION calculate_processing_fee(
    p_amount DECIMAL(10,2),
    p_method_type TEXT
)
RETURNS JSON AS $$
DECLARE
    v_fee_structure RECORD;
    v_percentage_fee DECIMAL(10,2);
    v_fixed_fee DECIMAL(10,2);
    v_total_fee DECIMAL(10,2);
    v_net_amount DECIMAL(10,2);
BEGIN
    -- Get fee structure
    SELECT percentage_fee, fixed_fee
    INTO v_fee_structure
    FROM payment_processing_fees
    WHERE method_type = p_method_type AND is_active = true;
    
    IF NOT FOUND THEN
        -- Default to card fees if not found
        v_percentage_fee := 0.029;
        v_fixed_fee := 0.30;
    ELSE
        v_percentage_fee := v_fee_structure.percentage_fee;
        v_fixed_fee := v_fee_structure.fixed_fee;
    END IF;
    
    -- Calculate fees
    v_total_fee := (p_amount * v_percentage_fee) + v_fixed_fee;
    v_net_amount := p_amount - v_total_fee;
    
    RETURN json_build_object(
        'gross_amount', p_amount,
        'processing_fee', ROUND(v_total_fee, 2),
        'net_amount', ROUND(v_net_amount, 2),
        'percentage_fee', v_percentage_fee,
        'fixed_fee', v_fixed_fee,
        'method_type', p_method_type
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function: Process autopay for due invoices
CREATE OR REPLACE FUNCTION process_autopay_invoices_payment()
RETURNS JSON AS $$
DECLARE
    v_invoice RECORD;
    v_autopay RECORD;
    v_processed_count INTEGER := 0;
    v_failed_count INTEGER := 0;
BEGIN
    -- Find all invoices due today with autopay enabled
    FOR v_invoice IN
        SELECT i.*, ae.payment_method_id
        FROM invoices_payment i
        JOIN autopay_enrollments ae ON ae.parent_id = i.parent_id AND ae.provider_id = i.provider_id
        WHERE i.due_date <= CURRENT_DATE
            AND i.status IN ('sent', 'viewed', 'partial')
            AND i.amount_due > 0
            AND ae.is_enabled = true
            AND ae.status = 'active'
            AND (i.autopay_attempted_at IS NULL OR i.autopay_attempted_at < CURRENT_DATE)
    LOOP
        -- Mark as attempted
        UPDATE invoices
        SET autopay_attempted_at = NOW()
        WHERE id = v_invoice.id;
        
        -- TODO: Actual payment processing happens in application layer via Stripe/Plaid
        -- This would create a payment record and update invoice
        
        v_processed_count := v_processed_count + 1;
    END LOOP;
    
    RETURN json_build_object(
        'processed', v_processed_count,
        'failed', v_failed_count,
        'timestamp', NOW()
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function: Create payment plan from invoice
CREATE OR REPLACE FUNCTION create_payment_plan(
    p_invoice_id UUID,
    p_number_of_installments INTEGER,
    p_frequency TEXT DEFAULT 'monthly'
)
RETURNS UUID AS $$
DECLARE
    v_invoice RECORD;
    v_plan_id UUID;
    v_installment_amount DECIMAL(10,2);
    v_installment_date DATE;
    v_i INTEGER;
BEGIN
    -- Get original invoice
    SELECT * INTO v_invoice FROM invoices_payment WHERE id = p_invoice_id;
    
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Invoice not found';
    END IF;
    
    -- Calculate installment amount
    v_installment_amount := v_invoice.total_amount / p_number_of_installments;
    
    -- Create payment plan
    INSERT INTO payment_plans (
        provider_id,
        parent_id,
        plan_name,
        total_amount,
        number_of_installments,
        installment_amount,
        start_date,
        frequency,
        next_payment_date
    ) VALUES (
        v_invoice.provider_id,
        v_invoice.parent_id,
        'Payment Plan - Invoice ' || v_invoice.invoice_number,
        v_invoice.total_amount,
        p_number_of_installments,
        v_installment_amount,
        v_invoice.due_date,
        p_frequency,
        v_invoice.due_date
    ) RETURNING id INTO v_plan_id;
    
    -- Create installment invoices
    v_installment_date := v_invoice.due_date;
    
    FOR v_i IN 1..p_number_of_installments LOOP
        -- Calculate next due date based on frequency
        IF v_i > 1 THEN
            v_installment_date := CASE p_frequency
                WHEN 'weekly' THEN v_installment_date + INTERVAL '1 week'
                WHEN 'biweekly' THEN v_installment_date + INTERVAL '2 weeks'
                WHEN 'monthly' THEN v_installment_date + INTERVAL '1 month'
                ELSE v_installment_date + INTERVAL '1 month'
            END;
        END IF;
        
        INSERT INTO invoices (
            provider_id,
            parent_id,
            child_id,
            invoice_number,
            invoice_date,
            due_date,
            subtotal,
            total_amount,
            line_items,
            status,
            is_payment_plan,
            payment_plan_id,
            installment_number,
            total_installments
        ) VALUES (
            v_invoice.provider_id,
            v_invoice.parent_id,
            v_invoice.child_id,
            v_invoice.invoice_number || '-' || v_i,
            v_invoice.invoice_date,
            v_installment_date,
            v_installment_amount,
            v_installment_amount,
            jsonb_build_array(
                jsonb_build_object(
                    'description', 'Installment ' || v_i || ' of ' || p_number_of_installments,
                    'quantity', 1,
                    'unit_price', v_installment_amount,
                    'amount', v_installment_amount
                )
            ),
            'sent',
            true,
            v_plan_id,
            v_i,
            p_number_of_installments
        );
    END LOOP;
    
    -- Mark original invoice as split into payment plan
    UPDATE invoices
    SET status = 'cancelled',
        notes = 'Split into ' || p_number_of_installments || ' installments'
    WHERE id = p_invoice_id;
    
    RETURN v_plan_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function: Record payment and update invoice
CREATE OR REPLACE FUNCTION record_payment(
    p_invoice_id UUID,
    p_parent_id UUID,
    p_payment_method_id UUID,
    p_amount DECIMAL(10,2),
    p_method_type TEXT,
    p_is_autopay BOOLEAN DEFAULT false
)
RETURNS UUID AS $$
DECLARE
    v_invoice RECORD;
    v_payment_id UUID;
    v_payment_number TEXT;
    v_fee_info JSON;
    v_processing_fee DECIMAL(10,2);
BEGIN
    -- Get invoice
    SELECT * INTO v_invoice FROM invoices_payment WHERE id = p_invoice_id;
    
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Invoice not found';
    END IF;
    
    -- Calculate processing fee
    v_fee_info := calculate_processing_fee(p_amount, p_method_type);
    v_processing_fee := (v_fee_info->>'processing_fee')::DECIMAL(10,2);
    
    -- Generate payment number
    v_payment_number := 'PAY-' || TO_CHAR(NOW(), 'YYYYMMDD') || '-' || SUBSTRING(gen_random_uuid()::TEXT, 1, 8);
    
    -- Create payment record
    INSERT INTO payments (
        provider_id,
        parent_id,
        invoice_id,
        payment_method_id,
        payment_number,
        amount,
        processing_fee,
        method_type,
        is_autopay,
        status,
        receipt_number
    ) VALUES (
        v_invoice.provider_id,
        p_parent_id,
        p_invoice_id,
        p_payment_method_id,
        v_payment_number,
        p_amount,
        v_processing_fee,
        p_method_type,
        p_is_autopay,
        'succeeded',
        'RCPT-' || TO_CHAR(NOW(), 'YYYYMMDD') || '-' || SUBSTRING(gen_random_uuid()::TEXT, 1, 8)
    ) RETURNING id INTO v_payment_id;
    
    -- Update invoice
    UPDATE invoices
    SET 
        amount_paid = amount_paid + p_amount,
        status = CASE 
            WHEN (amount_paid + p_amount) >= total_amount THEN 'paid'
            WHEN (amount_paid + p_amount) > 0 THEN 'partial'
            ELSE status
        END,
        paid_at = CASE 
            WHEN (amount_paid + p_amount) >= total_amount THEN NOW()
            ELSE paid_at
        END,
        updated_at = NOW()
    WHERE id = p_invoice_id;
    
    -- Update payment plan if this is an installment
    IF v_invoice.is_payment_plan AND v_invoice.payment_plan_id IS NOT NULL THEN
        UPDATE payment_plans
        SET 
            installments_paid = installments_paid + 1,
            amount_paid = amount_paid + p_amount,
            last_payment_date = CURRENT_DATE,
            status = CASE 
                WHEN installments_paid + 1 >= number_of_installments THEN 'completed'
                ELSE status
            END,
            updated_at = NOW()
        WHERE id = v_invoice.payment_plan_id;
    END IF;
    
    RETURN v_payment_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- TRIGGERS
-- =====================================================

-- Trigger: Auto-update invoice status based on due date
CREATE OR REPLACE FUNCTION update_overdue_invoices_payment()
RETURNS void AS $$
BEGIN
    UPDATE invoices
    SET status = 'overdue'
    WHERE status IN ('sent', 'viewed', 'partial')
        AND due_date < CURRENT_DATE
        AND amount_due > 0;
END;
$$ LANGUAGE plpgsql;

-- Trigger: Send receipt notification when payment succeeds
CREATE OR REPLACE FUNCTION notify_payment_success()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.status = 'succeeded' AND OLD.status != 'succeeded' THEN
        -- Insert notification for parent
        INSERT INTO notifications (
            user_id,
            type,
            title,
            message,
            data,
            provider_id
        ) VALUES (
            NEW.parent_id,
            'payment_confirmed',
            'Payment Confirmed',
            'Your payment of $' || NEW.amount || ' has been received. Receipt: ' || NEW.receipt_number,
            jsonb_build_object(
                'payment_id', NEW.id,
                'amount', NEW.amount,
                'receipt_number', NEW.receipt_number,
                'net_amount', NEW.net_amount
            ),
            NEW.provider_id
        );
        
        -- Update receipt sent timestamp
        NEW.receipt_sent_at := NOW();
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_payment_success_notification
AFTER UPDATE ON payments
FOR EACH ROW
EXECUTE FUNCTION notify_payment_success();

-- =====================================================
-- ENABLE RLS
-- =====================================================

ALTER TABLE payment_methods ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE autopay_enrollments ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_processing_fees ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Parents can view their payment methods"
    ON payment_methods FOR SELECT
    USING (parent_id = auth.uid());

CREATE POLICY "Parents can manage their payment methods"
    ON payment_methods FOR ALL
    USING (parent_id = auth.uid());

CREATE POLICY "Providers can view parent payment methods"
    ON payment_methods FOR SELECT
    USING (provider_id = auth.uid());

CREATE POLICY "Parents can view their invoices"
    ON invoices_payment FOR SELECT
    USING (parent_id = auth.uid());

CREATE POLICY "Providers can manage invoices"
    ON invoices_payment FOR ALL
    USING (provider_id = auth.uid());

CREATE POLICY "Parents can view their payments"
    ON payments FOR SELECT
    USING (parent_id = auth.uid());

CREATE POLICY "Providers can view their payments"
    ON payments FOR SELECT
    USING (provider_id = auth.uid());

CREATE POLICY "Everyone can view fee structures"
    ON payment_processing_fees FOR SELECT
    TO authenticated
    USING (true);

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION calculate_processing_fee TO authenticated;
GRANT EXECUTE ON FUNCTION process_autopay_invoices_payment TO authenticated;
GRANT EXECUTE ON FUNCTION create_payment_plan TO authenticated;
GRANT EXECUTE ON FUNCTION record_payment TO authenticated;

-- Success message
DO $$
BEGIN
    RAISE NOTICE '✅ Payment Collection System created successfully!';
    RAISE NOTICE '💳 Features enabled:';
    RAISE NOTICE '   - Multiple payment methods (ACH, Card, FSA/HSA)';
    RAISE NOTICE '   - Autopay enrollment (set and forget)';
    RAISE NOTICE '   - Instant payment confirmation';
    RAISE NOTICE '   - Payment plans (family flexibility)';
    RAISE NOTICE '   - Real-time fee calculation';
    RAISE NOTICE '   - Automatic receipt generation';
END $$;
