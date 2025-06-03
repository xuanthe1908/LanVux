-- Create payments table
CREATE TABLE IF NOT EXISTS payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
    order_id VARCHAR(100) UNIQUE NOT NULL,
    amount DECIMAL(10,2) NOT NULL CHECK (amount >= 0),
    currency VARCHAR(3) NOT NULL DEFAULT 'VND',
    payment_method VARCHAR(50) NOT NULL DEFAULT 'vnpay',
    payment_status VARCHAR(50) NOT NULL DEFAULT 'pending' 
        CHECK (payment_status IN ('pending', 'completed', 'failed', 'cancelled', 'refunded', 'completed_enrollment_failed')),
    transaction_id VARCHAR(100),
    payment_date TIMESTAMP,
    vnpay_response_code VARCHAR(10),
    vnpay_bank_code VARCHAR(20),
    vnpay_card_type VARCHAR(20),
    refund_amount DECIMAL(10,2) DEFAULT 0 CHECK (refund_amount >= 0),
    refund_reason TEXT,
    refunded_at TIMESTAMP,
    notes TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Create payment_logs table for audit trail
CREATE TABLE IF NOT EXISTS payment_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    payment_id UUID NOT NULL REFERENCES payments(id) ON DELETE CASCADE,
    action VARCHAR(50) NOT NULL,
    old_status VARCHAR(50),
    new_status VARCHAR(50),
    details JSONB,
    ip_address INET,
    user_agent TEXT,
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMP DEFAULT NOW()
);

-- Create payment_methods table for supported payment options
CREATE TABLE IF NOT EXISTS payment_methods (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code VARCHAR(20) UNIQUE NOT NULL,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    icon_url VARCHAR(500),
    is_active BOOLEAN DEFAULT true,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Create coupons table for discount codes
CREATE TABLE IF NOT EXISTS coupons (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    discount_type VARCHAR(20) NOT NULL CHECK (discount_type IN ('percentage', 'fixed')),
    discount_value DECIMAL(10,2) NOT NULL CHECK (discount_value > 0),
    minimum_amount DECIMAL(10,2) DEFAULT 0,
    maximum_discount DECIMAL(10,2),
    usage_limit INTEGER,
    used_count INTEGER DEFAULT 0,
    valid_from TIMESTAMP NOT NULL,
    valid_until TIMESTAMP NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Create coupon_usage table to track coupon usage
CREATE TABLE IF NOT EXISTS coupon_usage (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    coupon_id UUID NOT NULL REFERENCES coupons(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    payment_id UUID REFERENCES payments(id) ON DELETE SET NULL,
    discount_amount DECIMAL(10,2) NOT NULL,
    used_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(coupon_id, user_id)
);

-- Add coupon fields to payments table
ALTER TABLE payments ADD COLUMN IF NOT EXISTS coupon_id UUID REFERENCES coupons(id);
ALTER TABLE payments ADD COLUMN IF NOT EXISTS original_amount DECIMAL(10,2);
ALTER TABLE payments ADD COLUMN IF NOT EXISTS discount_amount DECIMAL(10,2) DEFAULT 0;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_payments_user_id ON payments(user_id);
CREATE INDEX IF NOT EXISTS idx_payments_course_id ON payments(course_id);
CREATE INDEX IF NOT EXISTS idx_payments_order_id ON payments(order_id);
CREATE INDEX IF NOT EXISTS idx_payments_status ON payments(payment_status);
CREATE INDEX IF NOT EXISTS idx_payments_created_at ON payments(created_at);
CREATE INDEX IF NOT EXISTS idx_payments_transaction_id ON payments(transaction_id);

CREATE INDEX IF NOT EXISTS idx_payment_logs_payment_id ON payment_logs(payment_id);
CREATE INDEX IF NOT EXISTS idx_payment_logs_created_at ON payment_logs(created_at);

CREATE INDEX IF NOT EXISTS idx_coupons_code ON coupons(code);
CREATE INDEX IF NOT EXISTS idx_coupons_valid_from ON coupons(valid_from);
CREATE INDEX IF NOT EXISTS idx_coupons_valid_until ON coupons(valid_until);
CREATE INDEX IF NOT EXISTS idx_coupons_is_active ON coupons(is_active);

CREATE INDEX IF NOT EXISTS idx_coupon_usage_coupon_id ON coupon_usage(coupon_id);
CREATE INDEX IF NOT EXISTS idx_coupon_usage_user_id ON coupon_usage(user_id);

-- Insert default payment methods
INSERT INTO payment_methods (code, name, description, sort_order) VALUES
('VNPAYQR', 'VNPay QR Code', 'Thanh toán bằng mã QR VNPay', 1),
('VNBANK', 'Internet Banking', 'Thanh toán qua Internet Banking', 2),
('VISA', 'Visa', 'Thanh toán bằng thẻ Visa', 3),
('MASTERCARD', 'MasterCard', 'Thanh toán bằng thẻ MasterCard', 4),
('BIDV', 'BIDV', 'Ngân hàng BIDV', 5),
('VCB', 'Vietcombank', 'Ngân hàng Vietcombank', 6),
('VIETINBANK', 'VietinBank', 'Ngân hàng VietinBank', 7),
('TCB', 'Techcombank', 'Ngân hàng Techcombank', 8),
('MB', 'MBBank', 'Ngân hàng MBBank', 9),
('ACB', 'ACB', 'Ngân hàng ACB', 10)
ON CONFLICT (code) DO NOTHING;

-- Create trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_payments_updated_at 
    BEFORE UPDATE ON payments
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_payment_methods_updated_at 
    BEFORE UPDATE ON payment_methods
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_coupons_updated_at 
    BEFORE UPDATE ON coupons
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create function to log payment status changes
CREATE OR REPLACE FUNCTION log_payment_status_change()
RETURNS TRIGGER AS $$
BEGIN
    IF OLD.payment_status IS DISTINCT FROM NEW.payment_status THEN
        INSERT INTO payment_logs (payment_id, action, old_status, new_status, details)
        VALUES (NEW.id, 'status_change', OLD.payment_status, NEW.payment_status, 
                jsonb_build_object(
                    'old_amount', OLD.amount,
                    'new_amount', NEW.amount,
                    'transaction_id', NEW.transaction_id,
                    'vnpay_response_code', NEW.vnpay_response_code
                ));
    END IF;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER payment_status_change_log 
    AFTER UPDATE ON payments
    FOR EACH ROW EXECUTE FUNCTION log_payment_status_change();

-- Add some sample coupons for testing
INSERT INTO coupons (code, name, description, discount_type, discount_value, minimum_amount, valid_from, valid_until, usage_limit) VALUES
('WELCOME10', 'Welcome 10%', 'Giảm giá 10% cho học viên mới', 'percentage', 10.00, 100000, NOW(), NOW() + INTERVAL '1 year', 1000),
('STUDENT50K', 'Student Discount', 'Giảm 50,000 VNĐ cho sinh viên', 'fixed', 50000.00, 200000, NOW(), NOW() + INTERVAL '6 months', 500),
('BLACKFRIDAY', 'Black Friday', 'Giảm giá 25% Black Friday', 'percentage', 25.00, 300000, NOW(), NOW() + INTERVAL '1 week', 100)
ON CONFLICT (code) DO NOTHING;