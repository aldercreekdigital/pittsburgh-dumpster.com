-- Add invite token columns to customers table for registration flow
ALTER TABLE customers
ADD COLUMN invite_token UUID,
ADD COLUMN invite_token_expires_at TIMESTAMPTZ;

-- Index for quick token lookup
CREATE INDEX idx_customers_invite_token ON customers(invite_token) WHERE invite_token IS NOT NULL;
