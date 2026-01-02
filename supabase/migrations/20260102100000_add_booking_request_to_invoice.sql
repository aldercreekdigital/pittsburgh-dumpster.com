-- Add booking_request_id to invoices table
-- This allows linking invoices to booking requests before a booking is created

ALTER TABLE invoices
ADD COLUMN booking_request_id UUID REFERENCES booking_requests(id) ON DELETE SET NULL;

-- Create index for faster lookups
CREATE INDEX idx_invoices_booking_request_id ON invoices(booking_request_id);
