// Database types for Supabase
// This file provides TypeScript types for our database schema

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      businesses: {
        Row: {
          id: string
          name: string
          phone: string | null
          email: string | null
          address: string | null
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          phone?: string | null
          email?: string | null
          address?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          phone?: string | null
          email?: string | null
          address?: string | null
          created_at?: string
        }
      }
      business_users: {
        Row: {
          id: string
          business_id: string
          user_id: string
          role: 'owner' | 'admin' | 'dispatcher' | 'accounting' | 'driver' | 'read_only'
          created_at: string
        }
        Insert: {
          id?: string
          business_id: string
          user_id: string
          role: 'owner' | 'admin' | 'dispatcher' | 'accounting' | 'driver' | 'read_only'
          created_at?: string
        }
        Update: {
          id?: string
          business_id?: string
          user_id?: string
          role?: 'owner' | 'admin' | 'dispatcher' | 'accounting' | 'driver' | 'read_only'
          created_at?: string
        }
      }
      business_settings: {
        Row: {
          id: string
          business_id: string
          settings: Json
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          business_id: string
          settings?: Json
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          business_id?: string
          settings?: Json
          created_at?: string
          updated_at?: string
        }
      }
      customers: {
        Row: {
          id: string
          business_id: string
          user_id: string | null
          name: string
          email: string
          phone: string | null
          created_at: string
        }
        Insert: {
          id?: string
          business_id: string
          user_id?: string | null
          name: string
          email: string
          phone?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          business_id?: string
          user_id?: string | null
          name?: string
          email?: string
          phone?: string | null
          created_at?: string
        }
      }
      addresses: {
        Row: {
          id: string
          business_id: string
          customer_id: string | null
          full_address: string
          street: string | null
          city: string | null
          state: string | null
          zip: string | null
          lat: number | null
          lng: number | null
          place_id: string | null
          created_at: string
        }
        Insert: {
          id?: string
          business_id: string
          customer_id?: string | null
          full_address: string
          street?: string | null
          city?: string | null
          state?: string | null
          zip?: string | null
          lat?: number | null
          lng?: number | null
          place_id?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          business_id?: string
          customer_id?: string | null
          full_address?: string
          street?: string | null
          city?: string | null
          state?: string | null
          zip?: string | null
          lat?: number | null
          lng?: number | null
          place_id?: string | null
          created_at?: string
        }
      }
      service_areas: {
        Row: {
          id: string
          business_id: string
          name: string
          polygon: Json
          active: boolean
          created_at: string
        }
        Insert: {
          id?: string
          business_id: string
          name: string
          polygon: Json
          active?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          business_id?: string
          name?: string
          polygon?: Json
          active?: boolean
          created_at?: string
        }
      }
      pricing_rules: {
        Row: {
          id: string
          business_id: string
          waste_type: 'construction_debris' | 'household_trash'
          dumpster_size: number
          base_price: number
          delivery_fee: number
          haul_fee: number
          included_days: number
          extra_day_fee: number
          included_tons: number
          overage_per_ton: number
          public_notes: string | null
          active: boolean
          created_at: string
        }
        Insert: {
          id?: string
          business_id: string
          waste_type: 'construction_debris' | 'household_trash'
          dumpster_size: number
          base_price: number
          delivery_fee?: number
          haul_fee?: number
          included_days?: number
          extra_day_fee?: number
          included_tons?: number
          overage_per_ton?: number
          public_notes?: string | null
          active?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          business_id?: string
          waste_type?: 'construction_debris' | 'household_trash'
          dumpster_size?: number
          base_price?: number
          delivery_fee?: number
          haul_fee?: number
          included_days?: number
          extra_day_fee?: number
          included_tons?: number
          overage_per_ton?: number
          public_notes?: string | null
          active?: boolean
          created_at?: string
        }
      }
      quotes: {
        Row: {
          id: string
          business_id: string
          address_id: string
          customer_id: string | null
          waste_type: 'construction_debris' | 'household_trash' | null
          dumpster_size: number | null
          dropoff_date: string | null
          pickup_date: string | null
          status: 'draft' | 'sent' | 'expired' | 'converted'
          expires_at: string | null
          pricing_snapshot: Json | null
          created_at: string
        }
        Insert: {
          id?: string
          business_id: string
          address_id: string
          customer_id?: string | null
          waste_type?: 'construction_debris' | 'household_trash' | null
          dumpster_size?: number | null
          dropoff_date?: string | null
          pickup_date?: string | null
          status?: 'draft' | 'sent' | 'expired' | 'converted'
          expires_at?: string | null
          pricing_snapshot?: Json | null
          created_at?: string
        }
        Update: {
          id?: string
          business_id?: string
          address_id?: string
          customer_id?: string | null
          waste_type?: 'construction_debris' | 'household_trash' | null
          dumpster_size?: number | null
          dropoff_date?: string | null
          pickup_date?: string | null
          status?: 'draft' | 'sent' | 'expired' | 'converted'
          expires_at?: string | null
          pricing_snapshot?: Json | null
          created_at?: string
        }
      }
      quote_line_items: {
        Row: {
          id: string
          quote_id: string
          label: string
          amount: number
          line_type: 'base' | 'delivery' | 'haul' | 'extra_days' | 'tax' | 'discount' | 'adjustment'
          sort_order: number
          created_at: string
        }
        Insert: {
          id?: string
          quote_id: string
          label: string
          amount: number
          line_type?: 'base' | 'delivery' | 'haul' | 'extra_days' | 'tax' | 'discount' | 'adjustment'
          sort_order?: number
          created_at?: string
        }
        Update: {
          id?: string
          quote_id?: string
          label?: string
          amount?: number
          line_type?: 'base' | 'delivery' | 'haul' | 'extra_days' | 'tax' | 'discount' | 'adjustment'
          sort_order?: number
          created_at?: string
        }
      }
      carts: {
        Row: {
          id: string
          business_id: string
          user_id: string
          status: 'active' | 'abandoned' | 'converted'
          created_at: string
        }
        Insert: {
          id?: string
          business_id: string
          user_id: string
          status?: 'active' | 'abandoned' | 'converted'
          created_at?: string
        }
        Update: {
          id?: string
          business_id?: string
          user_id?: string
          status?: 'active' | 'abandoned' | 'converted'
          created_at?: string
        }
      }
      cart_items: {
        Row: {
          id: string
          cart_id: string
          quote_id: string
          created_at: string
        }
        Insert: {
          id?: string
          cart_id: string
          quote_id: string
          created_at?: string
        }
        Update: {
          id?: string
          cart_id?: string
          quote_id?: string
          created_at?: string
        }
      }
      booking_requests: {
        Row: {
          id: string
          business_id: string
          customer_id: string
          quote_id: string
          status: 'pending' | 'approved' | 'declined' | 'modified_awaiting_customer'
          customer_inputs: Json
          created_at: string
        }
        Insert: {
          id?: string
          business_id: string
          customer_id: string
          quote_id: string
          status?: 'pending' | 'approved' | 'declined' | 'modified_awaiting_customer'
          customer_inputs?: Json
          created_at?: string
        }
        Update: {
          id?: string
          business_id?: string
          customer_id?: string
          quote_id?: string
          status?: 'pending' | 'approved' | 'declined' | 'modified_awaiting_customer'
          customer_inputs?: Json
          created_at?: string
        }
      }
      dumpsters: {
        Row: {
          id: string
          business_id: string
          unit_number: string
          size: number
          type: string | null
          status: 'available' | 'reserved' | 'dropped' | 'maintenance' | 'retired'
          notes: string | null
          created_at: string
        }
        Insert: {
          id?: string
          business_id: string
          unit_number: string
          size: number
          type?: string | null
          status?: 'available' | 'reserved' | 'dropped' | 'maintenance' | 'retired'
          notes?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          business_id?: string
          unit_number?: string
          size?: number
          type?: string | null
          status?: 'available' | 'reserved' | 'dropped' | 'maintenance' | 'retired'
          notes?: string | null
          created_at?: string
        }
      }
      bookings: {
        Row: {
          id: string
          business_id: string
          booking_request_id: string | null
          customer_id: string
          address_id: string
          dumpster_id: string | null
          status: 'confirmed' | 'scheduled' | 'dropped' | 'picked_up' | 'completed' | 'cancelled'
          dropoff_scheduled_at: string | null
          pickup_due_at: string | null
          dropped_at: string | null
          picked_up_at: string | null
          pricing_snapshot: Json
          created_at: string
        }
        Insert: {
          id?: string
          business_id: string
          booking_request_id?: string | null
          customer_id: string
          address_id: string
          dumpster_id?: string | null
          status?: 'confirmed' | 'scheduled' | 'dropped' | 'picked_up' | 'completed' | 'cancelled'
          dropoff_scheduled_at?: string | null
          pickup_due_at?: string | null
          dropped_at?: string | null
          picked_up_at?: string | null
          pricing_snapshot: Json
          created_at?: string
        }
        Update: {
          id?: string
          business_id?: string
          booking_request_id?: string | null
          customer_id?: string
          address_id?: string
          dumpster_id?: string | null
          status?: 'confirmed' | 'scheduled' | 'dropped' | 'picked_up' | 'completed' | 'cancelled'
          dropoff_scheduled_at?: string | null
          pickup_due_at?: string | null
          dropped_at?: string | null
          picked_up_at?: string | null
          pricing_snapshot?: Json
          created_at?: string
        }
      }
      invoices: {
        Row: {
          id: string
          business_id: string
          customer_id: string
          booking_id: string | null
          invoice_number: string
          status: 'unpaid' | 'paid' | 'void' | 'refunded' | 'partial'
          issued_at: string
          subtotal: number
          total: number
          stripe_checkout_session_id: string | null
          stripe_payment_intent_id: string | null
          created_at: string
        }
        Insert: {
          id?: string
          business_id: string
          customer_id: string
          booking_id?: string | null
          invoice_number: string
          status?: 'unpaid' | 'paid' | 'void' | 'refunded' | 'partial'
          issued_at?: string
          subtotal: number
          total: number
          stripe_checkout_session_id?: string | null
          stripe_payment_intent_id?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          business_id?: string
          customer_id?: string
          booking_id?: string | null
          invoice_number?: string
          status?: 'unpaid' | 'paid' | 'void' | 'refunded' | 'partial'
          issued_at?: string
          subtotal?: number
          total?: number
          stripe_checkout_session_id?: string | null
          stripe_payment_intent_id?: string | null
          created_at?: string
        }
      }
      invoice_line_items: {
        Row: {
          id: string
          invoice_id: string
          label: string
          quantity: number
          unit_price: number
          amount: number
          line_type: 'base' | 'delivery' | 'haul' | 'extra_days' | 'tax' | 'discount' | 'adjustment'
          created_at: string
        }
        Insert: {
          id?: string
          invoice_id: string
          label: string
          quantity?: number
          unit_price: number
          amount: number
          line_type?: 'base' | 'delivery' | 'haul' | 'extra_days' | 'tax' | 'discount' | 'adjustment'
          created_at?: string
        }
        Update: {
          id?: string
          invoice_id?: string
          label?: string
          quantity?: number
          unit_price?: number
          amount?: number
          line_type?: 'base' | 'delivery' | 'haul' | 'extra_days' | 'tax' | 'discount' | 'adjustment'
          created_at?: string
        }
      }
      stripe_customers: {
        Row: {
          id: string
          business_id: string
          customer_id: string
          stripe_customer_id: string
          default_payment_method_id: string | null
          created_at: string
        }
        Insert: {
          id?: string
          business_id: string
          customer_id: string
          stripe_customer_id: string
          default_payment_method_id?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          business_id?: string
          customer_id?: string
          stripe_customer_id?: string
          default_payment_method_id?: string | null
          created_at?: string
        }
      }
      payments: {
        Row: {
          id: string
          invoice_id: string
          stripe_payment_intent_id: string
          amount: number
          status: string
          receipt_url: string | null
          created_at: string
        }
        Insert: {
          id?: string
          invoice_id: string
          stripe_payment_intent_id: string
          amount: number
          status: string
          receipt_url?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          invoice_id?: string
          stripe_payment_intent_id?: string
          amount?: number
          status?: string
          receipt_url?: string | null
          created_at?: string
        }
      }
      dump_tickets: {
        Row: {
          id: string
          booking_id: string
          facility: string
          ticket_number: string
          net_tons: number
          ticket_datetime: string
          attachment_url: string | null
          created_at: string
        }
        Insert: {
          id?: string
          booking_id: string
          facility: string
          ticket_number: string
          net_tons: number
          ticket_datetime: string
          attachment_url?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          booking_id?: string
          facility?: string
          ticket_number?: string
          net_tons?: number
          ticket_datetime?: string
          attachment_url?: string | null
          created_at?: string
        }
      }
      adjustments: {
        Row: {
          id: string
          business_id: string
          booking_id: string
          customer_id: string
          kind: 'tonnage_overage' | 'late_fee' | 'other'
          amount: number
          status: 'pending' | 'charged' | 'failed' | 'void'
          stripe_payment_intent_id: string | null
          notes: string | null
          created_at: string
        }
        Insert: {
          id?: string
          business_id: string
          booking_id: string
          customer_id: string
          kind: 'tonnage_overage' | 'late_fee' | 'other'
          amount: number
          status?: 'pending' | 'charged' | 'failed' | 'void'
          stripe_payment_intent_id?: string | null
          notes?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          business_id?: string
          booking_id?: string
          customer_id?: string
          kind?: 'tonnage_overage' | 'late_fee' | 'other'
          amount?: number
          status?: 'pending' | 'charged' | 'failed' | 'void'
          stripe_payment_intent_id?: string | null
          notes?: string | null
          created_at?: string
        }
      }
      events_audit: {
        Row: {
          id: string
          business_id: string | null
          user_id: string | null
          event_type: string
          entity_type: string | null
          entity_id: string | null
          payload: Json | null
          created_at: string
        }
        Insert: {
          id?: string
          business_id?: string | null
          user_id?: string | null
          event_type: string
          entity_type?: string | null
          entity_id?: string | null
          payload?: Json | null
          created_at?: string
        }
        Update: {
          id?: string
          business_id?: string | null
          user_id?: string | null
          event_type?: string
          entity_type?: string | null
          entity_id?: string | null
          payload?: Json | null
          created_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      is_business_admin: {
        Args: {
          check_business_id: string
        }
        Returns: boolean
      }
      is_business_member: {
        Args: {
          check_business_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      [_ in never]: never
    }
  }
}

// Helper types
export type Tables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Row']
export type InsertTables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Insert']
export type UpdateTables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Update']

// Common type aliases
export type Business = Tables<'businesses'>
export type BusinessUser = Tables<'business_users'>
export type Customer = Tables<'customers'>
export type Address = Tables<'addresses'>
export type ServiceArea = Tables<'service_areas'>
export type PricingRule = Tables<'pricing_rules'>
export type Quote = Tables<'quotes'>
export type QuoteLineItem = Tables<'quote_line_items'>
export type Cart = Tables<'carts'>
export type CartItem = Tables<'cart_items'>
export type BookingRequest = Tables<'booking_requests'>
export type Dumpster = Tables<'dumpsters'>
export type Booking = Tables<'bookings'>
export type Invoice = Tables<'invoices'>
export type InvoiceLineItem = Tables<'invoice_line_items'>
export type StripeCustomer = Tables<'stripe_customers'>
export type Payment = Tables<'payments'>
export type DumpTicket = Tables<'dump_tickets'>
export type Adjustment = Tables<'adjustments'>
