-- Add tax exempt fields to customers
ALTER TABLE customers
ADD COLUMN tax_exempt BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN tax_exempt_certificate TEXT;

-- Update quote_line_items line_type constraint to include new types
-- Drop the old constraint and add new one with expanded types
ALTER TABLE quote_line_items
DROP CONSTRAINT IF EXISTS quote_line_items_line_type_check;

ALTER TABLE quote_line_items
ADD CONSTRAINT quote_line_items_line_type_check
CHECK (line_type IN (
  'base',           -- legacy, maps to 'rental'
  'rental',         -- dumpster rental (TAXABLE)
  'delivery',       -- delivery fee (non-taxable)
  'haul',           -- disposal/haul fee (non-taxable)
  'extra_days',     -- legacy, maps to 'extended_service'
  'extended_service', -- extended service days (non-taxable)
  'tax',            -- tax line item
  'processing_fee', -- card processing fee (non-taxable)
  'discount',       -- discount
  'adjustment',     -- other adjustments
  'overage'         -- tonnage overage (non-taxable, charged separately)
));

-- Update invoice_line_items line_type constraint similarly
ALTER TABLE invoice_line_items
DROP CONSTRAINT IF EXISTS invoice_line_items_line_type_check;

ALTER TABLE invoice_line_items
ADD CONSTRAINT invoice_line_items_line_type_check
CHECK (line_type IN (
  'base',           -- legacy, maps to 'rental'
  'rental',         -- dumpster rental (TAXABLE)
  'delivery',       -- delivery fee (non-taxable)
  'haul',           -- disposal/haul fee (non-taxable)
  'extra_days',     -- legacy, maps to 'extended_service'
  'extended_service', -- extended service days (non-taxable)
  'tax',            -- tax line item
  'processing_fee', -- card processing fee (non-taxable)
  'discount',       -- discount
  'adjustment',     -- other adjustments
  'overage'         -- tonnage overage (non-taxable, charged separately)
));

-- Add comment explaining the tax rules
COMMENT ON COLUMN customers.tax_exempt IS 'If true, customer is exempt from sales tax (requires certificate)';
COMMENT ON COLUMN customers.tax_exempt_certificate IS 'Tax exemption certificate number';
